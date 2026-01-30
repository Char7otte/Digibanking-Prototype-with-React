const accountsModel = require("../models/accountsModel");
const authModel = require("../models/authModel");

async function getAll(req, res) {
    try {
        const accounts = await accountsModel.getAllAccounts();
        res.json(accounts);
    } catch (err) {
        console.error("Get all accounts error", err);
        res.status(500).json({ error: "Server error" });
    }
}

async function getMe(req, res) {
    try {
        const userId = req.user && req.user.id;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });
        const user = await authModel.getUserById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json(user);
    } catch (err) {
        console.error("Get me error", err);
        res.status(500).json({ error: "Server error" });
    }
}

async function getViaUserID(req, res) {
    try {
        const userID = req.query.id;
        if (!userID) return res.status(401).json({ error: "Unauthorized" });
        const user = await authModel.getUserById(userID);
        if (!user) return res.status(404).json({ error: "User not found" });
        console.log(user);

        req.session.user = {
            id: user.id,
            username: user.username,
            name: user.first_name,
            account_number: user.account_number,
            balance: user.balance,
            account_type: user.account_type,
            currency: user.currency,
        };
        return res.json({ success: true, user: req.session.user });
    } catch (error) {
        console.error("Get via UserID error", error);
        res.status(500).json({ error: "Server error" });
    }
}

module.exports = { getAll, getMe, getViaUserID };
