export const getEmailTemplate = (otp: string, firstName: string, expiryMinutes: number) => {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your OTP Code</title>
  <style>
    body { font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb; margin: 0; padding: 0; color: #111827; }
    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 1px solid #e5e7eb; }
    .header { background-color: #4F46E5; padding: 24px 32px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.025em; }
    .content { padding: 40px 32px; text-align: center; }
    .greeting { font-size: 18px; font-weight: 600; color: #374151; margin-bottom: 24px; text-align: left; }
    .message { font-size: 16px; color: #4B5563; margin-bottom: 32px; text-align: left; line-height: 1.5; }
    .otp-box { background-color: #EEF2FF; border: 2px dashed #818CF8; border-radius: 8px; padding: 24px; margin: 0 auto 32px auto; display: inline-block; }
    .otp-code { font-size: 36px; font-weight: 800; color: #4F46E5; letter-spacing: 0.2em; margin: 0; font-family: monospace; }
    .expiry { font-size: 14px; color: #6B7280; margin-bottom: 32px; }
    .security-warning { background-color: #FEF2F2; border-left: 4px solid #EF4444; padding: 16px; text-align: left; margin-bottom: 24px; border-radius: 0 8px 8px 0; }
    .security-warning p { margin: 0; color: #991B1B; font-size: 14px; font-weight: 500; }
    .footer { background-color: #F3F4F6; padding: 24px 32px; text-align: center; border-top: 1px solid #E5E7EB; }
    .footer p { margin: 0; color: #9CA3AF; font-size: 12px; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Dev Pay</h1>
    </div>
    <div class="content">
      <div class="greeting">Hello ${firstName},</div>
      <div class="message">
        You requested a One-Time Password (OTP) for your Dev Pay account. Please use the verification code below to securely complete your action.
      </div>
      
      <div class="otp-box">
        <p class="otp-code">${otp}</p>
      </div>
      
      <div class="expiry">
        This code is valid for <strong>${expiryMinutes} minutes</strong>.
      </div>
      
      <div class="security-warning">
        <p>⚠️ <strong>Security Warning:</strong> Never share this OTP with anyone, including Dev Pay support staff. We will never ask for your OTP.</p>
      </div>
    </div>
    <div class="footer">
      <p>If you didn't request this OTP, please ignore this email or contact support if you have concerns.</p>
      <p>&copy; ${new Date().getFullYear()} Dev Pay. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Hello ${firstName},

You requested a One-Time Password (OTP) for your Dev Pay account. 
Please use the following verification code:

${otp}

This code is valid for ${expiryMinutes} minutes.

SECURITY WARNING: Never share this OTP with anyone, including Dev Pay support staff. We will never ask for your OTP.

If you didn't request this OTP, please ignore this email.

(c) ${new Date().getFullYear()} Dev Pay. All rights reserved.
  `;

  return { html, text };
};
