import { useState, useEffect, useRef, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../Transaction/Transaction.module.css";
import AccessibilityComponent from "../../Components/AccessibilityComponent/AccessibilityComponent";
import AccountCardComponent from "../../Components/AccountCardComponent/AccountCardComponent";
import { useMenuContext } from "../../MenuContext";

interface Account {
  type: string;
  number: string;
  currency: string;
  money: number;
  isHidden: boolean;
}

function DemoTransaction() {
  const navigate = useNavigate();
  const [demoData, setDemoData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isSimplified } = useMenuContext();
  const accountCardArticles = useRef<Element[]>([]);
  const [_selectedAccountCardArticle, setSelectedAccountCardArticle] =
    useState<Element>();
  const accounts = useRef<Account[]>([]);
  const selectedTransferorAccount = useRef<string | null>(null);
  const selectedTransfereeAccount = useRef<string | null>(null);
  const transferAmount = useRef<number | null>(null);
  const [transactionStep, setTransactionStep] = useState(0);

  useEffect(() => {
    async function fetchDemoData() {
      try {
        const response = await fetch("http://localhost:8080/api/account/summary?mode=demo");
        const data = await response.json();
        setDemoData(data);
      } catch (error: any) {
        console.error("Error fetching demo data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDemoData();
  }, []);

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

  function selectCardArticle(e: Event) {
    updateSelectedAccountCard(e.currentTarget as HTMLElement);
  }

  function updateSelectedAccountCard(newSelectedCard: HTMLElement) {
    setSelectedAccountCardArticle(newSelectedCard);
    newSelectedCard.classList.add("selected");
    selectedTransferorAccount.current = newSelectedCard.getAttribute(
      "data-account-number"
    );
    accountCardArticles.current.forEach((article) => {
      if (article != newSelectedCard) article.classList.remove("selected");
    });
  }

  function returnToDashboard() {
    const newTransactionStep = transactionStep - 1;
    if (newTransactionStep < 0) {
      navigate("/demo");
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

  async function executeTransfer() {
    try {
      const response = await axios.post(
        "http://localhost:8080/api/transfer?mode=demo",
        {
          to: selectedTransfereeAccount.current,
          amount: transferAmount.current,
          reference: "Demo Transfer",
        }
      );
      alert(`Transfer successful! New balance: $${response.data.balance}`);
      navigate("/demo");
    } catch (error: any) {
      alert(`Transfer failed: ${error.response?.data?.error || error.message}`);
    }
  }

  if (isLoading) return <div className="loadingContainer">Loading demo...</div>;
  if (!demoData) return <div className="loadingContainer">Failed to load demo data</div>;

  const demoAccount = {
    type: "Demo Savings",
    currency: "SGD",
    number: "XXXX XXXX XXXX 0000",
    money: demoData.balance,
    isHidden: false,
  };

  accounts.current = [demoAccount];

  return (
    <div className="d-flex justify-content-center">
      <div className="bodyMini">
        {/* Demo Banner */}
        <div style={{
          backgroundColor: "#ff9800",
          color: "white",
          padding: "15px",
          textAlign: "center",
          fontSize: "1.5rem",
          fontWeight: "bold",
          borderRadius: "8px",
          margin: "20px 0",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2)"
        }}>
          DEMO MODE - TEST TRANSACTION
        </div>
        
        <main className={styles.mainContainer}>
          <h1>Transfer money</h1>
          <p className="d-flex justify-content-center align-items-center">
            <span
              className={`${styles.stepCircle} ${
                transactionStep == 0 ? "important-button" : ""
              }`}
            >
              1
            </span>
            <span className={styles.stepLine}></span>
            <span
              className={`${styles.stepCircle} ${
                transactionStep == 1 ? "important-button" : ""
              }`}
            >
              2
            </span>
            <span className={styles.stepLine}></span>
            <span
              className={`${styles.stepCircle} ${
                transactionStep == 2 ? "important-button" : ""
              }`}
            >
              3
            </span>
          </p>
          <section>
            {transactionStep == 0 && (
              <>
                <h2 className="mb-4">
                  Step 1: What account do you want to transfer from?
                </h2>
                {accounts.current.map((account) => {
                  return (
                    <AccountCardComponent
                      accountData={account}
                      key={account.number}
                    />
                  );
                })}
              </>
            )}
            {transactionStep == 1 && (
              <>
                <h3>Transfering from: {selectedTransferorAccount.current}</h3>
                <h2 className="spacing-md mt-2">
                  Step 2: Who do you want to transfer to?
                </h2>
                <label htmlFor="transferee-account-number" className={styles.label}>
                  Select Payee or Enter Account Number
                </label>
                <select 
                  className="spacing-md"
                  onChange={(e) => selectedTransfereeAccount.current = e.target.value}
                >
                  <option value="">-- Select a payee --</option>
                  {demoData.payees.map((payee: any) => (
                    <option key={payee.id} value={payee.name}>
                      {payee.name} ({payee.type})
                    </option>
                  ))}
                </select>
                <p className="text-center my-2">OR</p>
                <input
                  type="text"
                  name="transferee-account-number"
                  id="transferee-account-number"
                  placeholder="Enter account number manually"
                  onChange={updateTransfereeAccount}
                  className="spacing-md"
                />
              </>
            )}
            {transactionStep == 2 && (
              <>
                <h3>Transfering from: {selectedTransferorAccount.current}</h3>
                <h3>Transfering to: {selectedTransfereeAccount.current}</h3>
                <h2 className="spacing-md mt-2">
                  Step 3: How much do you want to transfer?
                </h2>
                <label htmlFor="transfer-amount" className="">
                  Transfer amount (Available: ${demoData.balance})
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max={demoData.balance}
                  name="transfer-amount"
                  id="transfer-amount"
                  placeholder="Transfer Amount"
                  onChange={updateTransferAmount}
                  className="spacing-md"
                />
              </>
            )}
            <div className="d-flex justify-content-between">
              <button className="m-2 ms-0" onClick={returnToDashboard}>
                Return
              </button>
              {transactionStep! < 2 && (
                <button
                  className="important-button m-2 me-0"
                  onClick={moveTransactionStep}
                >
                  Continue
                </button>
              )}
              {transactionStep == 2 && (
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
      <AccessibilityComponent />
    </div>
  );
}

export default DemoTransaction;
