import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadRoot = path.resolve(__dirname, '../../uploads/rooms');

fs.mkdirSync(uploadRoot, { recursive: true });

const storage = multer.diskStorage({
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

    callback(null, `${Date.now()}-${safeName || 'room'}${ext}`);
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
  storage,
  fileFilter,
  limits: {
    files: 6,
    fileSize: 5 * 1024 * 1024
  }
}).array('images', 6);
