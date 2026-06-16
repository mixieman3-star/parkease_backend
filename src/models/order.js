'use strict';

const mongoose = require('mongoose');
const { toMoney } = require('../utils/money');

// An order is a parking booking (mirrors frontend PFBooking).
const orderSchema = new mongoose.Schema(
  {
    slotLabel: { type: String, required: true },
    floor: { type: Number, required: true },
    vehiclePlate: { type: String, required: true },
    vehicleName: { type: String },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    amountPaise: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['upcoming', 'active', 'completed', 'expired', 'cancelled'],
      default: 'upcoming',
    },
    cancelledAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        Object.assign(ret, toMoney(ret.amountPaise));
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Backward-compat: accept a legacy `feeCents` field as the minor-unit amount,
// and default currency to INR when absent.
orderSchema.pre('validate', function backfill() {
  if (this.amountPaise == null && this.get('feeCents') != null) {
    this.amountPaise = this.get('feeCents');
  }
  if (!this.currency) this.currency = 'INR';
});

module.exports = mongoose.model('Order', orderSchema);
