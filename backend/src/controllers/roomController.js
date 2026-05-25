import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import Room from '../models/Room.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadRoot = path.resolve(__dirname, '../../uploads/rooms');

const roomImagesFromFiles = (files = []) =>
  files.map((file) => ({
    url: `/uploads/rooms/${file.filename}`,
    filename: file.filename,
    originalName: file.originalname
  }));

const deleteRoomImageFiles = async (rooms) => {
  const filenames = rooms.flatMap((room) => room.images?.map((image) => image.filename) || []);

  await Promise.allSettled(
    filenames.map((filename) => fs.unlink(path.join(uploadRoot, filename)))
  );
};

const roomPayload = (body, files = []) => {
  const payload = {
    name: body.name,
    type: body.type,
    description: body.description,
    status: body.status
  };

  if (body.price !== undefined) payload.price = Number(body.price);
  if (body.rating !== undefined) payload.rating = Number(body.rating);
  if (files.length) payload.images = roomImagesFromFiles(files);

  return payload;
};

export const getRooms = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.type) filter.type = req.query.type;

    const rooms = await Room.find(filter).sort({ createdAt: -1 });
    res.json({ rooms });
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

    res.json({ room });
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
