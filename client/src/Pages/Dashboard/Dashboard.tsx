import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios.ts";
import styles from "./Dashboard.module.css";
import AccountCardComponent from "../../Components/AccountCardComponent/AccountCardComponent";
import AccessibilityComponent from "../../Components/AccessibilityComponent/AccessibilityComponent.tsx";
import { useMenuContext } from "../../MenuContext.tsx";
import HeaderComponent from "../../Components/HeaderComponent/HeaderComponent.tsx";

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
                const res = await api.get("/dashboard", {
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
                <div className="bodyMini">
                    <HeaderComponent />
                    <hr />
                    <main className={styles.mainContainer}>
                        <h1 className="text-center">Welcome back</h1>
                        <p className="subtitle fs-2 text-center">{user.name}</p>
                        <section className={styles.subContainer}>
                            <h2 className="mb-2 mt-4">
                                What would you like to do?
                            </h2>
                            <div>
                                <Link to={"/transaction"}>
                                    <button
                                        type="submit"
                                        className="spacing-md fs-3 important-button"
                                    >
                                        Transfer Money
                                    </button>
                                </Link>
                                <button className="spacing-md fs-3">
                                    Pay Bills
                                </button>
                                <button className="fs-3">
                                    View Transactions
                                </button>
                            </div>
                        </section>
                        <section className={styles.subContainer}>
                            <h2 className="mb-2  mt-4">My Accounts</h2>
                            <AccountCardComponent
                                accountData={{
                                    type: "Checking",
                                    currency: user.currency,
                                    number: user.account_number,
                                    money: user.balance,
                                    isHidden: false,
                                }}
                            />
                            <AccountCardComponent
                                accountData={savingsAccount}
                            />
                            <AccountCardComponent accountData={creditAccount} />
                            <AccountCardComponent
                                accountData={checkingAccount}
                            />
                        </section>
                    </main>
                    <AccessibilityComponent />
                </div>
            </div>
        );
    } else {
        return (
            <div className={styles.mainContainerRegular}>
                <div className={styles.bodyRegular}>
                    <section className="dashboard-header">
                        <div>
                            <p className="label">Welcome back</p>
                            <h2 className="user-name">{user.name}</h2>
                        </div>
                        <div className="dashboard-total">
                            <p className="label">Total balance</p>
                            <p className="amount">
                                {user.currency} {user.balance.toFixed(2)}
                            </p>
                        </div>
                    </section>
                    <section className="accounts-overview grid-3">
                        <div className="account-card card-red">
                            <p className="acc-title">Savings Account</p>
                            <p className="acc-number">
                                •••• {user.account_number.slice(-4)}
                            </p>
                            <p className="acc-label">Available Balance</p>
                            <p className="acc-balance">
                                SGD {user.balance.toFixed(2)}
                            </p>
                            <a className="acc-details" href="#">
                                View Details →
                            </a>
                        </div>
                        <div className="account-card card-blue">
                            <p className="acc-title">Current Account</p>
                            <p className="acc-number">•••• 3721</p>
                            <p className="acc-label">Available Balance</p>
                            <p className="acc-balance">SGD 8,950.25</p>
                            <a className="acc-details" href="#">
                                View Details →
                            </a>
                        </div>
                        <div className="account-card card-purple">
                            <p className="acc-title">Credit Card</p>
                            <p className="acc-number">•••• 8904</p>
                            <p className="acc-label">Available Credit</p>
                            <p className="acc-balance">SGD 15,420.00</p>
                            <a className="acc-details" href="#">
                                View Details →
                            </a>
                        </div>
                    </section>
                    <section className="quick-actions card">
                        <h3>Quick Actions</h3>
                        <div className="quick-actions-row">
                            <a className="qa-item" href="/transaction">
                                Transfer
                            </a>
                            <a className="qa-item" href="#">
                                Pay Bills
                            </a>
                            <a className="qa-item" href="#">
                                Cards
                            </a>
                            <a className="qa-item" href="#">
                                Mobile Top-up
                            </a>
                            <a className="qa-item" href="#">
                                Statements
                            </a>
                            <a className="qa-item" href="#">
                                Deposits
                            </a>
                        </div>
                    </section>
                    <section className="monthly-summary card">
                        <p className="summary-title">This Month</p>
                        <p className="summary-amount">$3,124</p>
                        <p className="summary-sub">
                            ↑ 12% less than last month
                        </p>
                        <hr />
                        <p className="summary-title">Total Balance</p>
                        <p className="summary-amount">$33,530</p>
                        <p className="summary-sub">↑ 5.2% growth</p>
                    </section>
                    <section className="transactions card">
                        <h3>Recent Transactions</h3>
                        <ul className="tx-list">
                            <li className="tx-item">
                                <span>Salary Credit</span>
                                <span className="tx-amount income">
                                    + $5500.00
                                </span>
                            </li>
                            <li className="tx-item">
                                <span>Amazon Shopping</span>
                                <span className="tx-amount expense">
                                    - $124.99
                                </span>
                            </li>
                            <li className="tx-item">
                                <span>Starbucks Coffee</span>
                                <span className="tx-amount expense">
                                    - $8.50
                                </span>
                            </li>
                        </ul>
                    </section>
                    <AccessibilityComponent />
                </div>
            </div>
        );
    }
}

export default Dashboard;
