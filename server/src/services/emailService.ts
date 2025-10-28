import nodemailer from 'nodemailer';
import { CONFIG } from '../config/env.config';

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    try {
      if (!CONFIG.AWS.SES_SMTP_USER || !CONFIG.AWS.SES_SMTP_PASS) {
        console.warn('AWS SES credentials not configured. Email functionality will be limited.');
        return;
      }

      this.transporter = nodemailer.createTransport({
        host: CONFIG.AWS.SES_SMTP_HOST,
        port: CONFIG.AWS.SES_SMTP_PORT,
        secure: false, // Use TLS
        auth: {
          user: CONFIG.AWS.SES_SMTP_USER,
          pass: CONFIG.AWS.SES_SMTP_PASS,
        },
      });

      console.log('Email service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize email service:', error);
    }
  }

  async sendTestEmail(recipientEmail: string, verificationCode: string): Promise<boolean> {
    if (!this.transporter) {
      console.error('Email transporter not initialized');
      return false;
    }

    try {
      const mailOptions = {
        from: CONFIG.EMAIL.SENDER,
        to: recipientEmail,
        subject: 'ILex Pre-Onboarding Test - Email Delivery Verification',
        html: `
          <html>
            <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
              <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
                <h2 style="color: #d96302;">ILex Pre-Onboarding Test</h2>
                <p>Hello,</p>
                <p>This is a test email to verify email delivery for your pre-onboarding assessment.</p>
                <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <p style="margin: 0;"><strong>Verification Code:</strong></p>
                  <p style="font-size: 24px; font-weight: bold; color: #d96302; margin: 10px 0;">${verificationCode}</p>
                </div>
                <p>Please enter this code in the test application to confirm email delivery.</p>
                <p style="margin-top: 30px; font-size: 12px; color: #666;">
                  This is an automated test email from Institutional Lending Exchange.<br>
                  If you did not initiate this test, please ignore this email.
                </p>
              </div>
            </body>
          </html>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Test email sent:', info.messageId);
      return true;
    } catch (error) {
      console.error('Error sending test email:', error);
      return false;
    }
  }

  async send2FAEmail(recipientEmail: string, otpCode: string): Promise<boolean> {
    if (!this.transporter) {
      console.error('Email transporter not initialized');
      return false;
    }

    try {
      const mailOptions = {
        from: CONFIG.EMAIL.SENDER,
        to: recipientEmail,
        subject: 'ILex Pre-Onboarding Test - 2FA Code',
        html: `
          <html>
            <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
              <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
                <h2 style="color: #d96302;">ILex 2FA Timing Test</h2>
                <p>Hello,</p>
                <p>This is a Two-Factor Authentication test to measure email delivery timing.</p>
                <div style="background-color: #f0f0f0; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center;">
                  <p style="margin: 0; font-size: 14px;">Your One-Time Password:</p>
                  <p style="font-size: 32px; font-weight: bold; color: #d96302; letter-spacing: 5px; margin: 10px 0;">${otpCode}</p>
                  <p style="margin: 0; font-size: 12px; color: #666;">Valid for 5 minutes</p>
                </div>
                <p><strong>Important:</strong> Please note the time you received this email and enter the code promptly to measure delivery timing.</p>
                <p style="margin-top: 30px; font-size: 12px; color: #666;">
                  This is an automated test email from Institutional Lending Exchange.<br>
                  This code will expire in 5 minutes.
                </p>
              </div>
            </body>
          </html>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('2FA email sent:', info.messageId);
      return true;
    } catch (error) {
      console.error('Error sending 2FA email:', error);
      return false;
    }
  }

  isConfigured(): boolean {
    return this.transporter !== null;
  }
}

export const emailService = new EmailService();
