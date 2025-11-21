import { Link } from "react-router-dom";
import styles from "./Login.module.css";
import AssistanceComponent from "../../Components/AssistanceComponent/AssistanceComponent";

function LoginComponent() {
    return (
        <>
            <form action="">
                <label htmlFor="username">Username:</label>
                <input type="text" name="username" id="username" placeholder="Enter your username" className="spacing-md" />
                <label htmlFor="username">Password:</label>
                <input type="text" name="username" id="username" placeholder="Enter your password" className="spacing-md" />
                <a href="" className="spacing-md">
                    Forgot password?
                </a>

                <Link to="/dashboard">
                    <button type="submit">Login</button>
                </Link>
            </form>
            <AssistanceComponent />
        </>
    );
}

export default LoginComponent;
