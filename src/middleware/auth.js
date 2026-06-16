'use strict';

const User = require('../models/user');
const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('./error');

// Bearer-token auth: resolves the token to a user and sets req.user.
module.exports = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new AppError('Authentication required', 401, 'UNAUTHORIZED');

  const user = await User.findOne({ token });
  if (!user) throw new AppError('Invalid or expired token', 401, 'UNAUTHORIZED');

  req.user = user;
  next();
});
