import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';
import { logActivity } from '../utils/logActivity.js';

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !user.password) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

  const token = generateToken(user._id, user.role);

  if (user.role === 'intern') {
    await logActivity(user._id, 'login');
  }

  res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      track: user.track,
    },
  });
};

export const getMe = async (req, res) => {
  res.json({ user: req.user });
};

// Checks if an invite token is valid, without consuming it — used to show the
// "set password" form only when the link is genuinely still good.
export const verifyInvite = async (req, res) => {
  const { token } = req.params;

  const user = await User.findOne({
    inviteToken: token,
    inviteTokenExpires: { $gt: Date.now() },
  });

  if (!user) return res.status(400).json({ message: 'Invalid or expired invite link' });

  res.json({ name: user.name, email: user.email, role: user.role });
};

// Intern (or invited admin) sets their password via the invite link, activating the account
export const acceptInvite = async (req, res) => {
  const { token, password } = req.body;

  const user = await User.findOne({
    inviteToken: token,
    inviteTokenExpires: { $gt: Date.now() },
  });

  if (!user) return res.status(400).json({ message: 'Invalid or expired invite link' });

  user.password = await bcrypt.hash(password, 10);
  user.status = 'active';
  user.inviteToken = null;
  user.inviteTokenExpires = null;
  await user.save();

  const jwtToken = generateToken(user._id, user.role);

  res.json({
    token: jwtToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      track: user.track,
    },
  });
};
