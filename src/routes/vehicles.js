'use strict';

const express = require('express');
const Vehicle = require('../models/vehicle');
const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('../middleware/error');

const router = express.Router();

// GET /api/vehicles -> { items, activeVehicleId }
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const items = await Vehicle.find({ userId: req.user.id });
    res.json({ items, activeVehicleId: req.user.activeVehicleId || null });
  })
);

// POST /api/vehicles (upsert by id)
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const body = { ...req.body, userId: req.user.id };
    const vehicle = await Vehicle.findOneAndUpdate(
      { userId: req.user.id, id: body.id },
      body,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    // First vehicle becomes active.
    if (!req.user.activeVehicleId) {
      req.user.activeVehicleId = vehicle.id;
      await req.user.save();
    }
    res.status(201).json(vehicle);
  })
);

// PUT /api/vehicles/active { id }
router.put(
  '/active',
  asyncHandler(async (req, res) => {
    req.user.activeVehicleId = req.body.id;
    await req.user.save();
    res.json({ activeVehicleId: req.user.activeVehicleId });
  })
);

// PUT /api/vehicles/:id
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const vehicle = await Vehicle.findOneAndUpdate(
      { userId: req.user.id, id: req.params.id },
      req.body,
      { new: true }
    );
    if (!vehicle) throw new AppError('Vehicle not found', 404, 'NOT_FOUND');
    res.json(vehicle);
  })
);

// DELETE /api/vehicles/:id
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await Vehicle.deleteOne({ userId: req.user.id, id: req.params.id });
    if (req.user.activeVehicleId === req.params.id) {
      const next = await Vehicle.findOne({ userId: req.user.id });
      req.user.activeVehicleId = next ? next.id : undefined;
      await req.user.save();
    }
    res.json({ success: true, activeVehicleId: req.user.activeVehicleId || null });
  })
);

module.exports = router;
