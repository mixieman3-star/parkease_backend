'use strict';

const express = require('express');
const Scan = require('../models/scan');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// GET /api/scans
router.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json(await Scan.find({ userId: req.user.id }).sort({ scannedAt: -1 }));
  })
);

// POST /api/scans
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const scan = await Scan.create({ ...req.body, userId: req.user.id });
    res.status(201).json(scan);
  })
);

// DELETE /api/scans (clear history)
router.delete(
  '/',
  asyncHandler(async (req, res) => {
    await Scan.deleteMany({ userId: req.user.id });
    res.json({ success: true });
  })
);

module.exports = router;
