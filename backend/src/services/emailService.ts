import nodemailer from 'nodemailer';
import { ENV } from '../config/env';
import { getEmailTemplate } from '../utils/emailTemplate';

let transporter: nodemailer.Transporter | null = null;

async function initTransporter() {
  if (ENV.SMTP_HOST && ENV.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: ENV.SMTP_HOST,
      port: ENV.SMTP_PORT,
      secure: ENV.SMTP_SECURE,
      auth: {
        user: ENV.SMTP_USER,
        pass: ENV.SMTP_PASS,
      },
    });
  } else {
    console.error('❌ SMTP credentials missing. Email delivery is disabled.');
  }
}

initTransporter();

/**
 * Send OTP email for email verification
 */
export const sendEmailOTP = async (to: string, name: string, otp: string): Promise<void> => {
  if (!transporter) await initTransporter();
  if (!transporter) {
    console.error('Email transporter not configured.');
    return;
  }

  const { html, text } = getEmailTemplate(otp, name, ENV.OTP_EXPIRES_MINUTES);

  await transporter.sendMail({
    from: ENV.EMAIL_FROM || '"Dev Pay Security" <noreply@devpay.app>',
    to,
    subject: `${otp} is your Dev Pay verification code`,
    html,
    text,
  });
};

/**
 * Send OTP for card verification
 */
export const sendCardOTP = async (to: string, name: string, otp: string): Promise<void> => {
  if (!transporter) await initTransporter();
  if (!transporter) {
    console.error('Email transporter not configured.');
    return;
  }

  const { html, text } = getEmailTemplate(otp, name, ENV.OTP_EXPIRES_MINUTES);

  await transporter.sendMail({
    from: ENV.EMAIL_FROM || '"Dev Pay Security" <noreply@devpay.app>',
    to,
    subject: `${otp} — Dev Pay Card Verification`,
    html,
    text,
  });
};

/**
 * Verify SMTP connection
 */
export const verifyEmailConnection = async (): Promise<boolean> => {
  if (!transporter) return false;
  try {
    await transporter.verify();
    return true;
  } catch {
    return false;
  }
};
