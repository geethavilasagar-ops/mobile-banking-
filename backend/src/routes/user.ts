import { Router } from 'express';
import { getUserProfile } from '../controllers/userController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/profile', authenticate, getUserProfile);

export default router;
