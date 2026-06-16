'use strict';

const express = require('express');
const Slot = require('../models/slot');
const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('../middleware/error');

const router = express.Router();

const FLOORS = 4;
const SIDE = 6; // 6x6 per floor

// Generate the shared garage layout once (mirrors the Flutter ParkingRepository).
function generateSlots() {
  const out = [];
  for (let f = 1; f <= FLOORS; f++) {
    for (let r = 0; r < SIDE; r++) {
      for (let c = 0; c < SIDE; c++) {
        const roll = Math.random();
        let status = 'available';
        if (roll < 0.35) status = 'occupied';
        else if (roll < 0.45) status = 'reserved';
        else if (roll < 0.48) status = 'disabled';
        out.push({
          id: `F${f}_R${r}C${c}`,
          floor: f,
          row: r,
          col: c,
          label: `F${f}-${String.fromCharCode(65 + r)}${c + 1}`,
          status,
          size: c === 0 || c === SIDE - 1 ? 'large' : 'standard',
          hasCharger: Math.random() < 0.18,
          disabledAccess: Math.random() < 0.07,
          walkingDistance: 30 + Math.floor(Math.random() * 180),
          score: 0.55 + Math.random() * 0.45,
        });
      }
    }
  }
  return out;
}

// GET /api/slots (seeds the layout on first call)
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    if ((await Slot.estimatedDocumentCount()) === 0) {
      await Slot.insertMany(generateSlots(), { ordered: false }).catch(() => {});
    }
    res.json(await Slot.find({}));
  })
);

// PATCH /api/slots/:id/status { status }
router.patch(
  '/:id/status',
  asyncHandler(async (req, res) => {
    const slot = await Slot.findOneAndUpdate(
      { id: req.params.id },
      { status: req.body.status },
      { new: true }
    );
    if (!slot) throw new AppError('Slot not found', 404, 'NOT_FOUND');
    res.json(slot);
  })
);

module.exports = router;
