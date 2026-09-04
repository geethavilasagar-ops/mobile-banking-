import { Router } from 'express';
import { transfer, transferValidation, getHistory } from '../controllers/transactionController';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/transfer', authenticate, transferValidation, validate, transfer);
router.get('/history', authenticate, getHistory);

export default router;
