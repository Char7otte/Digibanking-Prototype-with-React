const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "db.json");

// Function to read the database file
function readDB() {
  if (!fs.existsSync(dbPath)) {
    return {}; // Return an empty object if the file doesn't exist
  }
  const data = fs.readFileSync(dbPath, "utf-8");
  return JSON.parse(data);
}

// Function to write to the database file
function writeDB(data) {
  const jsonData = JSON.stringify(data, null, 2); // Pretty-print JSON
  fs.writeFileSync(dbPath, jsonData, "utf-8");
}

module.exports = {
  readDB,
  writeDB,
};