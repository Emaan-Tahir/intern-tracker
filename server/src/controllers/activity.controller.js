import ActivityLog from '../models/ActivityLog.js';

// Returns "This week" style stats for the logged-in intern:
// active days this week, current streak, daily event counts, and recent activity.
export const getMyActivityStats = async (req, res) => {
  const internId = req.user._id;

  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday as week start
  startOfWeek.setHours(0, 0, 0, 0);

  // Pull everything from the start of this week onward — small enough dataset
  // for a learning project that we can safely do the rest of the math in JS.
  const logs = await ActivityLog.find({
    intern: internId,
    createdAt: { $gte: startOfWeek },
  })
    .sort({ createdAt: -1 })
    .populate('task', 'title');

  // Group logs by calendar day (YYYY-MM-DD) so we can count active days
  // and build the daily chart.
  const dayKey = (date) => date.toISOString().slice(0, 10);

  const eventsByDay = {};
  logs.forEach((log) => {
    const key = dayKey(new Date(log.createdAt));
    eventsByDay[key] = (eventsByDay[key] || 0) + 1;
  });

  const activeDays = Object.keys(eventsByDay).length;

  
  let streak = 0;
  const cursor = new Date(now);
  cursor.setHours(0, 0, 0, 0);

  
  if (!eventsByDay[dayKey(cursor)]) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (eventsByDay[dayKey(cursor)]) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  // Rough "platform time" estimate: each logged event stands in for a few
  // minutes of activity, since we don't track session duration directly.
  const MINUTES_PER_EVENT = 3;
  const platformMinutes = logs.length * MINUTES_PER_EVENT;

  // Build a Sun–Sat array for the week, each with a minute estimate, for the chart.
  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    const key = dayKey(d);
    weekDays.push({
      label: d.toLocaleDateString('en-US', { weekday: 'short' }),
      date: key,
      minutes: (eventsByDay[key] || 0) * MINUTES_PER_EVENT,
    });
  }

  const recentActivity = logs.slice(0, 5).map((log) => ({
    event: log.event,
    taskTitle: log.task?.title || null,
    createdAt: log.createdAt,
  }));

  res.json({
    activeDays,
    activeDaysTarget: 7,
    streak,
    platformMinutes,
    weekDays,
    recentActivity,
  });
};
