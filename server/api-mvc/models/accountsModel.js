// accountsModel.js - simple mock data model for bank accounts

// Sample accounts data (you can later replace with database logic)
const accounts = [
  { id: "CHK-001", type: "Checking Account", balance: 5234.12 },
  { id: "SVG-002", type: "Savings Account", balance: 15000.00 },
  { id: "CRD-003", type: "Credit Account", balance: -1200.55 }
];

// Model methods
module.exports = {
  getAll: () => accounts,

  getById: (id) => accounts.find(acc => acc.id === id),

  addAccount: (account) => {
    accounts.push(account);
    return account;
  },

  updateBalance: (id, amount) => {
    const acc = accounts.find(a => a.id === id);
    if (!acc) return null;
    acc.balance = amount;
    return acc;
  }
};
