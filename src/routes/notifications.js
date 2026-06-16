'use strict';

const express = require('express');
const Notification = require('../models/notification');
const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('../middleware/error');

const router = express.Router();

// GET /api/notifications
router.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json(await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 }));
  })
);

// POST /api/notifications (upsert by id)
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const body = { ...req.body, userId: req.user.id };
    const notif = await Notification.findOneAndUpdate(
      { userId: req.user.id, id: body.id },
      body,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.status(201).json(notif);
  })
);

// PATCH /api/notifications/read-all
router.patch(
  '/read-all',
  asyncHandler(async (req, res) => {
    await Notification.updateMany({ userId: req.user.id }, { read: true });
    res.json({ success: true });
  })
);

// PATCH /api/notifications/:id/read
router.patch(
  '/:id/read',
  asyncHandler(async (req, res) => {
    const notif = await Notification.findOneAndUpdate(
      { userId: req.user.id, id: req.params.id },
      { read: true },
      { new: true }
    );
    if (!notif) throw new AppError('Notification not found', 404, 'NOT_FOUND');
    res.json(notif);
  })
);

module.exports = router;
