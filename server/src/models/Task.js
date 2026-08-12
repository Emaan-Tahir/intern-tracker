import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    dueDate: { type: Date },
    points: { type: Number, default: 10 },
    resources: [
      {
        label: { type: String, default: '' },
        url: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('Task', taskSchema);
