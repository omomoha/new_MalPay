import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { query, transaction } from '../config/database';
import { redisHelpers } from '../config/redis';
import { logger } from '../utils/logger';
import { CustomError, handleDatabaseError } from '../middleware/errorHandler';
import { EmailService } from '../services/EmailService';
import { TwoFactorService } from '../services/TwoFactorService';

export class AuthController {
  private emailService: EmailService;
  private twoFactorService: TwoFactorService;

  constructor() {
    this.emailService = new EmailService();
    this.twoFactorService = new TwoFactorService();
  }

  // Register new user
  register = async (req: Request, res: Response): Promise<void> => {
    const { name, email, phoneNumber, password, confirmPassword } = req.body;

    try {
      // Validate password confirmation
      if (password !== confirmPassword) {
        throw new CustomError('Passwords do not match', 400);
      }

      // Check if user already exists
      const existingUser = await query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        throw new CustomError('User with this email already exists', 409);
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Generate email verification token
      const emailVerificationToken = uuidv4();
      const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Create user in transaction
      const result = await transaction(async (client) => {
        // Insert user
        const userResult = await client.query(
          `INSERT INTO users (id, email, password_hash, first_name, phone_number, email_verification_token, email_verification_expires, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
           RETURNING id, email, first_name, phone_number, is_email_verified, created_at`,
          [uuidv4(), email, hashedPassword, name, phoneNumber, emailVerificationToken, emailVerificationExpires]
        );

        const user = userResult.rows[0];

        // Create user profile
        await client.query(
          `INSERT INTO user_profiles (user_id, created_at, updated_at)
           VALUES ($1, NOW(), NOW())`,
          [user.id]
        );

        return user;
      });

      // Send verification email
      await this.emailService.sendVerificationEmail(email, emailVerificationToken, name);

      logger.info('User registered successfully', { userId: result.id, email });

      res.status(201).json({
        success: true,
        message: 'User registered successfully. Please check your email to verify your account.',
        user: {
          id: result.id,
          email: result.email,
          name: result.first_name,
          phoneNumber: result.phone_number,
          isEmailVerified: result.is_email_verified,
          createdAt: result.created_at,
        },
        requiresEmailVerification: true,
      });
    } catch (error) {
      logger.error('Registration error:', error);
      throw handleDatabaseError(error);
    }
  };

  // Login user
  login = async (req: Request, res: Response): Promise<void> => {
    const { email, password, rememberMe = false } = req.body;

    try {
      // Find user
      const userResult = await query(
        `SELECT id, email, password_hash, first_name, last_name, phone_number, date_of_birth, is_email_verified, is_phone_verified, is_2fa_enabled, is_active, created_at
         FROM users WHERE email = $1`,
        [email]
      );

      if (userResult.rows.length === 0) {
        throw new CustomError('Invalid email or password', 401);
      }

      const user = userResult.rows[0];

      // Check if user is active
      if (!user.is_active) {
        throw new CustomError('Account is deactivated. Please contact support.', 401);
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        throw new CustomError('Invalid email or password', 401);
      }

      // Check if email is verified
      if (!user.is_email_verified) {
        throw new CustomError('Please verify your email address before logging in', 401);
      }

      // Check profile completion status
      const profileStatus = await this.checkProfileCompletion(user.id);

      // Generate JWT tokens
      const tokens = this.generateTokens(user.id, user.email);

      // Store refresh token in Redis
      const refreshTokenExpiry = rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60; // 30 days or 7 days
      await redisHelpers.setex(`refresh_token:${user.id}`, refreshTokenExpiry, tokens.refreshToken);

      // Update last login
      await query(
        'UPDATE users SET last_login = NOW(), updated_at = NOW() WHERE id = $1',
        [user.id]
      );

      logger.info('User logged in successfully', { userId: user.id, email });

      res.json({
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          name: user.first_name,
          phoneNumber: user.phone_number,
          isEmailVerified: user.is_email_verified,
          isPhoneVerified: user.is_phone_verified,
          is2FAEnabled: user.is_2fa_enabled,
          createdAt: user.created_at,
        },
        profileStatus,
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn,
        },
      });
    } catch (error) {
      logger.error('Login error:', error);
      throw handleDatabaseError(error);
    }
  };

  // Logout user
  logout = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;

    try {
      // Remove refresh token from Redis
      await redisHelpers.del(`refresh_token:${userId}`);

      logger.info('User logged out successfully', { userId });

      res.json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      logger.error('Logout error:', error);
      throw error;
    }
  };

  // Refresh access token
  refreshToken = async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new CustomError('Refresh token is required', 400);
    }

    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;

      // Check if refresh token exists in Redis
      const storedToken = await redisHelpers.get(`refresh_token:${decoded.userId}`);
      if (!storedToken || storedToken !== refreshToken) {
        throw new CustomError('Invalid refresh token', 401);
      }

      // Generate new access token
      const newAccessToken = jwt.sign(
        { userId: decoded.userId, email: decoded.email },
        process.env.JWT_SECRET!,
        { expiresIn: '15m' }
      );

      res.json({
        success: true,
        accessToken: newAccessToken,
        expiresIn: 15 * 60, // 15 minutes
      });
    } catch (error) {
      logger.error('Token refresh error:', error);
      throw new CustomError('Invalid refresh token', 401);
    }
  };

  // Forgot password
  forgotPassword = async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;

    try {
      // Find user
      const userResult = await query(
        'SELECT id, email, first_name FROM users WHERE email = $1',
        [email]
      );

      if (userResult.rows.length === 0) {
        // Don't reveal if user exists or not
        res.json({
          success: true,
          message: 'If an account with that email exists, a password reset link has been sent.',
        });
        return;
      }

      const user = userResult.rows[0];

      // Generate reset token
      const resetToken = uuidv4();
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Store reset token
      await query(
        'UPDATE users SET password_reset_token = $1, password_reset_expires = $2, updated_at = NOW() WHERE id = $3',
        [resetToken, resetExpires, user.id]
      );

      // Send reset email
      await this.emailService.sendPasswordResetEmail(email, resetToken, user.first_name);

      logger.info('Password reset email sent', { userId: user.id, email });

      res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    } catch (error) {
      logger.error('Forgot password error:', error);
      throw handleDatabaseError(error);
    }
  };

  // Reset password
  resetPassword = async (req: Request, res: Response): Promise<void> => {
    const { token, password } = req.body;

    try {
      // Find user with valid reset token
      const userResult = await query(
        'SELECT id FROM users WHERE password_reset_token = $1 AND password_reset_expires > NOW()',
        [token]
      );

      if (userResult.rows.length === 0) {
        throw new CustomError('Invalid or expired reset token', 400);
      }

      const user = userResult.rows[0];

      // Hash new password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Update password and clear reset token
      await query(
        'UPDATE users SET password_hash = $1, password_reset_token = NULL, password_reset_expires = NULL, updated_at = NOW() WHERE id = $2',
        [hashedPassword, user.id]
      );

      // Invalidate all refresh tokens
      await redisHelpers.del(`refresh_token:${user.id}`);

      logger.info('Password reset successfully', { userId: user.id });

      res.json({
        success: true,
        message: 'Password reset successfully. Please log in with your new password.',
      });
    } catch (error) {
      logger.error('Reset password error:', error);
      throw handleDatabaseError(error);
    }
  };

  // Verify email
  verifyEmail = async (req: Request, res: Response): Promise<void> => {
    const { token } = req.body;

    try {
      // Find user with valid verification token
      const userResult = await query(
        'SELECT id, email FROM users WHERE email_verification_token = $1 AND email_verification_expires > NOW()',
        [token]
      );

      if (userResult.rows.length === 0) {
        throw new CustomError('Invalid or expired verification token', 400);
      }

      const user = userResult.rows[0];

      // Update user as verified
      await query(
        'UPDATE users SET is_email_verified = true, email_verification_token = NULL, email_verification_expires = NULL, updated_at = NOW() WHERE id = $1',
        [user.id]
      );

      logger.info('Email verified successfully', { userId: user.id, email: user.email });

      res.json({
        success: true,
        message: 'Email verified successfully. You can now log in.',
      });
    } catch (error) {
      logger.error('Email verification error:', error);
      throw handleDatabaseError(error);
    }
  };

  // Resend verification email
  resendVerification = async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;

    try {
      // Find user
      const userResult = await query(
        'SELECT id, email, first_name, is_email_verified FROM users WHERE email = $1',
        [email]
      );

      if (userResult.rows.length === 0) {
        throw new CustomError('User not found', 404);
      }

      const user = userResult.rows[0];

      if (user.is_email_verified) {
        throw new CustomError('Email is already verified', 400);
      }

      // Generate new verification token
      const emailVerificationToken = uuidv4();
      const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Update verification token
      await query(
        'UPDATE users SET email_verification_token = $1, email_verification_expires = $2, updated_at = NOW() WHERE id = $3',
        [emailVerificationToken, emailVerificationExpires, user.id]
      );

      // Send verification email
      await this.emailService.sendVerificationEmail(email, emailVerificationToken, user.first_name);

      logger.info('Verification email resent', { userId: user.id, email });

      res.json({
        success: true,
        message: 'Verification email sent successfully.',
      });
    } catch (error) {
      logger.error('Resend verification error:', error);
      throw handleDatabaseError(error);
    }
  };

  // Change password
  changePassword = async (req: Request, res: Response): Promise<void> => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.id;

    try {
      // Get current password hash
      const userResult = await query(
        'SELECT password_hash FROM users WHERE id = $1',
        [userId]
      );

      if (userResult.rows.length === 0) {
        throw new CustomError('User not found', 404);
      }

      const user = userResult.rows[0];

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isCurrentPasswordValid) {
        throw new CustomError('Current password is incorrect', 400);
      }

      // Hash new password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await query(
        'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
        [hashedPassword, userId]
      );

      // Invalidate all refresh tokens
      await redisHelpers.del(`refresh_token:${userId}`);

      logger.info('Password changed successfully', { userId });

      res.json({
        success: true,
        message: 'Password changed successfully. Please log in again.',
      });
    } catch (error) {
      logger.error('Change password error:', error);
      throw handleDatabaseError(error);
    }
  };

  // Enable 2FA
  enable2FA = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;

    try {
      // Generate 2FA secret
      const secret = this.twoFactorService.generateSecret();

      // Store secret temporarily
      await redisHelpers.setex(`2fa_secret:${userId}`, 300, secret); // 5 minutes

      // Generate QR code
      const qrCodeUrl = this.twoFactorService.generateQRCode(secret, req.user?.email);

      res.json({
        success: true,
        message: '2FA setup initiated. Please scan the QR code with your authenticator app.',
        secret,
        qrCodeUrl,
      });
    } catch (error) {
      logger.error('Enable 2FA error:', error);
      throw error;
    }
  };

  // Verify 2FA
  verify2FA = async (req: Request, res: Response): Promise<void> => {
    const { code } = req.body;
    const userId = req.user?.id;

    try {
      // Get stored secret
      const secret = await redisHelpers.get(`2fa_secret:${userId}`);
      if (!secret) {
        throw new CustomError('2FA setup session expired. Please try again.', 400);
      }

      // Verify code
      const isValid = this.twoFactorService.verifyToken(secret, code);
      if (!isValid) {
        throw new CustomError('Invalid 2FA code', 400);
      }

      // Enable 2FA for user
      await query(
        'UPDATE users SET is_2fa_enabled = true, updated_at = NOW() WHERE id = $1',
        [userId]
      );

      // Clear stored secret
      await redisHelpers.del(`2fa_secret:${userId}`);

      logger.info('2FA enabled successfully', { userId });

      res.json({
        success: true,
        message: '2FA enabled successfully.',
      });
    } catch (error) {
      logger.error('Verify 2FA error:', error);
      throw handleDatabaseError(error);
    }
  };

  // Disable 2FA
  disable2FA = async (req: Request, res: Response): Promise<void> => {
    const { code } = req.body;
    const userId = req.user?.id;

    try {
      // Get user's 2FA secret (you'd need to store this securely)
      // For now, we'll skip the verification step
      
      // Disable 2FA for user
      await query(
        'UPDATE users SET is_2fa_enabled = false, updated_at = NOW() WHERE id = $1',
        [userId]
      );

      logger.info('2FA disabled successfully', { userId });

      res.json({
        success: true,
        message: '2FA disabled successfully.',
      });
    } catch (error) {
      logger.error('Disable 2FA error:', error);
      throw handleDatabaseError(error);
    }
  };

  // Get user profile
  getProfile = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;

    try {
      const userResult = await query(
        `SELECT id, email, first_name, last_name, phone_number, date_of_birth, is_email_verified, is_phone_verified, is_2fa_enabled, created_at, updated_at
         FROM users WHERE id = $1`,
        [userId]
      );

      if (userResult.rows.length === 0) {
        throw new CustomError('User not found', 404);
      }

      const user = userResult.rows[0];

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          phoneNumber: user.phone_number,
          dateOfBirth: user.date_of_birth,
          isEmailVerified: user.is_email_verified,
          isPhoneVerified: user.is_phone_verified,
          is2FAEnabled: user.is_2fa_enabled,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
        },
      });
    } catch (error) {
      logger.error('Get profile error:', error);
      throw handleDatabaseError(error);
    }
  };

  // Update user profile
  updateProfile = async (req: Request, res: Response): Promise<void> => {
    const { firstName, lastName, phoneNumber, dateOfBirth } = req.body;
    const userId = req.user?.id;

    try {
      const result = await query(
        `UPDATE users 
         SET first_name = COALESCE($1, first_name),
             last_name = COALESCE($2, last_name),
             phone_number = COALESCE($3, phone_number),
             date_of_birth = COALESCE($4, date_of_birth),
             updated_at = NOW()
         WHERE id = $5
         RETURNING id, email, first_name, last_name, phone_number, date_of_birth, is_email_verified, is_phone_verified, is_2fa_enabled, created_at, updated_at`,
        [firstName, lastName, phoneNumber, dateOfBirth, userId]
      );

      if (result.rows.length === 0) {
        throw new CustomError('User not found', 404);
      }

      const user = result.rows[0];

      logger.info('Profile updated successfully', { userId });

      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          phoneNumber: user.phone_number,
          dateOfBirth: user.date_of_birth,
          isEmailVerified: user.is_email_verified,
          isPhoneVerified: user.is_phone_verified,
          is2FAEnabled: user.is_2fa_enabled,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
        },
      });
    } catch (error) {
      logger.error('Update profile error:', error);
      throw handleDatabaseError(error);
    }
  };

  // Check profile completion status
  private async checkProfileCompletion(userId: string): Promise<{
    isComplete: boolean;
    hasBankAccount: boolean;
    hasCards: boolean;
    cardCount: number;
    maxCards: number;
    missingSteps: string[];
  }> {
    try {
      // Check bank accounts
      const bankAccountsResult = await query(
        'SELECT COUNT(*) as count FROM bank_accounts WHERE user_id = $1 AND is_verified = true',
        [userId]
      );
      const hasBankAccount = parseInt(bankAccountsResult.rows[0].count) > 0;

      // Check cards
      const cardsResult = await query(
        'SELECT COUNT(*) as count FROM linked_cards WHERE user_id = $1 AND is_active = true',
        [userId]
      );
      const cardCount = parseInt(cardsResult.rows[0].count);
      const hasCards = cardCount > 0;
      const maxCards = 3;

      const missingSteps: string[] = [];
      if (!hasBankAccount) {
        missingSteps.push('Link a bank account');
      }
      if (!hasCards) {
        missingSteps.push('Add at least one card');
      }

      const isComplete = hasBankAccount && hasCards;

      return {
        isComplete,
        hasBankAccount,
        hasCards,
        cardCount,
        maxCards,
        missingSteps,
      };
    } catch (error) {
      logger.error('Profile completion check error:', error);
      return {
        isComplete: false,
        hasBankAccount: false,
        hasCards: false,
        cardCount: 0,
        maxCards: 3,
        missingSteps: ['Link a bank account', 'Add at least one card'],
      };
    }
  }

  // Get profile completion status
  getProfileCompletion = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;

    try {
      const profileStatus = await this.checkProfileCompletion(userId!);

      res.json({
        success: true,
        profileStatus,
      });
    } catch (error) {
      logger.error('Get profile completion error:', error);
      throw handleDatabaseError(error);
    }
  };

  // Generate JWT tokens
  private generateTokens(userId: string, email: string) {
    const accessToken = jwt.sign(
      { userId, email },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId, email },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' }
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15 minutes
    };
  }
}
