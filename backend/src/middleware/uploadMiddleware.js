import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const roomsUploadRoot = path.resolve(__dirname, '../../uploads/rooms');
const avatarsUploadRoot = path.resolve(__dirname, '../../uploads/avatars');

fs.mkdirSync(roomsUploadRoot, { recursive: true });
fs.mkdirSync(avatarsUploadRoot, { recursive: true });

const createStorage = (uploadRoot, fallbackName) => multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadRoot);
  },
  filename: (_req, file, callback) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = path
      .basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 40);

    callback(null, `${Date.now()}-${safeName || fallbackName}${ext}`);
  }
});

const fileFilter = (_req, file, callback) => {
  if (!file.mimetype.startsWith('image/')) {
    const error = new Error('Only image files are allowed');
    error.statusCode = 400;
    callback(error);
    return;
  }

  callback(null, true);
};

export const uploadRoomImages = multer({
  storage: createStorage(roomsUploadRoot, 'room'),
  fileFilter,
  limits: {
    files: 6,
    fileSize: 5 * 1024 * 1024
  }
}).array('images', 6);

export const uploadAvatar = multer({
  storage: createStorage(avatarsUploadRoot, 'avatar'),
  fileFilter,
  limits: {
    files: 1,
    fileSize: 3 * 1024 * 1024
  }
}).single('avatar');
