import { Request, Response, NextFunction } from 'express';
import validator from 'validator';
import xss from 'xss';

export interface SanitizedRequest extends Request {
  sanitizedBody?: any;
}

export class InputSanitizationService {
  /**
   * Sanitize string input to prevent XSS attacks
   */
  static sanitizeString(input: string): string {
    if (typeof input !== 'string') return input;
    
    // Remove HTML tags and encode special characters
    return xss(validator.escape(input.trim()));
  }

  /**
   * Sanitize email input
   */
  static sanitizeEmail(email: string): string {
    if (typeof email !== 'string') return email;
    
    const sanitized = email.toLowerCase().trim();
    return validator.isEmail(sanitized) ? sanitized : '';
  }

  /**
   * Sanitize phone number input
   */
  static sanitizePhoneNumber(phone: string): string {
    if (typeof phone !== 'string') return phone;
    
    // Remove all non-digit characters except +
    const sanitized = phone.replace(/[^\d+]/g, '');
    return validator.isMobilePhone(sanitized) ? sanitized : '';
  }

  /**
   * Sanitize numeric input
   */
  static sanitizeNumber(input: any): number {
    const num = parseFloat(input);
    return isNaN(num) ? 0 : Math.abs(num);
  }

  /**
   * Sanitize card number input
   */
  static sanitizeCardNumber(cardNumber: string): string {
    if (typeof cardNumber !== 'string') return cardNumber;
    
    // Remove all non-digit characters
    const sanitized = cardNumber.replace(/\D/g, '');
    
    // Validate length (13-19 digits)
    if (sanitized.length < 13 || sanitized.length > 19) {
      return '';
    }
    
    return sanitized;
  }

  /**
   * Sanitize CVV input
   */
  static sanitizeCVV(cvv: string): string {
    if (typeof cvv !== 'string') return cvv;
    
    // Remove all non-digit characters
    const sanitized = cvv.replace(/\D/g, '');
    
    // Validate length (3-4 digits)
    if (sanitized.length < 3 || sanitized.length > 4) {
      return '';
    }
    
    return sanitized;
  }

  /**
   * Sanitize object recursively
   */
  static sanitizeObject(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    
    if (typeof obj === 'string') {
      return this.sanitizeString(obj);
    }
    
    if (typeof obj === 'number') {
      return this.sanitizeNumber(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }
    
    if (typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitized[key] = this.sanitizeObject(obj[key]);
        }
      }
      return sanitized;
    }
    
    return obj;
  }

  /**
   * Validate and sanitize request body
   */
  static sanitizeRequestBody(req: SanitizedRequest, res: Response, next: NextFunction): void {
    try {
      if (req.body) {
        req.sanitizedBody = this.sanitizeObject(req.body);
        
        // Special handling for specific fields
        if (req.sanitizedBody.email) {
          req.sanitizedBody.email = this.sanitizeEmail(req.sanitizedBody.email);
        }
        
        if (req.sanitizedBody.phoneNumber) {
          req.sanitizedBody.phoneNumber = this.sanitizePhoneNumber(req.sanitizedBody.phoneNumber);
        }
        
        if (req.sanitizedBody.cardNumber) {
          req.sanitizedBody.cardNumber = this.sanitizeCardNumber(req.sanitizedBody.cardNumber);
        }
        
        if (req.sanitizedBody.cvv) {
          req.sanitizedBody.cvv = this.sanitizeCVV(req.sanitizedBody.cvv);
        }
        
        if (req.sanitizedBody.amount) {
          req.sanitizedBody.amount = this.sanitizeNumber(req.sanitizedBody.amount);
        }
      }
      
      next();
    } catch (error) {
      res.status(400).json({
        success: false,
        error: { message: 'Invalid input data' }
      });
    }
  }

  /**
   * Validate input against common attack patterns
   */
  static validateInput(input: string): boolean {
    if (typeof input !== 'string') return true;
    
    // Check for SQL injection patterns
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
      /(;|\-\-|\/\*|\*\/)/,
      /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
      /(\b(OR|AND)\s+['"]\s*=\s*['"])/i
    ];
    
    // Check for XSS patterns
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<img[^>]*src[^>]*>/gi
    ];
    
    // Check for command injection patterns
    const commandPatterns = [
      /[;&|`$()]/,
      /\b(cat|ls|pwd|whoami|id|uname)\b/i
    ];
    
    const allPatterns = [...sqlPatterns, ...xssPatterns, ...commandPatterns];
    
    return !allPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Rate limiting for sensitive operations
   */
  static createRateLimit(windowMs: number, max: number) {
    return {
      windowMs,
      max,
      message: {
        success: false,
        error: { message: 'Too many requests, please try again later' }
      },
      standardHeaders: true,
      legacyHeaders: false
    };
  }
}
