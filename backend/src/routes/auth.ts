import { Router } from 'express';
import {
  login, loginValidation,
  changePassword, changePasswordValidation,
  forgotPasswordRequest, forgotPasswordRequestValidation,
  forgotPasswordReset, forgotPasswordResetValidation
} from '../controllers/authController';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { globalRateLimiter } from '../middleware/rateLimiter';
import rateLimit from 'express-rate-limit';

const router = Router();

// Login specific rate limiter: max 5 attempts per minute
export const loginRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many login attempts, please try again after a minute' },
});

// Forgot Password specific rate limiter: max 3 attempts per hour
export const forgotPasswordRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { success: false, message: 'Too many forgot password requests, please try again after an hour' },
});

router.post('/login', loginRateLimiter, loginValidation, validate, login);
router.post('/change-password', authenticate, changePasswordValidation, validate, changePassword);
router.post('/forgot-password/request', forgotPasswordRateLimiter, forgotPasswordRequestValidation, validate, forgotPasswordRequest);
router.post('/forgot-password/reset', globalRateLimiter, forgotPasswordResetValidation, validate, forgotPasswordReset);

export default router;
