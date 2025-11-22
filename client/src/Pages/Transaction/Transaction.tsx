import HeaderComponent from "../../Components/HeaderComponent/HeaderComponent";
import AccessibilityComponent from "../../Components/AccessibilityComponent/AccessibilityComponent";
import { useMenuContext } from "../../MenuContext";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface User {
    id: number;
    username: string;
    name: string;
    account_number: string;
    balance: number;
    account_type: string;
    currency: string;
}

function Transaction() {
    const navigate = useNavigate();
    const [mode, setMode] = useState("local");
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

    if (isLoading) return <div className="loadingContainer">Loading...</div>;
    if (!user) return <div className="loadingContainer">Not authenticated</div>;

    if (isSimplified) {
        return (
            <div className="d-flex justify-content-center">
                <div className="bodyMini">
                    <HeaderComponent />
                    <main>
                        <h1>Transfer money</h1>
                        <p>
                            <span>1</span>
                            <span>2</span>
                            <span>3</span>
                        </p>
                        <h2>Step 1: What account do you want to transfer from? </h2>
                        <AccountCardsManager accounts={accountsArray} selectable={true} />
                    </main>
                </div>
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
                    <input type="radio" id="modeLocal" name="mode-select" value="local" checked hidden />
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
                            <select className="input-select spacing-md" required>
                                <option value={user.account_number}>
                                    {user.account_type} — **** {String(user.account_number).slice(-4)} ({user.currency})
                                </option>
                            </select>
                            <label>To Account</label>
                            <input type="text" name="recipient" className="input spacing-md" placeholder="Enter account number" required />
                            <label>Amount</label>
                            <input type="number" name="amount" className="input spacing-md" step="0.01" placeholder="Enter amount" required />
                            <label>Remarks (Optional)</label>
                            <input type="text" name="remarks spacing-md" className="input" placeholder="Add a note" />
                            <div className="transfer-buttons">
                                <button type="submit" className="button red full">
                                    Transfer Now
                                </button>
                                <button type="button" className="button outline full">
                                    Schedule Transfer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                <AccessibilityComponent />
            </>
        );
    }
}

export default Transaction;
