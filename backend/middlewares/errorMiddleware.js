/**
 * Global Error Handling Middleware
 * Catches all errors and returns appropriate HTTP status codes and messages
 */

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
  }

  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  }

  // Handle Mongoose cast errors (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 403;
    message = 'Invalid or expired token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 403;
    message = 'Token has expired';
  }

  // Handle specific business logic errors
  if (message === 'Email is already registered') {
    statusCode = 409;
  }

  if (message === 'Invalid email or password') {
    statusCode = 401;
  }

  if (message === 'User not found') {
    statusCode = 404;
  }

  if (message === 'Invalid OTP') {
    statusCode = 400;
  }

  if (message === 'OTP has expired') {
    statusCode = 400;
  }

  if (message === 'Your account has been banned. Please contact support.') {
    statusCode = 403;
  }

  if (message === 'This account uses Google Sign-In. Please sign in with Google.') {
    statusCode = 400;
  }

  // Return error response
  res.status(statusCode).json({
    success: false,
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * Not Found Middleware
 * Handles requests to non-existent routes
 */
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

/**
 * Async Handler Wrapper
 * Wraps async route handlers to catch errors automatically
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  notFound,
  asyncHandler,
};
