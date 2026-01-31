import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import axios from "axios";
import styles from "./NavBar.module.css";
import OCBCLogo from "../../assets/ocbc.svg";
import { useMenuContext } from "../../MenuContext";

function NavBar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isSimplified, setIsSimplified } = useMenuContext();

    useEffect(() => {
        const localIsSimplified = localStorage.getItem("isSimplified");
        if (localIsSimplified != null)
            setIsSimplified(localIsSimplified === "true");
    }, [setIsSimplified]);

      await axios.post("http://localhost:8080/logout", {}, {
    const handleLogout = async () => {
        try {
                    withCredentials: true,
                },
            );
            navigate("/");
        } catch (error) {
            console.error("Logout error:", error);
            navigate("/");
        }
    };

    const isActive = (path: string) => {
        return location.pathname === path;
    };

    const toggleSimplifiedMenu = () => {
        const newBool = !isSimplified;
        setIsSimplified(newBool);
        localStorage.setItem("isSimplified", newBool.toString());
    };

    // Don't show navbar on login page
    if (location.pathname === "/") {
        return null;
    }

    return (
        <nav className={styles.navbar}>
            <div className={styles.navContainer}>
                <Link to="/dashboard" className={styles.logoLink}>
                    <img src={OCBCLogo} alt="OCBC" className={styles.logo} />
                    <span className={styles.logoText}>Digital Banking</span>
                </Link>

                <div className={styles.navLinks}>
                    <Link
                        to="/dashboard"
                        className={`${styles.navLink} ${isActive("/dashboard") ? styles.active : ""}`}
                    >
                        <span className={styles.icon}>🏠</span>
                        Dashboard
                    </Link>
                    <Link
                        to="/transaction"
                        className={`${styles.navLink} ${isActive("/transaction") ? styles.active : ""}`}
                    >
                        <span className={styles.icon}>💸</span>
                        Transfer
                    </Link>
                    <Link
                        to="/demo"
                        className={`${styles.navLink} ${isActive("/demo") || isActive("/demo/transaction") ? styles.active : ""}`}
                    >
                        <span className={styles.icon}>🎮</span>
                        Demo
                    </Link>
                </div>

                <div className={styles.navActions}>
                    <button
                        onClick={toggleSimplifiedMenu}
                        className={styles.modeToggle}
                        title={
                            isSimplified
                                ? "Switch to Regular Mode"
                                : "Switch to Simple Mode"
                        }
                    >
                        <span className={styles.icon}>👁️</span>
                        <span className={styles.modeText}>
                            {isSimplified ? "Regular" : "Simple"}
                        </span>
                    </button>

                    <button onClick={handleLogout} className={styles.logoutBtn}>
                        <span className={styles.icon}>🚪</span>
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
}

export default NavBar;
