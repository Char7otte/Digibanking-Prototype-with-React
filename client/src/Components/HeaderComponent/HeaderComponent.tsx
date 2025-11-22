import styles from "./HeaderComponent.module.css";

function HeaderComponent() {
    return (
        <header className="d-flex justify-content-between">
            <input type="text" placeholder="Search transactions, payments" className={styles.headerInput} />
            <button className={styles.modifierButton}>👁️</button>
        </header>
    );
}

export default HeaderComponent;
