const express = require("express");
const path = require("path");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const session = require("express-session");
const cors = require("cors");
require("dotenv").config();

const mainRoutes = require("./routes.js");

const app = express();
const PORT = process.env.PORT || 8080;

// CORS - Must be applied early
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

// BODY PARSERS - Must be before routes
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// DEMO ACCOUNT
const { extractMode } = require("./demo-account/demo-middleware.js");
const demoAccountRoutes = require("./demo-account/demo.routes");

// MIDDLEWARE DEMO ACCOUNTTTTTT
app.use("/api", extractMode, demoAccountRoutes);

// SECURITY
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(morgan("dev"));

// STATIC FILES
app.use(express.static(path.join(__dirname, "public")));

// SESSIONS
app.use(
  session({
    secret: "supersecretkey",
    resave: false,
    saveUninitialized: true,
    cookie: { httpOnly: true },
  })
);

// EJS
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// ROUTES
app.use("/", mainRoutes);

// ERRORS
app.use((req, res) => {
  res.status(404).send("<h1>404 Not Found</h1>");
});
app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);
  res.status(500).send("<h1>500 - Server Error</h1>");
});

// START SERVER
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
