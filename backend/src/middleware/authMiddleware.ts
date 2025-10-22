import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { redisHelpers } from '../config/redis';
import { logger } from '../utils/logger';
import { CustomError } from './errorHandler';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new CustomError('Access token is required', 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // Check if user exists and is active
    const { query } = await import('../config/database');
    const userResult = await query(
      'SELECT id, email, is_active FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      throw new CustomError('User not found', 401);
    }

    const user = userResult.rows[0];

    if (!user.is_active) {
      throw new CustomError('Account is deactivated', 401);
    }

    // Add user to request
    req.user = {
      id: user.id,
      email: user.email,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new CustomError('Invalid token', 401));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new CustomError('Token expired', 401));
    } else {
      next(error);
    }
  }
};

export const adminAuthMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // First check if user is authenticated
    await authMiddleware(req, res, () => {});

    if (!req.user) {
      throw new CustomError('Authentication required', 401);
    }

    // Check if user is admin
    const { query } = await import('../config/database');
    const adminResult = await query(
      'SELECT id FROM admins WHERE user_id = $1 AND is_active = true',
      [req.user.id]
    );

    if (adminResult.rows.length === 0) {
      throw new CustomError('Admin access required', 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const optionalAuthMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without user
      next();
      return;
    }

    const token = authHeader.substring(7);

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

      // Check if user exists and is active
      const { query } = await import('../config/database');
      const userResult = await query(
        'SELECT id, email, is_active FROM users WHERE id = $1',
        [decoded.userId]
      );

      if (userResult.rows.length > 0 && userResult.rows[0].is_active) {
        req.user = {
          id: userResult.rows[0].id,
          email: userResult.rows[0].email,
        };
      }
    } catch (tokenError) {
      // Token is invalid, but we continue without user
      logger.warn('Invalid token in optional auth middleware:', tokenError);
    }

    next();
  } catch (error) {
    next(error);
  }
};
