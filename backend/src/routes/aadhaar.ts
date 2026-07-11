import { Router } from 'express';
import {
  sendAadhaarOTPHandler, verifyAadhaarOTPHandler, aadhaarValidation
} from '../controllers/aadhaarController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { otpRateLimiter } from '../middleware/rateLimiter';
import { body } from 'express-validator';

const router = Router();

router.post('/send-otp',   authenticate, otpRateLimiter, aadhaarValidation, validate, sendAadhaarOTPHandler);
router.post('/verify-otp', authenticate, [body('otp').isLength({ min: 6, max: 6 }).isNumeric()], validate, verifyAadhaarOTPHandler);

export default router;
