import { Response } from 'express';
import User from '../models/User';
import RegistrationStatus from '../models/RegistrationStatus';
import OTPVerification from '../models/OTPVerification';
import { AuthRequest } from '../middleware/auth';
import { successResponse, errorResponse } from '../utils/responseUtils';

export const completeRegistration = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    const status = await RegistrationStatus.findOne({ userId });
    if (!status) { errorResponse(res, 'Registration status not found.', 404); return; }

    if (!status.emailVerified) { errorResponse(res, 'Email not verified.', 400); return; }
    if (!status.pinSet) { errorResponse(res, 'Transaction PIN not set.', 400); return; }

    // Activate account
    await User.findByIdAndUpdate(userId, { isActive: true, sessionToken: undefined });

    // Finalize registration status
    await RegistrationStatus.findOneAndUpdate(
      { userId },
      { isComplete: true, completedAt: new Date() }
    );

    // Cleanup all OTPs
    await OTPVerification.deleteMany({ userId });

    successResponse(res, {}, 'Registration completed successfully! Your account is now active.');
  } catch (err) {
    errorResponse(res, 'Failed to complete registration.', 500);
  }
};
