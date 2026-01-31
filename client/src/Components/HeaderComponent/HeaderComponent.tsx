import { useEffect } from "react";
import styles from "./HeaderComponent.module.css";
import { useMenuContext } from "../../MenuContext.tsx";

function HeaderComponent() {
    const { isSimplified, setIsSimplified } = useMenuContext();

    useEffect(() => {
        const localIsSimplified = localStorage.getItem("isSimplified");
        if (localIsSimplified != null)
            setIsSimplified(localIsSimplified === "true");
    }, []);

    // function toggleSimplifiedMenu() {
    //     //Need to create temp bool because states don't update dynamically within a function.
    //     const newBool = !isSimplified;
    //     setIsSimplified(newBool);
    //     localStorage.setItem("isSimplified", newBool.toString());
    // }

    return (
        <header className="d-flex justify-content-between p-2">
            <input
                type="text"
                placeholder="Search transactions, payments"
                className={styles.headerInput}
            />
        </header>
    );
}

export default HeaderComponent;
