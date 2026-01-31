import { useState, useEffect, useRef, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import styles from "./Transaction.module.css";
import AccountCardComponent from "../../Components/AccountCardComponent/AccountCardComponent";
import { useMenuContext } from "../../MenuContext";
import TokenComponent from "../../Components/AccessibilityComponent/TokenComponent";
interface User {
    id: number;
    username: string;
    name: string;
    account_number: string;
    balance: number;
    account_type: string;
    currency: string;
}

interface Account {
    type: string;
    number: string;
    currency: string;
    money: number;
    isHidden: boolean;
}

function Transaction() {
    const navigate = useNavigate();
    const [mode, setMode] = useState("local");
    const [user, setUser] = useState<User | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true);
    const { isSimplified } = useMenuContext();
    const accountCardArticles = useRef<Element[]>([]);
    const accounts = useRef<Account[]>([]);
    const selectedTransferorAccount = useRef<string | null>(null);
    const selectedTransfereeAccount = useRef<string | null>(null);
    const transferAmount = useRef<number | null>(null);
    const [transactionStep, setTransactionStep] = useState(0);

    useEffect(() => {
        async function fetchUserData() {
            try {
                const res = await api.get("/dashboard");
                setUser(res.data.user);
            } catch (error: any) {
                console.error("Error fetching user data:", error);
                if (error?.res?.status === 401) navigate("/login");
            } finally {
                setIsLoading(false);
            }
        }
        fetchUserData();
    }, [navigate]);

    function handleModeChange(newMode: string) {
        setMode(newMode);
        const localButton = document.querySelector("#localButton");
        const overseasButton = document.querySelector("#overseasButton");

        if (newMode === "local") {
            localButton?.classList.add("active");
            overseasButton?.classList.remove("active");
        } else {
            localButton?.classList.remove("active");
            overseasButton?.classList.add("active");
        }
    }

    useEffect(() => {
        const articles = document.querySelectorAll(".accountCard");
        if (articles.length === 0) return;
        accountCardArticles.current = [...articles];

        articles.forEach((article) =>
            article.addEventListener("click", selectCardArticle),
        );

        return () => {
            accountCardArticles.current.forEach((article) =>
                article.removeEventListener("click", selectCardArticle),
            );
            accountCardArticles.current = [];
        };
    }, [isSimplified, isLoading, transactionStep]);

    function selectCardArticle(e: Event) {
        updateSelectedAccountCard(e.currentTarget as HTMLElement);
    }

    function updateSelectedAccountCard(newSelectedCard: HTMLElement) {
        // setSelectedAccountArticle(newSelectedCard);
        newSelectedCard.classList.add("selected");
        selectedTransferorAccount.current = newSelectedCard.getAttribute(
            "data-account-number",
        );
        accountCardArticles.current.forEach((article) => {
            if (article !== newSelectedCard)
                article.classList.remove("selected");
        });
    }

    function returnToDashboard() {
        setTransactionStep(0);
        navigate("/dashboard");
    }

    function moveTransactionStep() {
        setTransactionStep((s) => s + 1);
    }

    function updateTransfereeAccount(e: ChangeEvent<HTMLInputElement>) {
        selectedTransfereeAccount.current = e.target.value;
    }

    function updateTransferAmount(e: ChangeEvent<HTMLInputElement>) {
        transferAmount.current = parseFloat(e.target.value);
    }

    function executeTransfer() {
        alert(
            `Transfering $${transferAmount.current} from your account ${selectedTransferorAccount.current} to ${selectedTransfereeAccount.current}`,
        );
        setTransactionStep(0);
    }

    if (isLoading) return <div className="loadingContainer">Loading...</div>;
    if (!user) return <div className="loadingContainer">Not authenticated</div>;

    const currentAccount: Account = {
        type: "Checking",
        currency: user.currency,
        number: user.account_number,
        money: user.balance,
        isHidden: false,
    };

    const savingsAccount: Account = {
        type: "Savings",
        number: "1234 5678 0987 7654",
        currency: "SGD",
        money: 23423,
        isHidden: false,
    };

    const checkingAccount: Account = {
        type: "Checking",
        number: "5678 1234 8765 4321",
        currency: "SGD",
        money: 1520.5,
        isHidden: false,
    };

    const creditAccount: Account = {
        type: "Credit",
        number: "4321 8765 1234 5678",
        currency: "SGD",
        money: 1250.75,
        isHidden: true,
    };

    accounts.current = [
        currentAccount,
        savingsAccount,
        checkingAccount,
        creditAccount,
    ];

    if (isSimplified) {
        return (
            <>
                <div className="d-flex justify-content-center">
                    <div className="bodyMini">
                        <main className={styles.mainContainer}>
                            <h1>Transfer money</h1>

                            <p className="d-flex justify-content-center align-items-center">
                                <span
                                    className={`${styles.stepCircle} ${transactionStep === 0 ? "important-button" : ""}`}
                                >
                                    1
                                </span>
                                <span className={styles.stepLine}></span>
                                <span
                                    className={`${styles.stepCircle} ${transactionStep === 1 ? "important-button" : ""}`}
                                >
                                    2
                                </span>
                                <span className={styles.stepLine}></span>
                                <span
                                    className={`${styles.stepCircle} ${transactionStep === 2 ? "important-button" : ""}`}
                                >
                                    3
                                </span>
                            </p>

                            <section>
                                {transactionStep === 0 && (
                                    <>
                                        <h2 className="mb-4">
                                            Step 1: What account do you want to
                                            transfer from?
                                        </h2>
                                        {accounts.current.map((account) => (
                                            <AccountCardComponent
                                                accountData={account}
                                                key={account.number}
                                            />
                                        ))}
                                    </>
                                )}

                                {transactionStep === 1 && (
                                    <>
                                        <h3>
                                            Transfering from:{" "}
                                            {selectedTransferorAccount.current}
                                        </h3>
                                        <h2 className="spacing-md mt-2">
                                            Step 2: What account to you want to
                                            transfer to?
                                        </h2>
                                        <label
                                            htmlFor="transferee-account-number"
                                            className={styles.label}
                                        >
                                            Account number
                                        </label>
                                        <input
                                            type="text"
                                            name="transferee-account-number"
                                            id="transferee-account-number"
                                            required
                                            placeholder="Account number"
                                            onChange={updateTransfereeAccount}
                                            className="spacing-md"
                                        />
                                    </>
                                )}

                                {transactionStep === 2 && (
                                    <>
                                        <h3>
                                            Transfering from:{" "}
                                            {selectedTransferorAccount.current}
                                        </h3>
                                        <h3>
                                            Transfering to:{" "}
                                            {selectedTransfereeAccount.current}
                                        </h3>
                                        <h2 className="spacing-md mt-2">
                                            Step 3: How much do you want to
                                            transfer?
                                        </h2>
                                        <label htmlFor="transferee-account-number">
                                            Transfer amount
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            min={0}
                                            name="transferee-account-number"
                                            id="transferee-account-number"
                                            placeholder="Transfer Amount"
                                            onChange={updateTransferAmount}
                                            className="spacing-md"
                                        />
                                    </>
                                )}

                                <div className="d-flex justify-content-between">
                                    <button
                                        className="m-2 ms-0"
                                        onClick={returnToDashboard}
                                    >
                                        Return
                                    </button>
                                    {transactionStep < 2 && (
                                        <button
                                            className="important-button m-2 me-0"
                                            onClick={moveTransactionStep}
                                        >
                                            Continue
                                        </button>
                                    )}
                                    {transactionStep === 2 && (
                                        <button
                                            className="important-button m-2"
                                            onClick={executeTransfer}
                                        >
                                            Transfer
                                        </button>
                                    )}
                                </div>
                            </section>
                        </main>
                    </div>
                </div>
                <TokenComponent userID={user.id} />
            </>
        );
    }

    return (
        <>
            <div className="transfer-page">
                <h1 className="page-title">Transfer Money</h1>
                <p className="page-subtitle">Send money locally or overseas</p>

                <input
                    type="radio"
                    id="modeLocal"
                    name="mode-select"
                    value="local"
                    hidden
                />
                <input
                    type="radio"
                    id="modeOverseas"
                    name="mode-select"
                    value="overseas"
                    hidden
                />

                <div className="transfer-tabs">
                    <button
                        className="tab spacing-md active"
                        onClick={() => handleModeChange("local")}
                        id="localButton"
                    >
                        Local Transfer
                    </button>
                    <button
                        className="tab spacing-md"
                        onClick={() => handleModeChange("overseas")}
                        id="overseasButton"
                    >
                        Overseas Transfer
                    </button>

                    <div className="card-transfer-card">
                        <div className="transfer-header">
                            <div className="icon-circle">
                                <span>↻</span>
                            </div>
                            <div>
                                <h2>Make a Transfer</h2>
                                <p className="muted">Instant and Secure</p>
                            </div>
                        </div>
                    </div>

                    <form>
                        <input
                            type="hidden"
                            id="modeInput"
                            name="mode"
                            value={mode}
                        />

                        <label>From Account</label>
                        <select className="input-select spacing-md" required>
                            <option value={user.account_number}>
                                {user.account_type} — ****{" "}
                                {String(user.account_number).slice(-4)} (
                                {user.currency})
                            </option>
                        </select>

                        <label>To Account</label>
                        <input
                            type="text"
                            name="recipient"
                            className="input spacing-md"
                            placeholder="Enter account number"
                            required
                        />

                        <label>Amount</label>
                        <input
                            type="number"
                            name="amount"
                            className="input spacing-md"
                            step="0.01"
                            placeholder="Enter amount"
                            required
                        />

                        <label>Remarks (Optional)</label>
                        <input
                            type="text"
                            name="remarks"
                            className="input spacing-md"
                            placeholder="Add a note"
                        />

                        <div className="transfer-buttons">
                            <button type="submit" className="button red full">
                                Transfer Now
                            </button>
                            <button
                                type="button"
                                className="button outline full"
                            >
                                Schedule Transfer
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <TokenComponent userID={user.id} />
        </>
    );
}

export default Transaction;
