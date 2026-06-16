'use strict';

const express = require('express');
const Ticket = require('../models/ticket');
const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('../middleware/error');

const router = express.Router();

// GET /api/tickets
router.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json(await Ticket.find({ userId: req.user.id }));
  })
);

// POST /api/tickets/validate { code } -> { result, ticket }
// Searches across all users (operator scans any driver's pass) and applies the
// ticket state machine server-side.
router.post(
  '/validate',
  asyncHandler(async (req, res) => {
    const code = String(req.body.code || '').trim();
    let ticket = await Ticket.findOne({ qrPayload: code });
    if (!ticket && code.startsWith('PARKFLOW|')) {
      const bookingId = code.split('|')[1];
      if (bookingId) ticket = await Ticket.findOne({ bookingId });
    }

    let result;
    if (!ticket) {
      result = 'invalid';
    } else if (ticket.status === 'used') {
      result = 'alreadyUsed';
    } else if (new Date() > ticket.expiresAt || ticket.status === 'expired') {
      result = 'expired';
      ticket.status = 'expired';
      await ticket.save();
    } else {
      result = 'valid';
      ticket.status = 'used';
      await ticket.save();
    }
    res.json({ result, ticket: ticket || null });
  })
);

// POST /api/tickets (upsert by id)
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const body = { ...req.body, userId: req.user.id };
    const ticket = await Ticket.findOneAndUpdate(
      { userId: req.user.id, id: body.id },
      body,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.status(201).json(ticket);
  })
);

// PATCH /api/tickets/:id (status: used/expired)
router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const ticket = await Ticket.findOneAndUpdate(
      { userId: req.user.id, id: req.params.id },
      req.body,
      { new: true }
    );
    if (!ticket) throw new AppError('Ticket not found', 404, 'NOT_FOUND');
    res.json(ticket);
  })
);

module.exports = router;
