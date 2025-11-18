const { getPool, sql } = require("../../db");

exports.transfer = async (req, res) => {
    try {
        const { recipient, amount } = req.body;
        const sender = req.session.user;

        if (!sender) return res.redirect("/login");

        if (!recipient || !amount) {
            return res.render("transfer", {
                user: sender,
                error: "Please fill in all fields.",
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

        // 1️⃣ Check recipient account
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

        // 2️⃣ Check sender available balance
        const senderResult = await pool.request()
            .input("id", sql.Int, sender.id)
            .query(`
                SELECT * FROM UsersAccounts 
                WHERE id = @id
            `);

        const senderDB = senderResult.recordset[0];

        if (!senderDB || senderDB.balance < amt) {
            return res.render("transfer", {
                user: sender,
                error: "Insufficient balance.",
                success: null
            });
        }

        // 3️⃣ Perform transfer using transaction
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            const request = new sql.Request(transaction);

            // Deduct from sender
            await request
                .input("sid", sql.Int, sender.id)
                .input("amt", sql.Decimal(18, 2), amt)
                .query(`
                    UPDATE UsersAccounts 
                    SET balance = balance - @amt 
                    WHERE id = @sid
                `);

            // Add to recipient
            await request
                .input("racc", sql.VarChar(50), recipient)
                .input("amt2", sql.Decimal(18, 2), amt)
                .query(`
                    UPDATE UsersAccounts 
                    SET balance = balance + @amt2 
                    WHERE account_number = @racc
                `);

            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            throw err;
        }

        // 4️⃣ Update session balance
        sender.balance = senderDB.balance - amt;

        return res.render("transfer", {
            user: sender,
            error: null,
            success: `Successfully transferred $${amt.toFixed(2)} to ${recipientUser.first_name}.`
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
