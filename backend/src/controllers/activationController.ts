import { Response } from 'express';
import { body } from 'express-validator';
import User from '../models/User';
import Bank from '../models/Bank';
import RegistrationStatus from '../models/RegistrationStatus';
import { AuthRequest } from '../middleware/auth';
import { successResponse, errorResponse } from '../utils/responseUtils';

export const activationMethodValidation = [
  body('bankId').notEmpty().withMessage('Bank selection is required'),
  body('method').isIn(['debit_card', 'aadhaar']).withMessage('Invalid activation method'),
];

export const setActivationMethod = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bankId, method } = req.body;
    const userId = req.userId!;

    const bank = await Bank.findById(bankId);
    if (!bank || !bank.isActive) {
      errorResponse(res, 'Selected bank is not supported.', 400);
      return;
    }

    await User.findByIdAndUpdate(userId, {
      selectedBankId: bankId,
      activationMethod: method,
    });

    await RegistrationStatus.findOneAndUpdate(
      { userId },
      { bankSelected: true, activationMethodSet: true, currentStep: 5 }
    );

    successResponse(res, { method, bankId }, 'Activation method saved.');
  } catch (err) {
    errorResponse(res, 'Failed to save activation method.', 500);
  }
};
