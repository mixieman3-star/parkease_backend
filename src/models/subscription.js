'use strict';

const mongoose = require('mongoose');
const { toMoney } = require('../utils/money');

// A subscription is an optional parking pass.
const subscriptionSchema = new mongoose.Schema(
  {
    userId: { type: String },
    planName: { type: String, required: true },
    amountPaise: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'expired'],
      default: 'active',
    },
    renewsAt: { type: Date },
    cancelledAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        Object.assign(ret, toMoney(ret.amountPaise));
        delete ret.__v;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model('Subscription', subscriptionSchema);
