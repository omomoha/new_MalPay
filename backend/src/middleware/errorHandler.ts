import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

// Custom error class
export class CustomError extends Error implements AppError {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handler middleware
export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let { statusCode = 500, message } = error;

  // Log error
  logger.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  } else if (error.name === 'MulterError') {
    statusCode = 400;
    message = 'File upload error';
  } else if (error.code === '23505') { // PostgreSQL unique violation
    statusCode = 409;
    message = 'Resource already exists';
  } else if (error.code === '23503') { // PostgreSQL foreign key violation
    statusCode = 400;
    message = 'Referenced resource does not exist';
  } else if (error.code === '23502') { // PostgreSQL not null violation
    statusCode = 400;
    message = 'Required field is missing';
  }

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production' && !error.isOperational) {
    message = 'Something went wrong';
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code: error.name || 'INTERNAL_ERROR',
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    },
    timestamp: new Date().toISOString(),
  });
};

// Not found handler
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new CustomError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Validation error handler
export const handleValidationError = (errors: any[]) => {
  const errorMessages = errors.map(error => ({
    field: error.path,
    message: error.msg,
    value: error.value,
  }));

  return new CustomError('Validation failed', 400, true);
};

// Database error handler
export const handleDatabaseError = (error: any) => {
  if (error.code === '23505') {
    return new CustomError('Resource already exists', 409);
  } else if (error.code === '23503') {
    return new CustomError('Referenced resource does not exist', 400);
  } else if (error.code === '23502') {
    return new CustomError('Required field is missing', 400);
  } else if (error.code === '42P01') {
    return new CustomError('Table does not exist', 500);
  } else if (error.code === '42703') {
    return new CustomError('Column does not exist', 500);
  }
  
  return new CustomError('Database error', 500);
};

// Rate limit error handler
export const handleRateLimitError = () => {
  return new CustomError('Too many requests, please try again later', 429);
};

// Authentication error handler
export const handleAuthError = (message: string = 'Authentication failed') => {
  return new CustomError(message, 401);
};

// Authorization error handler
export const handleAuthorizationError = (message: string = 'Access denied') => {
  return new CustomError(message, 403);
};

// Not found error handler
export const handleNotFoundError = (resource: string = 'Resource') => {
  return new CustomError(`${resource} not found`, 404);
};

// Conflict error handler
export const handleConflictError = (message: string = 'Resource conflict') => {
  return new CustomError(message, 409);
};

// Bad request error handler
export const handleBadRequestError = (message: string = 'Bad request') => {
  return new CustomError(message, 400);
};

// Internal server error handler
export const handleInternalError = (message: string = 'Internal server error') => {
  return new CustomError(message, 500);
};
