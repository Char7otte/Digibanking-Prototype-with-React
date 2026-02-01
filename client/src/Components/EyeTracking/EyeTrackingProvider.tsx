import { useState } from "react";
import { useEyeClick } from "../../hooks/useEyeClick";
import { useClickableText } from "../../hooks/useClickableText";
import Calibration from "./Calibration";
import "../../eye-tracking.css";

/**
 * Example component showing how to use eye-tracking with clickable text
 *
 * Usage:
 * 1. Import this component in your app
 * 2. Add the <EyeTrackingProvider /> component at the root of your app
 * 3. Any clickable text will automatically be detected
 * 4. You can also manually mark elements with data-eye-clickable="true"
 */
export function EyeTrackingProvider() {
    const [showCalibration, setShowCalibration] = useState(false);
    const [isEnabled, setIsEnabled] = useState(true);

    // Initialize eye tracking with 800ms dwell time
    const { isInitialized } = useEyeClick({
        dwellMs: 800,
        enabled: isEnabled,
    });

    //Automatically mark clickable text elements
    useClickableText();

    return (
        <>
            {showCalibration && (
                <Calibration onComplete={() => setShowCalibration(false)} />
            )}

            <div
                style={{
                    position: "fixed",
                    bottom: "10px",
                    right: "10px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    zIndex: 9999,
                }}
            >
                <div
                    style={{
                        padding: "8px 12px",
                        backgroundColor: isEnabled
                            ? isInitialized
                                ? "#4caf50"
                                : "#ff9800"
                            : "#9e9e9e",
                        color: "white",
                        borderRadius: "5px",
                        fontSize: "12px",
                        boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                    }}
                >
                    Eye Tracking:{" "}
                    {isEnabled
                        ? isInitialized
                            ? "Active ✓"
                            : "Initializing..."
                        : "Disabled"}
                </div>

                <button
                    onClick={() => setIsEnabled(!isEnabled)}
                    style={{
                        padding: "8px 12px",
                        backgroundColor: isEnabled ? "#f44336" : "#4caf50",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        fontSize: "12px",
                        cursor: "pointer",
                        boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                        fontWeight: "600",
                    }}
                >
                    {isEnabled ? "Disable" : "Enable"}
                </button>

                {isEnabled && (
                    <button
                        onClick={() => setShowCalibration(true)}
                        style={{
                            padding: "8px 12px",
                            backgroundColor: "#ff6b35",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            fontSize: "12px",
                            cursor: "pointer",
                            boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                            fontWeight: "600",
                        }}
                    >
                        Calibrate
                    </button>
                )}
            </div>
        </>
    );
}

export default EyeTrackingProvider;
