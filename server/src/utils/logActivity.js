import ActivityLog from '../models/ActivityLog.js';

export const logActivity = async (internId, event, taskId = null) => {
  try {
    await ActivityLog.create({ intern: internId, event, task: taskId });
  } catch (err) {
    
    console.error('Failed to log activity:', err.message);
  }
};
