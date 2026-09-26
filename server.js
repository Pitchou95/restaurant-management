const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const expressLayouts = require('express-ejs-layouts');

// Load environment variables
dotenv.config();

// Database Connection
const { connectDB, closeDB } = require('./db/connection');

// Custom Middlewares
const flashMiddleware = require('./middleware/flash');
const { notFoundHandler, serverErrorHandler } = require('./middleware/errorHandler');

// Route Handlers
const indexRoutes = require('./routes/indexRoutes');
const dishRoutes = require('./routes/dishRoutes');
const chefRoutes = require('./routes/chefRoutes');
const apiRoutes = require('./routes/apiRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Body Parsers & Method Override
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      const method = req.body._method;
      delete req.body._method;
      return method;
    }
    if (req.query && req.query._method) {
      return req.query._method;
    }
  })
);

// Static Assets
app.use(express.static(path.join(__dirname, 'public')));

// Session & Flash Messages
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'gourmet_hub_default_secret_key_2026',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1 day
  })
);
app.use(flash());

// View Engine (EJS with Layouts)
app.use(expressLayouts);
app.set('layout', 'layouts/main');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Inject Flash & Global Context into all Templates
app.use(flashMiddleware);

// Ensure Database connection is attempted before processing requests without blocking or crashing
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (err) {
    // Log warning and proceed so controllers can serve from fallbackStore instead of 500 error
    console.warn(`[GourmetHub Notice] MongoDB offline (${err.message}). Serving from fallback store.`);
  }
  next();
});

// Mount Application Routes
app.use('/', indexRoutes);
app.use('/dishes', dishRoutes);
app.use('/chefs', chefRoutes);
app.use('/api', apiRoutes);

// Error Handling Middlewares
app.use(notFoundHandler);
app.use(serverErrorHandler);

// Start Server
async function startServer() {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(` 🍽️  GourmetHub Restaurant Management System Running `);
      console.log(` 🌐  URL: http://localhost:${PORT}                      `);
      console.log(` 📊  Dashboard: http://localhost:${PORT}/dashboard     `);
      console.log(` 🍲  Menu Items: http://localhost:${PORT}/dishes        `);
      console.log(` 👨‍🍳 Chefs: http://localhost:${PORT}/chefs             `);
      console.log(` 🚀  API: http://localhost:${PORT}/api/dishes          `);
      console.log(`====================================================`);
    });

    // Graceful Shutdown
    const shutdown = async (signal) => {
      console.log(`\nReceived ${signal}. Gracefully shutting down...`);
      server.close(async () => {
        await closeDB();
        console.log('Database and server connections closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

  } catch (error) {
    console.error('Failed to initialize application:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = app;
