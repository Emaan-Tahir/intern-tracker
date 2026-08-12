import express from 'express';
import { getMyActivityStats } from '../controllers/activity.controller.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/me', protect, requireRole('intern'), getMyActivityStats);

export default router;
