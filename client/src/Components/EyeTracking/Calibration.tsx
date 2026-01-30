import { useState, useEffect, useRef } from "react";
import styles from "./Calibration.module.css";

interface CalibrationPoint {
  x: number;
  y: number;
  id: number;
}

export function Calibration({ onComplete }: { onComplete?: () => void }) {
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [currentPoint, setCurrentPoint] = useState(0);
  const [progress, setProgress] = useState(0);
  const [calibrationPoints, setCalibrationPoints] = useState<CalibrationPoint[]>([]);
  
  const collectedDataRef = useRef<
    Array<{
      screen: { x: number; y: number };
      prediction: { x: number; y: number };
    }>
  >([]);
  
  const webgazerRef = useRef<any>(null);

  useEffect(() => {
    webgazerRef.current = (window as any).webgazer;
  }, []);

  const generateCalibrationPoints = () => {
    const points: CalibrationPoint[] = [];
    const padding = 80;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const centerX = width / 2;
    const centerY = height / 2;

    // INCREASED: 13-Point High Precision Grid
    const positions = [
      // 1. Corners
      { x: padding, y: padding },
      { x: width - padding, y: padding },
      { x: padding, y: height - padding },
      { x: width - padding, y: height - padding },
      
      // 2. Edges Midpoints
      { x: centerX, y: padding },
      { x: width - padding, y: centerY },
      { x: centerX, y: height - padding },
      { x: padding, y: centerY },
      
      // 3. Center
      { x: centerX, y: centerY },

      // 4. "Sweet Spot" Inner Corners (Helps with accuracy in the middle-zone)
      { x: width * 0.3, y: height * 0.3 },
      { x: width * 0.7, y: height * 0.3 },
      { x: width * 0.3, y: height * 0.7 },
      { x: width * 0.7, y: height * 0.7 },
    ];

    positions.forEach((pos, i) => {
      points.push({ x: pos.x, y: pos.y, id: i });
    });

    return points;
  };

  const startCalibration = () => {
    webgazerRef.current = (window as any).webgazer;
    const wg = webgazerRef.current;

    const points = generateCalibrationPoints();
    setCalibrationPoints(points);
    setCurrentPoint(0);
    setProgress(0);
    setIsCalibrating(true);
    collectedDataRef.current = [];

    try {
      if (wg) {
        wg.clearData?.(); 
        wg.showVideo?.(true);
        wg.showFaceOverlay?.(true);
        wg.showFaceFeedbackBox?.(true);
        wg.showPredictionPoints?.(true); 
      }
    } catch (e) {
      console.error("Error starting calibration UI:", e);
    }
  };

  const collectCalibrationData = async (point: CalibrationPoint) => {
    if (!webgazerRef.current) return;

    // Increased samples for better accuracy
    const samples = 12; 
    const sampleDelay = 60; 

    for (let i = 0; i < samples; i++) {
      await new Promise((resolve) => setTimeout(resolve, sampleDelay));

      const prediction = webgazerRef.current.getCurrentPrediction?.();
      if (
        prediction &&
        typeof prediction.x === "number" &&
        typeof prediction.y === "number"
      ) {
        collectedDataRef.current.push({
          screen: { x: point.x, y: point.y },
          prediction: { x: prediction.x, y: prediction.y },
        });
      }
    }
  };

  const calculateOffset = () => {
    if (collectedDataRef.current.length === 0) return { x: 0, y: 0 };

    let totalOffsetX = 0;
    let totalOffsetY = 0;

    collectedDataRef.current.forEach((data) => {
      totalOffsetX += data.screen.x - data.prediction.x;
      totalOffsetY += data.screen.y - data.prediction.y;
    });

    return {
      x: totalOffsetX / collectedDataRef.current.length,
      y: totalOffsetY / collectedDataRef.current.length,
    };
  };

  const handlePointClick = async (point: CalibrationPoint) => {
    if (currentPoint !== point.id) return;

    // Train WebGazer
    try {
      webgazerRef.current?.recordScreenPosition?.(point.x, point.y, "click");
    } catch {}

    await new Promise(resolve => setTimeout(resolve, 100));
    await collectCalibrationData(point);

    const nextPoint = currentPoint + 1;
    setCurrentPoint(nextPoint);
    setProgress((nextPoint / calibrationPoints.length) * 100);

    if (nextPoint >= calibrationPoints.length) {
      const offset = calculateOffset();
      
      localStorage.setItem(
        "eye_calibration",
        JSON.stringify({
          offsetX: offset.x,
          offsetY: offset.y,
          timestamp: Date.now(),
        })
      );

      // Cleanup
      try {
        const wg = webgazerRef.current;
        wg?.showVideo?.(false);
        wg?.showFaceOverlay?.(false);
        wg?.showFaceFeedbackBox?.(false);
        wg?.showPredictionPoints?.(false); 
      } catch {}

      setIsCalibrating(false);
      window.dispatchEvent(new Event("eyeCalibrationUpdated"));

      if (onComplete) {
        onComplete();
      }
    }
  };

  const clearCalibration = () => {
    localStorage.removeItem("eye_calibration");
    try {
      webgazerRef.current?.clearData?.();
      const wg = webgazerRef.current;
      wg?.showVideo?.(false);
      wg?.showFaceOverlay?.(false);
      wg?.showFaceFeedbackBox?.(false);
      wg?.showPredictionPoints?.(false);
    } catch {}
    window.dispatchEvent(new Event("eyeCalibrationUpdated"));
  };

  if (!isCalibrating) {
    return (
      <div className={styles.calibrationContainer}>
        <div className={styles.calibrationCard}>
          <h2>Eye Tracker Calibration</h2>
          <p>
            The eye tracker is currently <strong>uncalibrated</strong>.
          </p>

          <div className={styles.instructions}>
            <h3>Instructions:</h3>
            <ol>
              <li>Click "Start Calibration" below.</li>
              <li>
                <strong>IMPORTANT:</strong> Use your <strong>MOUSE</strong> to click the 13 orange circles.
              </li>
              <li>Look directly at the circle while clicking it.</li>
              <li>Keep your head still.</li>
            </ol>
          </div>

          <div className={styles.buttonGroup}>
            <button 
              className={styles.startButton} 
              onClick={startCalibration}
              data-eye-clickable="true"
            >
              Start Calibration (13 Points)
            </button>
            <button 
              className={styles.clearButton} 
              onClick={clearCalibration}
              data-eye-clickable="true"
            >
              Reset Data
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.calibrationOverlay}>
      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className={styles.instruction}>
        Look at the circle and click it ({currentPoint + 1}/{calibrationPoints.length})
      </div>

      {calibrationPoints.map((point) => (
        <div
          key={point.id}
          data-eye-clickable="true" 
          className={`${styles.calibrationPoint} ${
            point.id === currentPoint ? styles.active : ""
          } ${point.id < currentPoint ? styles.completed : ""}`}
          style={{
            left: `${point.x}px`,
            top: `${point.y}px`,
          }}
          onClick={() => handlePointClick(point)}
        >
          {point.id < currentPoint && (
            <span className={styles.checkmark}>✓</span>
          )}
        </div>
      ))}
    </div>
  );
}

export default Calibration;