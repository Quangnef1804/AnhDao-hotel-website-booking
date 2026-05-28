import express from 'express';
import {
  createRoom,
  deleteRoom,
  deleteRooms,
  getRoom,
  getRooms,
  updateRoom,
  updateRoomsStatus
} from '../controllers/roomController.js';
import { adminOnly, protect } from '../middleware/authMiddleware.js';
import { uploadRoomImages } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/', getRooms);
router.get('/:id', getRoom);
router.post('/', protect, adminOnly, uploadRoomImages, createRoom);
router.delete('/bulk', protect, adminOnly, deleteRooms);
router.patch('/bulk/status', protect, adminOnly, updateRoomsStatus);
router.put('/:id', protect, adminOnly, uploadRoomImages, updateRoom);
router.delete('/:id', protect, adminOnly, deleteRoom);

export default router;
