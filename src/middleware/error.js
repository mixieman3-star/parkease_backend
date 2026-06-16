'use strict';

class AppError extends Error {
  constructor(message, statusCode, errorCode) {
    super(message);
    this.statusCode = statusCode || 400;
    this.errorCode = errorCode || 'BAD_REQUEST';
  }
}

// 404 for unmatched routes.
function notFound(req, res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404, 'NOT_FOUND'));
}

// Centralized error handler — every error response has the same shape.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let { statusCode, errorCode, message } = err;

  if (err.name === 'ValidationError') {
    statusCode = 422;
    errorCode = 'VALIDATION_ERROR';
    message = Object.values(err.errors).map((e) => e.message).join('; ');
  } else if (err.name === 'CastError') {
    statusCode = 400;
    errorCode = 'INVALID_ID';
    message = `Invalid ${err.path}: ${err.value}`;
  }

  if (!statusCode || statusCode >= 500) {
    statusCode = 500;
    errorCode = errorCode || 'INTERNAL_ERROR';
    if (process.env.NODE_ENV === 'production') message = 'Internal server error';
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message: message || 'Something went wrong',
    errorCode: errorCode || 'INTERNAL_ERROR',
  });
}

module.exports = { AppError, notFound, errorHandler };
