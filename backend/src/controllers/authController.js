import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const avatarsUploadRoot = path.resolve(__dirname, '../../uploads/avatars');

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });

const deleteAvatarFile = async (avatar) => {
  if (!avatar || !avatar.startsWith('/uploads/avatars/')) return;

  await fs.unlink(path.join(avatarsUploadRoot, path.basename(avatar))).catch(() => {});
};

const publicUser = (user) => ({
  id: user._id,
  nickname: user.nickname,
  email: user.email,
  phone: user.phone,
  gender: user.gender,
  avatar: user.avatar,
  role: user.role
});

export const register = async (req, res, next) => {
  try {
    const { nickname, email, phone, password, gender = 'male' } = req.body;

    if (!nickname || !email || !phone || !password) {
      return res.status(400).json({ message: 'Nickname, email, phone and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      nickname,
      email,
      phone,
      gender: ['male', 'female'].includes(gender) ? gender : 'male',
      password: hashedPassword
    });

    res.status(201).json({
      user: publicUser(user),
      token: signToken(user._id)
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
      user: publicUser(user),
      token: signToken(user._id)
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res) => {
  res.json({ user: publicUser(req.user) });
};

export const updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Avatar image is required' });
    }

    const previousAvatar = req.user.avatar;
    req.user.avatar = `/uploads/avatars/${req.file.filename}`;
    await req.user.save();
    await deleteAvatarFile(previousAvatar);

    res.json({ user: publicUser(req.user) });
  } catch (error) {
    next(error);
  }
};
