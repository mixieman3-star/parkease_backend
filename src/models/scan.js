'use strict';

const mongoose = require('mongoose');
const clientSchema = require('./_doc');

module.exports = mongoose.model(
  'Scan',
  clientSchema({
    result: { type: String, required: true },
    scannedAt: { type: Date, required: true },
    ticketId: { type: String },
    slotLabel: { type: String },
    vehiclePlate: { type: String },
    rawCode: { type: String },
  })
);
