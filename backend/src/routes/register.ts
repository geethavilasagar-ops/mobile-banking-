import { Router } from 'express';
import { register, registerValidation } from '../controllers/registerController';
import { validate } from '../middleware/validate';
import { registrationRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/', registrationRateLimiter, registerValidation, validate, register);

export default router;
