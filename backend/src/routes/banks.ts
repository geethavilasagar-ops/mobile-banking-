import { Router } from 'express';
import { getBanks } from '../controllers/bankController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getBanks);

export default router;
