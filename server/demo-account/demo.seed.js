// server/demo-account/demo.seed.js
const { readDB, writeDB } = require("../data/fileDb");
const { DEMO_START_BALANCE, DEMO_PAYEES } = require("./demo.data");

function ensureDemoData(userId) {
  const db = readDB();

  // Ensure arrays exist (in case db.json is missing keys)
  db.wallets = db.wallets || [];
  db.payees = db.payees || [];
  db.transactions = db.transactions || [];
  db.counters = db.counters || { transactionId: 0, payeeId: 0 };

  // 1) Create demo wallet if missing
  const demoWallet = db.wallets.find(
    (w) => w.userId === userId && w.mode === "demo"
  );

  if (!demoWallet) {
    db.wallets.push({
      userId,
      mode: "demo",
      balance: DEMO_START_BALANCE,
      updatedAt: new Date().toISOString(),
    });
  }

  // 2) Seed demo payees if user has none in demo mode
  const hasDemoPayees = db.payees.some(
    (p) => p.userId === userId && p.mode === "demo"
  );

  if (!hasDemoPayees) {
    for (const p of DEMO_PAYEES) {
      db.counters.payeeId += 1;
      db.payees.push({
        id: db.counters.payeeId,
        userId,
        mode: "demo",
        name: p.name,
        type: p.type,
        createdAt: new Date().toISOString(),
      });
    }
  }

  writeDB(db);
}

module.exports = { ensureDemoData };
