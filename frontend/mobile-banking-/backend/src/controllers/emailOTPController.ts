import { Response } from 'express';
import OTPVerification from '../models/OTPVerification';
import User from '../models/User';
import RegistrationStatus from '../models/RegistrationStatus';
import { AuthRequest } from '../middleware/auth';
import { generateOTP, hashOTP, verifyOTP, getOTPExpiry, isOTPExpired, canResendOTP } from '../services/otpService';
import { sendEmailOTP } from '../services/emailService';
import { successResponse, errorResponse } from '../utils/responseUtils';
import { ENV } from '../config/env';

export const sendEmailOTPHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const user = await User.findById(userId);
    if (!user) { errorResponse(res, 'User not found', 404); return; }

    // Check resend cooldown
    const existing = await OTPVerification.findOne({ userId, type: 'email', isUsed: false });
    if (existing && !canResendOTP(existing.lastSentAt, ENV.OTP_RESEND_SECONDS)) {
      const waitSeconds = ENV.OTP_RESEND_SECONDS - Math.floor((Date.now() - existing.lastSentAt.getTime()) / 1000);
      errorResponse(res, `Please wait ${waitSeconds} seconds before resending.`, 429);
      return;
    }

    await OTPVerification.deleteMany({ userId, type: 'email' });

    const otp = generateOTP();
    const hashedOTP = await hashOTP(otp);

    await OTPVerification.create({
      userId,
      hashedOTP,
      type: 'email',
      expiresAt: getOTPExpiry(ENV.OTP_EXPIRES_MINUTES),
      lastSentAt: new Date(),
    });

    // Send email strictly
    await sendEmailOTP(user.email, user.firstName, otp);

    successResponse(res, { expiresIn: ENV.OTP_EXPIRES_MINUTES * 60 }, 'OTP sent to your email address.');
  } catch (err) {
    errorResponse(res, 'Failed to send OTP.', 500);
  }
};

export const verifyEmailOTPHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { otp } = req.body;
    const userId = req.userId!;

    const otpDoc = await OTPVerification.findOne({ userId, type: 'email', isUsed: false });

    if (!otpDoc) { errorResponse(res, 'No OTP found. Please request a new one.', 400); return; }
    if (isOTPExpired(otpDoc.expiresAt)) {
      await OTPVerification.deleteOne({ _id: otpDoc._id });
      errorResponse(res, 'OTP has expired. Please request a new one.', 400);
      return;
    }
    if (otpDoc.attempts >= ENV.OTP_MAX_ATTEMPTS) {
      await OTPVerification.deleteOne({ _id: otpDoc._id });
      errorResponse(res, 'Maximum attempts exceeded. Please request a new OTP.', 429);
      return;
    }

    otpDoc.attempts += 1;
    await otpDoc.save();

    const isValid = await verifyOTP(otp, otpDoc.hashedOTP);
    if (!isValid) {
      const remaining = ENV.OTP_MAX_ATTEMPTS - otpDoc.attempts;
      errorResponse(res, `Incorrect OTP. ${remaining} attempts remaining.`, 400);
      return;
    }

    // Delete OTP after successful verification
    await OTPVerification.deleteOne({ _id: otpDoc._id });

    // Update user and registration status
    await User.findByIdAndUpdate(userId, { isEmailVerified: true });
    await RegistrationStatus.findOneAndUpdate(
      { userId },
      { emailVerified: true, currentStep: 3 }
    );

    successResponse(res, {}, 'Email verified successfully.');
  } catch (err) {
    errorResponse(res, 'OTP verification failed.', 500);
  }
};
