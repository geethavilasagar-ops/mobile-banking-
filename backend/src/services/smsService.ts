import twilio from 'twilio';
import { ENV } from '../config/env';

let client: twilio.Twilio | null = null;

if (ENV.TWILIO_ACCOUNT_SID && ENV.TWILIO_AUTH_TOKEN && ENV.TWILIO_PHONE_NUMBER) {
  client = twilio(ENV.TWILIO_ACCOUNT_SID, ENV.TWILIO_AUTH_TOKEN);
}

/**
 * Send an OTP via SMS for Aadhaar linked mobile verification
 */
export const sendAadhaarOTP = async (otp: string, mobileNumber: string): Promise<void> => {
  if (!client) {
    console.error('❌ Twilio credentials missing. SMS delivery is disabled.');
    return;
  }

  const targetNumber = mobileNumber.startsWith('+') ? mobileNumber : `+91${mobileNumber}`;

  try {
    await client.messages.create({
      body: `Your Dev Pay Aadhaar verification code is: ${otp}. It will expire in ${ENV.OTP_EXPIRES_MINUTES} minutes.`,
      from: ENV.TWILIO_PHONE_NUMBER,
      to: targetNumber,
    });
  } catch (error: any) {
    console.error(`❌ Twilio API Failed: ${error.message}`);
    throw new Error('Failed to send SMS');
  }
};
