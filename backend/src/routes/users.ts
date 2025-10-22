import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authMiddleware } from '../middleware/authMiddleware';
import { UserController } from '../controllers/UserController';

const router = Router();
const userController = new UserController();

// All routes require authentication
router.use(authMiddleware);

// User routes
router.get('/profile', asyncHandler(userController.getProfile));
router.put('/profile', asyncHandler(userController.updateProfile));
router.get('/search', asyncHandler(userController.searchUsers));

export default router;
