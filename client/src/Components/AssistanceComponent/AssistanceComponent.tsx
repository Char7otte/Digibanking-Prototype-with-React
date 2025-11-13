import { useState, useEffect, type ChangeEvent } from "react";
import ReactModal from "react-modal";
import styles from "./AssistanceComponent.module.css";

function AssistanceComponent() {
    const [isOpen, setIsOpen] = useState(false);

    function openModal() {
        setIsOpen(true);
    }

    function closeModal() {
        setIsOpen(false);
    }

    //Controls the distance between elements.
    const [elementDistance, setElementDistance] = useState(16);

    function handleDistanceChange(e: ChangeEvent<HTMLInputElement>) {
        setElementDistance(parseInt(e.target.value));
    }

    const [buttonSize, setbuttonSize] = useState(50);

    function handlebuttonSizeChange(e: ChangeEvent<HTMLInputElement>) {
        setbuttonSize(parseInt(e.target.value));
    }

    useEffect(() => {
        document.documentElement.style.setProperty("--spacing", elementDistance + "px");
    }, [elementDistance]);

    useEffect(() => {
        document.documentElement.style.setProperty("--buttonSize", buttonSize + "px");
    }, [buttonSize]);

    ReactModal.setAppElement("#root");

    return (
        <div className={styles.assistanceButtonContainer}>
            <button onClick={openModal} className="important-button">
                Assistance♿
            </button>
            <ReactModal isOpen={isOpen} onRequestClose={closeModal}>
                <label>
                    Distance between buttons: <strong>{elementDistance}</strong>
                </label>
                <br />
                <input type="range" className={styles.rangeInput} min="16" max="48" onChange={handleDistanceChange} value={elementDistance} />
                <hr />
                <label>
                    Button size: <strong>{buttonSize}</strong>
                </label>
                <input type="range" className={styles.rangeInput} min="50" max="150" onChange={handlebuttonSizeChange} value={buttonSize} />
            </ReactModal>
        </div>
    );
}

export default AssistanceComponent;
