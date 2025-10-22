
import DOMPurify from 'isomorphic-dompurify';
import validator from 'validator';

export class InputSanitizer {
  static sanitizeString(input: string): string {
    if (typeof input !== 'string') {
      return '';
    }
    
    // Remove potentially dangerous characters
    let sanitized = input
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/onw+=/gi, '') // Remove event handlers
      .trim();
    
    // Use DOMPurify for additional sanitization
    sanitized = DOMPurify.sanitize(sanitized, { 
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: []
    });
    
    return sanitized;
  }

  static sanitizeEmail(email: string): string {
    const sanitized = this.sanitizeString(email);
    return validator.isEmail(sanitized) ? sanitized : '';
  }

  static sanitizePhoneNumber(phone: string): string {
    const sanitized = this.sanitizeString(phone);
    return validator.isMobilePhone(sanitized) ? sanitized : '';
  }

  static sanitizeNumericString(input: string): string {
    if (typeof input !== 'string') {
      return '';
    }
    
    // Remove all non-numeric characters
    return input.replace(/[^0-9]/g, '');
  }

  static sanitizeCardNumber(cardNumber: string): string {
    const sanitized = this.sanitizeNumericString(cardNumber);
    
    // Validate card number length (13-19 digits)
    if (sanitized.length < 13 || sanitized.length > 19) {
      return '';
    }
    
    return sanitized;
  }

  static sanitizeAmount(amount: string): number {
    const sanitized = this.sanitizeString(amount);
    const numericAmount = parseFloat(sanitized);
    
    // Validate amount is positive and reasonable
    if (isNaN(numericAmount) || numericAmount < 0 || numericAmount > 1000000) {
      return 0;
    }
    
    return Math.round(numericAmount * 100) / 100; // Round to 2 decimal places
  }

  static sanitizeObject(obj: any): any {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }
    
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const sanitizedKey = this.sanitizeString(key);
      if (typeof value === 'string') {
        sanitized[sanitizedKey] = this.sanitizeString(value);
      } else if (typeof value === 'object') {
        sanitized[sanitizedKey] = this.sanitizeObject(value);
      } else {
        sanitized[sanitizedKey] = value;
      }
    }
    
    return sanitized;
  }

  static validateAndSanitizeInput(input: any, rules: {
    type: 'string' | 'email' | 'phone' | 'cardNumber' | 'amount' | 'numeric';
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
  }): { isValid: boolean; sanitized: any; error?: string } {
    try {
      let sanitized: any;
      
      switch (rules.type) {
        case 'string':
          sanitized = this.sanitizeString(input);
          break;
        case 'email':
          sanitized = this.sanitizeEmail(input);
          break;
        case 'phone':
          sanitized = this.sanitizePhoneNumber(input);
          break;
        case 'cardNumber':
          sanitized = this.sanitizeCardNumber(input);
          break;
        case 'amount':
          sanitized = this.sanitizeAmount(input);
          break;
        case 'numeric':
          sanitized = this.sanitizeNumericString(input);
          break;
        default:
          return { isValid: false, sanitized: null, error: 'Invalid input type' };
      }
      
      // Check required
      if (rules.required && (!sanitized || sanitized === '')) {
        return { isValid: false, sanitized: null, error: 'Field is required' };
      }
      
      // Check length
      if (rules.minLength && sanitized.length < rules.minLength) {
        return { isValid: false, sanitized: null, error: `Minimum length is ${rules.minLength}` };
      }
      
      if (rules.maxLength && sanitized.length > rules.maxLength) {
        return { isValid: false, sanitized: null, error: `Maximum length is ${rules.maxLength}` };
      }
      
      // Check pattern
      if (rules.pattern && !rules.pattern.test(sanitized)) {
        return { isValid: false, sanitized: null, error: 'Invalid format' };
      }
      
      return { isValid: true, sanitized };
    } catch (error) {
      return { isValid: false, sanitized: null, error: 'Input validation failed' };
    }
  }
}
