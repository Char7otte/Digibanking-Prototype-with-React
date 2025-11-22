import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Dashboard.module.css";
import AccountCardComponent from "../../Components/AccountCardComponent/AccountCardComponent";
import AccessibilityComponent from "../../Components/AccessibilityComponent/AccessibilityComponent.tsx";
import HeaderComponent from "../../Components/HeaderComponent/HeaderComponent";
import { useMenuContext } from "../../MenuContext.tsx";
// import FooterComponent from "../../Components/FooterComponent/FooterComponent";

interface User {
    id: number;
    username: string;
    name: string;
    account_number: string;
    balance: number;
    account_type: string;
    currency: string;
}

function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState<User>();
    const [isLoading, setIsLoading] = useState(true);
    const { isSimplified } = useMenuContext();

    useEffect(() => {
        async function fetchUserData() {
            try {
                const res = await axios.get("http://localhost:8080/dashboard", {
                    withCredentials: true,
                });
                setUser(res.data.user);
            } catch (error: any) {
                console.error("Error fetching user data:", error);
                if (error.res?.status === 401) {
                    navigate("/login");
                }
            } finally {
                setIsLoading(false);
            }
        }

        fetchUserData();
    }, []);

    const savingsAccount = {
        type: "Savings",
        number: "1234 5678 0987 7654",
        currency: "SGD",
        money: 23423,
        isHidden: false,
    };

    const checkingAccount = {
        type: "Checking",
        number: "5678 1234 8765 4321",
        currency: "SGD",
        money: 1520.5,
        isHidden: false,
    };

    const creditAccount = {
        type: "Credit",
        number: "4321 8765 1234 5678",
        currency: "SGD",
        money: 1250.75,
        isHidden: true,
    };

    if (isLoading) return <div className="loadingContainer">Loading...</div>;
    if (!user) return <div className="loadingContainer">Not authenticated</div>;
    if (isSimplified) {
        return (
            <div className="d-flex justify-content-center">
                <div className={styles.body}>
                    <HeaderComponent />
                    <hr />
                    <main className={styles.mainContainer}>
                        <h1 className="text-center">Welcome back</h1>
                        <p className="subtitle fs-2 text-center">{user.name}</p>
                        <section className={styles.subContainer}>
                            <h2>What would you like to do?</h2>
                            <div>
                                <Link to={"/transaction"}>
                                    <button type="submit" className="spacing-md fs-3 important-button">
                                        Transfer Money
                                    </button>
                                </Link>
                                <button className="spacing-md fs-3">Pay Bills</button>
                                <button className="fs-3">View Transactions</button>
                            </div>
                        </section>
                        <section className={`${styles.subContainer} mt-2`}>
                            <h2>My Accounts</h2>
                            <AccountCardComponent
                                accountData={{
                                    type: "Checking",
                                    currency: user.currency,
                                    number: user.account_number,
                                    money: user.balance,
                                    isHidden: false,
                                }}
                            />
                            <AccountCardComponent accountData={savingsAccount} />
                            <AccountCardComponent accountData={creditAccount} />
                            <AccountCardComponent accountData={checkingAccount} />
                        </section>
                    </main>
                    <AccessibilityComponent />
                </div>
            </div>
        );
    } else {
        return (
            <>
                <HeaderComponent />
                <h1>Not simplified menu!</h1>
            </>
        );
    }
}

export default Dashboard;
