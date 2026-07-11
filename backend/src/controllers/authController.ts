import { Request, Response } from 'express';
import { body } from 'express-validator';
import User from '../models/User';
import { signToken } from '../services/jwtService';
import { compareValue, hashValue } from '../utils/hashUtils';
import { successResponse, errorResponse } from '../utils/responseUtils';
import { AuthRequest } from '../middleware/auth';
import { generateOTP, hashOTP, verifyOTP, getOTPExpiry, isOTPExpired } from '../services/otpService';
import OTPVerification from '../models/OTPVerification';
import { sendEmailOTP } from '../services/emailService';
import { ENV } from '../config/env';

export const loginValidation = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').trim().notEmpty().withMessage('Password is required'),
];

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.password) {
      errorResponse(res, 'Invalid email or password.', 401);
      return;
    }

    const isMatch = await compareValue(password, user.password);
    if (!isMatch) {
      errorResponse(res, 'Invalid email or password.', 401);
      return;
    }

    if (!user.isActive && user.activationMethod) {
      // Allow them to login but they are restricted to finishing setup
    }

    const token = signToken({ userId: user._id.toString(), email: user.email });
    
    user.sessionToken = token;
    await user.save();

    successResponse(res, { token, user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, isActive: user.isActive } }, 'Login successful.');
  } catch (err) {
    errorResponse(res, 'Login failed.', 500);
  }
};

export const changePasswordValidation = [
  body('oldPassword').trim().notEmpty().withMessage('Old password is required'),
  body('newPassword').trim().isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
];

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.userId);
    
    if (!user || !user.password) {
      errorResponse(res, 'User not found.', 404);
      return;
    }

    const isMatch = await compareValue(oldPassword, user.password);
    if (!isMatch) {
      errorResponse(res, 'Incorrect old password.', 400);
      return;
    }

    user.password = await hashValue(newPassword);
    await user.save();

    successResponse(res, {}, 'Password changed successfully.');
  } catch (err) {
    errorResponse(res, 'Failed to change password.', 500);
  }
};

// Forgot Password Flow
export const forgotPasswordRequestValidation = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
];

export const forgotPasswordRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      // Security: Do not reveal that the user does not exist
      successResponse(res, { expiresIn: ENV.OTP_EXPIRES_MINUTES * 60 }, 'If your email is registered, an OTP has been sent.');
      return;
    }

    await OTPVerification.deleteMany({ userId: user._id, type: 'email' });
    
    const otp = generateOTP();
    await OTPVerification.create({
      userId: user._id,
      hashedOTP: await hashOTP(otp),
      type: 'email',
      expiresAt: getOTPExpiry(ENV.OTP_EXPIRES_MINUTES),
    });

    await sendEmailOTP(user.email, user.firstName, otp);

    successResponse(res, { expiresIn: ENV.OTP_EXPIRES_MINUTES * 60 }, 'If your email is registered, an OTP has been sent.');
  } catch (err) {
    errorResponse(res, 'Failed to process request.', 500);
  }
};

export const forgotPasswordResetValidation = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('otp').trim().isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits').isNumeric(),
  body('newPassword').trim().isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
];

export const forgotPasswordReset = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      errorResponse(res, 'Invalid request.', 400);
      return;
    }

    const otpDoc = await OTPVerification.findOne({ userId: user._id, type: 'email' });
    if (!otpDoc) { errorResponse(res, 'No OTP found.', 400); return; }
    if (isOTPExpired(otpDoc.expiresAt)) {
      await OTPVerification.deleteOne({ _id: otpDoc._id });
      errorResponse(res, 'OTP expired.', 400); return;
    }
    if (otpDoc.attempts >= ENV.OTP_MAX_ATTEMPTS) {
      await OTPVerification.deleteOne({ _id: otpDoc._id });
      errorResponse(res, 'Maximum attempts exceeded.', 429); return;
    }

    otpDoc.attempts += 1;
    await otpDoc.save();

    const isValid = await verifyOTP(otp, otpDoc.hashedOTP);
    if (!isValid) {
      errorResponse(res, 'Invalid OTP.', 400);
      return;
    }

    await OTPVerification.deleteOne({ _id: otpDoc._id });

    user.password = await hashValue(newPassword);
    await user.save();

    successResponse(res, {}, 'Password reset successfully. You can now login.');
  } catch (err) {
    errorResponse(res, 'Failed to reset password.', 500);
  }
};
