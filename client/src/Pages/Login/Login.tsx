import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./Login.module.css";
import AssistanceComponent from "../../Components/AssistanceComponent/AssistanceComponent";
import OCBCLogo from "../../assets/ocbc.svg";

function LoginComponent() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    async function handleLogin(e: FormEvent) {
        e.preventDefault();

        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        const data = {
            username: formData.get("username"),
            password: formData.get("password"),
        };

        try {
            setIsLoading(true);
            const res = await axios.post("http://localhost:8080/login", data, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                withCredentials: true,
            });

            navigate("/dashboard", {
                state: {
                    user: res.data.user,
                },
            });
            setIsLoading(false);
        } catch (error: any) {
            setIsLoading(false);
            console.log("Login error: ", error);

            if (error.response?.data) {
                alert("Error: " + JSON.stringify(error.response.data, null, 2));
            } else {
                alert("Login failed. Please try again.");
            }
        }
    }

    if (isLoading) return <div className="loadingContainer">Logging in...</div>;

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
                    <form onSubmit={handleLogin} className={styles.loginForm}>
                        <label htmlFor="username" className="m-2">
                            Username
                        </label>
                        <input type="text" name="username" id="username" placeholder="Enter your username" className="spacing-md" />
                        <label htmlFor="username" className="m-2">
                            PIN
                        </label>
                        <input type="text" name="password" id="password" placeholder="Enter your PIN number" className="spacing-md" />
                        <a href="" className="spacing-md d-block text-start w-100 mt-2">
                            Forgot password?
                        </a>
                        <button type="submit">Sign In</button>
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
