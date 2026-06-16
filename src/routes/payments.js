'use strict';

const express = require('express');
const Payment = require('../models/payment');
const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('../middleware/error');
const service = require('../services/payment');

const router = express.Router();

// POST /api/payments/create
router.post(
  '/create',
  asyncHandler(async (req, res) => {
    const payment = await service.createPayment(req.body);
    res.status(201).json({ paymentId: payment.id, status: payment.status, qrData: payment.qrData });
  })
);

// POST /api/payments/success
router.post(
  '/success',
  asyncHandler(async (req, res) => {
    const payment = await service.settlePayment(req.body.paymentId, 'success');
    res.json({ status: payment.status });
  })
);

// POST /api/payments/fail
router.post(
  '/fail',
  asyncHandler(async (req, res) => {
    const payment = await service.settlePayment(req.body.paymentId, 'failed');
    res.json({ status: payment.status });
  })
);

// POST /api/payments/webhook — webhook simulation (e.g. PSP callback).
router.post(
  '/webhook',
  asyncHandler(async (req, res) => {
    const { paymentId, status } = req.body;
    const map = { success: 'success', failed: 'failed' };
    if (!map[status]) {
      throw new AppError('Webhook status must be success or failed', 422, 'VALIDATION_ERROR');
    }
    const payment = await service.settlePayment(paymentId, map[status]);
    res.json({ status: payment.status });
  })
);

// POST /api/payments/:id/cancel
router.post(
  '/:id/cancel',
  asyncHandler(async (req, res) => {
    const payment = await service.cancelPayment(req.params.id);
    res.json({ success: true, status: payment.status, cancelledAt: payment.cancelledAt });
  })
);

// GET /api/payments/:id
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const payment = await Payment.findById(req.params.id);
    if (!payment) throw new AppError('Payment not found', 404, 'NOT_FOUND');
    res.json(payment);
  })
);

module.exports = router;
