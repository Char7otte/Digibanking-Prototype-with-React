import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./Login.module.css";
import AccessibilityComponent from "../../Components/AccessibilityComponent/AccessibilityComponent";
import OCBCLogo from "../../assets/ocbc.svg";

function LoginComponent() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [signOption, setSignOption] = useState("login");

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
      await axios.post("http://localhost:8080/login", data, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        withCredentials: true,
      });
      setIsLoading(false);
      navigate("/dashboard");
    } catch (error: any) {
      setIsLoading(false);
      console.log("Login error: ", error);

      alert("Login failed. Please try again.");
    }
  }

  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    // const form = e.target as HTMLFormElement;
    // const formData = new FormData(form);
  }

  //   async function handleAssistance(e: FormEvent) {
  //     e.preventDefault();
  //   }

  //   function updateSignOption(newOption: string) {
  //     setSignOption(newOption);
  //   }

  if (isLoading) return <div className="loadingContainer">Logging in...</div>;

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center flex-column">
      <section className="pt-4">
        <img src={OCBCLogo} alt="" />
        <p className="subtitle pb-4">Internet Banking</p>
      </section>
      <main className={`${styles.mainContainer} `}>
        <fieldset className={`${styles.radioFieldset} d-flex border-0`}>
          <div className={styles.radioContainer}>
            <input
              type="radio"
              name="radio"
              id="login"
              value="login"
              checked={signOption === "login"}
              onChange={() => setSignOption("login")}
            />
            <label htmlFor="login">Sign in</label>
          </div>
          <div className={styles.radioContainer}>
            <input
              type="radio"
              name="radio"
              id="register"
              value="register"
              checked={signOption === "register"}
              onChange={() => setSignOption("register")}
            />
            <label htmlFor="register">Sign up</label>
          </div>
          <div className={styles.radioContainer}>
            <input
              type="radio"
              name="radio"
              id="otp"
              value="otp"
              checked={signOption === "otp"}
              onChange={() => setSignOption("otp")}
            />
            <label htmlFor="otp">Limited Access</label>
          </div>
        </fieldset>
        {signOption == "login" && (
          <div>
            <h1>Welcome Back</h1>
            <p className="subtitle pb-4">Sign in to access your bank account</p>
            <form onSubmit={handleLogin} className={styles.loginForm}>
              <label htmlFor="username" className="m-2">
                Username
              </label>
              <input
                type="text"
                name="username"
                id="username"
                placeholder="Enter your username"
                className="spacing-md"
              />
              <label htmlFor="username" className="m-2">
                PIN
              </label>
              <input
                type="password"
                name="password"
                id="password"
                placeholder="Enter your PIN number"
                className="spacing-md"
              />
              <a href="" className="spacing-md d-block text-start w-100 mt-2">
                Forgot password?
              </a>
              <button type="submit" className="important-button">
                Sign In
              </button>
              <hr />
              <p>
                New to OCBC? <a href="">Open an Account</a>
              </p>
            </form>
          </div>
        )}
        {signOption == "register" && (
          <div>
            <h1>Welcome</h1>
            <p className="subtitle pb-4">Create a new bank account</p>
            <form onSubmit={handleRegister} className={styles.loginForm}>
              <label htmlFor="username" className="m-2">
                Username
              </label>
              <input
                type="text"
                name="username"
                id="username"
                placeholder="Enter your username"
                className="spacing-md"
              />
              <label htmlFor="name" className="m-2">
                Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                placeholder="Enter your name"
                className="spacing-md"
              />
              <label htmlFor="username" className="m-2">
                PIN
              </label>
              <input
                type="text"
                name="password"
                id="password"
                placeholder="Enter your PIN number"
                className="spacing-md"
              />
              <button type="submit" className="important-button mt-2">
                Sign up
              </button>
              <hr />
              <p>
                New to OCBC? <a href="">Open an Account</a>
              </p>
            </form>
          </div>
        )}
        {signOption == "otp" && (
          <div>
            <h1>Limited Access</h1>
            <p className="subtitle pb-4">
              Enter the generated OTP to gain access to the account
            </p>
            <form onSubmit={handleLogin} className={styles.loginForm}>
              <input
                type="hidden"
                name="username"
                id="username"
                placeholder="Enter your username"
                className="spacing-md"
                value="bob"
              />
              <input
                type="hidden"
                name="password"
                id="password"
                placeholder="Enter your PIN number"
                className="spacing-md"
                value="bobpass"
              />
              <label htmlFor="otp" className="m-2">
                One Time Password
              </label>
              <input
                type="text"
                name="otp"
                id="otp"
                placeholder="Enter your otp"
                className="spacing-md"
              />
              <button type="submit" className="important-button mt-2">
                Login
              </button>
              <hr />
              <p>
                New to OCBC? <a href="">Open an Account</a>
              </p>
            </form>
          </div>
        )}

        <AccessibilityComponent />
      </main>
    </div>
  );
}

export default LoginComponent;
