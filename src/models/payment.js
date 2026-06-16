'use strict';

const mongoose = require('mongoose');
const { toMoney } = require('../utils/money');

const paymentSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    amountPaise: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    upiId: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed', 'cancelled'],
      default: 'pending',
    },
    qrData: { type: String },
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

// At most one live (pending or success) payment per order — DB-level duplicate guard.
paymentSchema.index(
  { orderId: 1 },
  { unique: true, partialFilterExpression: { status: { $in: ['pending', 'success'] } } }
);

module.exports = mongoose.model('Payment', paymentSchema);
