const express = require("express");
const path = require("path");
const cors = require("cors");
// const sql = require("mssql");
// const dotenv = require("dotenv");

// dotenv.config();

const app = express();
const port = process.env.PORT || 8080;
const corsOptions = {
    origin: ["http://localhost:5173"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("", (req, res) => {
    res.render("login");
});

app.get("/dashboard", (req, res) => {
    res.render("dashboard");
});

app.get("/transaction/1", (req, res) => {
    res.render("transaction-step1");
});

app.get("/transaction/2", (req, res) => {
    res.render("transaction-step2");
});

app.get("/transaction/3", (req, res) => {
    res.render("transaction-step3");
});

app.listen(port, () => {
    console.log("Server running on port " + port);
});

// process.on("SIGINT", async () => {
//     console.log("Server is gracefully shutting down");
//     await sql.close();
//     console.log("Database connections closed");
//     process.exit(0);
// });
