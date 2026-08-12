import express from 'express';
import { createIntern, getInterns, getInternById } from '../controllers/intern.controller.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, requireRole('admin'));

router.post('/', createIntern);
router.get('/', getInterns);
router.get('/:id', getInternById);

export default router;
