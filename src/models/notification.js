'use strict';

const mongoose = require('mongoose');
const clientSchema = require('./_doc');

module.exports = mongoose.model(
  'Notification',
  clientSchema({
    title: { type: String, required: true },
    body: { type: String, required: true },
    type: { type: String, default: 'system' },
    createdAt: { type: Date, required: true },
    read: { type: Boolean, default: false },
    bookingId: { type: String },
  })
);
