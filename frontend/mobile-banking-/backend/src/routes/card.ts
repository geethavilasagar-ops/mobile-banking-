import { Router } from 'express';
import {
  validateCard, validateCardValidation,
  sendCardOTPHandler, verifyCardOTPHandler
} from '../controllers/cardController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { otpRateLimiter } from '../middleware/rateLimiter';
import { body } from 'express-validator';

const router = Router();

router.post('/validate',   authenticate, validateCardValidation, validate, validateCard);
router.post('/send-otp',   authenticate, otpRateLimiter, sendCardOTPHandler);
router.post('/verify-otp', authenticate, [body('otp').isLength({ min: 6, max: 6 }).isNumeric()], validate, verifyCardOTPHandler);

export default router;
