import { Request, Response } from 'express';
import { body } from 'express-validator';
import User from '../models/User';
import RegistrationStatus from '../models/RegistrationStatus';
import { signToken } from '../services/jwtService';
import { hashValue } from '../utils/hashUtils';
import { successResponse, errorResponse } from '../utils/responseUtils';

export const registerValidation = [
  body('firstName').trim().notEmpty().withMessage('First name is required').isLength({ max: 50 }),
  body('lastName').trim().notEmpty().withMessage('Last name is required').isLength({ max: 50 }),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('phone').trim().isLength({ min: 10, max: 10 }).withMessage('Phone must be 10 digits').isNumeric(),
  body('password').trim().isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    // Check duplicate email
    const existing = await User.findOne({ email });
    if (existing) {
      errorResponse(res, 'An account with this email already exists.', 409);
      return;
    }

    // Check duplicate phone
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      errorResponse(res, 'An account with this phone number already exists.', 409);
      return;
    }

    const hashedPassword = await hashValue(password);

    // Create user
    const user = await User.create({ firstName, lastName, email, phone, password: hashedPassword });

    // Create registration status
    await RegistrationStatus.create({ userId: user._id });

    // Issue session JWT
    const token = signToken({ userId: user._id.toString(), email: user.email });

    // Store token on user
    user.sessionToken = token;
    await user.save();

    successResponse(res, { token, userId: user._id }, 'Registration initiated. Please verify your email.', 201);
  } catch (err) {
    errorResponse(res, 'Registration failed. Please try again.', 500);
  }
};
