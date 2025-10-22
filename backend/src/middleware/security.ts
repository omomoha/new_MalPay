
import { Request, Response, NextFunction } from 'express';
import { SecurityLogger } from '../utils/SecurityLogger';
import { InputSanitizer } from '../utils/InputSanitizer';

export const securityMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Log API access
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    SecurityLogger.logAPIAccess(req, res, responseTime);
  });
  
  // Sanitize request body
  if (req.body && typeof req.body === 'object') {
    req.body = InputSanitizer.sanitizeObject(req.body);
  }
  
  // Sanitize query parameters
  if (req.query && typeof req.query === 'object') {
    req.query = InputSanitizer.sanitizeObject(req.query);
  }
  
  // Sanitize URL parameters
  if (req.params && typeof req.params === 'object') {
    req.params = InputSanitizer.sanitizeObject(req.params);
  }
  
  next();
};

export const requestSizeLimiter = (maxSize: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.get('content-length') || '0');
    
    if (contentLength > maxSize) {
      SecurityLogger.logSecurityEvent('Request size exceeded', {
        contentLength,
        maxSize,
        ip: req.ip,
        url: req.url
      }, 'medium');
      
      return res.status(413).json({
        success: false,
        error: 'Request entity too large'
      });
    }
    
    next();
  };
};

export const suspiciousActivityDetector = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip;
  const userAgent = req.get('User-Agent') || '';
  const url = req.url;
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /..//g, // Directory traversal
    /<script/gi, // XSS attempts
    /unions+select/gi, // SQL injection
    /javascript:/gi, // JavaScript injection
    /evals*(/gi, // Code injection
    /document.cookie/gi, // Cookie theft attempts
  ];
  
  const requestString = JSON.stringify({
    url,
    body: req.body,
    query: req.query,
    params: req.params
  });
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(requestString)) {
      SecurityLogger.logSuspiciousActivity(
        (req as any).user?.id || 'anonymous',
        'Suspicious request pattern detected',
        {
          pattern: pattern.toString(),
          url,
          ip,
          userAgent
        },
        ip
      );
      
      return res.status(400).json({
        success: false,
        error: 'Invalid request'
      });
    }
  }
  
  next();
};
