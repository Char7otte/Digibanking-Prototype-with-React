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

app.set("view engine", "ejs");

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.get("", (req, res) => {
    res.json({ fruits: ["Apple", "Banana"] });
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
