import express from 'express';
import { login, getMe, verifyInvite, acceptInvite } from '../controllers/auth.controller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/invite/:token', verifyInvite);
router.post('/accept-invite', acceptInvite);

export default router;
