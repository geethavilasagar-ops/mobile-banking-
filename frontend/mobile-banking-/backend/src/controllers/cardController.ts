import { Response } from 'express';
import { body } from 'express-validator';
import User from '../models/User';
import BankAccount from '../models/BankAccount';
import OTPVerification from '../models/OTPVerification';
import { AuthRequest } from '../middleware/auth';
import { generateOTP, hashOTP, verifyOTP, getOTPExpiry, isOTPExpired, canResendOTP } from '../services/otpService';
import { sendCardOTP } from '../services/emailService';
import { successResponse, errorResponse } from '../utils/responseUtils';
import { ENV } from '../config/env';

export const validateCardValidation = [
  body('accountNumber').trim().notEmpty().withMessage('Account number is required'),
  body('cardholderName').trim().notEmpty().withMessage('Cardholder name is required'),
  body('cardNumber').trim().isLength({ min: 16, max: 16 }).withMessage('Card number must be 16 digits').isNumeric(),
  body('expiryDate').trim().matches(/^(0[1-9]|1[0-2])\/\d{2}$/).withMessage('Expiry must be MM/YY'),
  body('cvv').trim().isLength({ min: 3, max: 3 }).withMessage('CVV must be 3 digits').isNumeric(),
];

export const validateCard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { accountNumber, cardholderName, cardNumber, expiryDate, cvv } = req.body;
    const userId = req.userId!;

    const user = await User.findById(userId).populate('selectedBankId');
    if (!user || !user.selectedBankId) {
      errorResponse(res, 'Please select a bank first.', 400);
      return;
    }

    // Validate expiry date
    const [month, year] = expiryDate.split('/');
    const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
    if (expiry < new Date()) {
      errorResponse(res, 'Card has expired.', 400);
      return;
    }

    // Store bank account (only last 4 digits of card)
    await BankAccount.findOneAndUpdate(
      { userId },
      {
        userId,
        bankId: user.selectedBankId,
        accountNumber,
        cardholderName,
        cardNumberLast4: cardNumber.slice(-4),
        expiryDate,
      },
      { upsert: true, new: true }
    );

    successResponse(res, {}, 'Card details validated. OTP will be sent.');
  } catch (err) {
    errorResponse(res, 'Card validation failed.', 500);
  }
};

export const sendCardOTPHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const user = await User.findById(userId);
    if (!user) { errorResponse(res, 'User not found.', 404); return; }

    const existing = await OTPVerification.findOne({ userId, type: 'card', isUsed: false });
    if (existing && !canResendOTP(existing.lastSentAt, ENV.OTP_RESEND_SECONDS)) {
      const wait = ENV.OTP_RESEND_SECONDS - Math.floor((Date.now() - existing.lastSentAt.getTime()) / 1000);
      errorResponse(res, `Please wait ${wait} seconds before resending.`, 429);
      return;
    }

    await OTPVerification.deleteMany({ userId, type: 'card' });

    const otp = generateOTP();
    await OTPVerification.create({
      userId,
      hashedOTP: await hashOTP(otp),
      type: 'card',
      expiresAt: getOTPExpiry(ENV.OTP_EXPIRES_MINUTES),
      lastSentAt: new Date(),
    });

    await sendCardOTP(user.email, user.firstName, otp);

    successResponse(res, { expiresIn: ENV.OTP_EXPIRES_MINUTES * 60 }, 'Card verification OTP sent.');
  } catch (err) {
    errorResponse(res, 'Failed to send card OTP.', 500);
  }
};

export const verifyCardOTPHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { otp } = req.body;
    const userId = req.userId!;

    const otpDoc = await OTPVerification.findOne({ userId, type: 'card', isUsed: false });
    if (!otpDoc) { errorResponse(res, 'No OTP found. Please request a new one.', 400); return; }
    if (isOTPExpired(otpDoc.expiresAt)) {
      await OTPVerification.deleteOne({ _id: otpDoc._id });
      errorResponse(res, 'OTP has expired.', 400); return;
    }
    if (otpDoc.attempts >= ENV.OTP_MAX_ATTEMPTS) {
      await OTPVerification.deleteOne({ _id: otpDoc._id });
      errorResponse(res, 'Maximum attempts exceeded.', 429); return;
    }

    otpDoc.attempts += 1;
    await otpDoc.save();

    const isValid = await verifyOTP(otp, otpDoc.hashedOTP);
    if (!isValid) {
      errorResponse(res, `Incorrect OTP. ${ENV.OTP_MAX_ATTEMPTS - otpDoc.attempts} attempts remaining.`, 400);
      return;
    }

    await OTPVerification.deleteOne({ _id: otpDoc._id });

    successResponse(res, {}, 'Card verified successfully.');
  } catch (err) {
    errorResponse(res, 'Card OTP verification failed.', 500);
  }
};
