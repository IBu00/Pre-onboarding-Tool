const nodemailer = require('nodemailer');

// Store verification codes temporarily (in production, use a database)
const verificationCodes = new Map();

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: 'Method Not Allowed' };
  }

  try {
    const { email, type } = JSON.parse(event.body);

    if (!email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Email address is required',
          details: 'Please provide a valid email address.'
        })
      };
    }

    // Create transporter using Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // mohammedibrahimah97@gmail.com
        pass: process.env.EMAIL_PASSWORD // Gmail App Password
      }
    });

    let mailOptions;
    let code;
    const sentTime = Date.now();

    if (type === '2fa') {
      // Generate 6-digit code
      code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store code with timestamp
      verificationCodes.set(email, {
        code,
        sentTime,
        type: '2fa'
      });

      mailOptions = {
        from: `"Pre-onboarding Test" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your 2FA Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">2FA Verification Code</h2>
            <p>Your verification code is:</p>
            <h1 style="background: #f0f0f0; padding: 20px; text-align: center; font-size: 32px; letter-spacing: 5px;">${code}</h1>
            <p>This code will expire in 5 minutes.</p>
            <p style="color: #666; font-size: 12px;">This is an automated test email from the Pre-onboarding Tool.</p>
            <p style="color: #666; font-size: 12px;">Sent from: ${process.env.EMAIL_USER}</p>
            <p style="color: #666; font-size: 12px;">Sent at: ${new Date().toLocaleString()}</p>
          </div>
        `
      };
    } else {
      // Regular test email
      code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store code with timestamp
      verificationCodes.set(email, {
        code,
        sentTime,
        type: 'test'
      });

      mailOptions = {
        from: `"Pre-onboarding Test" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Test Email - Pre-onboarding Tool',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Email Delivery Test</h2>
            <p>This is a test email to verify email delivery functionality.</p>
            <p>Your verification code is:</p>
            <h1 style="background: #f0f0f0; padding: 20px; text-align: center; font-size: 32px; letter-spacing: 5px;">${code}</h1>
            <p>If you received this email, the email delivery test has passed successfully.</p>
            <p style="color: #666; font-size: 12px;">This is an automated test email from the Pre-onboarding Tool.</p>
            <p style="color: #666; font-size: 12px;">Sent from: ${process.env.EMAIL_USER}</p>
            <p style="color: #666; font-size: 12px;">Sent at: ${new Date().toLocaleString()}</p>
          </div>
        `
      };
    }

    const info = await transporter.sendMail(mailOptions);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: type === '2fa' ? '2FA code sent successfully' : 'Test email sent successfully',
        details: type === '2fa' 
          ? `2FA verification code sent to ${email} from ${process.env.EMAIL_USER}. Please check your inbox.`
          : `Test email successfully sent to ${email} from ${process.env.EMAIL_USER}. Please check your inbox (and spam folder) to confirm delivery.`,
        metadata: {
          messageId: info.messageId,
          timestamp: sentTime,
          from: process.env.EMAIL_USER
        }
      })
    };
  } catch (error) {
    console.error('Email error:', error);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Failed to send email',
        details: 'Email delivery failed. Please check the email address and try again.',
        blockers: [
          'Invalid email address',
          'Email server error',
          'Email rejected by recipient server',
          'Gmail authentication failed'
        ],
        metadata: { 
          error: error.message,
          from: process.env.EMAIL_USER
        }
      })
    };
  }
};
