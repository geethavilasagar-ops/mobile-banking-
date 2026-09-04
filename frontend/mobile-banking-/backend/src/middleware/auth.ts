import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/jwtService';
import { errorResponse } from '../utils/responseUtils';

export interface AuthRequest extends Request {
  userId?: string;
  email?: string;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    errorResponse(res, 'Authorization token required', 401);
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyToken(token);
    req.userId = payload.userId;
    req.email = payload.email;
    next();
  } catch {
    errorResponse(res, 'Invalid or expired token', 401);
  }
};
