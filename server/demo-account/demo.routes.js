// server/demo-account/demo.routes.js
const express = require("express");
const { readDB } = require("../data/fileDb");
const { ensureDemoData } = require("./demo.seed");
const { createTransaction } = require("./demo.service");
const { resetDemoForUser, topUpDemo } = require("./demo.reset");

const router = express.Router();

/**
 * GET /api/account/summary
 * Returns balance + payees + recent transactions based on req.mode
 */
router.get("/account/summary", (req, res) => {
    // For now, use a fixed userId (since many school apps don't have auth yet)
    // Later you can replace with: const userId = req.user.id;
    const userId = 1;

    // If demo mode, auto-create demo data on first use
    if (req.mode === "demo") {
        ensureDemoData(userId);
    }

    const db = readDB();
    const mode = req.mode || "live";

    const wallet =
        (db.wallets || []).find(
            (w) => w.userId === userId && w.mode === mode,
        ) || null;

    const payees = (db.payees || []).filter(
        (p) => p.userId === userId && p.mode === mode,
    );

    const transactions = (db.transactions || [])
        .filter((t) => t.userId === userId && t.mode === mode)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 20);

    res.json({
        mode,
        balance: wallet ? wallet.balance : 0,
        payees,
        transactions,
    });
});

/**
 * POST /api/transfer
 * body: { to, amount, reference? }
 */
router.post("/transfer", (req, res) => {
    const userId = 1; // replace later with req.user.id
    const mode = req.mode || "live";

    const { to, amount, reference } = req.body;

    if (!to || typeof to !== "string") {
        return res.status(400).json({ error: "Missing 'to' (string)." });
    }

    const result = createTransaction({
        userId,
        mode,
        type: "transfer",
        to,
        amount,
        reference,
    });

    if (!result.ok) {
        return res.status(result.status).json({ error: result.error });
    }

    res.json({
        mode,
        message: "Transfer successful",
        balance: result.balance,
        transaction: result.data,
    });
});

/**
 * POST /api/bills/pay
 * body: { biller, amount, reference? }
 */
router.post("/bills/pay", (req, res) => {
    const userId = 1; // replace later with req.user.id
    const mode = req.mode || "live";

    const { biller, amount, reference } = req.body;

    if (!biller || typeof biller !== "string") {
        return res.status(400).json({ error: "Missing 'biller' (string)." });
    }

    const result = createTransaction({
        userId,
        mode,
        type: "bill_payment",
        to: biller,
        amount,
        reference,
    });

    if (!result.ok) {
        return res.status(result.status).json({ error: result.error });
    }

    res.json({
        mode,
        message: "Bill payment successful",
        balance: result.balance,
        transaction: result.data,
    });
});

/**
 * POST /api/demo/reset
 * Only works in demo mode (safety)
 */
router.post("/demo/reset", (req, res) => {
    const userId = 1;

    if (req.mode !== "demo") {
        return res
            .status(400)
            .json({ error: "Reset is only available in DEMO mode." });
    }

    const result = resetDemoForUser(userId);

    res.json({
        mode: "demo",
        message: "Demo account has been reset.",
        balance: result.balance,
        payeesSeeded: result.payeesCount,
    });
});

/**
 * POST /api/demo/topup
 * body: { amount }
 */
router.post("/demo/topup", (req, res) => {
    const userId = 1;

    if (req.mode !== "demo") {
        return res
            .status(400)
            .json({ error: "Top up is only available in DEMO mode." });
    }

    const { amount } = req.body;

    const result = topUpDemo(userId, amount);

    if (!result.ok) {
        return res.status(result.status).json({ error: result.error });
    }

    res.json({
        mode: "demo",
        message: "Demo balance topped up.",
        balance: result.balance,
    });
});

module.exports = router;
