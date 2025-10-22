import { Request, Response } from 'express';
import { logger } from '../utils/logger';

export interface SecurityEvent {
  type: 'AUTH_FAILURE' | 'RATE_LIMIT' | 'SUSPICIOUS_INPUT' | 'SQL_INJECTION' | 'XSS_ATTEMPT' | 'UNAUTHORIZED_ACCESS';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  userId?: string;
  ipAddress: string;
  userAgent?: string;
  endpoint: string;
  details: any;
  timestamp: Date;
}

export class SecurityMonitoringService {
  private static securityEvents: SecurityEvent[] = [];
  private static readonly MAX_EVENTS = 10000;

  /**
   * Log a security event
   */
  static logSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>): void {
    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: new Date()
    };

    this.securityEvents.push(securityEvent);

    // Keep only the most recent events
    if (this.securityEvents.length > this.MAX_EVENTS) {
      this.securityEvents = this.securityEvents.slice(-this.MAX_EVENTS);
    }

    // Log to console/file based on severity
    const logMessage = `SECURITY EVENT [${event.severity}] ${event.type}: ${JSON.stringify(event.details)}`;
    
    switch (event.severity) {
      case 'CRITICAL':
        logger.error(logMessage);
        break;
      case 'HIGH':
        logger.warn(logMessage);
        break;
      case 'MEDIUM':
        logger.info(logMessage);
        break;
      case 'LOW':
        logger.debug(logMessage);
        break;
    }

    // In production, send to external monitoring service
    this.sendToExternalMonitoring(securityEvent);
  }

  /**
   * Log authentication failure
   */
  static logAuthFailure(req: Request, email: string, reason: string): void {
    this.logSecurityEvent({
      type: 'AUTH_FAILURE',
      severity: 'MEDIUM',
      ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent'),
      endpoint: req.path,
      details: { email, reason }
    });
  }

  /**
   * Log rate limit exceeded
   */
  static logRateLimit(req: Request): void {
    this.logSecurityEvent({
      type: 'RATE_LIMIT',
      severity: 'LOW',
      ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent'),
      endpoint: req.path,
      details: { message: 'Rate limit exceeded' }
    });
  }

  /**
   * Log suspicious input
   */
  static logSuspiciousInput(req: Request, input: any, reason: string): void {
    this.logSecurityEvent({
      type: 'SUSPICIOUS_INPUT',
      severity: 'HIGH',
      ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent'),
      endpoint: req.path,
      details: { input: JSON.stringify(input), reason }
    });
  }

  /**
   * Log SQL injection attempt
   */
  static logSQLInjection(req: Request, query: string): void {
    this.logSecurityEvent({
      type: 'SQL_INJECTION',
      severity: 'CRITICAL',
      ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent'),
      endpoint: req.path,
      details: { query }
    });
  }

  /**
   * Log XSS attempt
   */
  static logXSSAttempt(req: Request, input: string): void {
    this.logSecurityEvent({
      type: 'XSS_ATTEMPT',
      severity: 'HIGH',
      ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent'),
      endpoint: req.path,
      details: { input }
    });
  }

  /**
   * Log unauthorized access attempt
   */
  static logUnauthorizedAccess(req: Request, userId?: string): void {
    this.logSecurityEvent({
      type: 'UNAUTHORIZED_ACCESS',
      severity: 'HIGH',
      userId,
      ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent'),
      endpoint: req.path,
      details: { message: 'Unauthorized access attempt' }
    });
  }

  /**
   * Get security events
   */
  static getSecurityEvents(limit: number = 100): SecurityEvent[] {
    return this.securityEvents.slice(-limit);
  }

  /**
   * Get security events by severity
   */
  static getSecurityEventsBySeverity(severity: SecurityEvent['severity']): SecurityEvent[] {
    return this.securityEvents.filter(event => event.severity === severity);
  }

  /**
   * Get security events by IP address
   */
  static getSecurityEventsByIP(ipAddress: string): SecurityEvent[] {
    return this.securityEvents.filter(event => event.ipAddress === ipAddress);
  }

  /**
   * Check if IP address is suspicious
   */
  static isSuspiciousIP(ipAddress: string): boolean {
    const events = this.getSecurityEventsByIP(ipAddress);
    const recentEvents = events.filter(event => 
      Date.now() - event.timestamp.getTime() < 24 * 60 * 60 * 1000 // Last 24 hours
    );

    // Consider IP suspicious if it has more than 10 security events in 24 hours
    return recentEvents.length > 10;
  }

  /**
   * Get security statistics
   */
  static getSecurityStats(): {
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsBySeverity: Record<string, number>;
    suspiciousIPs: string[];
  } {
    const eventsByType: Record<string, number> = {};
    const eventsBySeverity: Record<string, number> = {};
    const suspiciousIPs: string[] = [];

    this.securityEvents.forEach(event => {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
      eventsBySeverity[event.severity] = (eventsBySeverity[event.severity] || 0) + 1;
    });

    // Find suspicious IPs
    const ipCounts: Record<string, number> = {};
    this.securityEvents.forEach(event => {
      ipCounts[event.ipAddress] = (ipCounts[event.ipAddress] || 0) + 1;
    });

    Object.entries(ipCounts).forEach(([ip, count]) => {
      if (count > 10) {
        suspiciousIPs.push(ip);
      }
    });

    return {
      totalEvents: this.securityEvents.length,
      eventsByType,
      eventsBySeverity,
      suspiciousIPs
    };
  }

  /**
   * Send to external monitoring service (placeholder)
   */
  private static sendToExternalMonitoring(event: SecurityEvent): void {
    // In production, integrate with services like:
    // - Datadog
    // - New Relic
    // - AWS CloudWatch
    // - Sentry
    // - Custom SIEM system

    if (event.severity === 'CRITICAL') {
      // Send immediate alert for critical events
      console.log(`🚨 CRITICAL SECURITY EVENT: ${event.type} from ${event.ipAddress}`);
      
      // In production, send SMS/email alerts to security team
      // await sendSecurityAlert(event);
    }
  }

  /**
   * Clear old security events
   */
  static clearOldEvents(olderThanDays: number = 30): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    this.securityEvents = this.securityEvents.filter(event => 
      event.timestamp > cutoffDate
    );
  }
}
