// import { authenticator } from 'otplib';
// import QRCode from 'qrcode';
import { logger } from '../utils/logger';

export class TwoFactorService {
  constructor() {
    // Configure OTP settings
    // authenticator.options = {
    //   window: 2, // Allow 2 time steps (60 seconds) of tolerance
    //   step: 30, // 30 second time step
    // };
  }

  generateSecret(): string {
    // return authenticator.generateSecret();
    return 'mock-secret-for-now';
  }

  generateQRCode(secret: string, email: string): string {
    // const serviceName = 'MalPay';
    // const otpauth = authenticator.keyuri(email, serviceName, secret);
    
    try {
      // return QRCode.toDataURL(otpauth);
      return 'data:image/png;base64,mock-qr-code';
    } catch (error) {
      logger.error('Failed to generate QR code:', error);
      throw error;
    }
  }

  verifyToken(secret: string, token: string): boolean {
    try {
      // return authenticator.verify({ token, secret });
      return token === '123456'; // Mock verification
    } catch (error) {
      logger.error('Failed to verify 2FA token:', error);
      return false;
    }
  }

  generateToken(secret: string): string {
    try {
      // return authenticator.generate(secret);
      return '123456'; // Mock token
    } catch (error) {
      logger.error('Failed to generate 2FA token:', error);
      throw error;
    }
  }

  validateSecret(secret: string): boolean {
    try {
      // Try to generate a token with the secret to validate it
      // authenticator.generate(secret);
      return secret.length > 0;
    } catch (error) {
      return false;
    }
  }

  getTimeRemaining(): number {
    const epoch = Math.round(new Date().getTime() / 1000.0);
    const timeStep = 30;
    return timeStep - (epoch % timeStep);
  }
}
