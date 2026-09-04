import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

/**
 * Generate a cryptographically secure 6-digit OTP
 */
export const generateOTP = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Hash an OTP using bcrypt
 */
export const hashOTP = async (otp: string): Promise<string> => {
  return bcrypt.hash(otp, SALT_ROUNDS);
};

/**
 * Verify an OTP against its hash
 */
export const verifyOTP = async (otp: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(otp, hash);
};

/**
 * Calculate OTP expiry date
 */
export const getOTPExpiry = (minutes: number): Date => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + minutes);
  return now;
};

/**
 * Check if OTP is expired
 */
export const isOTPExpired = (expiresAt: Date): boolean => {
  return new Date() > expiresAt;
};

/**
 * Check if resend is allowed (30 second cooldown)
 */
export const canResendOTP = (lastSentAt: Date, resendSeconds: number): boolean => {
  const elapsed = (Date.now() - lastSentAt.getTime()) / 1000;
  return elapsed >= resendSeconds;
};
