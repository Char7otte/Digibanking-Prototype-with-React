import styles from "./LoginComponent.module.css";

function LoginComponent() {
    return (
        <div>
            <form action="">
                <label htmlFor="username">Username:</label> <br />
                <input type="text" name="username" id="username" placeholder="Enter your username" className="spacing-md" /> <br />
                <label htmlFor="username">Password:</label> <br />
                <input type="text" name="username" id="username" placeholder="Enter your password" className="spacing-md" /> <br />
                <div className={styles.loginModifiers}>
                    <button type="submit" className={styles.loginButton}>
                        Login
                    </button>
                    <a href="">Forgot password?</a>
                </div>
                <br />
            </form>
        </div>
    );
}

export default LoginComponent;
