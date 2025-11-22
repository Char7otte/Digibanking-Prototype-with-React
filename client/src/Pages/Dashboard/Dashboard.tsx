import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Dashboard.module.css";
import AccountCardComponent from "../../Components/AccountCardComponent/AccountCardComponent";
import AssistanceComponent from "../../Components/AssistanceComponent/AssistanceComponent";
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

    return (
        <>
            <h1>Welcome back, {user.name}.</h1>
            {console.log(user)}
            <hr />
            <section>
                <h2>What would you like to do?</h2>
                <div>
                    <Link to={"/transaction"}>
                        <button type="submit" className="spacing-md">
                            Transfer Money
                        </button>
                    </Link>
                    <button className="spacing-md">Pay Bills</button>
                    <button>View Transactions</button>
                </div>
            </section>
            <hr />
            <section>
                <h2>My Accounts</h2>
                <AccountCardComponent
                    accountData={{
                        type: user.account_type,
                        currency: user.currency,
                        number: user.account_number,
                        money: user.balance,
                        isHidden: false,
                    }}
                />
                <AccountCardComponent accountData={checkingAccount} />
                <AccountCardComponent accountData={creditAccount} />
            </section>
            <AssistanceComponent />
        </>
    );
}

export default Dashboard;
