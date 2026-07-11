import { Response } from 'express';
import { body } from 'express-validator';
import User from '../models/User';
import OTPVerification from '../models/OTPVerification';
import { AuthRequest } from '../middleware/auth';
import { generateOTP, hashOTP, verifyOTP, getOTPExpiry, isOTPExpired, canResendOTP } from '../services/otpService';
import { sendAadhaarOTP } from '../services/smsService';
import { validateVerhoeff } from '../utils/verhoeff';
import { successResponse, errorResponse } from '../utils/responseUtils';
import { ENV } from '../config/env';

export const aadhaarValidation = [
  body('aadhaarNumber')
    .trim()
    .isLength({ min: 12, max: 12 })
    .withMessage('Aadhaar number must be exactly 12 digits')
    .isNumeric()
    .withMessage('Aadhaar number must contain only digits')
    .custom((value) => {
      if (!validateVerhoeff(value)) {
        throw new Error('Invalid Aadhaar number (checksum failed)');
      }
      return true;
    }),
  body('mobileNumber')
    .trim()
    .isLength({ min: 10, max: 10 })
    .withMessage('Mobile number must be exactly 10 digits')
    .isNumeric()
    .withMessage('Mobile number must contain only digits'),
  body('consent').equals('true').withMessage('Consent is required to proceed'),
];

export const sendAadhaarOTPHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const user = await User.findById(userId);
    if (!user) { errorResponse(res, 'User not found.', 404); return; }

    const existing = await OTPVerification.findOne({ userId, type: 'aadhaar', isUsed: false });
    if (existing && !canResendOTP(existing.lastSentAt, ENV.OTP_RESEND_SECONDS)) {
      const wait = ENV.OTP_RESEND_SECONDS - Math.floor((Date.now() - existing.lastSentAt.getTime()) / 1000);
      errorResponse(res, `Please wait ${wait} seconds.`, 429);
      return;
    }

    await OTPVerification.deleteMany({ userId, type: 'aadhaar' });

    const otp = generateOTP();
    await OTPVerification.create({
      userId,
      hashedOTP: await hashOTP(otp),
      type: 'aadhaar',
      expiresAt: getOTPExpiry(ENV.OTP_EXPIRES_MINUTES),
      lastSentAt: new Date(),
    });

    // Extract mobile number from request
    const { mobileNumber } = req.body;

    // Send SMS via Twilio
    await sendAadhaarOTP(otp, mobileNumber);

    successResponse(res, { expiresIn: ENV.OTP_EXPIRES_MINUTES * 60 }, 'Aadhaar OTP sent to your registered mobile number.');
  } catch (err) {
    errorResponse(res, 'Failed to send Aadhaar OTP.', 500);
  }
};

export const verifyAadhaarOTPHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { otp } = req.body;
    const userId = req.userId!;

    const otpDoc = await OTPVerification.findOne({ userId, type: 'aadhaar', isUsed: false });
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

    successResponse(res, {}, 'Aadhaar verified successfully.');
  } catch (err) {
    errorResponse(res, 'Aadhaar OTP verification failed.', 500);
  }
};
