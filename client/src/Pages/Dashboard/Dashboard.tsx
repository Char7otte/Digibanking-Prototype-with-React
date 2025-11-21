import { Link } from "react-router-dom";
import styles from "./Dashboard.module.css";
import AccountCardComponent from "../../Components/AccountCardComponent/AccountCardComponent";
import AssistanceComponent from "../../Components/AssistanceComponent/AssistanceComponent";
// import FooterComponent from "../../Components/FooterComponent/FooterComponent";

function Dashboard() {
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

    const name = "Senior Tan";
    return (
        <>
            <h1>Welcome back, {name}</h1>
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
                <AccountCardComponent accountData={savingsAccount} />
                <AccountCardComponent accountData={checkingAccount} />
                <AccountCardComponent accountData={creditAccount} />
            </section>
            <AssistanceComponent />
        </>
    );
}

export default Dashboard;
