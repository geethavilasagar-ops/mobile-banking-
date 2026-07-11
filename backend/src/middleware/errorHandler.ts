import { Request, Response, NextFunction } from 'express';
import { ENV } from '../config/env';
import { errorResponse } from '../utils/responseUtils';

interface AppError extends Error {
  statusCode?: number;
  code?: number;
  errors?: Record<string, any>;
  keyValue?: Record<string, any>;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let errors: any[] = [];

  // Mongoose duplicate key error
  if (err.code === 11000 && err.keyValue) {
    statusCode = 400;
    message = 'Duplicate field value entered';
    errors = [err.keyValue];
  }

  // Mongoose validation error
  if (err.name === 'ValidationError' && err.errors) {
    statusCode = 400;
    message = 'Validation Error';
    errors = Object.values(err.errors).map((val: any) => val.message);
  }

  // Mongoose cast error (invalid ID)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Resource not found or invalid format';
  }

  if (ENV.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Internal server error';
  }

  if (ENV.NODE_ENV !== 'production') {
    console.error(`[Error] ${err.name}: ${err.message}`, err.stack);
  }

  errorResponse(res, message, statusCode, errors.length > 0 ? errors : undefined);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  errorResponse(res, `Route ${req.originalUrl} not found`, 404);
};
