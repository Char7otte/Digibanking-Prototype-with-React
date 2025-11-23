import { useState, useEffect, useRef, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./Transaction.module.css";
import HeaderComponent from "../../Components/HeaderComponent/HeaderComponent";
import AccessibilityComponent from "../../Components/AccessibilityComponent/AccessibilityComponent";
import AccountCardComponent from "../../Components/AccountCardComponent/AccountCardComponent";
import { useMenuContext } from "../../MenuContext";

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
    const [user, setUser] = useState<User>();
    const [isLoading, setIsLoading] = useState(true);
    const { isSimplified } = useMenuContext();
    const accountCardArticles = useRef<Element[]>([]);
    const [selectedAccountCardArticle, setSelectedAccountCardArticle] = useState<Element>();
    const accounts = useRef<Account[]>([]);
    const selectedTransferorAccount = useRef<string | null>(null);
    const selectedTransfereeAccount = useRef<string | null>(null);
    const transferAmount = useRef<number | null>(null);
    const [transactionStep, setTransactionStep] = useState(0);
    const [isTutorialOpen, setIsTutorialOpen] = useState(false);
    const [tutorialStepIndex, setTutorialStepIndex] = useState(0);
    const fromSelectRef = useRef<HTMLSelectElement | null>(null);
    const toInputRef = useRef<HTMLInputElement | null>(null);
    const amountInputRef = useRef<HTMLInputElement | null>(null);
    const transferButtonRef = useRef<HTMLButtonElement | null>(null);
    const tooltipRef = useRef<HTMLDivElement | null>(null);
    const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number; placement: "right" | "left" | "center" | "bottom" }>({
        top: 0,
        left: 0,
        placement: "center",
    });
    // simplified view refs
    const simplifiedFromRef = useRef<HTMLDivElement | null>(null);
    const simplifiedTransfereeRef = useRef<HTMLInputElement | null>(null);
    const simplifiedAmountRef = useRef<HTMLInputElement | null>(null);
    const [tutorialContextSimplified, setTutorialContextSimplified] = useState(false);

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

    function handleModeChange(newMode: string) {
        setMode(mode);
        const localButton = document.querySelector("#localButton");
        const overseasButton = document.querySelector("#overseasButton");

        if (newMode == "local") {
            localButton?.classList.add("active");
            overseasButton?.classList.remove("active");
        } else {
            localButton?.classList.remove("active");
            overseasButton?.classList.add("active");
        }
    }

    useEffect(() => {
        const articles = document.querySelectorAll(".accountCard");
        if (articles.length == 0) return;
        accountCardArticles.current = [...articles];

        articles.forEach((article) => {
            article.addEventListener("click", selectCardArticle);
        });

        return () => {
            accountCardArticles.current.forEach((article) => {
                article.removeEventListener("click", selectCardArticle);
            });
            accountCardArticles.current = [];
        };
    }, [isSimplified, isLoading, transactionStep]);
    // Includes isLoading to allow for the accountCards to load on mount before getting them.
    //Includes transactionStep to retrieve accountCards when the user returns.

    function selectCardArticle(e: Event) {
        updateSelectedAccountCard(e.currentTarget as HTMLElement);
    }

    function addAccountCard(newCard: HTMLElement) {
        accountCardArticles.current = [...accountCardArticles.current, newCard];
    }

    function updateSelectedAccountCard(newSelectedCard: HTMLElement) {
        setSelectedAccountCardArticle(newSelectedCard);
        newSelectedCard.classList.add("selected");
        selectedTransferorAccount.current = newSelectedCard.getAttribute("data-account-number");
        accountCardArticles.current.forEach((article) => {
            if (article != newSelectedCard) article.classList.remove("selected");
        });
    }

    function addAccounts(newAccount: Account) {
        accounts.current = [...accounts.current, newAccount];
    }

    function returnToDashboard() {
        const newTransactionStep = transactionStep - 1;
        if (newTransactionStep < 0) {
            navigate("/dashboard");
        } else {
            setTransactionStep(newTransactionStep);
        }
    }

    function moveTransactionStep() {
        setTransactionStep(transactionStep + 1);
    }

    function updateTransfereeAccount(e: ChangeEvent<HTMLInputElement>) {
        selectedTransfereeAccount.current = e.target.value;
    }

    function updateTransferAmount(e: ChangeEvent<HTMLInputElement>) {
        transferAmount.current = parseInt(e.target.value);
    }

    function executeTransfer() {
        alert(
            `Transfering $${transferAmount.current} from your account ${selectedTransferorAccount.current} to ${selectedTransfereeAccount.current}`
        );
        setTransactionStep(0);
    }

    const tutorialSteps = [
        {
            title: "Overview",
            content: (
                <>
                    <p>This page lets you transfer money locally or overseas.</p>
                    <p>Use the 'Local Transfer' and 'Overseas Transfer' tabs to switch modes.</p>
                </>
            ),
        },
        {
            title: "From Account",
            content: <p>The "From Account" selector pre-fills your default account. This is the account the money will be debited from.</p>,
        },
        {
            title: "To Account",
            content: <p>Enter the recipient's account number in the "To Account" field. Double-check the number before sending.</p>,
        },
        {
            title: "Amount & Transfer",
            content: <p>Enter the amount, add an optional remark, then press "Transfer Now" to complete the transfer.</p>,
        },
    ];

    function openTutorial(simplified = false) {
        setTutorialStepIndex(0);
        setIsTutorialOpen(true);
        setTutorialContextSimplified(!!simplified);
    }

    function closeTutorial() {
        setIsTutorialOpen(false);
    }

    function nextTutorialStep() {
        setTutorialStepIndex((i) => Math.min(i + 1, tutorialSteps.length - 1));
    }

    function prevTutorialStep() {
        setTutorialStepIndex((i) => Math.max(i - 1, 0));
    }
    function nextTutorialStepSimple() {
        setTutorialStepIndex((i) => Math.min(i + 1, tutorialSteps.length - 1));
        if (tutorialStepIndex == 0) return;
        moveTransactionStep();
    }

    function prevTutorialStepSimple() {
        setTutorialStepIndex((i) => Math.max(i - 1, 0));
        returnToDashboard();
    }

    function handleAssistance() {
        const oneTimePassword = Math.floor(Math.random() * (999999 - 100000) + 100000);
        alert(`Your one time password is: ${oneTimePassword}`);
    }

    // Update tooltip position based on current step and target element
    useEffect(() => {
        if (!isTutorialOpen) return;

        function updatePosition() {
            const margin = 12;
            let target: Element | null = null;
            if (tutorialStepIndex === 0) {
                // center near the page title
                setTooltipPos({ top: window.innerHeight / 2, left: window.innerWidth / 2, placement: "center" });
                return;
            }

            if (tutorialContextSimplified) {
                if (tutorialStepIndex === 1) target = simplifiedFromRef.current;
                if (tutorialStepIndex === 2) target = simplifiedTransfereeRef.current;
                if (tutorialStepIndex === 3) target = simplifiedAmountRef.current;
            } else {
                if (tutorialStepIndex === 1) target = fromSelectRef.current;
                if (tutorialStepIndex === 2) target = toInputRef.current;
                if (tutorialStepIndex === 3) target = amountInputRef.current ?? transferButtonRef.current;
            }

            if (!target) {
                setTooltipPos({ top: window.innerHeight / 2, left: window.innerWidth / 2, placement: "center" });
                return;
            }

            const rect = target.getBoundingClientRect();

            // Place tooltip centered under the field
            const centerX = rect.left + rect.width / 2;
            let left = centerX; // we'll use translateX(-50%) when rendering

            // Compute top as just under the field
            let top = rect.bottom + margin;

            // Ensure tooltip doesn't go off the bottom of the viewport; if so, show above
            const approxTooltipHeight = 120; // estimate
            if (top + approxTooltipHeight > window.innerHeight - 8) {
                // place above
                top = rect.top - margin - approxTooltipHeight;
                // if still negative, clamp
                if (top < 8) top = 8;
            }

            setTooltipPos({ top, left, placement: "bottom" });
        }

        updatePosition();
        window.addEventListener("resize", updatePosition);
        window.addEventListener("scroll", updatePosition, true);
        return () => {
            window.removeEventListener("resize", updatePosition);
            window.removeEventListener("scroll", updatePosition, true);
        };
    }, [isTutorialOpen, tutorialStepIndex]);

    if (isLoading) return <div className="loadingContainer">Loading...</div>;
    if (!user) return <div className="loadingContainer">Not authenticated</div>;

    const currentAccount = {
        type: "Checking",
        currency: user.currency,
        number: user.account_number,
        money: user.balance,
        isHidden: false,
    };

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

    accounts.current = [currentAccount, savingsAccount, checkingAccount, creditAccount];

    if (isSimplified) {
        return (
            <div className="d-flex justify-content-center">
                <div className="bodyMini">
                    <HeaderComponent />
                    <main className={styles.mainContainer}>
                        <h1>Transfer money</h1>
                        <p className="d-flex justify-content-center align-items-center">
                            <span className={`${styles.stepCircle} ${transactionStep == 0 ? "important-button" : ""}`}>1</span>
                            <span className={styles.stepLine}></span>
                            <span className={`${styles.stepCircle} ${transactionStep == 1 ? "important-button" : ""}`}>2</span>
                            <span className={styles.stepLine}></span>
                            <span className={`${styles.stepCircle} ${transactionStep == 2 ? "important-button" : ""}`}>3</span>
                        </p>
                        <section>
                            {transactionStep == 0 && (
                                <>
                                    <h2 className="mb-4">Step 1: What account do you want to transfer from?</h2>
                                    <div
                                        ref={simplifiedFromRef}
                                        className={
                                            isTutorialOpen && tutorialContextSimplified && tutorialStepIndex === 1
                                                ? styles.tutorialHighlight
                                                : undefined
                                        }
                                    >
                                        {accounts.current.map((account) => {
                                            return <AccountCardComponent accountData={account} key={account.number} />;
                                        })}
                                    </div>
                                </>
                            )}
                            {transactionStep == 1 && (
                                <>
                                    <h3>Transfering from: {selectedTransferorAccount.current}</h3>
                                    <h2 className="spacing-md mt-2">Step 2: What account to you want to transfer to?</h2>
                                    <label htmlFor="transferee-account-number" className={styles.label}>
                                        Account number
                                    </label>
                                    <input
                                        ref={simplifiedTransfereeRef}
                                        type="text"
                                        name="transferee-account-number"
                                        id="transferee-account-number"
                                        required
                                        placeholder="Account number"
                                        onChange={updateTransfereeAccount}
                                        className={`${"spacing-md"} ${
                                            isTutorialOpen && tutorialContextSimplified && tutorialStepIndex === 2 ? styles.tutorialHighlight : ""
                                        }`}
                                    />
                                </>
                            )}
                            {transactionStep == 2 && (
                                <>
                                    <h3>Transfering from: {selectedTransferorAccount.current}</h3>
                                    <h3>Transfering to: {selectedTransfereeAccount.current}</h3>
                                    <h2 className="spacing-md mt-2">Step 3: How much do you want to transfer?</h2>
                                    <label htmlFor="transferee-account-number" className="">
                                        Transfer amount
                                    </label>
                                    <input
                                        ref={simplifiedAmountRef}
                                        type="number"
                                        required
                                        min="0"
                                        name="transferee-account-number"
                                        id="transferee-account-number"
                                        placeholder="Transfer Amount"
                                        onChange={updateTransferAmount}
                                        className={`${"spacing-md"} ${
                                            isTutorialOpen && tutorialContextSimplified && tutorialStepIndex === 3 ? styles.tutorialHighlight : ""
                                        }`}
                                    />
                                </>
                            )}
                            <div className="d-flex justify-content-between">
                                <button className="m-2 ms-0" onClick={returnToDashboard}>
                                    Return
                                </button>
                                {transactionStep! < 2 && (
                                    <button className="important-button m-2 me-0" onClick={moveTransactionStep}>
                                        Continue
                                    </button>
                                )}
                                {transactionStep == 2 && (
                                    <button className="important-button m-2" onClick={executeTransfer}>
                                        Transfer
                                    </button>
                                )}
                            </div>
                        </section>
                    </main>
                </div>
                <button className="assistanceButton ignore-sizing" onClick={handleAssistance}>
                    Assistance
                </button>
                <button className="tutorialButton ignore-sizing" onClick={() => openTutorial(true)}>
                    Tutorial❓
                </button>
                {isTutorialOpen && (
                    <div className={styles.tutorialOverlay} role="dialog" aria-modal="true">
                        {tutorialStepIndex === 0 ? (
                            <div className={styles.tutorialModal}>
                                <div className={styles.tutorialHeader}>
                                    <h3>
                                        Step {tutorialStepIndex + 1}: {tutorialSteps[tutorialStepIndex].title}
                                    </h3>
                                    <button onClick={closeTutorial} aria-label="Close tutorial">
                                        ✕
                                    </button>
                                </div>
                                <div className={styles.tutorialBody}>{tutorialSteps[tutorialStepIndex].content}</div>
                                <div className={styles.tutorialFooter}>
                                    <button onClick={prevTutorialStepSimple} disabled={tutorialStepIndex === 0} className="m-0">
                                        Back
                                    </button>
                                    {tutorialStepIndex < tutorialSteps.length - 1 ? (
                                        <button onClick={nextTutorialStepSimple} className="important-button">
                                            Next
                                        </button>
                                    ) : (
                                        <button onClick={closeTutorial} className="important-button">
                                            Done
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div
                                ref={tooltipRef}
                                className={styles.tutorialTooltip}
                                style={{
                                    position: "fixed",
                                    left: tooltipPos.left,
                                    top: tooltipPos.top,
                                    transform: "translateX(-50%)",
                                }}
                            >
                                <div className={styles.tooltipBubble}>
                                    <div className={styles.tutorialHeader}>
                                        <h4>{tutorialSteps[tutorialStepIndex].title}</h4>
                                        <button onClick={closeTutorial} aria-label="Close tutorial">
                                            ✕
                                        </button>
                                    </div>
                                    <div className={styles.tutorialBody}>{tutorialSteps[tutorialStepIndex].content}</div>
                                    <div className={styles.tutorialFooter}>
                                        <button onClick={prevTutorialStepSimple} disabled={tutorialStepIndex === 0} className="m-0">
                                            Back
                                        </button>
                                        {tutorialStepIndex < tutorialSteps.length - 1 ? (
                                            <button onClick={nextTutorialStepSimple} className="important-button">
                                                Next
                                            </button>
                                        ) : (
                                            <button onClick={closeTutorial} className="important-button">
                                                Done
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className={styles.tooltipArrow} data-placement={tooltipPos.placement}></div>
                            </div>
                        )}
                    </div>
                )}
                <AccessibilityComponent />
            </div>
        );
    } else {
        return (
            <>
                <div className="transfer-page">
                    <HeaderComponent />
                    <h1 className="page-title">Transfer Money</h1>
                    <p className="page-subtitle">Send money locally or overseas</p>
                    <input type="radio" id="modeLocal" name="mode-select" value="local" hidden />
                    <input type="radio" id="modeOverseas" name="mode-select" value="overseas" hidden />
                    <div className="transfer-tabs">
                        <button className="tab spacing-md active" onClick={() => handleModeChange("local")} id="localButton">
                            Local Transfer
                        </button>
                        <button className="tab spacing-md" onClick={() => handleModeChange("overseas")} id="overseasButton">
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
                        <form action="">
                            <input type="hidden" id="modeInput" name="mode" value={mode} />
                            <label>From Account</label>
                            <select
                                ref={fromSelectRef}
                                className={`${"input-select spacing-md"} ${
                                    isTutorialOpen && tutorialStepIndex === 1 ? styles.tutorialHighlight : ""
                                }`}
                                required
                            >
                                <option value={user.account_number}>
                                    {user.account_type} — **** {String(user.account_number).slice(-4)} ({user.currency})
                                </option>
                            </select>
                            <label>To Account</label>
                            <input
                                ref={toInputRef}
                                type="text"
                                name="recipient"
                                className={`${"input spacing-md"} ${isTutorialOpen && tutorialStepIndex === 2 ? styles.tutorialHighlight : ""}`}
                                placeholder="Enter account number"
                                required
                            />
                            <label>Amount</label>
                            <input
                                ref={amountInputRef}
                                type="number"
                                name="amount"
                                className={`${"input spacing-md"} ${isTutorialOpen && tutorialStepIndex === 3 ? styles.tutorialHighlight : ""}`}
                                step="0.01"
                                placeholder="Enter amount"
                                required
                            />
                            <label>Remarks (Optional)</label>
                            <input type="text" name="remarks spacing-md" className="input" placeholder="Add a note" />
                            <div className="transfer-buttons">
                                <button ref={transferButtonRef} type="submit" className="button red full">
                                    Transfer Now
                                </button>
                                <button type="button" className="button outline full">
                                    Schedule Transfer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                <button className="assistanceButton ignore-sizing" onClick={handleAssistance}>
                    Assistance
                </button>
                <button className="tutorialButton ignore-sizing" onClick={() => openTutorial(false)}>
                    Tutorial❓
                </button>
                {isTutorialOpen && (
                    <div className={styles.tutorialOverlay} role="dialog" aria-modal="true">
                        {/* If first step (overview) show centered modal, otherwise show tooltip beside field */}
                        {tutorialStepIndex === 0 ? (
                            <div className={styles.tutorialModal}>
                                <div className={styles.tutorialHeader}>
                                    <h3>
                                        Step {tutorialStepIndex + 1}: {tutorialSteps[tutorialStepIndex].title}
                                    </h3>
                                    <button onClick={closeTutorial} aria-label="Close tutorial">
                                        ✕
                                    </button>
                                </div>
                                <div className={styles.tutorialBody}>{tutorialSteps[tutorialStepIndex].content}</div>
                                <div className={styles.tutorialFooter}>
                                    <button onClick={prevTutorialStep} disabled={tutorialStepIndex === 0} className="m-0">
                                        Back
                                    </button>
                                    {tutorialStepIndex < tutorialSteps.length - 1 ? (
                                        <button onClick={nextTutorialStep} className="important-button">
                                            Next
                                        </button>
                                    ) : (
                                        <button onClick={closeTutorial} className="important-button">
                                            Done
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div
                                ref={tooltipRef}
                                className={styles.tutorialTooltip}
                                style={{
                                    position: "fixed",
                                    left: tooltipPos.left,
                                    top: tooltipPos.top,
                                    transform: "translateX(-50%)",
                                }}
                            >
                                <div className={styles.tooltipBubble}>
                                    <div className={styles.tutorialHeader}>
                                        <h4>{tutorialSteps[tutorialStepIndex].title}</h4>
                                        <button onClick={closeTutorial} aria-label="Close tutorial">
                                            ✕
                                        </button>
                                    </div>
                                    <div className={styles.tutorialBody}>{tutorialSteps[tutorialStepIndex].content}</div>
                                    <div className={styles.tutorialFooter}>
                                        <button onClick={prevTutorialStep} disabled={tutorialStepIndex === 0} className="m-0">
                                            Back
                                        </button>
                                        {tutorialStepIndex < tutorialSteps.length - 1 ? (
                                            <button onClick={nextTutorialStep} className="important-button">
                                                Next
                                            </button>
                                        ) : (
                                            <button onClick={closeTutorial} className="important-button">
                                                Done
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className={styles.tooltipArrow} data-placement={tooltipPos.placement}></div>
                            </div>
                        )}
                    </div>
                )}
                <AccessibilityComponent />
            </>
        );
    }
}

export default Transaction;
