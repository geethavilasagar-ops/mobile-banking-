import { Router } from 'express';
import {
  getUserProfile,
  getNotifications,
  markNotificationRead,
  getBankAccounts,
  addBankAccount,
  getRecentContacts,
} from '../controllers/userController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/profile', authenticate, getUserProfile);
router.get('/notifications', authenticate, getNotifications);
router.patch('/notifications/:id/read', authenticate, markNotificationRead);
router.get('/accounts', authenticate, getBankAccounts);
router.post('/accounts/add', authenticate, addBankAccount);
router.get('/recent-contacts', authenticate, getRecentContacts);

export default router;
