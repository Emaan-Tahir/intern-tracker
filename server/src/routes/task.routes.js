import express from 'express';
import {
  createTask,
  getTasks,
  submitTask,
  reviewSubmission,
  logTaskOpened,
} from '../controllers/task.controller.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getTasks);
router.post('/', requireRole('admin'), createTask);
router.post('/:taskId/submit', requireRole('intern'), submitTask);
router.post('/:taskId/opened', requireRole('intern'), logTaskOpened);
router.patch('/submissions/:submissionId/review', requireRole('admin'), reviewSubmission);

export default router;
