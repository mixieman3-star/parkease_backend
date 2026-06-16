'use strict';

const express = require('express');
const crypto = require('crypto');
const User = require('../models/user');
const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('../middleware/error');

const router = express.Router();

const genId = (p) => `${p}_${Date.now()}_${crypto.randomInt(9999)}`;

// POST /api/auth/signup
router.post(
  '/signup',
  asyncHandler(async (req, res) => {
    const { id, name, email, password, role, avatarSeed } = req.body;
    if (!name || !email || !password) {
      throw new AppError('name, email and password are required', 422, 'VALIDATION_ERROR');
    }
    const normEmail = String(email).trim().toLowerCase();
    if (await User.findOne({ email: normEmail })) {
      throw new AppError('Email already registered', 409, 'EMAIL_TAKEN');
    }
    const token = User.newToken();
    const user = await User.create({
      id: id || genId('u'),
      name: String(name).trim(),
      email: normEmail,
      passwordHash: User.hashPassword(password),
      role: role === 'operator' ? 'operator' : 'driver',
      avatarSeed: Number.isFinite(avatarSeed) ? avatarSeed : crypto.randomInt(8),
      token,
    });
    res.status(201).json({ user, token });
  })
);

// POST /api/auth/signin
router.post(
  '/signin',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email: String(email || '').trim().toLowerCase() });
    if (!user || user.passwordHash !== User.hashPassword(password || '')) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }
    if (!user.token) {
      user.token = User.newToken();
      await user.save();
    }
    res.json({ user, token: user.token });
  })
);

module.exports = router;
