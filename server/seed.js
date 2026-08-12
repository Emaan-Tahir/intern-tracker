import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { connectDB } from './src/config/db.js';
import User from './src/models/User.js';
import mongoose from 'mongoose';

const seed = async () => {
  await connectDB();

  const email = 'admin@company.com';
  const existing = await User.findOne({ email });

  if (existing) {
    console.log('Admin already exists:', email);
  } else {
    const hashed = await bcrypt.hash('admin123', 10);
    await User.create({
      name: 'Root Admin',
      email,
      password: hashed,
      role: 'admin',
    });
    console.log('Root admin created:');
    console.log('  email:', email);
    console.log('  password: admin123');
    console.log('Change this password after first login.');
  }

  await mongoose.disconnect();
};

seed();
