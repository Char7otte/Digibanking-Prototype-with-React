import styles from "./HeaderComponent.module.css";
import { useMenuContext } from "../../MenuContext.tsx";

function HeaderComponent() {
    const { isSimplified, setIsSimplified } = useMenuContext();

    function toggleSimplifiedMenu() {
        setIsSimplified(!isSimplified);
    }

    return (
        <header className="d-flex justify-content-between">
            <input type="text" placeholder="Search transactions, payments" className={styles.headerInput} />
            <button className={styles.modifierButton} onClick={toggleSimplifiedMenu}>
                👁️
            </button>
        </header>
    );
}

export default HeaderComponent;
