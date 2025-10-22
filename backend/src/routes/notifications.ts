import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authMiddleware } from '../middleware/authMiddleware';
import { NotificationController } from '../controllers/NotificationController';

const router = Router();
const notificationController = new NotificationController();

// All routes require authentication
router.use(authMiddleware);

// Notification routes
router.get('/', asyncHandler(notificationController.getNotifications));
router.get('/:id', asyncHandler(notificationController.getNotification));
router.put('/:id/read', asyncHandler(notificationController.markAsRead));
router.put('/read-all', asyncHandler(notificationController.markAllAsRead));
router.delete('/:id', asyncHandler(notificationController.deleteNotification));

export default router;
