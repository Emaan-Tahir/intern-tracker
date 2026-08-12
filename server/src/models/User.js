import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, default: null },
    role: { type: String, enum: ['admin', 'intern'], required: true },
    track: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'active'], default: 'active' },
    inviteToken: { type: String, default: null },
    inviteTokenExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
