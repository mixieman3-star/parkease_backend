'use strict';

require('dotenv').config();
const express = require('express');
const connectDB = require('./db');
const { notFound, errorHandler } = require('./middleware/error');

const auth = require('./middleware/auth');

const app = express();
app.use(express.json());

// Minimal CORS for the Flutter web client (no extra dependency).
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Health check (no DB dependency) — used by Railway.
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Public auth.
app.use('/api/auth', require('./routes/auth'));

// Authenticated app resources.
app.use('/api/vehicles', auth, require('./routes/vehicles'));
app.use('/api/slots', auth, require('./routes/slots'));
app.use('/api/bookings', auth, require('./routes/bookings'));
app.use('/api/tickets', auth, require('./routes/tickets'));
app.use('/api/scans', auth, require('./routes/scans'));
app.use('/api/notifications', auth, require('./routes/notifications'));

// Pre-existing commerce resources.
app.use('/api/orders', require('./routes/orders'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/subscriptions', require('./routes/subscriptions'));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Bind the port first so the platform health check passes and requests get a
// real error instead of a 502 "Application failed to respond" when the DB is
// unreachable. ponytail: no retry/backoff lib — log and let the platform restart.
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));

connectDB(process.env.MONGODB_URI).catch((err) => {
  console.error('MongoDB connection failed:', err.message);
});

module.exports = app;
