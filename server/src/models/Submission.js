import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
  {
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
    intern: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'submitted', 'approved', 'changes_requested'],
      default: 'not_started',
    },
    submissionLink: { type: String, default: '' },
    submissionNotes: { type: String, default: '' },
    feedback: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('Submission', submissionSchema);
