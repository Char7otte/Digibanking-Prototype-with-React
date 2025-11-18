const { getPool, sql } = require("../../db");

// Simple FX rate table (SGD → foreign)
const exchangeRates = {
    "MYR": 3.5,   // 1 SGD = 3.5 MYR
    "IDR": 11500, // 1 SGD = 11500 IDR
    "CNY": 5.2,   // 1 SGD = 5.2 CNY
    "THB": 26.0   // 1 SGD = 26 THB
};

exports.transfer = async (req, res) => {
    try {
        const { recipient, amount, country, currency } = req.body;
        const sender = req.session.user;

        if (!sender) return res.redirect("/login");

        if (!recipient || !amount) {
            return res.render("transfer", {
                user: sender,
                error: "Please fill in all required fields.",
                success: null
            });
        }

        const amt = parseFloat(amount);
        if (isNaN(amt) || amt <= 0) {
            return res.render("transfer", {
                user: sender,
                error: "Invalid amount.",
                success: null
            });
        }

        const pool = await getPool();

        // Check recipient account
        const recResult = await pool.request()
            .input("acc", sql.VarChar(50), recipient)
            .query(`
                SELECT * FROM UsersAccounts 
                WHERE account_number = @acc
            `);

        const recipientUser = recResult.recordset[0];

        if (!recipientUser) {
            return res.render("transfer", {
                user: sender,
                error: "Recipient not found.",
                success: null
            });
        }

        // Refresh sender's balance
        const senderResult = await pool.request()
            .input("id", sql.Int, sender.id)
            .query(`
                SELECT * FROM UsersAccounts 
                WHERE id = @id
            `);

        const senderDB = senderResult.recordset[0];

        if (!senderDB) {
            return res.render("transfer", {
                user: sender,
                error: "Unable to fetch sender account.",
                success: null
            });
        }

        /** ====================================================
         *  LOCAL TRANSFER LOGIC (SGD → SGD)
         * ==================================================== */
        let isOverseas = Boolean(country && currency);
        let debitAmountSGD = amt;           // amount deducted from sender
        let creditAmountForeign = amt;      // amount added to recipient

        if (isOverseas) {
            // Validate currency
            if (!exchangeRates[currency]) {
                return res.render("transfer", {
                    user: sender,
                    error: "Unsupported currency for overseas transfer.",
                    success: null
                });
            }

            const rate = exchangeRates[currency];

            // Convert SGD → foreign currency
            creditAmountForeign = amt * rate;
            debitAmountSGD = amt; // sender input is always SGD

            if (senderDB.balance < debitAmountSGD) {
                return res.render("transfer", {
                    user: sender,
                    error: "Insufficient balance for overseas transfer.",
                    success: null
                });
            }

        } else {
            // Local transfer (SGD only)
            if (senderDB.balance < amt) {
                return res.render("transfer", {
                    user: sender,
                    error: "Insufficient balance.",
                    success: null
                });
            }
        }

        /** ====================================================
         *  PERFORM TRANSACTION
         * ==================================================== */
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            const request = new sql.Request(transaction);

            // Deduct from sender (SGD only)
            await request
                .input("sid", sql.Int, sender.id)
                .input("deduct", sql.Decimal(18, 2), debitAmountSGD)
                .query(`
                    UPDATE UsersAccounts 
                    SET balance = balance - @deduct 
                    WHERE id = @sid
                `);

            // Credit to recipient (SGD or Foreign)
            await request
                .input("racc", sql.VarChar(50), recipient)
                .input("credit", sql.Decimal(18, 2), creditAmountForeign)
                .query(`
                    UPDATE UsersAccounts 
                    SET balance = balance + @credit 
                    WHERE account_number = @racc
                `);

            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            console.error("Transfer SQL error:", err);
            throw err;
        }

        // Update session balance
        sender.balance = senderDB.balance - debitAmountSGD;

        /** ====================================================
         *  SUCCESS MESSAGE
         * ==================================================== */
        let msg = "";

        if (isOverseas) {
            msg = `
                Successfully sent SGD $${debitAmountSGD.toFixed(2)} 
                to ${recipientUser.first_name}.<br/>
                Converted to <strong>${currency}</strong>: 
                ${creditAmountForeign.toFixed(2)}.<br/>
                Destination Country: <strong>${country}</strong>.
            `;
        } else {
            msg = `Successfully transferred $${amt.toFixed(2)} to ${recipientUser.first_name}.`;
        }

        return res.render("transfer", {
            user: sender,
            error: null,
            success: msg
        });

    } catch (err) {
        console.error("Transfer error:", err);
        return res.status(500).render("transfer", {
            user: req.session.user,
            error: "Server error. Please try again.",
            success: null
        });
    }
};
