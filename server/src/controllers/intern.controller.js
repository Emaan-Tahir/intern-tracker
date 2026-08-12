import crypto from 'crypto';
import User from '../models/User.js';
import Submission from '../models/Submission.js';
import { sendInviteEmail } from '../utils/sendEmail.js';

// Admin invites an intern — no password set here, intern sets their own via email link
export const createIntern = async (req, res) => {
  const { name, email, track } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) return res.status(400).json({ message: 'Email already in use' });

  const inviteToken = crypto.randomBytes(32).toString('hex');

  const intern = await User.create({
    name,
    email: email.toLowerCase(),
    role: 'intern',
    track: track || '',
    status: 'pending',
    inviteToken,
    inviteTokenExpires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  await sendInviteEmail(intern.email, intern.name, inviteToken, 'intern');

  res.status(201).json({
    id: intern._id,
    name: intern.name,
    email: intern.email,
    track: intern.track,
    status: intern.status,
  });
};

// Admin views all interns with their completion stats
export const getInterns = async (req, res) => {
  const interns = await User.find({ role: 'intern' }).select('-password');

  const internsWithStats = await Promise.all(
    interns.map(async (intern) => {
      const submissions = await Submission.find({ intern: intern._id });
      const total = submissions.length;
      const completed = submissions.filter((s) => s.status === 'approved').length;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        id: intern._id,
        name: intern.name,
        email: intern.email,
        track: intern.track,
        status: intern.status,
        totalTasks: total,
        completed,
        progress,
      };
    })
  );

  res.json(internsWithStats);
};

export const getInternById = async (req, res) => {
  const intern = await User.findById(req.params.id).select('-password');
  if (!intern) return res.status(404).json({ message: 'Intern not found' });
  res.json(intern);
};
