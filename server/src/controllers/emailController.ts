import { Request, Response } from 'express';
import { emailService } from '../services/emailService';

// Store verification codes temporarily (in production, use Redis or similar)
const verificationCodes = new Map<string, { code: string; timestamp: Date }>();
const tfaCodes = new Map<string, { code: string; timestamp: Date }>();

export const sendTestEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email address is required',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
      });
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store verification code
    verificationCodes.set(email, {
      code: verificationCode,
      timestamp: new Date(),
    });

    // Send email
    const sent = await emailService.sendTestEmail(email, verificationCode);

    if (!sent) {
      return res.status(500).json({
        success: false,
        error: 'Failed to send email. Please check server configuration.',
      });
    }

    res.json({
      success: true,
      message: 'Test email sent successfully',
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Error in sendTestEmail:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send test email',
    });
  }
};

export const verifyEmailCode = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        error: 'Email and code are required',
      });
    }

    const stored = verificationCodes.get(email);

    if (!stored) {
      return res.status(400).json({
        success: false,
        error: 'No verification code found for this email',
      });
    }

    // Check if code expired (5 minutes)
    const now = new Date();
    const elapsed = now.getTime() - stored.timestamp.getTime();
    if (elapsed > 5 * 60 * 1000) {
      verificationCodes.delete(email);
      return res.status(400).json({
        success: false,
        error: 'Verification code expired',
      });
    }

    // Verify code
    if (stored.code !== code) {
      return res.status(400).json({
        success: false,
        error: 'Invalid verification code',
      });
    }

    // Calculate delivery time
    const deliveryTime = elapsed / 1000; // in seconds

    // Clean up
    verificationCodes.delete(email);

    res.json({
      success: true,
      deliveryTime,
      message: 'Email verified successfully',
    });
  } catch (error) {
    console.error('Error in verifyEmailCode:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify code',
    });
  }
};

export const send2FACode = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email address is required',
      });
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP code
    const timestamp = new Date();
    tfaCodes.set(email, {
      code: otpCode,
      timestamp,
    });

    // Send email
    const sent = await emailService.send2FAEmail(email, otpCode);

    if (!sent) {
      return res.status(500).json({
        success: false,
        error: 'Failed to send 2FA email',
      });
    }

    res.json({
      success: true,
      message: '2FA code sent successfully',
      timestamp,
    });
  } catch (error) {
    console.error('Error in send2FACode:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send 2FA code',
    });
  }
};

export const verify2FACode = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        error: 'Email and code are required',
      });
    }

    const stored = tfaCodes.get(email);

    if (!stored) {
      return res.status(400).json({
        success: false,
        error: 'No 2FA code found for this email',
      });
    }

    // Check if code expired (5 minutes)
    const now = new Date();
    const elapsed = now.getTime() - stored.timestamp.getTime();
    if (elapsed > 5 * 60 * 1000) {
      tfaCodes.delete(email);
      return res.status(400).json({
        success: false,
        error: '2FA code expired',
      });
    }

    // Verify code
    if (stored.code !== code) {
      return res.status(400).json({
        success: false,
        error: 'Invalid 2FA code',
      });
    }

    // Calculate delivery time
    const deliveryTime = elapsed / 1000; // in seconds

    // Determine status based on delivery time
    let status: 'PASS' | 'WARNING' | 'FAIL';
    if (deliveryTime < 30) {
      status = 'PASS';
    } else if (deliveryTime < 60) {
      status = 'WARNING';
    } else {
      status = 'FAIL';
    }

    // Clean up
    tfaCodes.delete(email);

    res.json({
      success: true,
      deliveryTime,
      status,
      message: '2FA code verified successfully',
    });
  } catch (error) {
    console.error('Error in verify2FACode:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify 2FA code',
    });
  }
};
