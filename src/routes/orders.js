'use strict';

const express = require('express');
const Order = require('../models/order');
const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('../middleware/error');

const router = express.Router();

// POST /api/orders — create a parking order (booking).
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const order = await Order.create(req.body);
    res.status(201).json(order);
  })
);

// GET /api/orders/:id
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) throw new AppError('Order not found', 404, 'NOT_FOUND');
    res.json(order);
  })
);

// POST /api/orders/:id/cancel — idempotent.
router.post(
  '/:id/cancel',
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) throw new AppError('Order not found', 404, 'NOT_FOUND');
    if (order.status !== 'cancelled') {
      order.status = 'cancelled';
      order.cancelledAt = new Date();
      await order.save();
    }
    res.json({ success: true, status: order.status, cancelledAt: order.cancelledAt });
  })
);

module.exports = router;
