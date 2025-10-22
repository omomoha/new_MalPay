import { Router } from 'express';
import { body } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthController } from '../controllers/AuthController';
import { validateRequest } from '../middleware/validateRequest';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const authController = new AuthController();

// Validation rules
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('phoneNumber')
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
];

const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),
];

const verifyEmailValidation = [
  body('token')
    .notEmpty()
    .withMessage('Verification token is required'),
];

const resendVerificationValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
];

const twoFactorValidation = [
  body('code')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('2FA code must be 6 digits'),
];

// Routes
router.post('/register', registerValidation, validateRequest, asyncHandler(authController.register));
router.post('/login', loginValidation, validateRequest, asyncHandler(authController.login));
router.post('/logout', authMiddleware, asyncHandler(authController.logout));
router.post('/refresh', asyncHandler(authController.refreshToken));
router.post('/forgot-password', forgotPasswordValidation, validateRequest, asyncHandler(authController.forgotPassword));
router.post('/reset-password', resetPasswordValidation, validateRequest, asyncHandler(authController.resetPassword));
router.post('/verify-email', verifyEmailValidation, validateRequest, asyncHandler(authController.verifyEmail));
router.post('/resend-verification', resendVerificationValidation, validateRequest, asyncHandler(authController.resendVerification));
router.post('/change-password', authMiddleware, changePasswordValidation, validateRequest, asyncHandler(authController.changePassword));

// 2FA routes
router.post('/2fa/enable', authMiddleware, asyncHandler(authController.enable2FA));
router.post('/2fa/verify', authMiddleware, twoFactorValidation, validateRequest, asyncHandler(authController.verify2FA));
router.post('/2fa/disable', authMiddleware, twoFactorValidation, validateRequest, asyncHandler(authController.disable2FA));

// Profile routes
router.get('/me', authMiddleware, asyncHandler(authController.getProfile));
router.put('/me', authMiddleware, asyncHandler(authController.updateProfile));
router.get('/profile-completion', authMiddleware, asyncHandler(authController.getProfileCompletion));

export default router;
