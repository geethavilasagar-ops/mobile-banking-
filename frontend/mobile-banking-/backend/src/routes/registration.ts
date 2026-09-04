import { Router } from 'express';
import { completeRegistration } from '../controllers/completionController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/complete', authenticate, completeRegistration);

export default router;
