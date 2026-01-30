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

// SECURITY
app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);
app.use(morgan("dev"));

const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// STATIC FILES
app.use(express.static(path.join(__dirname, "public")));

// BODY PARSERS
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// SESSIONS
app.use(
  session({
    secret: "supersecretkey",
    resave: false,
    saveUninitialized: true,
    cookie: { httpOnly: true },
  }),
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

//Socket.io
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const { fileURLToPath } = require("node:url");
const { dirname, join } = require("node:path");
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  },
});

io.on("connection", (socket) => {
  console.log("A user has connected", socket.id);

  socket.on("disconnect", () => {
    console.log("User has disconnected", socket.id);
  });
});

// START SERVER
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
