'use strict';

const mongoose = require('mongoose');
const clientSchema = require('./_doc');

// Slots are a shared garage layout (not per-user).
module.exports = mongoose.model(
  'Slot',
  clientSchema(
    {
      floor: { type: Number, required: true },
      row: { type: Number, required: true },
      col: { type: Number, required: true },
      label: { type: String, required: true },
      status: { type: String, default: 'available' },
      size: { type: String, default: 'standard' },
      hasCharger: { type: Boolean, default: false },
      disabledAccess: { type: Boolean, default: false },
      walkingDistance: { type: Number, default: 0 },
      score: { type: Number, default: 0 },
    },
    { scoped: false }
  )
);
