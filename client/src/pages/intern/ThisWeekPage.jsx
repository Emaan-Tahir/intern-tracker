import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Clock3, CalendarCheck } from 'lucide-react';
import api from '../../lib/axios';
import { useAuth } from '../../features/auth/AuthContext';
import DashboardLayout from '../../shared/components/DashboardLayout';

const statusOrder = {
  changes_requested: 0,
  not_started: 1,
  in_progress: 1,
  submitted: 2,
  approved: 3,
};

const eventLabels = {
  login: 'Logged in',
  task_opened: 'Task opened',
  task_submitted: 'Task submitted',
};

const ThisWeekPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [activityRes, tasksRes] = await Promise.all([
      api.get('/activity/me'),
      api.get('/tasks'),
    ]);
    setStats(activityRes.data);
    setTasks(tasksRes.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  if (loading || !stats) {
    return (
      <DashboardLayout>
        <div className="page">
          <p>Loading this week...</p>
        </div>
      </DashboardLayout>
    );
  }

  const total = tasks.length;
  const completed = tasks.filter((t) => t.submission?.status === 'approved').length;
  const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Same "what's most worth doing next" ordering as the My Tasks page —
  // first task that isn't done yet, earliest due date wins ties.
  const openTasks = tasks
    .filter((t) => (t.submission?.status || 'not_started') !== 'approved')
    .sort((a, b) => {
      const sA = statusOrder[a.submission?.status || 'not_started'];
      const sB = statusOrder[b.submission?.status || 'not_started'];
      if (sA !== sB) return sA - sB;
      if (a.dueDate && b.dueDate) return new Date(a.dueDate) - new Date(b.dueDate);
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const nextTask = openTasks[0] || null;
  const maxMinutes = Math.max(...stats.weekDays.map((d) => d.minutes), 1);

  const handleOpenTask = async () => {
    if (!nextTask) return;
    try {
      await api.post(`/tasks/${nextTask._id}/opened`);
    } catch {
      // Logging the "opened" event is best-effort — never block navigation on it
    }
    navigate('/intern');
  };

  return (
    <DashboardLayout>
      <div className="page">
        <div className="page-header">
          <div>
            <h2 className="page-title">This week, {user.name.split(' ')[0]}</h2>
            <p className="page-subtitle">Here's the one thing worth doing next.</p>
          </div>
        </div>

        {/* Next up */}
        {nextTask ? (
          <div
            className="card"
            style={{
              marginBottom: 28,
              borderColor: 'var(--color-green-light)',
              background: 'rgba(15, 169, 88, 0.08)',
            }}
          >
            <p style={{ fontSize: 11, color: 'var(--color-green-light)', fontWeight: 700, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Next up
            </p>
            <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-white)', margin: '0 0 4px' }}>
              {nextTask.title}
            </p>
            <p style={{ fontSize: 12.5, color: 'var(--color-muted)', margin: '0 0 14px' }}>
              {nextTask.dueDate ? `Due ${new Date(nextTask.dueDate).toLocaleDateString()}` : 'No due date'}
            </p>
            <button className="btn btn-primary" onClick={handleOpenTask}>
              Open task
            </button>
          </div>
        ) : (
          <div className="card" style={{ marginBottom: 28 }}>
            <p style={{ margin: 0 }}>All caught up — no open tasks right now.</p>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 20 }}>
          {/* Activity */}
          <div className="card">
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-white)', margin: '0 0 16px' }}>
              Activity
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
              <MiniStat icon={<Clock3 size={16} />} label="Platform time" value={`${stats.platformMinutes}m`} />
              <MiniStat
                icon={<CalendarCheck size={16} />}
                label="Active days"
                value={`${stats.activeDays} / ${stats.activeDaysTarget}`}
              />
              <MiniStat icon={<Flame size={16} />} label="Streak" value={`${stats.streak}d`} />
            </div>

            <p style={{ fontSize: 12, color: 'var(--color-muted)', margin: '0 0 8px' }}>Daily active time</p>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 70, marginBottom: 20 }}>
              {stats.weekDays.map((day) => (
                <div key={day.date} style={{ flex: 1, textAlign: 'center' }}>
                  <div
                    style={{
                      height: `${Math.max((day.minutes / maxMinutes) * 56, 3)}px`,
                      background:
                        day.minutes > 0
                          ? 'linear-gradient(180deg, var(--color-green-light), var(--color-green))'
                          : 'rgba(255,255,255,0.08)',
                      borderRadius: 3,
                    }}
                  />
                  <p style={{ fontSize: 10, color: 'var(--color-muted)', margin: '4px 0 0' }}>{day.label}</p>
                </div>
              ))}
            </div>

            <p style={{ fontSize: 12, color: 'var(--color-muted)', margin: '0 0 8px' }}>Recent activity</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {stats.recentActivity.length === 0 && (
                <p style={{ fontSize: 12.5, color: 'var(--color-muted)' }}>Nothing logged yet.</p>
              )}
              {stats.recentActivity.map((a, i) => (
                <p key={i} style={{ fontSize: 12.5, margin: 0, color: 'var(--color-text)' }}>
                  {eventLabels[a.event] || a.event}
                  {a.taskTitle && <span style={{ color: 'var(--color-muted)' }}> — {a.taskTitle}</span>}
                  <span style={{ color: 'var(--color-muted)' }}>
                    {' · '}
                    {new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </p>
              ))}
            </div>
          </div>

          {/* Program + enrollment */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-white)', margin: 0 }}>
                  Active program
                </p>
                <span className="badge badge-success">Active</span>
              </div>
              <p style={{ fontSize: 13, margin: '4px 0 12px' }}>{user.track || 'General track'}</p>
              <p style={{ fontSize: 26, fontWeight: 700, color: 'var(--color-white)', margin: '0 0 2px' }}>
                {progressPercent}%
              </p>
              <p style={{ fontSize: 12.5, color: 'var(--color-muted)', margin: '0 0 14px' }}>
                {completed} completed of {total} program tasks
              </p>
              <button className="btn" style={{ width: '100%' }} onClick={() => navigate('/intern')}>
                View tasks
              </button>
              <p style={{ fontSize: 11.5, color: 'var(--color-muted)', margin: '12px 0 0' }}>
                Finish every task and your mentor will confirm completion — no request needed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

const MiniStat = ({ icon, label, value }) => (
  <div>
    <div style={{ color: 'var(--color-green-light)', marginBottom: 4 }}>{icon}</div>
    <p style={{ fontSize: 11, color: 'var(--color-muted)', margin: '0 0 2px' }}>{label}</p>
    <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-white)', margin: 0 }}>{value}</p>
  </div>
);

export default ThisWeekPage;
