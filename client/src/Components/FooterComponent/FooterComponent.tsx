import { Link } from "react-router-dom";
import styles from "./FooterComponent.module.css";

function FooterComponent() {
    return (
        <footer className={styles.container}>
            <Link to={"/Dashboard"} className={styles.buttonContainer}>
                <button className={styles.navButton}>Home</button>
            </Link>
            <Link to={"/Dashboard"} className={styles.buttonContainer}>
                <button className={styles.navButton}>Transfer</button>
            </Link>
            <Link to={"/Dashboard"} className={styles.buttonContainer}>
                <button className={styles.navButton}>Pay Bills</button>
            </Link>
            <Link to={"/Dashboard"} className={styles.buttonContainer}>
                <button className={styles.navButton}>Settings</button>
            </Link>
        </footer>
    );
}

export default FooterComponent;
