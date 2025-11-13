import { Link } from "react-router-dom";
import styles from "./NotFound.module.css";

function NotFound() {
    return (
        <div className={styles.centerText}>
            <h1>404 Not found</h1>
            <p>This page doesn't exist!</p>
            <Link to={"/"}>
                <button>Return home</button>
            </Link>
        </div>
    );
}

export default NotFound;
