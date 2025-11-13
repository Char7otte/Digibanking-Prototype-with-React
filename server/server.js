const express = require("express");
const path = require("path");
const cors = require("cors");
const corsOptions = {
    origin: ["http://localhost:5173"],
};
// const sql = require("mssql");
// const dotenv = require("dotenv");

// dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.listen(port, () => {
    console.log("Server running on port " + port);
});

// process.on("SIGINT", async () => {
//     console.log("Server is gracefully shutting down");
//     await sql.close();
//     console.log("Database connections closed");
//     process.exit(0);
// });
