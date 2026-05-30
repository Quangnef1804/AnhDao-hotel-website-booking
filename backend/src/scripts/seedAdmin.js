import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const seedAdmin = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/anhdao_hotel';
  await mongoose.connect(mongoUri);

  const email = process.env.ADMIN_EMAIL || 'admin@anhdao.local';
  const password = process.env.ADMIN_PASSWORD || 'admin123456';
  const hashedPassword = await bcrypt.hash(password, 10);

  await User.findOneAndUpdate(
    { email },
    {
      nickname: process.env.ADMIN_NICKNAME || 'Admin',
      email,
      phone: process.env.ADMIN_PHONE || '0900000000',
      gender: 'male',
      password: hashedPassword,
      role: 'admin'
    },
    { upsert: true, new: true, runValidators: true }
  );

  console.log(`Admin account ready: ${email}`);
  await mongoose.disconnect();
};

seedAdmin().catch(async (error) => {
  console.error(error.message);
  await mongoose.disconnect();
  process.exit(1);
});
