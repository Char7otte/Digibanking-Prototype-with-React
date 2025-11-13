import { useState, useEffect } from "react";
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
    return (
        <div className={styles.assistanceButtonContainer}>
            <button onClick={openModal}>Assistance♿</button>
            <ReactModal isOpen={isOpen} onRequestClose={closeModal}>
                <label htmlFor="">
                    Distance between buttons: <strong>{elementDistance}px</strong>
                </label>{" "}
                <br />
                <input type="range" className={styles.rangeInput} min="16" max="48" onChange={handleDistanceChange} value={elementDistance} />
                <hr />
            </ReactModal>
        </div>
    );
}

export default AssistanceComponent;
