'use strict';

const express = require('express');
const Booking = require('../models/booking');
const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('../middleware/error');

const router = express.Router();

// GET /api/bookings
router.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json(await Booking.find({ userId: req.user.id }));
  })
);

// POST /api/bookings (upsert by id)
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const body = { ...req.body, userId: req.user.id };
    const booking = await Booking.findOneAndUpdate(
      { userId: req.user.id, id: body.id },
      body,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.status(201).json(booking);
  })
);

// PATCH /api/bookings/:id (cancel / extend)
router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const booking = await Booking.findOneAndUpdate(
      { userId: req.user.id, id: req.params.id },
      req.body,
      { new: true }
    );
    if (!booking) throw new AppError('Booking not found', 404, 'NOT_FOUND');
    res.json(booking);
  })
);

module.exports = router;
