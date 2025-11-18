import { Link } from "react-router-dom";
import styles from "./Login.module.css";
import AssistanceComponent from "../../Components/AssistanceComponent/AssistanceComponent";

function LoginComponent() {
    return (
        <>
            <form action="" className={styles.container}>
                <label htmlFor="username">Username:</label>
                <input type="text" name="username" id="username" placeholder="Enter your username" className="spacing-md" />
                <label htmlFor="username">Password:</label>
                <input type="text" name="username" id="username" placeholder="Enter your password" className="spacing-md" />
                <a href="" className="spacing-md">
                    Forgot password?
                </a>

                <Link to="/dashboard">
                    <button type="submit" className={styles.loginButton}>
                        Login
                    </button>
                </Link>
            </form>
            <AssistanceComponent />
        </>
    );
}

export default LoginComponent;
