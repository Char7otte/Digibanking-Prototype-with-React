// Temporary in-memory fake storage
let mockUser = {
  name: "OCBC Demo Customer",
  email: "demo@ocbc.com",
  password: "123",  // only for mock mode
  accountNumber: "5200 1234 5678",
  balance: 4250.80,
  accounts: [
    { type: 'Current Account', number: '5200 1234 5678', balance: 3120.50 },
    { type: 'Savings Account', number: '5200 9876 5432', balance: 1130.30 }
  ]
};

module.exports = {
  createUser: (data) => {
    mockUser = data;
    return mockUser;
  },
  getUser: () => mockUser,
  findByEmail: (email) => mockUser.email === email ? mockUser : null
};
