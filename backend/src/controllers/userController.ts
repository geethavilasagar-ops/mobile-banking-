import { Response } from 'express';
import User from '../models/User';
import BankAccount from '../models/BankAccount';
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
