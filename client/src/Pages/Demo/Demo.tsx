import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import styles from "./Demo.module.css";
import AccountCardComponent from "../../Components/AccountCardComponent/AccountCardComponent";

const DemoPage: React.FC = () => {
    const [demoData, setDemoData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDemoData() {
            try {
                const response = await api.get(
                    "/api/account/summary?mode=demo",
                );
                console.log("Fetched demo data:", response.data);
                setDemoData(response.data);
            } catch (error) {
                console.error("Failed to fetch demo data:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchDemoData();
    }, []);

    if (loading) {
        return <div className="loadingContainer">Loading demo account...</div>;
    }

    if (!demoData) {
        return (
            <div className="loadingContainer">
                Failed to load demo account data.
            </div>
        );
    }

    return (
        <div className="d-flex justify-content-center">
            <div className="bodyMini">
                {/* Large Demo Banner */}
                <div className={styles.demoBanner}>
                    <h1>THIS IS A DEMO TESTING ACCOUNT</h1>
                </div>
                <main className={styles.mainContainer}>
                    <h1 className="text-center">Welcome to Demo Mode</h1>
                    <p className="subtitle fs-2 text-center">Demo User</p>

                    <section className={styles.subContainer}>
                        <h2 className="mb-2 mt-4">
                            What would you like to do?
                        </h2>
                        <div>
                            <Link to={"/demo/transaction"}>
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
                            <button className="fs-3">View Transactions</button>
                        </div>
                    </section>

                    <section className={styles.subContainer}>
                        <h2 className="mb-2 mt-4">My Accounts</h2>
                        <AccountCardComponent
                            accountData={{
                                type: "Demo Savings",
                                currency: "SGD",
                                number: "XXXX XXXX XXXX 0000",
                                money: demoData.balance,
                                isHidden: false,
                            }}
                        />
                    </section>

                    <section className={styles.subContainer}>
                        <h2 className="mb-2 mt-4">Payees</h2>
                        <div className={styles.payeeList}>
                            {demoData.payees.map((payee: any) => (
                                <div
                                    key={payee.id}
                                    className={styles.payeeItem}
                                >
                                    <span>{payee.name}</span>
                                    <span className={styles.payeeType}>
                                        ({payee.type})
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className={styles.subContainer}>
                        <h2 className="mb-2 mt-4">Recent Transactions</h2>
                        <div className={styles.transactionList}>
                            {demoData.transactions.length > 0 ? (
                                demoData.transactions.map(
                                    (transaction: any) => (
                                        <div
                                            key={transaction.id}
                                            className={styles.transactionItem}
                                        >
                                            <div>
                                                <div
                                                    className={
                                                        styles.transactionType
                                                    }
                                                >
                                                    {transaction.type}
                                                </div>
                                                <div
                                                    className={
                                                        styles.transactionTo
                                                    }
                                                >
                                                    To: {transaction.to}
                                                </div>
                                            </div>
                                            <div
                                                className={
                                                    styles.transactionAmount
                                                }
                                            >
                                                -$
                                                {transaction.amount.toFixed(2)}
                                            </div>
                                        </div>
                                    ),
                                )
                            ) : (
                                <p className="subtitle">No transactions yet</p>
                            )}
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
};

export default DemoPage;
