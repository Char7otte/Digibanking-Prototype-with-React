import { useState } from "react";
import ReactModal from "react-modal";
import styles from "./AccessibilityComponent.module.css";
import supabase from "../../utils/supabase";

function TokenComponent({ userID }: { userID: number }) {
    const [code, setCode] = useState<string>();
    const [isOpen, setIsOpen] = useState(false);
    const [isGenerated, setIsGenerated] = useState(false);

    function openModal() {
        setIsOpen(true);
        handleTokenGeneration();
    }
    function closeModal() {
        setIsOpen(false);
    }

    ReactModal.setAppElement("#root");

    async function handleTokenGeneration() {
        setIsGenerated(false);
        const generatedCode = Math.floor(
            100000 + Math.random() * 900000,
        ).toString();
        if (!userID) return;

        const tenMinsAgo = new Date(Date.now() - 1000 * 60 * 10).toISOString();
        try {
            const { data, error: checkDupesError } = await supabase
                .from("token")
                .select()
                .eq("code", generatedCode)
                .gt("expires_at", tenMinsAgo as any);

            if (checkDupesError) {
                console.error(checkDupesError);
                return;
            }

            if (data && data.length !== 0) return handleTokenGeneration();

            const { error: insertCodeError } = await supabase
                .from("token")
                .insert({ user_id: userID, code: generatedCode });
            if (insertCodeError) console.error(insertCodeError);
            setIsGenerated(true);
            setCode(generatedCode);
        } catch (err) {
            console.error("startAssisting error:", err);
        }
    }

    return (
        <>
            <button
                className={`${styles.helpButton} ${styles.tokenButton}`}
                onClick={openModal}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-person-raised-hand"
                    viewBox="0 0 16 16"
                >
                    <path d="M6 6.207v9.043a.75.75 0 0 0 1.5 0V10.5a.5.5 0 0 1 1 0v4.75a.75.75 0 0 0 1.5 0v-8.5a.25.25 0 1 1 .5 0v2.5a.75.75 0 0 0 1.5 0V6.5a3 3 0 0 0-3-3H6.236a1 1 0 0 1-.447-.106l-.33-.165A.83.83 0 0 1 5 2.488V.75a.75.75 0 0 0-1.5 0v2.083c0 .715.404 1.37 1.044 1.689L5.5 5c.32.32.5.754.5 1.207" />
                    <path d="M8 3a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3" />
                </svg>
            </button>
            <ReactModal isOpen={isOpen} onRequestClose={closeModal}>
                {isGenerated ? "Your code is: " + code : "Generating..."}
            </ReactModal>
        </>
    );
}

export default TokenComponent;
