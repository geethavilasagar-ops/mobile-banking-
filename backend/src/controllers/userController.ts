import { Response } from 'express';
import User from '../models/User';
import BankAccount from '../models/BankAccount';
import Notification from '../models/Notification';
import Transaction from '../models/Transaction';
import Bank from '../models/Bank';
import { AuthRequest } from '../middleware/auth';
import { successResponse, errorResponse } from '../utils/responseUtils';

export const getUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId).select('-password -sessionToken');
    if (!user) {
      errorResponse(res, 'User not found.', 404);
      return;
    }

    const bankAccount = await BankAccount.findOne({ userId: req.userId }).populate('bankId', 'name logoUrl color abbreviation');

    successResponse(res, { user, bankAccount }, 'Profile fetched successfully.');
  } catch (err) {
    errorResponse(res, 'Failed to fetch user profile.', 500);
  }
};

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notifications = await Notification.find({ userId: req.userId }).sort({ createdAt: -1 });
    successResponse(res, { notifications }, 'Notifications fetched successfully.');
  } catch (err) {
    errorResponse(res, 'Failed to fetch notifications.', 500);
  }
};

export const markNotificationRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await Notification.findOneAndUpdate({ _id: id, userId: req.userId }, { isRead: true });
    successResponse(res, {}, 'Notification marked as read.');
  } catch (err) {
    errorResponse(res, 'Failed to update notification.', 500);
  }
};

export const getBankAccounts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const accounts = await BankAccount.find({ userId: req.userId }).populate('bankId', 'name logoUrl color abbreviation');
    successResponse(res, { accounts }, 'Bank accounts fetched successfully.');
  } catch (err) {
    errorResponse(res, 'Failed to fetch bank accounts.', 500);
  }
};

export const addBankAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bankId, accountNumber, cardholderName } = req.body;
    const userId = req.userId!;

    const user = await User.findById(userId);
    const bank = await Bank.findById(bankId);
    if (!bank) {
      errorResponse(res, 'Invalid bank selected.', 400);
      return;
    }

    const last4 = (accountNumber || '1234').slice(-4);
    const newAccount = await BankAccount.create({
      userId,
      bankId,
      accountNumber: accountNumber || `ACC${Date.now()}`,
      cardholderName: cardholderName || `${user?.firstName || 'User'} ${user?.lastName || ''}`,
      cardNumberLast4: last4,
      expiryDate: '12/28',
      balance: 50000,
    });

    const populated = await BankAccount.findById(newAccount._id).populate('bankId', 'name logoUrl color abbreviation');
    successResponse(res, { bankAccount: populated }, 'Bank account linked successfully.');
  } catch (err) {
    errorResponse(res, 'Failed to link bank account.', 500);
  }
};

export const getRecentContacts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const recentTxns = await Transaction.find({ userId, type: 'transfer' })
      .sort({ createdAt: -1 })
      .limit(10);

    const contactsMap = new Map();
    for (const txn of recentTxns) {
      if (txn.receiverName && !contactsMap.has(txn.receiverName)) {
        contactsMap.set(txn.receiverName, {
          name: txn.receiverName,
          handle: txn.receiverUpiId || `${txn.receiverName.toLowerCase().replace(/\s+/g, '')}@devpay`,
          initial: txn.receiverName.charAt(0).toUpperCase(),
        });
      }
    }

    let contacts = Array.from(contactsMap.values());
    if (contacts.length === 0) {
      const otherUsers = await User.find({ _id: { $ne: userId } }).limit(5);
      contacts = otherUsers.map((u) => ({
        name: `${u.firstName} ${u.lastName}`.trim(),
        handle: `${u.firstName.toLowerCase()}.${u.lastName.toLowerCase()}@devpay`,
        initial: u.firstName.charAt(0).toUpperCase(),
      }));
    }

    successResponse(res, { contacts }, 'Recent contacts fetched successfully.');
  } catch (err) {
    errorResponse(res, 'Failed to fetch recent contacts.', 500);
  }
};
