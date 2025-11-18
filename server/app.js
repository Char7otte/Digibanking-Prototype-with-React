const express = require('express');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const cors = require('cors');
require('dotenv').config();

// Google Cloud SQL controllers (main branch)
const { getPool } = require('./db');
const authController = require('./api-mvc/controllers/authController');
const accountsController = require('./api-mvc/controllers/accountsController');
const { requireAuth } = require('./api-mvc/middlewares/authMiddleware');

// Local EJS routes (HEAD branch)
const mainRoutes = require("./routes/index");

const app = express();
const PORT = process.env.PORT || 8080;

// =========================
// MIDDLEWARE
// =========================

// Security + logging
app.use(helmet());
app.use(morgan('dev'));

// Allow client (React or other local frontend)
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

// Static files for EJS frontend
app.use(express.static(path.join(__dirname, 'public')));

// Body parsers
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Sessions (needed for EJS auth prototype)
app.use(
  session({
    secret: "supersecretkey",
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60
    }
  })
);

// =========================
// VIEW ENGINE (EJS)
// =========================
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layout');

// =========================
// FRONTEND ROUTES (EJS)
// =========================
app.use("/", mainRoutes);

// =========================
// GOOGLE CLOUD SQL API ROUTES
// =========================

// Authentication API
app.post('/api/register', authController.register);
app.post('/api/login', authController.login);

// Protected API endpoints
app.get('/api/accounts', requireAuth, accountsController.getAll);
app.get('/api/me', requireAuth, accountsController.getMe);

// =========================
// ERROR HANDLERS
// =========================

// 404
app.use((req, res) => {
  res.status(404).render('layout', {
    title: 'Not found',
    body: `
      <section class="container">
        <h1>404 — Not Found</h1>
        <p>The page you asked for does not exist.</p>
      </section>`
  });
});

// 500
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).render('layout', {
    title: 'Server error',
    body: `
      <section class="container">
        <h1>500 — Server error</h1>
        <pre>${err.message}</pre>
      </section>`
  });
});

// =========================
// START SERVER
// =========================
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// =========================
// GRACEFUL SHUTDOWN (SQL)
// =========================
async function closePoolAndExit(signal) {
  console.log(`Shutting down (${signal})...`);
  try {
    const pool = await getPool();
    await pool.close();
    console.log('Database pool closed');
  } catch (e) {}
  process.exit(0);
}

process.on('SIGINT', () => closePoolAndExit('SIGINT'));