'use strict';

const mongoose = require('mongoose');
const clientSchema = require('./_doc');

module.exports = mongoose.model(
  'Vehicle',
  clientSchema({
    name: { type: String, required: true },
    plate: { type: String, required: true },
    type: { type: String, default: 'car' },
    colorValue: { type: Number, required: true },
    notes: { type: String, default: '' },
    isFavorite: { type: Boolean, default: false },
  })
);
