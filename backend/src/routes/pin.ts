import { Router } from 'express';
import { setTransactionPIN, setPINValidation, verifyTransactionPIN } from '../controllers/pinController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.post('/set', authenticate, setPINValidation, validate, setTransactionPIN);
router.post('/verify', authenticate, verifyTransactionPIN);

export default router;

