// server/demo-account/demo.reset.js
const { readDB, writeDB } = require("../data/fileDb");
const { DEMO_START_BALANCE, DEMO_PAYEES } = require("./demo.data");

function resetDemoForUser(userId) {
  const db = readDB();

  db.wallets = db.wallets || [];
  db.payees = db.payees || [];
  db.transactions = db.transactions || [];
  db.counters = db.counters || { transactionId: 0, payeeId: 0 };

  // 1) Remove demo transactions
  db.transactions = db.transactions.filter(
    (t) => !(t.userId === userId && t.mode === "demo")
  );

  // 2) Remove demo payees
  db.payees = db.payees.filter(
    (p) => !(p.userId === userId && p.mode === "demo")
  );

  // 3) Reset / create demo wallet
  const wallet = db.wallets.find(
    (w) => w.userId === userId && w.mode === "demo"
  );
  if (wallet) {
    wallet.balance = DEMO_START_BALANCE;
    wallet.updatedAt = new Date().toISOString();
  } else {
    db.wallets.push({
      userId,
      mode: "demo",
      balance: DEMO_START_BALANCE,
      updatedAt: new Date().toISOString(),
    });
  }

  // 4) Re-seed demo payees
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

  writeDB(db);

  return {
    balance: DEMO_START_BALANCE,
    payeesCount: DEMO_PAYEES.length,
  };
}

function topUpDemo(userId, amount) {
  const db = readDB();

  db.wallets = db.wallets || [];
  const wallet = db.wallets.find(
    (w) => w.userId === userId && w.mode === "demo"
  );

  if (!wallet) {
    return {
      ok: false,
      status: 400,
      error: "Demo wallet not found. Enter demo once first.",
    };
  }

  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) {
    return { ok: false, status: 400, error: "Invalid top up amount." };
  }

  wallet.balance = Number((wallet.balance + n).toFixed(2));
  wallet.updatedAt = new Date().toISOString();

  writeDB(db);

  return { ok: true, balance: wallet.balance };
}

module.exports = {
  resetDemoForUser,
  topUpDemo,
};
