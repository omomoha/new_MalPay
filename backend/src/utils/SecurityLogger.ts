
import winston from 'winston';
import { Request, Response } from 'express';

export class SecurityLogger {
  private static logger: winston.Logger;

  static initialize() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'malpay-security' },
      transports: [
        new winston.transports.File({ filename: 'logs/security-error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/security-combined.log' }),
        new winston.transports.Console({
          format: winston.format.simple()
        })
      ]
    });
  }

  static logAuthAttempt(userId: string, email: string, success: boolean, ip: string, userAgent: string) {
    this.logger.info('Authentication attempt', {
      userId,
      email,
      success,
      ip,
      userAgent,
      timestamp: new Date().toISOString(),
      type: 'AUTH_ATTEMPT'
    });
  }

  static logSuspiciousActivity(userId: string, activity: string, details: any, ip: string) {
    this.logger.warn('Suspicious activity detected', {
      userId,
      activity,
      details,
      ip,
      timestamp: new Date().toISOString(),
      type: 'SUSPICIOUS_ACTIVITY'
    });
  }

  static logDataAccess(userId: string, resource: string, action: string, ip: string) {
    this.logger.info('Data access', {
      userId,
      resource,
      action,
      ip,
      timestamp: new Date().toISOString(),
      type: 'DATA_ACCESS'
    });
  }

  static logSecurityEvent(event: string, details: any, severity: 'low' | 'medium' | 'high' | 'critical') {
    const logLevel = severity === 'critical' ? 'error' : 
                    severity === 'high' ? 'warn' : 'info';
    
    this.logger.log(logLevel, 'Security event', {
      event,
      details,
      severity,
      timestamp: new Date().toISOString(),
      type: 'SECURITY_EVENT'
    });
  }

  static logAPIAccess(req: Request, res: Response, responseTime: number) {
    this.logger.info('API access', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: (req as any).user?.id,
      timestamp: new Date().toISOString(),
      type: 'API_ACCESS'
    });
  }

  static logError(error: Error, context: any) {
    this.logger.error('Application error', {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      type: 'ERROR'
    });
  }
}

// Initialize logger
SecurityLogger.initialize();
