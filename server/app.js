const express = require("express");
const path = require("path");
const cors = require("cors");
require('dotenv').config();
const { getPool } = require('./db');
const authController = require('./api-mvc/controllers/authController');

const app = express();
const port = process.env.PORT || 8080;

// Allow local client during development
app.use(cors({ origin: 'http://localhost:5173' }));
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

// auth routes (handled in controller)
app.post('/api/register', authController.register);
app.post('/api/login', authController.login);

app.listen(port, () => {
    console.log("Server running on port " + port);
});

// Graceful shutdown: close DB pool when process exits
async function closePoolAndExit(signal) {
    console.log(`Server is gracefully shutting down (${signal})`);
    try {
        const pool = await getPool();
        await pool.close();
        console.log('Database pool closed');
    } catch (e) {
        // ignore shutdown errors
    }
    process.exit(0);
}

process.on('SIGINT', () => closePoolAndExit('SIGINT'));
process.on('SIGTERM', () => closePoolAndExit('SIGTERM'));
