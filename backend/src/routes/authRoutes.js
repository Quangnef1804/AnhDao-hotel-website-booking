import express from 'express';
import { getMe, login, register, updateAvatar } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadAvatar } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.patch('/avatar', protect, uploadAvatar, updateAvatar);

export default router;
