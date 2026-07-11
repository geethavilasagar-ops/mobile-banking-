import { Router } from 'express';
import { sendEmailOTPHandler, verifyEmailOTPHandler } from '../controllers/emailOTPController';
import { authenticate } from '../middleware/auth';
import { otpRateLimiter } from '../middleware/rateLimiter';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';

const router = Router();

router.post('/send-otp', authenticate, otpRateLimiter, sendEmailOTPHandler);
router.post('/verify-otp', authenticate, [body('otp').isLength({ min: 6, max: 6 }).isNumeric()], validate, verifyEmailOTPHandler);

export default router;
