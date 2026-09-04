import { Router } from 'express';
import authRouter        from './auth';
import userRouter        from './user';
import transactionsRouter from './transactions';
import registerRouter    from './register';
import emailRouter       from './email';
import banksRouter       from './banks';
import activationRouter  from './activation';
import cardRouter        from './card';
import aadhaarRouter     from './aadhaar';
import pinRouter         from './pin';
import registrationRouter from './registration';

const router = Router();

router.use('/auth',         authRouter);
router.use('/user',         userRouter);
router.use('/transactions', transactionsRouter);
router.use('/register',     registerRouter);
router.use('/email',        emailRouter);
router.use('/banks',        banksRouter);
router.use('/activation',   activationRouter);
router.use('/card',         cardRouter);
router.use('/aadhaar',      aadhaarRouter);
router.use('/pin',          pinRouter);
router.use('/registration', registrationRouter);

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'Dev Pay API is running 🚀', timestamp: new Date().toISOString() });
});

export default router;
