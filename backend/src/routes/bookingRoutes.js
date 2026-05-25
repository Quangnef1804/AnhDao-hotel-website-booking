import express from 'express';
import {
  createBooking,
  deleteBooking,
  deleteBookings,
  getAllBookings,
  getMyBookings,
  updateBookingStatus
} from '../controllers/bookingController.js';
import { adminOnly, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createBooking);
router.get('/my', protect, getMyBookings);
router.get('/admin', protect, adminOnly, getAllBookings);
router.delete('/bulk', protect, adminOnly, deleteBookings);
router.patch('/:id/status', protect, adminOnly, updateBookingStatus);
router.delete('/:id', protect, adminOnly, deleteBooking);

export default router;
