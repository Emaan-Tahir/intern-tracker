import { useEffect, useState } from 'react';
import { ClipboardList, CheckCircle2, TrendingUp, Clock3, AlertTriangle } from 'lucide-react';
import api from '../../lib/axios';
import { useAuth } from '../../features/auth/AuthContext';
import DashboardLayout from '../../shared/components/DashboardLayout';

const statusStyles = {
  not_started: { cls: 'badge-neutral', label: 'To do' },
  in_progress: { cls: 'badge-warning', label: 'In progress' },
  submitted: { cls: 'badge-info', label: 'Pending review' },
  approved: { cls: 'badge-success', label: 'Completed' },
  changes_requested: { cls: 'badge-danger', label: 'Changes requested' },
};

// Lower number = shows higher up the list. Completed tasks sink to the bottom.
const statusOrder = {
  changes_requested: 0,
  not_started: 1,
  in_progress: 1,
  submitted: 2,
  approved: 3,
};

const InternDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const { user } = useAuth();

  const loadTasks = async () => {
    const { data } = await api.get('/tasks');
    setTasks(data);
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleSubmit = async (taskId, link) => {
    await api.post(`/tasks/${taskId}/submit`, { submissionLink: link });
    loadTasks();
  };

  const total = tasks.length;
  const completed = tasks.filter((t) => t.submission?.status === 'approved').length;
  const inProgress = tasks.filter((t) => t.submission?.status === 'in_progress').length;
  const overdue = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.submission?.status !== 'approved'
  ).length;
  const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const sortedTasks = [...tasks].sort((a, b) => {
    const statusA = statusOrder[a.submission?.status || 'not_started'];
    const statusB = statusOrder[b.submission?.status || 'not_started'];
    if (statusA !== statusB) return statusA - statusB;

    if (a.dueDate && b.dueDate) return new Date(a.dueDate) - new Date(b.dueDate);
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <DashboardLayout>
      <div className="page">
        <div className="page-header">
          <div>
            <h2 className="page-title">My tasks</h2>
            <p className="page-subtitle">Track your learning progress and submit your work</p>
            <p className="page-track">{user.track || 'General track'}</p>
          </div>
        </div>

      <div className="stat-grid">
        <StatCard icon={<ClipboardList size={20} />} label="Total tasks" value={total} />
        <StatCard icon={<CheckCircle2 size={20} />} label="Completed" value={completed} />
        <StatCard icon={<TrendingUp size={20} />} label="Progress" value={`${progressPercent}%`} />
        <StatCard icon={<Clock3 size={20} />} label="In progress" value={inProgress} />
        <StatCard
          icon={<AlertTriangle size={20} />}
          label="Overdue"
          value={overdue}
          danger={overdue > 0}
        />
      </div>

      <h3 style={{ marginBottom: 14 }}>All tasks</h3>
      <div className="task-list">
        {sortedTasks.length === 0 && <p>No tasks assigned yet.</p>}
        {sortedTasks.map((task) => {
          const status = task.submission?.status || 'not_started';
          const style = statusStyles[status];
          const isOverdue =
            task.dueDate && new Date(task.dueDate) < new Date() && status !== 'approved';

          return (
            <div key={task._id} className="task-card">
              <div className="task-card-top">
                <strong className="task-title">{task.title}</strong>
                <span className={`badge ${isOverdue ? 'badge-danger' : style.cls}`}>
                  {isOverdue ? 'Overdue' : style.label}
                </span>
              </div>

              {task.description && <p className="task-desc">{task.description}</p>}

              {task.resources?.length > 0 && (
                <div style={{ margin: '10px 0' }}>
                  <p style={{ fontSize: 12, color: 'var(--color-muted)', margin: '0 0 6px', fontWeight: 600 }}>
                    Resources
                  </p>
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {task.resources.map((r, i) => (
                      <li key={i} style={{ fontSize: 13 }}>
                        <a href={r.url} target="_blank" rel="noreferrer">
                          {r.label?.trim() ? r.label : r.url}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="task-meta">
                {task.dueDate && `Due ${new Date(task.dueDate).toLocaleDateString()} · `}
                {task.points} points
                {status === 'approved' && ` · ${task.points} earned`}
              </p>

              {task.submission?.submissionLink && (
                <p style={{ fontSize: 13, margin: '0 0 12px' }}>
                  Your submission:{' '}
                  <a href={task.submission.submissionLink} target="_blank" rel="noreferrer">
                    {task.submission.submissionLink}
                  </a>
                </p>
              )}

              {(status === 'not_started' || status === 'in_progress' || status === 'changes_requested') && (
                <SubmitForm onSubmit={(link) => handleSubmit(task._id, link)} />
              )}

              {status === 'submitted' && (
                <p style={{ fontSize: 12, color: 'var(--color-info)' }}>Waiting for admin review.</p>
              )}

              {task.submission?.feedback && (
                <p style={{ fontSize: 12, color: 'var(--color-danger)', marginTop: 8 }}>
                  Feedback: {task.submission.feedback}
                </p>
              )}
            </div>
          );
        })}
      </div>
      </div>
    </DashboardLayout>
  );
};

const StatCard = ({ icon, label, value, danger }) => (
  <div className="stat-card">
    <div className="stat-icon">{icon}</div>
    <p className="stat-label">{label}</p>
    <p className={`stat-value ${danger ? 'danger' : ''}`}>{value}</p>
  </div>
);

const SubmitForm = ({ onSubmit }) => {
  const [link, setLink] = useState('');
  return (
    <div className="form-row">
      <input
        placeholder="Link to your work"
        value={link}
        onChange={(e) => setLink(e.target.value)}
        style={{ flex: 1 }}
      />
      <button onClick={() => onSubmit(link)} className="btn btn-primary">
        Submit
      </button>
    </div>
  );
};

export default InternDashboard;
