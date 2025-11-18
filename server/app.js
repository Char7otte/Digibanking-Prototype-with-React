const express = require('express');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
// const mongoose = require('mongoose');   // Mongo disabled

// ===== TEMP: MONGO DISABLED =====
// mongoose.connect("mongodb://127.0.0.1:27017/ocbc", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// })
// .then(() => console.log("MongoDB connected"))
// .catch(err => console.error(err));

const app = express();

// ===== View Engine =====
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layout');

// ===== Security, Logging, Static =====
app.use(helmet());
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));

// ===== Body Parsers (MUST be before routes) =====
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// ===== Sessions (MUST be before routes) =====
app.use(
  session({
    secret: "supersecretkey", // change later
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 // 1 hour
    }
  })
);

// ===== Routes =====
const mainRoutes = require("./routes/index");
app.use("/", mainRoutes);

// ===== 404 Handler =====
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

// ===== Error Handler =====
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

// ===== Start Server =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Listening on http://localhost:${PORT}`)
);
