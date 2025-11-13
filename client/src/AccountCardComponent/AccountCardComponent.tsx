import { useState } from "react";
import styles from "./AccountCardComponent.module.css";

interface props {
    accountData: { type: string; currency: string; number: string; money: number; isHidden: boolean };
}

function AccountCardComponent({ accountData: { type, currency, number, money, isHidden } }: props) {
    const [_isHidden, setIsHidden] = useState(isHidden);

    function toggleHideMoney() {
        setIsHidden(!_isHidden);
    }

    function handleMoneyDisplay(money: number, isHidden: boolean) {
        if (isHidden) return "••••••";
        else return Number.isInteger(money) ? money : money.toFixed(2);
    }

    function obfuscateAccountNumber(fullNumber: string) {
        const last4Digits = fullNumber.slice(-4);
        return (" " + last4Digits).padStart(8, "•");
    }

    return (
        <div className={styles.cardContainer}>
            <div className={styles.header}>
                <div className={styles.subheader}>
                    <h2>{type}</h2>
                    <p>{obfuscateAccountNumber(number)}</p>
                </div>
                <button onClick={toggleHideMoney}>Hide</button>
            </div>

            <p>
                {currency + " "}
                {handleMoneyDisplay(money, _isHidden)}
            </p>
        </div>
    );
}

export default AccountCardComponent;
