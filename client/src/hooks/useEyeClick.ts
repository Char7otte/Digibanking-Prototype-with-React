import { useEffect, useRef, useState } from "react";

// --- INTERFACE ---
interface WebGazer {
  setRegression: (type: string) => WebGazer;
  setGazeListener: (listener: (data: any, clock: any) => void) => WebGazer;
  begin: () => Promise<void>;
  clearData?: () => void;
  removeMouseEventListeners?: () => void;
  showVideo?: (val: boolean) => void;
  showFaceOverlay?: (val: boolean) => void;
  showFaceFeedbackBox?: (val: boolean) => void;
  showPredictionPoints?: (val: boolean) => void;
  applyKalmanFilter?: (val: boolean) => void;
  getCurrentPrediction: () => { x: number; y: number } | null;
  pause?: () => void;
  resume?: () => void;
  recordScreenPosition?: (x: number, y: number, type: string) => void;
  setData?: (data: any[]) => void;
}

let globalEyeTrackingStarted = false;

type UseEyeClickOpts = { dwellMs?: number; enabled?: boolean };

export function useEyeClick({
  dwellMs = 800,
  enabled = true,
}: UseEyeClickOpts = {}) {
  const lastElementRef = useRef<HTMLElement | null>(null);
  const dwellTimerRef = useRef<number | null>(null);
  const graceTimerRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Smoothing Window
  const predictionHistoryRef = useRef<Array<{ x: number; y: number }>>([]);
  const smoothingWindowSize = 8; 

  useEffect(() => {
    // --- CLEANUP HELPER ---
    const clearTimers = () => {
      if (dwellTimerRef.current) {
        window.clearTimeout(dwellTimerRef.current);
        dwellTimerRef.current = null;
      }
      if (graceTimerRef.current) {
        window.clearTimeout(graceTimerRef.current);
        graceTimerRef.current = null;
      }
    };

    if (!enabled) {
      clearTimers();
      if (lastElementRef.current) {
        lastElementRef.current.classList.remove("eye-hover");
        lastElementRef.current = null;
      }
      
      // Stop WebGazer if it's already running (when disabled)
      if (globalEyeTrackingStarted) {
        // @ts-ignore
        const currentWebGazer = (window as any).webgazer;
        try {
           if (currentWebGazer) {
               currentWebGazer.end(); // Use .end() to stop camera and processing
               globalEyeTrackingStarted = false;
               setIsInitialized(false);
           }
        } catch (e) {
          console.warn("Error stopping webgazer:", e);
        }
      }
      return;
    }

    let running = true;
    let predictionDot: HTMLElement | null = null;
    let webgazer: WebGazer | null = null;

    // --- CORNER CLICKING TRAINER ---
    const handleManualClick = (e: MouseEvent) => {
      if (!isInitialized || !webgazer) return;

      try {
        webgazer.recordScreenPosition?.(e.clientX, e.clientY, "click");
        
        // Visual Feedback (Blue Flash)
        if (predictionDot) {
          predictionDot.style.backgroundColor = "#0088ff";
          predictionDot.style.transform = "translate(-50%, -50%) scale(1.5)";
          predictionDot.style.boxShadow = "0 0 20px #0088ff";
          
          setTimeout(() => {
            if (predictionDot) {
              predictionDot.style.backgroundColor = "rgba(255, 100, 0, 0.7)";
              predictionDot.style.transform = "translate(-50%, -50%) scale(1)";
              predictionDot.style.boxShadow = "0 0 10px rgba(255, 100, 0, 0.5)";
            }
          }, 200);
        }
      } catch (err) {
        console.warn("Training error:", err);
      }
    };

    // --- MAGNETISM SEARCH (40px) ---
    const findNearbyClickable = (x: number, y: number): HTMLElement | null => {
      const radius = 40; 

      const exactEl = document.elementFromPoint(x, y) as HTMLElement;
      if (exactEl) {
        const clickable = exactEl.closest('[data-eye-clickable="true"], button, a, [role="button"]') as HTMLElement;
        if (clickable) return clickable;
      }

      const offsets = [
        { dx: radius, dy: 0 },
        { dx: -radius, dy: 0 },
        { dx: 0, dy: radius },
        { dx: 0, dy: -radius },
      ];

      for (const o of offsets) {
        const el = document.elementFromPoint(x + o.dx, y + o.dy) as HTMLElement;
        if (el) {
           const clickable = el.closest('[data-eye-clickable="true"], button, a, [role="button"]') as HTMLElement;
           if (clickable) return clickable;
        }
      }
      return null;
    };

    // --- SMOOTHING ---
    const smoothPrediction = async (rawPrediction: { x: number; y: number }) => {
      predictionHistoryRef.current.push(rawPrediction);
      if (predictionHistoryRef.current.length > smoothingWindowSize) {
        predictionHistoryRef.current.shift();
      }
      const avg = predictionHistoryRef.current.reduce(
        (acc, curr) => ({ x: acc.x + curr.x, y: acc.y + curr.y }),
        { x: 0, y: 0 }
      );
      const count = predictionHistoryRef.current.length;
      return { x: avg.x / count, y: avg.y / count };
    };

    const start = async () => {
      try {
        if (!enabled) return; // double check

        // @ts-ignore
        const mod = await import("webgazer");
        webgazer = (mod?.default || mod) as any;

        if (!webgazer) return;
        (window as any).webgazer = webgazer;

        // FIXED: Removed "webgazer.clearData()" here.
        // This allows WebGazer to load previous calibration data from localStorage
        // automatically when the user navigates between pages.
        
        await webgazer.setRegression("ridge").setGazeListener(() => {}).begin();
        // Force show video to false if desired, although .begin() might show it initially
        // webgazer.showVideo(false); 
        
        const removeListeners = () => {
             if (webgazer?.removeMouseEventListeners) {
                 webgazer.removeMouseEventListeners();
             }
             // Ensure we don't accidentally record mouse moves
             // Note: We leave existing data intact!
        };
        removeListeners();

        // Attach Click Trainer
        document.addEventListener("click", handleManualClick);

        // UI Setup
        if (webgazer.showVideo) webgazer.showVideo(false);
        if (webgazer.showFaceOverlay) webgazer.showFaceOverlay(false);
        if (webgazer.showFaceFeedbackBox) webgazer.showFaceFeedbackBox(false);
        if (webgazer.showPredictionPoints) webgazer.showPredictionPoints(false);
        if (webgazer.applyKalmanFilter) webgazer.applyKalmanFilter(true);

        setIsInitialized(true);

        // Visual Dot
        document.getElementById("eye-prediction-dot")?.remove();
        predictionDot = document.createElement("div");
        predictionDot.id = "eye-prediction-dot";
        predictionDot.style.cssText = `
          position: fixed;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgba(255, 100, 0, 0.7);
          border: 2px solid rgba(255, 255, 255, 0.9);
          pointer-events: none;
          z-index: 999999;
          transform: translate(-50%, -50%);
          box-shadow: 0 0 10px rgba(255, 100, 0, 0.5);
          transition: left 0.1s ease-out, top 0.1s ease-out, transform 0.2s; 
          display: block;
        `;
        document.body.appendChild(predictionDot);

        const loop = async () => {
          if (!running) return;

          try {
            const prediction = await webgazer?.getCurrentPrediction();

            if (prediction && typeof prediction.x === "number") {
              const smoothed = await smoothPrediction(prediction);
              
              const correctedX = smoothed.x;
              const correctedY = smoothed.y;

              if (predictionDot) {
                const clampX = Math.max(0, Math.min(window.innerWidth, correctedX));
                const clampY = Math.max(0, Math.min(window.innerHeight, correctedY));
                
                predictionDot.style.left = `${clampX}px`;
                predictionDot.style.top = `${clampY}px`;
                predictionDot.style.opacity = "1";
              }

              // --- INTERACTION LOGIC ---
              const clickableEl = findNearbyClickable(correctedX, correctedY);

              if (clickableEl) {
                // ON TARGET
                if (graceTimerRef.current) {
                    window.clearTimeout(graceTimerRef.current);
                    graceTimerRef.current = null;
                }

                if (clickableEl !== lastElementRef.current) {
                  if (lastElementRef.current) {
                    lastElementRef.current.classList.remove("eye-hover", "eye-dwelling");
                  }
                  clearTimers(); 

                  lastElementRef.current = clickableEl;
                  clickableEl.classList.add("eye-hover");

                  dwellTimerRef.current = window.setTimeout(() => {
                      if (clickableEl) {
                          clickableEl.classList.add("eye-dwelling");
                          clickableEl.click();
                          
                          // Visual Feedback
                          clickableEl.style.transform = "scale(0.95)";
                          setTimeout(() => {
                             if (clickableEl) clickableEl.style.transform = "";
                          }, 150);
                      }
                  }, dwellMs);
                }
              } else {
                // LOST TARGET
                if (lastElementRef.current && !graceTimerRef.current) {
                    // Grace Period 200ms
                    graceTimerRef.current = window.setTimeout(() => {
                        if (lastElementRef.current) {
                            lastElementRef.current.classList.remove("eye-hover", "eye-dwelling");
                            lastElementRef.current = null;
                        }
                        clearTimers();
                    }, 200);
                }
              }

            } else {
                if (predictionDot) predictionDot.style.opacity = "0.2";
            }
          } catch (err) {}

          rafRef.current = requestAnimationFrame(loop);
        };

        rafRef.current = requestAnimationFrame(loop);
      } catch (error) {
        console.error("Init failed:", error);
      }
    };

    if (!globalEyeTrackingStarted) {
      globalEyeTrackingStarted = true;
      start();
    }

    return () => {
      running = false;
      globalEyeTrackingStarted = false;
      clearTimers();
      document.removeEventListener("click", handleManualClick);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (lastElementRef.current) lastElementRef.current.classList.remove("eye-hover", "eye-dwelling");
      document.getElementById("eye-prediction-dot")?.remove();
      try { if (webgazer) webgazer.pause?.(); } catch {}
    };
  }, [dwellMs, enabled]);

  return { isInitialized };
}

export default useEyeClick;