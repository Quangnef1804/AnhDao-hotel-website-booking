import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import Room from '../models/Room.js';
import Review from '../models/Review.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadRoot = path.resolve(__dirname, '../../uploads/rooms');

const roomImagesFromFiles = (files = []) =>
  files.map((file) => `/uploads/rooms/${file.filename}`);

const deleteRoomImageFiles = async (rooms) => {
  const filenames = rooms.flatMap((room) =>
    (room.images || [])
      .map((image) => {
        if (typeof image === 'string') return path.basename(image);
        return image?.filename;
      })
      .filter(Boolean)
  );

  await Promise.allSettled(
    filenames.map((filename) => fs.unlink(path.join(uploadRoot, filename)))
  );
};

const roomPayload = (body, files = []) => {
  const payload = {};

  const roomName = body.name || body.roomNumber;
  if (roomName !== undefined) {
    payload.name = roomName;
    payload.roomNumber = roomName;
  }
  if (body.type !== undefined) payload.type = body.type;
  if (body.description !== undefined) payload.description = body.description;
  if (body.status !== undefined) payload.status = body.status;
  if (body.price !== undefined) payload.price = Number(body.price);
  if (body.quantity !== undefined) payload.quantity = Number(body.quantity);
  if (files.length) payload.images = roomImagesFromFiles(files);

  return payload;
};

const attachReviewStats = async (rooms) => {
  const plainRooms = rooms.map((room) => room.toObject());
  const stats = await Review.aggregate([
    { $match: { roomId: { $in: rooms.map((room) => room._id) } } },
    {
      $group: {
        _id: '$roomId',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 }
      }
    }
  ]);

  const statsByRoom = new Map(stats.map((item) => [String(item._id), item]));

  return plainRooms.map((room) => {
    const roomStats = statsByRoom.get(String(room._id));
    return {
      ...room,
      roomNumber: room.name || room.roomNumber,
      name: room.name || room.roomNumber,
      quantity: Number(room.quantity || 0),
      averageRating: roomStats ? Number(roomStats.averageRating.toFixed(1)) : 0,
      reviewCount: roomStats?.reviewCount || 0
    };
  });
};

export const getRooms = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.type) filter.type = req.query.type;

    const rooms = await Room.find(filter).sort({ name: 1, roomNumber: 1, createdAt: -1 });
    res.json({ rooms: await attachReviewStats(rooms) });
  } catch (error) {
    next(error);
  }
};

export const getRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const [roomWithStats] = await attachReviewStats([room]);
    res.json({ room: roomWithStats });
  } catch (error) {
    next(error);
  }
};

export const createRoom = async (req, res, next) => {
  try {
    const room = await Room.create(roomPayload(req.body, req.files));
    res.status(201).json({ room });
  } catch (error) {
    next(error);
  }
};

export const updateRoom = async (req, res, next) => {
  try {
    const currentRoom = await Room.findById(req.params.id);
    if (!currentRoom) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const payload = roomPayload(req.body, req.files);
    const hasNewImages = Boolean(req.files?.length);

    const room = await Room.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true
    });

    if (hasNewImages) {
      await deleteRoomImageFiles([currentRoom]);
    }

    res.json({ room });
  } catch (error) {
    next(error);
  }
};

export const deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    await deleteRoomImageFiles([room]);
    res.json({ message: 'Room deleted' });
  } catch (error) {
    next(error);
  }
};

export const deleteRooms = async (req, res, next) => {
  try {
    const ids = Array.isArray(req.body.ids) ? req.body.ids : [];
    if (!ids.length) {
      return res.status(400).json({ message: 'Room ids are required' });
    }

    const rooms = await Room.find({ _id: { $in: ids } });
    const result = await Room.deleteMany({ _id: { $in: ids } });

    await deleteRoomImageFiles(rooms);

    res.json({ message: 'Rooms deleted', deletedCount: result.deletedCount });
  } catch (error) {
    next(error);
  }
};

export const updateRoomsStatus = async (req, res, next) => {
  try {
    const ids = Array.isArray(req.body.ids) ? req.body.ids : [];
    const { status } = req.body;
    const allowedStatuses = ['available', 'occupied', 'booked', 'maintenance'];

    if (!ids.length) {
      return res.status(400).json({ message: 'Room ids are required' });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid room status' });
    }

    const result = await Room.updateMany({ _id: { $in: ids } }, { status }, { runValidators: true });

    res.json({ message: 'Rooms updated', modifiedCount: result.modifiedCount });
  } catch (error) {
    next(error);
  }
};
