// server/demo-account/demo.service.js
const { readDB, writeDB } = require("./data/fileDb");
const { ensureDemoData } = require("./demo.seed");

function getOrCreateWallet(db, userId, mode) {
  db.wallets = db.wallets || [];
  let wallet = db.wallets.find((w) => w.userId === userId && w.mode === mode);

  if (!wallet) {
    wallet = {
      userId,
      mode,
      balance: 0,
      updatedAt: new Date().toISOString(),
    };
    db.wallets.push(wallet);
  }
  return wallet;
}

function nextTransactionId(db) {
  db.counters = db.counters || { transactionId: 0, payeeId: 0 };
  db.counters.transactionId += 1;
  return db.counters.transactionId;
}

function validateAmount(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

function createTransaction({ userId, mode, type, to, amount, reference }) {
  // Ensure demo data exists if demo mode
  if (mode === "demo") ensureDemoData(userId);

  const db = readDB();
  db.transactions = db.transactions || [];

  const wallet = getOrCreateWallet(db, userId, mode);

  const amt = validateAmount(amount);
  if (amt === null) {
    return { ok: false, status: 400, error: "Invalid amount." };
  }

  if (amt > wallet.balance) {
    return { ok: false, status: 400, error: "Insufficient balance." };
  }

  // Deduct balance
  wallet.balance = Number((wallet.balance - amt).toFixed(2));
  wallet.updatedAt = new Date().toISOString();

  // Create transaction
  const tx = {
    id: nextTransactionId(db),
    userId,
    mode,
    type, // "transfer" | "bill_payment"
    to,
    amount: amt,
    reference: reference || "",
    status: "success",
    createdAt: new Date().toISOString(),
  };

  db.transactions.push(tx);
  writeDB(db);

  return { ok: true, data: tx, balance: wallet.balance };
}

module.exports = {
  createTransaction,
};
