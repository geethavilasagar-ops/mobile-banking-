import nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

async function testSMTP() {
  console.log('Testing SMTP Connection...');
  console.log('Host:', process.env.SMTP_HOST);
  console.log('Port:', process.env.SMTP_PORT);
  console.log('User:', process.env.SMTP_USER);

  if (!process.env.SMTP_USER || process.env.SMTP_USER === 'your_gmail@gmail.com') {
    console.error('ERROR: Placeholder credentials detected in .env');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    await transporter.verify();
    console.log('✅ SMTP Connection Successful!');
  } catch (error) {
    console.error('❌ SMTP Connection Failed:', error);
  }
}

testSMTP();
