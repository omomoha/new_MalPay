import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin';

interface AdminAuthRequest extends Request {
  admin?: {
    adminId: string;
    email: string;
    role: string;
    permissions: string[];
  };
}

export const adminAuthMiddleware = (requiredPermissions: string[] = []) => {
  return async (req: AdminAuthRequest, res: Response, next: NextFunction) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');

      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Access denied. No token provided.',
        });
      }

      const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
      const decoded = jwt.verify(token, JWT_SECRET) as any;

      // Check if admin exists and is active
      const admin = await Admin.findByPk(decoded.adminId);
      
      if (!admin || !admin.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Access denied. Invalid or inactive admin account.',
        });
      }

      // Check if admin has required permissions
      if (requiredPermissions.length > 0) {
        const hasPermission = requiredPermissions.every(permission =>
          admin.permissions.includes(permission)
        );

        if (!hasPermission) {
          return res.status(403).json({
            success: false,
            message: 'Access denied. Insufficient permissions.',
          });
        }
      }

      // Add admin info to request
      req.admin = {
        adminId: admin.id,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
      };

      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Access denied. Invalid token.',
      });
    }
  };
};

export default adminAuthMiddleware;
