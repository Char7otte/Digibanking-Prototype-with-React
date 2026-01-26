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
  const [calibrationPoints, setCalibrationPoints] = useState<
    CalibrationPoint[]
  >([]);
  const collectedDataRef = useRef<
    Array<{
      screen: { x: number; y: number };
      prediction: { x: number; y: number };
    }>
  >([]);
  const webgazerRef = useRef<any>(null);

  useEffect(() => {
    // Get webgazer instance
    webgazerRef.current = (window as any).webgazer;
  }, []);

  const generateCalibrationPoints = () => {
    const points: CalibrationPoint[] = [];
    const padding = 100;
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Generate 9 calibration points in a grid
    const positions = [
      { x: padding, y: padding }, // Top-left
      { x: width / 2, y: padding }, // Top-center
      { x: width - padding, y: padding }, // Top-right
      { x: padding, y: height / 2 }, // Middle-left
      { x: width / 2, y: height / 2 }, // Center
      { x: width - padding, y: height / 2 }, // Middle-right
      { x: padding, y: height - padding }, // Bottom-left
      { x: width / 2, y: height - padding }, // Bottom-center
      { x: width - padding, y: height - padding }, // Bottom-right
    ];

    positions.forEach((pos, i) => {
      points.push({ x: pos.x, y: pos.y, id: i });
    });

    return points;
  };

  const startCalibration = () => {
    webgazerRef.current = (window as any).webgazer; //added ETHAN

    const points = generateCalibrationPoints();
    setCalibrationPoints(points);
    setCurrentPoint(0);
    setProgress(0);
    setIsCalibrating(true);
    collectedDataRef.current = [];
    try {
      const wg = webgazerRef.current;
      wg?.showVideo?.(true);
      wg?.showFaceOverlay?.(true);
      wg?.showFaceFeedbackBox?.(true);
      wg?.showPredictionPoints?.(true);
    } catch {} //try catch added ETHAn
  };

  const collectCalibrationData = async (point: CalibrationPoint) => {
    if (!webgazerRef.current) return;

    // Collect multiple samples for this point
    const samples = 5;
    const sampleDelay = 80; // ms

    for (let i = 0; i < samples; i++) {
      await new Promise((resolve) => setTimeout(resolve, sampleDelay));

      // ✅ Always train WebGazer even if prediction is null
      try {
        webgazerRef.current?.recordScreenPosition?.(point.x, point.y, "click");
      } catch {}

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
    // ✅ Train WebGazer with this known "truth" point
    try {
      webgazerRef.current?.recordScreenPosition?.(point.x, point.y, "click");
    } catch {} //added ETHAN

    // Collect data for this point
    await collectCalibrationData(point);

    const nextPoint = currentPoint + 1;
    setCurrentPoint(nextPoint);
    setProgress((nextPoint / calibrationPoints.length) * 100);

    if (nextPoint >= calibrationPoints.length) {
      // Calibration complete
      const offset = calculateOffset();

      // Save calibration data
      localStorage.setItem(
        "eye_calibration",
        JSON.stringify({
          offsetX: offset.x,
          offsetY: offset.y,
          timestamp: Date.now(),
        }),
      );

      // Dispatch event to notify other components
      window.dispatchEvent(new Event("eyeCalibrationUpdated"));

      try {
        const wg = webgazerRef.current;
        wg?.showVideo?.(false);
        wg?.showFaceOverlay?.(false);
        wg?.showFaceFeedbackBox?.(false);
        wg?.showPredictionPoints?.(false);
      } catch {} //added EThan

      setIsCalibrating(false);

      if (onComplete) {
        onComplete();
      }
    }
  };

  const clearCalibration = () => {
    localStorage.removeItem("eye_calibration");

    try {
      webgazerRef.current?.clearData?.();
    } catch {}
    try {
      const wg = webgazerRef.current;
      wg?.showVideo?.(false);
      wg?.showFaceOverlay?.(false);
      wg?.showFaceFeedbackBox?.(false);
      wg?.showPredictionPoints?.(false);
    } catch {} //added Ethan

    window.dispatchEvent(new Event("eyeCalibrationUpdated"));
  }; //added ETHAN

  if (!isCalibrating) {
    return (
      <div className={styles.calibrationContainer}>
        <div className={styles.calibrationCard}>
          <h2>Eye Tracker Calibration</h2>
          <p>
            Calibration improves the accuracy of eye tracking by learning where
            you look on the screen.
          </p>

          <div className={styles.instructions}>
            <h3>Instructions:</h3>
            <ol>
              <li>Click "Start Calibration" below</li>
              <li>Look at each orange circle as it appears</li>
              <li>Click on the circle while looking at it</li>
              <li>Repeat for all 9 points</li>
            </ol>
            <p>
              <strong>Tips:</strong>
            </p>
            <ul>
              <li>Keep your head still during calibration</li>
              <li>Ensure good lighting on your face</li>
              <li>Position yourself centered in front of the camera</li>
            </ul>
          </div>

          <div className={styles.buttonGroup}>
            <button className={styles.startButton} onClick={startCalibration}>
              Start Calibration
            </button>
            <button className={styles.clearButton} onClick={clearCalibration}>
              Clear Calibration
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
        Look at the orange circle and click it ({currentPoint + 1}/
        {calibrationPoints.length})
      </div>

      {calibrationPoints.map((point) => (
        <div
          key={point.id}
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
