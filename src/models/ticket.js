'use strict';

const mongoose = require('mongoose');
const clientSchema = require('./_doc');

module.exports = mongoose.model(
  'Ticket',
  clientSchema({
    bookingId: { type: String, required: true },
    slotLabel: { type: String, required: true },
    floor: { type: Number, required: true },
    vehiclePlate: { type: String, required: true },
    qrPayload: { type: String, required: true },
    issuedAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
    status: { type: String, default: 'active' },
  })
);
