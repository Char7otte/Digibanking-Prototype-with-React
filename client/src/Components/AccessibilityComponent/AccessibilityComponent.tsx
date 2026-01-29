import { useState, useEffect, type ChangeEvent } from "react";
import ReactModal from "react-modal";
import styles from "./AccessibilityComponent.module.css";

function AccessibilityComponent() {
    const defaultElementDistanceMin = 16;
    const defaultElementDistanceMax = 48;
    const [elementDistance, setElementDistance] = useState(
        defaultElementDistanceMin,
    );
    const defaultButtonSizeMin = 50;
    const defaultButtonSizeMax = 150;
    const [buttonSize, setButtonSize] = useState(defaultButtonSizeMin);

    const [isOpen, setIsOpen] = useState(false);

    function openModal() {
        setIsOpen(true);
    }

    function closeModal() {
        setIsOpen(false);
    }

    function handleDistanceChange(e: ChangeEvent<HTMLInputElement>) {
        const distance = e.target.value;
        setElementDistance(parseInt(distance));
        localStorage.setItem("elementDistance", distance);
    }

    function handlebuttonSizeChange(e: ChangeEvent<HTMLInputElement>) {
        const size = e.target.value;
        setButtonSize(parseInt(size));
        localStorage.setItem("buttonSize", size);
    }

    useEffect(() => {
        const localElementDistance = localStorage.getItem("elementDistance");
        if (localElementDistance != null) {
            setElementDistance(parseInt(localElementDistance));
        }
        const localButtonSize = localStorage.getItem("buttonSize");
        if (localButtonSize != null) {
            setButtonSize(parseInt(localButtonSize));
        }
    }, []);

    useEffect(() => {
        document.documentElement.style.setProperty(
            "--spacing",
            elementDistance + "px",
        );
    }, [elementDistance]);

    useEffect(() => {
        document.documentElement.style.setProperty(
            "--buttonSize",
            buttonSize + "px",
        );
    }, [buttonSize]);

    ReactModal.setAppElement("#root");

    return (
        <div>
            <button
                onClick={openModal}
                className={`${styles.helpButton} ignore-sizing`}
            >
                Assistance♿
            </button>
            <ReactModal isOpen={isOpen} onRequestClose={closeModal}>
                <label>
                    Distance between buttons: <strong>{elementDistance}</strong>
                </label>
                <br />
                <input
                    type="range"
                    min={defaultElementDistanceMin}
                    max={defaultElementDistanceMax}
                    onChange={handleDistanceChange}
                    value={elementDistance}
                />
                <hr />
                <label>
                    Button size: <strong>{buttonSize}</strong>
                </label>
                <input
                    type="range"
                    min={defaultButtonSizeMin}
                    max={defaultButtonSizeMax}
                    onChange={handlebuttonSizeChange}
                    value={buttonSize}
                />
            </ReactModal>
        </div>
    );
}

export default AccessibilityComponent;
