import { useEffect, useRef, useState } from "react";
let globalEyeTrackingStarted = false; //Added this EthAn

type UseEyeClickOpts = { dwellMs?: number; enabled?: boolean };

//edited the line beolow. i removed the async keyword ETHAN
export function useEyeClick({
  dwellMs = 800,
  enabled = true,
}: UseEyeClickOpts = {}) {
  const lastElementRef = useRef<HTMLElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const offsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null); //added this ETHAN
  const [isInitialized, setIsInitialized] = useState(false);
  const mouseRef = useRef({ x: -9999, y: -9999 }); //added this Ethan

  // Smoothing for better accuracy
  const predictionHistoryRef = useRef<Array<{ x: number; y: number }>>([]);
  const smoothingWindowSize = 5;

  useEffect(() => {
    if (!enabled) {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (lastElementRef.current) {
        lastElementRef.current.classList.remove("eye-hover");
        lastElementRef.current = null;
      }
      return;
    }

    let running = true;
    let webgazer: any = null;
    let predictionDot: HTMLElement | null = null;
    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMouseMove); //added this const ETHAN

    // Enhanced smoothing function for better accuracy
    const smoothPrediction = async (rawPrediction: {
      x: number;
      y: number;
    }) => {
      const maxOutlierDistance = 50; // Maximum distance to consider a prediction valid

      // Add the new prediction to the history
      predictionHistoryRef.current.push(rawPrediction);

      // Add a delay to stabilize predictions
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Keep only recent predictions
      if (predictionHistoryRef.current.length > smoothingWindowSize) {
        predictionHistoryRef.current.shift();
      }

      // Remove outliers based on distance from the average
      const average = predictionHistoryRef.current.reduce(
        (acc, pred) => ({ x: acc.x + pred.x, y: acc.y + pred.y }),
        { x: 0, y: 0 },
      );
      const count = predictionHistoryRef.current.length;
      const center = { x: average.x / count, y: average.y / count };

      predictionHistoryRef.current = predictionHistoryRef.current.filter(
        (pred) => {
          const distance = Math.sqrt(
            Math.pow(pred.x - center.x, 2) + Math.pow(pred.y - center.y, 2),
          );
          return distance <= maxOutlierDistance;
        },
      );

      // Recalculate weighted average after filtering
      let totalWeight = 0;
      let weightedX = 0;
      let weightedY = 0;

      predictionHistoryRef.current.forEach((pred, index) => {
        const weight = index + 1; // Recent predictions get higher weight
        weightedX += pred.x * weight;
        weightedY += pred.y * weight;
        totalWeight += weight;
      });

      return {
        x: weightedX / totalWeight,
        y: weightedY / totalWeight,
      };
    };

    const start = async () => {
      try {
        console.log("Starting WebGazer initialization...");

        // Load WebGazer
        // @ts-ignore - webgazer types are defined in src/types/webgazer.d.ts
        const mod = await import("webgazer");
        webgazer = mod?.default || mod;
        if (!webgazer) {
          console.error("WebGazer module not found");
          return;
        }

        // Set global reference
        (window as any).webgazer = webgazer;

        // Configure WebGazer
        if (webgazer.setRegression) webgazer.setRegression("ridge");

        // Initialize WebGazer with retry and CPU fallback
        let initSuccess = false;
        for (let attempt = 1; attempt <= 2; attempt++) {
          try {
            console.log(`WebGazer initialization attempt ${attempt}`);

            // Force CPU backend on first attempt to avoid WebGL texture errors
            if (attempt === 1) {
              try {
                const tf = (window as any).tf;
                if (tf && tf.setBackend) {
                  console.log("Attempting to switch to CPU backend...");
                  await tf.setBackend("cpu");
                  await tf.ready();
                  console.log("Successfully switched to CPU backend");
                }
              } catch (tfErr) {
                console.log(
                  "CPU backend unavailable, proceeding with default backend",
                );
              }
            }

            // Begin WebGazer initialization
            await webgazer.begin();
            // ✅ correct WebGazer APIs      //added Ethan
            webgazer.showVideo(false);
            webgazer.showFaceOverlay(false);
            webgazer.showFaceFeedbackBox(false);
            webgazer.showPredictionPoints(false);

            // ✅ disables click/mouse-based training (what you actually want)   //Added Ethan
            webgazer.applyKalmanFilter(true); // optional stabilizer //added Ethan

            console.log("WebGazer.begin() completed");

            // Wait for stabilization
            await new Promise((resolve) => setTimeout(resolve, 3000));

            // Test predictions
            // Test predictions (don't fail hard if not ready yet)  //added Ethan
            let hasValidPredictions = false;
            for (let i = 0; i < 10; i++) {
              const testPred = webgazer.getCurrentPrediction?.();
              if (
                testPred &&
                typeof testPred.x === "number" &&
                typeof testPred.y === "number"
              ) {
                hasValidPredictions = true;
                break;
              }
              await new Promise((resolve) => setTimeout(resolve, 500));
            }

            if (!hasValidPredictions) {
              console.warn(
                "No valid predictions yet — continuing anyway (needs calibration).",
              );
              // ✅ DO NOT throw / return
            }

            initSuccess = true;
            console.log("WebGazer initialization successful!");
            break;
          } catch (err: any) {
            console.warn(`Attempt ${attempt} failed:`, err.message);

            if (attempt === 2) {
              console.error("All initialization attempts failed");
              return;
            }

            // Pause and wait before retry
            try {
              webgazer?.pause?.();
            } catch {}

            await new Promise((resolve) => setTimeout(resolve, 2000));
          }
        }

        if (!initSuccess) {
          console.error("WebGazer initialization completely failed");
          return;
        }

        // Hide WebGazer overlays
        webgazer.showVideo?.(false);
        webgazer.showPredictionPoints?.(false);
        webgazer.showFaceOverlay?.(false);

        setIsInitialized(true);

        // Load calibration data
        try {
          const calibData = localStorage.getItem("eye_calibration");
          if (calibData) {
            const parsed = JSON.parse(calibData);
            offsetRef.current = {
              x: parsed.offsetX || 0,
              y: parsed.offsetY || 0,
            };
            console.log("Loaded calibration offset:", offsetRef.current);
          }
        } catch {}

        // Listen for calibration updates
        const handleCalibrationUpdate = () => {
          try {
            const calibData = localStorage.getItem("eye_calibration");
            if (calibData) {
              const parsed = JSON.parse(calibData);
              offsetRef.current = {
                x: parsed.offsetX || 0,
                y: parsed.offsetY || 0,
              };
              console.log("Updated calibration offset:", offsetRef.current);
            }
          } catch {}
        };
        window.addEventListener(
          "eyeCalibrationUpdated",
          handleCalibrationUpdate,
        );

        // Create prediction dot

        document.getElementById("eye-prediction-dot")?.remove(); //added this line

        predictionDot = document.createElement("div");
        predictionDot.id = "eye-prediction-dot";
        predictionDot.style.cssText = `
          position: fixed;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: rgba(255, 100, 0, 0.9);
          border: 2px solid rgba(255, 255, 255, 0.8);
          pointer-events: none;
          z-index: 999999;
          transform: translate(-50%, -50%);
          box-shadow: 0 0 8px rgba(255, 100, 0, 0.6);
          transition: opacity 100ms ease-out;
          display: block;
        `;
        document.body.appendChild(predictionDot);
        predictionDot.style.left = "50%";
        predictionDot.style.top = "50%";
        predictionDot.style.opacity = "0.3"; //3lines added Ethan

        console.log("Prediction dot created");

        // Main prediction loop with error recovery
        let consecutiveErrors = 0;
        const maxConsecutiveErrors = 10;
        let blinkTimeout: number | null = null;
        const blinkDuration = 300; // Time in ms to consider as a blink
        const stablePredictionThreshold = 3; // Number of stable predictions needed to recover

        const loop = () => {
          if (!running) return;

          try {
            const prediction = webgazer.getCurrentPrediction?.();

            if (
              prediction &&
              typeof prediction.x === "number" &&
              typeof prediction.y === "number"
            ) {
              // Reset blink timeout on valid prediction
              if (blinkTimeout) {
                clearTimeout(blinkTimeout);
                blinkTimeout = null;
              }

              consecutiveErrors = 0; // Reset error counter

              // Apply smoothing for better accuracy
              smoothPrediction(prediction).then((smoothedPrediction) => {
                // Apply calibration offset and convert to viewport coordinates
                const correctedX =
                  smoothedPrediction.x + offsetRef.current.x - window.scrollX;
                const correctedY =
                  smoothedPrediction.y + offsetRef.current.y - window.scrollY;

                const mx = mouseRef.current.x;
                const my = mouseRef.current.y;
                const distToMouse = Math.hypot(
                  correctedX - mx,
                  correctedY - my,
                );
                console.log("mouse", mouseRef.current, "corrected", {
                  correctedX,
                  correctedY,
                  distToMouse,
                });
                console.log("mouse", mouseRef.current, "corrected", {
                  correctedX,
                  correctedY,
                  distToMouse,
                }); //debugger ETHAN

                if (distToMouse < 25) {
                  // Looks like mouse-fallback, ignore this frame
                  if (predictionDot) predictionDot.style.opacity = "0.15";
                  return;
                } //added const mx onwards until comment ETHAN

                // Update prediction dot
                /*if (predictionDot) {
                  predictionDot.style.left = `${correctedX}px`;
                  predictionDot.style.top = `${correctedY}px`;
                  predictionDot.style.opacity = "0.9";
                } */ //this one is the old one ETHAN

                if (
                  predictionDot &&
                  correctedX >= 0 &&
                  correctedY >= 0 &&
                  correctedX <= window.innerWidth &&
                  correctedY <= window.innerHeight
                ) {
                  predictionDot.style.left = `${correctedX}px`;
                  predictionDot.style.top = `${correctedY}px`;
                  predictionDot.style.opacity = "0.9";
                }

                // Find clickable element under gaze
                const elements = document.elementsFromPoint(
                  correctedX,
                  correctedY,
                );
                const clickableEl = elements.find(
                  (el) =>
                    el instanceof HTMLElement &&
                    (el.tagName === "BUTTON" ||
                      el.getAttribute("role") === "button" ||
                      el.tagName === "A" ||
                      el.onclick !== null ||
                      el.getAttribute("data-eye-clickable") === "true"),
                ) as HTMLElement | undefined;

                if (clickableEl && clickableEl !== lastElementRef.current) {
                  // New element - start dwell timer
                  if (lastElementRef.current) {
                    lastElementRef.current.classList.remove(
                      "eye-hover",
                      "eye-dwelling",
                    );
                  }
                  if (timerRef.current) {
                    clearTimeout(timerRef.current);
                  }

                  lastElementRef.current = clickableEl;
                  clickableEl.classList.add("eye-hover");

                  timerRef.current = window.setTimeout(() => {
                    clickableEl.classList.add("eye-dwelling");

                    // Trigger click
                    console.log("Eye-clicking element:", clickableEl);
                    const clickEvent = new MouseEvent("click", {
                      view: window,
                      bubbles: true,
                      cancelable: true,
                    });
                    clickableEl.dispatchEvent(clickEvent);

                    // Visual feedback
                    clickableEl.style.transform = "scale(0.95)";
                    setTimeout(() => {
                      clickableEl.style.transform = "";
                    }, 150);
                  }, dwellMs);
                } else if (!clickableEl && lastElementRef.current) {
                  // No element - clear hover
                  lastElementRef.current.classList.remove(
                    "eye-hover",
                    "eye-dwelling",
                  );
                  lastElementRef.current = null;
                  if (timerRef.current) {
                    clearTimeout(timerRef.current);
                    timerRef.current = null;
                  }
                }
              });
            } else {
              // No prediction - fade out dot
              if (predictionDot) {
                predictionDot.style.opacity = "0.2";
              }

              // Clear any active hover
              if (lastElementRef.current) {
                lastElementRef.current.classList.remove(
                  "eye-hover",
                  "eye-dwelling",
                );
                lastElementRef.current = null;
              }
              if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
              }

              // Start blink timeout if not already started
              if (!blinkTimeout) {
                blinkTimeout = window.setTimeout(() => {
                  console.log("Blink detected, pausing gaze tracking...");
                }, blinkDuration);
              }
            }
          } catch (error: any) {
            consecutiveErrors++;

            // Only log first few errors to avoid spam
            if (consecutiveErrors <= 3) {
              console.warn(
                `Prediction error ${consecutiveErrors}:`,
                error.message,
              );
            }

            // If too many consecutive errors, restart WebGazer
            if (consecutiveErrors >= maxConsecutiveErrors) {
              console.error(
                "Too many consecutive errors, restarting WebGazer...",
              );
              try {
                webgazer?.pause?.();
                setTimeout(async () => {
                  try {
                    await webgazer?.begin?.();
                    consecutiveErrors = 0;
                    console.log("WebGazer restarted successfully");
                  } catch (restartErr) {
                    console.error("WebGazer restart failed:", restartErr);
                  }
                }, 3000);
              } catch (pauseErr) {
                console.error("WebGazer pause failed:", pauseErr);
              }
              return;
            }
          }

          rafRef.current = requestAnimationFrame(loop); //added this Ethan
        };

        // Start the prediction loop
        rafRef.current = requestAnimationFrame(loop); //changed this Ethan
        console.log("Prediction loop started");

        return () => {
          running = false;
          window.removeEventListener(
            "eyeCalibrationUpdated",
            handleCalibrationUpdate,
          );
        };
      } catch (error) {
        console.error("Eye tracking initialization failed:", error);
      }
    };

    if (!globalEyeTrackingStarted) {
      globalEyeTrackingStarted = true;
      start();
    } //added this ETHan

    return () => {
      running = false;
      if (timerRef.current) clearTimeout(timerRef.current);
      if (lastElementRef.current) {
        lastElementRef.current.classList.remove("eye-hover", "eye-dwelling");
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      } //added this loop Ethan

      //added this try catch Ethan
      try {
        webgazer?.pause?.();
      } catch {}

      document.getElementById("eye-prediction-dot")?.remove();

      // 🔐 RELEASE GLOBAL LOCK
      globalEyeTrackingStarted = false;
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [dwellMs, enabled]);

  return { isInitialized };
}

export default useEyeClick;
