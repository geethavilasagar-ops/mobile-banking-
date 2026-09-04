import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';

export interface JWTPayload {
  userId: string;
  email: string;
}

/**
 * Sign a JWT session token
 */
export const signToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
};

/**
 * Verify and decode a JWT token
 */
export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, ENV.JWT_SECRET) as JWTPayload;
};
