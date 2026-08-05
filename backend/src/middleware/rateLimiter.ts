import rateLimit from 'express-rate-limit';

export const otpRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 100, // Relaxed for development testing
  message: {
    success: false,
    message: 'Too many OTP requests from this IP, please try again after 5 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const registrationRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100, // Relaxed for development testing
  message: {
    success: false,
    message: 'Too many registration attempts from this IP, please try again after an hour',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
