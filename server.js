require('dotenv').config();

const path = require('path');
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const ejsMate = require('ejs-mate');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const appRoutes = require('./routes/app');

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/structura';
const SESSION_SECRET = process.env.SESSION_SECRET || 'structura-dev-secret-change-me';
const isProd = process.env.NODE_ENV === 'production';

async function start() {
  await connectDB();

  const app = express();

  // Render (and most PaaS hosts) terminate HTTPS at a load balancer and
  // forward plain HTTP internally. Without this, Express doesn't know the
  // original request was secure, which can break secure session cookies.
  app.set('trust proxy', 1);

  app.engine('ejs', ejsMate);
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));

  app.use(express.urlencoded({ extended: true, limit: '16mb' }));
  app.use(express.json({ limit: '16mb' }));
  app.use(express.static(path.join(__dirname, 'public')));

  // ── Sessions, persisted in MongoDB (survives restarts / multi-instance) ──
  app.use(
    session({
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      proxy: true, // trust X-Forwarded-Proto from Render's load balancer
      store: MongoStore.create({
        mongoUrl: MONGODB_URI,
        collectionName: 'sessions',
        ttl: 14 * 24 * 60 * 60, // 14 days
      }),
      cookie: {
        httpOnly: true,
        secure: 'auto', // relies on `trust proxy` above to detect HTTPS correctly behind Render
        sameSite: 'lax',
        maxAge: 14 * 24 * 60 * 60 * 1000,
      },
    })
  );

  // Basic protection against brute-force login/signup attempts.
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many attempts. Please try again in a few minutes.' },
  });
  app.use(['/login', '/signup'], authLimiter);

  const generateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many generation requests. Please slow down.' },
  });
  app.use('/generate', generateLimiter);

  // Make session available to every view (mirrors Flask's `session` in Jinja).
  app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
  });

  app.use('/', authRoutes);
  app.use('/', appRoutes);

  app.use((req, res) => {
    res.status(404).send('Not found');
  });

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error('[error]', err);
    if (req.path.startsWith('/api') || req.path === '/generate') {
      return res.status(500).json({ error: 'Internal server error.' });
    }
    res.status(500).send('Internal server error.');
  });

  app.listen(PORT, () => {
    console.log(`[server] Structura AI running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('[server] Failed to start:', err);
  process.exit(1);
});
