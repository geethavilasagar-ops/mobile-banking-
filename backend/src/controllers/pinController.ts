import { Response } from 'express';
import { body } from 'express-validator';
import TransactionPIN from '../models/TransactionPIN';
import RegistrationStatus from '../models/RegistrationStatus';
import { AuthRequest } from '../middleware/auth';
import { hashValue } from '../utils/hashUtils';
import { successResponse, errorResponse } from '../utils/responseUtils';

export const setPINValidation = [
  body('pin').trim().isLength({ min: 4, max: 4 }).withMessage('PIN must be exactly 4 digits').isNumeric(),
  body('confirmPin').trim().custom((val, { req }) => {
    if (val !== req.body.pin) throw new Error('PINs do not match');
    return true;
  }),
];

const WEAK_PINS = ['1234', '0000', '1111', '2222', '3333', '4444', '5555', '6666', '7777', '8888', '9999', '4321', '0123'];

const isWeakPIN = (pin: string): boolean => {
  if (WEAK_PINS.includes(pin)) return true;

  // Check all same digits (e.g., 1111)
  if (/^(\d)\1{3}$/.test(pin)) return true;

  // Check sequential ascending (e.g., 1234, 2345)
  const digits = pin.split('').map(Number);
  const isAscending = digits.every((d, i) => i === 0 || d === digits[i - 1] + 1);
  if (isAscending) return true;

  // Check sequential descending (e.g., 4321, 9876)
  const isDescending = digits.every((d, i) => i === 0 || d === digits[i - 1] - 1);
  if (isDescending) return true;

  return false;
};

export const setTransactionPIN = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { pin } = req.body;
    const userId = req.userId!;

    if (isWeakPIN(pin)) {
      errorResponse(res, 'PIN is too weak. Avoid sequential or repeated digits like 1234, 0000, or 1111.', 400);
      return;
    }

    const hashedPIN = await hashValue(pin);

    await TransactionPIN.findOneAndUpdate(
      { userId },
      { userId, hashedPIN },
      { upsert: true, new: true }
    );

    await RegistrationStatus.findOneAndUpdate(
      { userId },
      { pinSet: true, activationVerified: true, currentStep: 9 }
    );

    successResponse(res, {}, 'Transaction PIN set successfully.');
  } catch (err) {
    errorResponse(res, 'Failed to set PIN.', 500);
  }
};
