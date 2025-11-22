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
        return "•••• " + last4Digits;
    }

    return (
        <article className={`${styles.mainContainer} spacing-md accountCard`}>
            <div className="d-flex justify-content-between">
                <div>
                    <h3>{type}</h3>
                    <p className="subtitle">{obfuscateAccountNumber(number)}</p>
                </div>
                <button onClick={toggleHideMoney} className={styles.hideButton}>
                    Hide
                </button>
            </div>

            <p>
                {currency + " "}
                <span className="fs-2">{handleMoneyDisplay(money, _isHidden)}</span>
            </p>
        </article>
    );
}

export default AccountCardComponent;
