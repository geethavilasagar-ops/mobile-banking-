import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/devpay',
  JWT_SECRET: process.env.JWT_SECRET || 'devpay_fallback_secret',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_SECURE: process.env.SMTP_SECURE === 'true',
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'Dev Pay <noreply@devpay.app>',
  OTP_EXPIRES_MINUTES: parseInt(process.env.OTP_EXPIRES_MINUTES || '5', 10),
  OTP_MAX_ATTEMPTS: parseInt(process.env.OTP_MAX_ATTEMPTS || '3', 10),
  OTP_RESEND_SECONDS: parseInt(process.env.OTP_RESEND_SECONDS || '30', 10),
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || '',
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || '',
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER || '',
  ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS || 'http://localhost:8081').split(','),
};
