import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    intern: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    event: {
      type: String,
      enum: ['task_opened', 'task_submitted', 'login'],
      required: true,
    },
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null },
  },
  { timestamps: true }
);


activityLogSchema.index({ intern: 1, createdAt: -1 });

export default mongoose.model('ActivityLog', activityLogSchema);
