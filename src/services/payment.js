'use strict';

const Order = require('../models/order');
const Payment = require('../models/payment');
const { AppError } = require('../middleware/error');

const UPI_RE = /^[\w.\-]{2,}@[a-zA-Z]{2,}$/;

// Create a pending UPI payment for an order.
async function createPayment({ orderId, upiId }) {
  if (!upiId || !UPI_RE.test(upiId)) {
    throw new AppError('Invalid UPI ID', 422, 'INVALID_UPI');
  }

  const order = await Order.findById(orderId);
  if (!order) throw new AppError('Order not found', 404, 'NOT_FOUND');
  if (order.status === 'cancelled') {
    throw new AppError('Order is cancelled and cannot be paid', 409, 'ORDER_CANCELLED');
  }

  const existing = await Payment.findOne({
    orderId,
    status: { $in: ['pending', 'success'] },
  });
  if (existing) {
    throw new AppError('A payment already exists for this order', 409, 'DUPLICATE_PAYMENT');
  }

  const amount = (order.amountPaise / 100).toString();
  const qrData =
    `upi://pay?pa=${encodeURIComponent(upiId)}&am=${amount}&cu=INR` +
    `&tn=${encodeURIComponent('Order ' + order.id)}`;

  try {
    return await Payment.create({
      orderId,
      amountPaise: order.amountPaise,
      currency: 'INR',
      upiId,
      status: 'pending',
      qrData,
    });
  } catch (err) {
    // Race: unique partial index caught a concurrent duplicate.
    if (err.code === 11000) {
      throw new AppError('A payment already exists for this order', 409, 'DUPLICATE_PAYMENT');
    }
    throw err;
  }
}

// Move a pending payment to a terminal state (success | failed).
async function settlePayment(paymentId, target) {
  const payment = await Payment.findById(paymentId);
  if (!payment) throw new AppError('Payment not found', 404, 'NOT_FOUND');
  if (payment.status !== 'pending') {
    throw new AppError(
      `Payment already ${payment.status}`,
      409,
      'ALREADY_COMPLETED'
    );
  }
  payment.status = target;
  await payment.save();
  return payment;
}

// Cancel a payment. Successful payments cannot be cancelled. Idempotent.
async function cancelPayment(paymentId) {
  const payment = await Payment.findById(paymentId);
  if (!payment) throw new AppError('Payment not found', 404, 'NOT_FOUND');
  if (payment.status === 'success') {
    throw new AppError('Successful payment cannot be cancelled', 409, 'PAYMENT_COMPLETED');
  }
  if (payment.status === 'cancelled') return payment; // idempotent
  payment.status = 'cancelled';
  payment.cancelledAt = new Date();
  await payment.save();
  return payment;
}

module.exports = { createPayment, settlePayment, cancelPayment };
