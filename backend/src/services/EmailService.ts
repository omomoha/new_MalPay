import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendVerificationEmail(email: string, token: string, firstName: string): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@malpay.com',
      to: email,
      subject: 'Verify Your MalPay Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1A2B4D;">Welcome to MalPay, ${firstName}!</h2>
          <p>Thank you for registering with MalPay. Please verify your email address to complete your account setup.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #1A2B4D; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email Address</a>
          </div>
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">If you didn't create an account with MalPay, please ignore this email.</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info('Verification email sent successfully', { email });
    } catch (error) {
      logger.error('Failed to send verification email:', error);
      throw error;
    }
  }

  async sendPasswordResetEmail(email: string, token: string, firstName: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@malpay.com',
      to: email,
      subject: 'Reset Your MalPay Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1A2B4D;">Password Reset Request</h2>
          <p>Hello ${firstName},</p>
          <p>We received a request to reset your password for your MalPay account.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #1A2B4D; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
          </div>
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
          <p><strong>If you didn't request this password reset, please ignore this email and your password will remain unchanged.</strong></p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">For security reasons, this link can only be used once.</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info('Password reset email sent successfully', { email });
    } catch (error) {
      logger.error('Failed to send password reset email:', error);
      throw error;
    }
  }

  async sendTransactionNotification(email: string, firstName: string, transaction: any): Promise<void> {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@malpay.com',
      to: email,
      subject: `Transaction ${transaction.status} - MalPay`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1A2B4D;">Transaction Update</h2>
          <p>Hello ${firstName},</p>
          <p>Your transaction has been ${transaction.status}.</p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Transaction Details</h3>
            <p><strong>Amount:</strong> ₦${transaction.amount.toLocaleString()}</p>
            <p><strong>Type:</strong> ${transaction.type}</p>
            <p><strong>Status:</strong> ${transaction.status}</p>
            <p><strong>Date:</strong> ${new Date(transaction.created_at).toLocaleString()}</p>
            ${transaction.description ? `<p><strong>Description:</strong> ${transaction.description}</p>` : ''}
          </div>
          <p>Thank you for using MalPay!</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info('Transaction notification email sent successfully', { email, transactionId: transaction.id });
    } catch (error) {
      logger.error('Failed to send transaction notification email:', error);
      throw error;
    }
  }

  async sendOTPEmail(email: string, otp: string, firstName: string): Promise<void> {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@malpay.com',
      to: email,
      subject: 'Your MalPay OTP Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1A2B4D;">OTP Verification</h2>
          <p>Hello ${firstName},</p>
          <p>Your OTP code for MalPay is:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="background-color: #1A2B4D; color: white; padding: 15px 30px; font-size: 24px; font-weight: bold; border-radius: 5px; display: inline-block; letter-spacing: 5px;">${otp}</span>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p><strong>Do not share this code with anyone.</strong></p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">If you didn't request this OTP, please contact our support team.</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info('OTP email sent successfully', { email });
    } catch (error) {
      logger.error('Failed to send OTP email:', error);
      throw error;
    }
  }
}
