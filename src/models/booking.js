'use strict';

const mongoose = require('mongoose');
const clientSchema = require('./_doc');

module.exports = mongoose.model(
  'Booking',
  clientSchema({
    slotId: { type: String, required: true },
    slotLabel: { type: String, required: true },
    floor: { type: Number, required: true },
    vehicleId: { type: String, required: true },
    vehicleName: { type: String, required: true },
    vehiclePlate: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    feeCents: { type: Number, required: true },
    status: { type: String, default: 'active' },
    createdAt: { type: Date, default: Date.now },
  })
);
