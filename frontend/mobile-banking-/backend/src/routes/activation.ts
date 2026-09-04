import { Router } from 'express';
import { setActivationMethod, activationMethodValidation } from '../controllers/activationController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.post('/method', authenticate, activationMethodValidation, validate, setActivationMethod);

export default router;
