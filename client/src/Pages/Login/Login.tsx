import { Link } from "react-router-dom";
import styles from "./Login.module.css";
import AssistanceComponent from "../../Components/AssistanceComponent/AssistanceComponent";
import OCBCLogo from "../../assets/ocbc.svg";

function LoginComponent() {
    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center flex-column">
            <section>
                <img src={OCBCLogo} alt="" />
                <p className="subtitle pb-4">Internet Banking</p>
            </section>
            <main className={`${styles.mainContainer} `}>
                <div>
                    <h1>Welcome Back</h1>
                    <p className="subtitle pb-4">Sign in to access your bank account</p>
                    <form action="" className={styles.loginForm}>
                        <label htmlFor="username" className="m-2">
                            Username
                        </label>
                        <input type="text" name="username" id="username" placeholder="Enter your username" className="spacing-md" />
                        <label htmlFor="username" className="m-2">
                            PIN
                        </label>
                        <input type="text" name="pin" id="pin" placeholder="Enter your PIN number" className="spacing-md" />
                        <a href="" className="spacing-md d-block text-start w-100 mt-2">
                            Forgot password?
                        </a>
                        <Link to="/dashboard">
                            <button type="submit">Sign In</button>
                        </Link>
                        <hr />
                        <p>
                            New to OCBC? <a href="">Open an Account</a>
                        </p>
                    </form>
                </div>
                <AssistanceComponent />
            </main>
        </div>
    );
}

export default LoginComponent;
