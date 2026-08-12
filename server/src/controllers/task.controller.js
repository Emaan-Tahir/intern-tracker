import Task from '../models/Task.js';
import Submission from '../models/Submission.js';
import { logActivity } from '../utils/logActivity.js';

// Admin creates a task and assigns it to an intern
export const createTask = async (req, res) => {
  const { title, description, assignedTo, dueDate, points, resources } = req.body;

  const task = await Task.create({
    title,
    description,
    assignedTo,
    createdBy: req.user._id,
    dueDate,
    points,
    resources: (resources || []).filter((r) => r.url?.trim()),
  });

  await Submission.create({ task: task._id, intern: assignedTo, status: 'not_started' });

  res.status(201).json(task);
};

// Admin: view all tasks. Intern: view only their own tasks.
export const getTasks = async (req, res) => {
  const filter = req.user.role === 'intern' ? { assignedTo: req.user._id } : {};
  const tasks = await Task.find(filter).populate('assignedTo', 'name email').sort({ dueDate: 1 });

  const tasksWithSubmission = await Promise.all(
    tasks.map(async (task) => {
      const submission = await Submission.findOne({ task: task._id, intern: task.assignedTo });
      return { ...task.toObject(), submission };
    })
  );

  res.json(tasksWithSubmission);
};

// Intern submits work for a task
export const submitTask = async (req, res) => {
  const { submissionLink, submissionNotes } = req.body;

  const submission = await Submission.findOne({
    task: req.params.taskId,
    intern: req.user._id,
  });

  if (!submission) return res.status(404).json({ message: 'Submission not found' });

  submission.submissionLink = submissionLink;
  submission.submissionNotes = submissionNotes;
  submission.status = 'submitted';
  await submission.save();

  await logActivity(req.user._id, 'task_submitted', req.params.taskId);

  res.json(submission);
};

// Intern opened a task (called from the frontend when a task card is viewed/expanded)
export const logTaskOpened = async (req, res) => {
  await logActivity(req.user._id, 'task_opened', req.params.taskId);
  res.status(204).send();
};

// Admin reviews a submission: approve or request changes
export const reviewSubmission = async (req, res) => {
  const { status, feedback } = req.body; // status: "approved" | "changes_requested"

  const submission = await Submission.findById(req.params.submissionId);
  if (!submission) return res.status(404).json({ message: 'Submission not found' });

  submission.status = status;
  submission.feedback = feedback || '';
  await submission.save();

  res.json(submission);
};
