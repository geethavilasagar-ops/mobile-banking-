import { Router } from 'express';
import { setTransactionPIN, setPINValidation } from '../controllers/pinController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.post('/set', authenticate, setPINValidation, validate, setTransactionPIN);

export default router;
