import express from 'express';
import { createReview, getRoomReviews } from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createReview);
router.get('/rooms/:roomId', getRoomReviews);

export default router;

