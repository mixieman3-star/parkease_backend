'use strict';

require('dotenv').config();
const express = require('express');
const connectDB = require('./db');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();
app.use(express.json());

// Health check (no DB dependency) — used by Railway.
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/orders', require('./routes/orders'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/subscriptions', require('./routes/subscriptions'));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB(process.env.MONGODB_URI)
  .then(() => app.listen(PORT, () => console.log(`Server listening on ${PORT}`)))
  .catch((err) => {
    console.error('Startup failed:', err.message);
    process.exit(1);
  });

module.exports = app;
