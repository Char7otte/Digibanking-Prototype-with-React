const { getPool, sql } = require("../../db");

const exchangeRates = {
    SGD: { SGD: 1, MYR: 3.50, CNY: 5.20, IDR: 11500, THB: 26, USD: 0.74, AUD: 1.03 },
    USD: { USD: 1, SGD: 1.35, MYR: 4.60, CNY: 7.10, IDR: 15500, THB: 33, AUD: 1.52 },
    AUD: { AUD: 1, SGD: 0.97, MYR: 3.10, CNY: 4.65, IDR: 10700, THB: 22, USD: 0.66 }
};

exports.transfer = async (req, res) => {
    try {
        let { recipient, amount, mode, countryCurrency } = req.body;
        const sender = req.session.user;

        if (!sender) return res.redirect("/login");

        // Default mode
        mode = mode || "local";

        if (!recipient || !amount) {
            return res.render("transfer", {
                user: sender,
                error: "Please fill in all fields.",
                success: null
            });
        }

        const amt = parseFloat(amount);
        if (amt <= 0) {
            return res.render("transfer", {
                user: sender,
                error: "Invalid amount entered.",
                success: null
            });
        }

        const pool = await getPool();

        // Fetch sender
        const senderQuery = await pool.request()
            .input("id", sql.Int, sender.id)
            .query(`SELECT * FROM UsersAccounts WHERE id = @id`);

        const senderDB = senderQuery.recordset[0];

        // Fetch recipient
        const recQuery = await pool.request()
            .input("acc", sql.VarChar(50), recipient)
            .query(`SELECT * FROM UsersAccounts WHERE account_number = @acc`);

        const recipientUser = recQuery.recordset[0];

        if (!recipientUser) {
            return res.render("transfer", {
                user: sender,
                error: "Recipient account not found.",
                success: null
            });
        }

        // ❌ Prevent self-transfer
        if (recipientUser.id === senderDB.id) {
            return res.render("transfer", {
                user: sender,
                error: "You cannot transfer to your own account.",
                success: null
            });
        }

        const senderCurrency = senderDB.currency;      // e.g. SGD, USD, AUD
        const recipientCurrency = recipientUser.currency;

        let debitAmount = 0;
        let creditAmount = 0;
        let selectedCountry = "";
        let selectedCurrency = "";

        //  LOCAL TRANSFER (NO CONVERSION)

        if (mode === "local") {
            if (senderCurrency !== recipientCurrency) {
                return res.render("transfer", {
                    user: sender,
                    error: `Local transfers require matching currencies (${senderCurrency} → ${recipientCurrency} not allowed).`,
                    success: null
                });
            }

            debitAmount = amt;
            creditAmount = amt;
        }

        //  OVERSEAS TRANSFER (CURRENCY CONVERSION)

        if (mode === "overseas") {

            if (!countryCurrency) {
                return res.render("transfer", {
                    user: sender,
                    error: "Please select a destination country & currency.",
                    success: null
                });
            }

            // Format: "MY|MYR"
            const [countryCode, currencyCode] = countryCurrency.split("|");
            selectedCountry = countryCode;
            selectedCurrency = currencyCode;

            // SenderCurrency → selectedCurrency
            if (!exchangeRates[senderCurrency] || !exchangeRates[senderCurrency][currencyCode]) {
                return res.render("transfer", {
                    user: sender,
                    error: `Exchange rate unavailable for ${senderCurrency} → ${currencyCode}.`,
                    success: null
                });
            }

            const rate = exchangeRates[senderCurrency][currencyCode];

            debitAmount = amt;             // Sender pays in their currency
            creditAmount = amt * rate;     // Convert to foreign currency
        }

        //  VERIFY BALANCE

        if (senderDB.balance < debitAmount) {
            return res.render("transfer", {
                user: sender,
                error: "Insufficient funds.",
                success: null
            });
        }

        //  SQL TRANSACTION

        const t = new sql.Transaction(pool);
        await t.begin();
        const reqT = new sql.Request(t);

        // Deduct from sender
        await reqT
            .input("sid", sql.Int, senderDB.id)
            .input("deduct", sql.Decimal(18, 2), debitAmount)
            .query(`UPDATE UsersAccounts SET balance = balance - @deduct WHERE id = @sid`);

        // Credit recipient
        await reqT
            .input("racc", sql.VarChar(50), recipientUser.account_number)
            .input("credit", sql.Decimal(18, 2), creditAmount)
            .query(`UPDATE UsersAccounts SET balance = balance + @credit WHERE account_number = @racc`);

        await t.commit();

        // Update session
        sender.balance = senderDB.balance - debitAmount;

        //  SUCCESS MESSAGE

        let msg = `
            Successfully sent ${senderCurrency} $${debitAmount.toFixed(2)} 
            to ${recipientUser.first_name}.
        `;

        if (mode === "overseas") {
            msg += `
                <br>Converted to ${selectedCurrency}: ${creditAmount.toFixed(2)}.
                <br>Destination Country: ${selectedCountry}.
            `;
        }

        return res.render("transfer", {
            user: sender,
            error: null,
            success: msg
        });

    } catch (err) {
        console.error("Transfer error:", err);
        return res.render("transfer", {
            user: req.session.user,
            error: "Server error occurred.",
            success: null
        });
    }
};
