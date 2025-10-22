// Error Handling Service for MalPay Mobile

import { Alert } from 'react-native';
import { APIError } from '@types/api.types';

export interface ErrorHandlerOptions {
  showAlert?: boolean;
  logError?: boolean;
  fallbackMessage?: string;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  
  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Handle API errors with user-friendly messages
   */
  handleAPIError(error: any, options: ErrorHandlerOptions = {}): string {
    const {
      showAlert = true,
      logError = true,
      fallbackMessage = 'An unexpected error occurred. Please try again.'
    } = options;

    let errorMessage = fallbackMessage;

    // Log error for debugging
    if (logError) {
      console.error('API Error:', error);
    }

    // Handle different error types
    if (error?.data?.error) {
      const apiError = error.data.error as APIError['error'];
      errorMessage = this.getUserFriendlyMessage(apiError.code, apiError.message);
    } else if (error?.message) {
      errorMessage = this.getUserFriendlyMessage('NETWORK_ERROR', error.message);
    } else if (typeof error === 'string') {
      errorMessage = this.getUserFriendlyMessage('UNKNOWN_ERROR', error);
    }

    // Show alert if requested
    if (showAlert) {
      Alert.alert('Error', errorMessage);
    }

    return errorMessage;
  }

  /**
   * Handle network errors
   */
  handleNetworkError(error: any, options: ErrorHandlerOptions = {}): string {
    const {
      showAlert = true,
      logError = true,
      fallbackMessage = 'Network error. Please check your internet connection.'
    } = options;

    let errorMessage = fallbackMessage;

    if (logError) {
      console.error('Network Error:', error);
    }

    if (error?.message?.includes('timeout')) {
      errorMessage = 'Request timed out. Please try again.';
    } else if (error?.message?.includes('Network Error')) {
      errorMessage = 'Network error. Please check your internet connection.';
    } else if (error?.message?.includes('Failed to fetch')) {
      errorMessage = 'Unable to connect to server. Please try again later.';
    }

    if (showAlert) {
      Alert.alert('Connection Error', errorMessage);
    }

    return errorMessage;
  }

  /**
   * Handle validation errors
   */
  handleValidationError(errors: Record<string, string[]>, options: ErrorHandlerOptions = {}): string {
    const {
      showAlert = true,
      logError = true,
      fallbackMessage = 'Please check your input and try again.'
    } = options;

    if (logError) {
      console.error('Validation Error:', errors);
    }

    // Get first error message
    const firstError = Object.values(errors)[0]?.[0];
    const errorMessage = firstError || fallbackMessage;

    if (showAlert) {
      Alert.alert('Validation Error', errorMessage);
    }

    return errorMessage;
  }

  /**
   * Handle authentication errors
   */
  handleAuthError(error: any, options: ErrorHandlerOptions = {}): string {
    const {
      showAlert = true,
      logError = true,
      fallbackMessage = 'Authentication failed. Please log in again.'
    } = options;

    let errorMessage = fallbackMessage;

    if (logError) {
      console.error('Auth Error:', error);
    }

    if (error?.status === 401) {
      errorMessage = 'Your session has expired. Please log in again.';
    } else if (error?.status === 403) {
      errorMessage = 'You do not have permission to perform this action.';
    } else if (error?.data?.error?.code === 'INVALID_CREDENTIALS') {
      errorMessage = 'Invalid email or password. Please try again.';
    } else if (error?.data?.error?.code === 'ACCOUNT_LOCKED') {
      errorMessage = 'Your account has been locked. Please contact support.';
    }

    if (showAlert) {
      Alert.alert('Authentication Error', errorMessage);
    }

    return errorMessage;
  }

  /**
   * Handle payment errors
   */
  handlePaymentError(error: any, options: ErrorHandlerOptions = {}): string {
    const {
      showAlert = true,
      logError = true,
      fallbackMessage = 'Payment failed. Please try again.'
    } = options;

    let errorMessage = fallbackMessage;

    if (logError) {
      console.error('Payment Error:', error);
    }

    if (error?.data?.error?.code === 'INSUFFICIENT_FUNDS') {
      errorMessage = 'Insufficient funds. Please add money to your wallet.';
    } else if (error?.data?.error?.code === 'INVALID_PIN') {
      errorMessage = 'Invalid PIN. Please try again.';
    } else if (error?.data?.error?.code === 'TRANSACTION_LIMIT_EXCEEDED') {
      errorMessage = 'Transaction limit exceeded. Please try a smaller amount.';
    } else if (error?.data?.error?.code === 'RECIPIENT_NOT_FOUND') {
      errorMessage = 'Recipient not found. Please check the email address.';
    } else if (error?.data?.error?.code === 'CARD_DECLINED') {
      errorMessage = 'Card declined. Please try a different card.';
    }

    if (showAlert) {
      Alert.alert('Payment Error', errorMessage);
    }

    return errorMessage;
  }

  /**
   * Get user-friendly error messages
   */
  private getUserFriendlyMessage(errorCode: string, originalMessage: string): string {
    const errorMessages: Record<string, string> = {
      // Authentication errors
      'INVALID_CREDENTIALS': 'Invalid email or password. Please try again.',
      'ACCOUNT_LOCKED': 'Your account has been locked. Please contact support.',
      'ACCOUNT_NOT_VERIFIED': 'Please verify your email address before logging in.',
      'TOKEN_EXPIRED': 'Your session has expired. Please log in again.',
      'INVALID_TOKEN': 'Invalid token. Please log in again.',

      // Validation errors
      'VALIDATION_ERROR': 'Please check your input and try again.',
      'INVALID_EMAIL': 'Please enter a valid email address.',
      'INVALID_PHONE': 'Please enter a valid phone number.',
      'PASSWORD_TOO_WEAK': 'Password must be at least 8 characters with uppercase, lowercase, and numbers.',
      'INVALID_DATE': 'Please enter a valid date.',

      // Payment errors
      'INSUFFICIENT_FUNDS': 'Insufficient funds. Please add money to your wallet.',
      'INVALID_PIN': 'Invalid PIN. Please try again.',
      'TRANSACTION_LIMIT_EXCEEDED': 'Transaction limit exceeded. Please try a smaller amount.',
      'RECIPIENT_NOT_FOUND': 'Recipient not found. Please check the email address.',
      'CARD_DECLINED': 'Card declined. Please try a different card.',
      'BANK_ACCOUNT_INVALID': 'Invalid bank account details. Please check and try again.',

      // Network errors
      'NETWORK_ERROR': 'Network error. Please check your internet connection.',
      'TIMEOUT_ERROR': 'Request timed out. Please try again.',
      'SERVER_ERROR': 'Server error. Please try again later.',

      // KYC errors
      'KYC_REQUIRED': 'KYC verification is required to perform this action.',
      'KYC_DOCUMENT_INVALID': 'Invalid document. Please upload a clear image.',
      'KYC_DOCUMENT_EXPIRED': 'Document has expired. Please upload a current document.',

      // Card errors
      'CARD_ALREADY_EXISTS': 'This card is already linked to your account.',
      'CARD_INVALID': 'Invalid card details. Please check and try again.',
      'CARD_EXPIRED': 'Card has expired. Please use a different card.',

      // General errors
      'UNKNOWN_ERROR': 'An unexpected error occurred. Please try again.',
      'RATE_LIMIT_EXCEEDED': 'Too many requests. Please wait a moment and try again.',
      'SERVICE_UNAVAILABLE': 'Service temporarily unavailable. Please try again later.',
    };

    return errorMessages[errorCode] || originalMessage || 'An unexpected error occurred. Please try again.';
  }

  /**
   * Handle generic errors
   */
  handleGenericError(error: any, options: ErrorHandlerOptions = {}): string {
    const {
      showAlert = true,
      logError = true,
      fallbackMessage = 'An unexpected error occurred. Please try again.'
    } = options;

    if (logError) {
      console.error('Generic Error:', error);
    }

    const errorMessage = error?.message || fallbackMessage;

    if (showAlert) {
      Alert.alert('Error', errorMessage);
    }

    return errorMessage;
  }

  /**
   * Show success message
   */
  showSuccessMessage(message: string, title: string = 'Success'): void {
    Alert.alert(title, message);
  }

  /**
   * Show confirmation dialog
   */
  showConfirmation(
    message: string,
    title: string = 'Confirm',
    onConfirm: () => void,
    onCancel?: () => void
  ): void {
    Alert.alert(
      title,
      message,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: onCancel,
        },
        {
          text: 'Confirm',
          style: 'default',
          onPress: onConfirm,
        },
      ]
    );
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();

// Export convenience functions
export const handleAPIError = (error: any, options?: ErrorHandlerOptions) =>
  errorHandler.handleAPIError(error, options);

export const handleNetworkError = (error: any, options?: ErrorHandlerOptions) =>
  errorHandler.handleNetworkError(error, options);

export const handleValidationError = (errors: Record<string, string[]>, options?: ErrorHandlerOptions) =>
  errorHandler.handleValidationError(errors, options);

export const handleAuthError = (error: any, options?: ErrorHandlerOptions) =>
  errorHandler.handleAuthError(error, options);

export const handlePaymentError = (error: any, options?: ErrorHandlerOptions) =>
  errorHandler.handlePaymentError(error, options);

export const handleGenericError = (error: any, options?: ErrorHandlerOptions) =>
  errorHandler.handleGenericError(error, options);

export const showSuccessMessage = (message: string, title?: string) =>
  errorHandler.showSuccessMessage(message, title);

export const showConfirmation = (
  message: string,
  title?: string,
  onConfirm?: () => void,
  onCancel?: () => void
) => errorHandler.showConfirmation(message, title, onConfirm, onCancel);
