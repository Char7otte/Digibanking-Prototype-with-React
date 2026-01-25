import React, { useEffect, useState } from "react";
import styles from "./Demo.module.css";

const DemoPage: React.FC = () => {
  const [demoData, setDemoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch demo data from the backend
    fetch("http://localhost:8080/api/account/summary?mode=demo")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Demo data received:", data);
        setDemoData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching demo data:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className={styles.loading}>Loading demo account...</div>;
  }

  if (!demoData) {
    return <div className={styles.error}>Failed to load demo account data.</div>;
  }

  return (
    <div className={styles.demoPage}>
      <h1>Demo Account</h1>
      <div className={styles.balance}>Balance: ${demoData.balance}</div>
      <h2>Payees</h2>
      <ul>
        {demoData.payees.map((payee: any) => (
          <li key={payee.id}>{payee.name} ({payee.type})</li>
        ))}
      </ul>
      <h2>Recent Transactions</h2>
      <ul>
        {demoData.transactions.map((transaction: any) => (
          <li key={transaction.id}>
            {transaction.type} - {transaction.to}: ${transaction.amount} ({transaction.status})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DemoPage;