import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authMiddleware } from '../middleware/authMiddleware';
import { KYCController } from '../controllers/KYCController';

const router = Router();
const kycController = new KYCController();

// All routes require authentication
router.use(authMiddleware);

// KYC routes
router.get('/status', asyncHandler(kycController.getKYCStatus));
router.post('/documents', asyncHandler(kycController.submitDocument));
router.get('/documents', asyncHandler(kycController.getDocuments));
router.delete('/documents/:id', asyncHandler(kycController.deleteDocument));

export default router;
