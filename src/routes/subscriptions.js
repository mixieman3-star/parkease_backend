'use strict';

const express = require('express');
const Subscription = require('../models/subscription');
const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('../middleware/error');

const router = express.Router();

// POST /api/subscriptions — create a parking pass.
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const sub = await Subscription.create(req.body);
    res.status(201).json(sub);
  })
);

// GET /api/subscriptions/:id
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const sub = await Subscription.findById(req.params.id);
    if (!sub) throw new AppError('Subscription not found', 404, 'NOT_FOUND');
    res.json(sub);
  })
);

// POST /api/subscriptions/:id/renew — blocked once cancelled.
router.post(
  '/:id/renew',
  asyncHandler(async (req, res) => {
    const sub = await Subscription.findById(req.params.id);
    if (!sub) throw new AppError('Subscription not found', 404, 'NOT_FOUND');
    if (sub.status === 'cancelled') {
      throw new AppError('Cancelled subscription cannot renew', 409, 'SUBSCRIPTION_CANCELLED');
    }
    sub.status = 'active';
    sub.renewsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await sub.save();
    res.json(sub);
  })
);

// POST /api/subscriptions/:id/cancel — idempotent.
router.post(
  '/:id/cancel',
  asyncHandler(async (req, res) => {
    const sub = await Subscription.findById(req.params.id);
    if (!sub) throw new AppError('Subscription not found', 404, 'NOT_FOUND');
    if (sub.status !== 'cancelled') {
      sub.status = 'cancelled';
      sub.cancelledAt = new Date();
      await sub.save();
    }
    res.json({ success: true, status: sub.status, cancelledAt: sub.cancelledAt });
  })
);

module.exports = router;
