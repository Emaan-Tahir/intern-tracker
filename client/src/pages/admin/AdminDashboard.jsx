import { useEffect, useState } from 'react';
import { Users, ClipboardCheck, UserPlus, ListPlus } from 'lucide-react';
import api from '../../lib/axios';
import DashboardLayout from '../../shared/components/DashboardLayout';

const AdminDashboard = () => {
  const [interns, setInterns] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', track: '' });
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assignedTo: '',
    dueDate: '',
    points: 10,
    resources: [{ label: '', url: '' }],
  });
  const loadInterns = async () => {
    const { data } = await api.get('/interns');
    setInterns(data);
  };

  const loadTasks = async () => {
    const { data } = await api.get('/tasks');
    setTasks(data);
  };

  useEffect(() => {
    loadInterns();
    loadTasks();
  }, []);

  const handleCreateIntern = async (e) => {
    e.preventDefault();
    try {
      await api.post('/interns', form);
      setForm({ name: '', email: '', track: '' });
      loadInterns();
      alert('Invite sent');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send invite');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskForm.assignedTo) return alert('Pick an intern first');
    await api.post('/tasks', taskForm);
    setTaskForm({
      title: '', description: '', assignedTo: '', dueDate: '', points: 10,
      resources: [{ label: '', url: '' }],
    });
    loadInterns();
    loadTasks();
    alert('Task created');
  };

  const updateResource = (index, field, value) => {
    const resources = [...taskForm.resources];
    resources[index] = { ...resources[index], [field]: value };
    setTaskForm({ ...taskForm, resources });
  };

  const addResourceField = () => {
    setTaskForm({ ...taskForm, resources: [...taskForm.resources, { label: '', url: '' }] });
  };

  const removeResourceField = (index) => {
    setTaskForm({ ...taskForm, resources: taskForm.resources.filter((_, i) => i !== index) });
  };

  const handleReview = async (submissionId, status, feedback) => {
    await api.patch(`/tasks/submissions/${submissionId}/review`, { status, feedback });
    loadInterns(); // progress % changes once approved
    loadTasks();
  };

  const pendingReview = tasks.filter((t) => t.submission?.status === 'submitted');

  return (
    <DashboardLayout>
      <div className="page" style={{ maxWidth: 900 }}>
        <div className="page-header">
          <div>
            <h2 className="page-title">Admin console</h2>
            <p className="page-subtitle">Onboard interns, assign work, review submissions</p>
          </div>
        </div>

        {/* ── Review submissions ── */}
        <div id="review-submissions">
        <SectionHeading icon={<ClipboardCheck size={18} />} title="Review submissions">
          {pendingReview.length > 0 && (
            <span className="badge badge-info" style={{ marginLeft: 10 }}>
              {pendingReview.length} pending
            </span>
          )}
        </SectionHeading>
        <div style={{ marginBottom: 32 }}>
          {pendingReview.length === 0 && (
            <p style={{ fontSize: 13 }}>Nothing waiting on review right now.</p>
          )}
          <div className="task-list">
            {pendingReview.map((task) => (
              <ReviewCard key={task._id} task={task} onReview={handleReview} />
            ))}
          </div>
        </div>
        </div>

        {/* ── Onboard intern ── */}
        <div id="onboard-intern">
        <SectionHeading icon={<UserPlus size={18} />} title="Onboard intern" />
        <p style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: -6, marginBottom: 12 }}>
          They'll get an email invite to set their own password.
        </p>
        <form onSubmit={handleCreateIntern} className="card" style={{ marginBottom: 32 }}>
        <div className="form-row">
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            placeholder="Track"
            value={form.track}
            onChange={(e) => setForm({ ...form, track: e.target.value })}
          />
        </div>
        <button type="submit" className="btn btn-primary">Send invite</button>
      </form>
      </div>

      {/* ── Create task ── */}
      <div id="create-task">
      <SectionHeading icon={<ListPlus size={18} />} title="Create task" />
      <form onSubmit={handleCreateTask} className="card" style={{ marginBottom: 32, marginTop: 12 }}>
        <div className="form-row">
          <input
            placeholder="Task title"
            value={taskForm.title}
            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
            required
            style={{ flex: 1, minWidth: 200 }}
          />
        </div>
        <div className="form-row">
          <textarea
            placeholder="Description"
            value={taskForm.description}
            onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
          />
        </div>
        <div className="form-row">
          <select
            value={taskForm.assignedTo}
            onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
            required
          >
            <option value="">Assign to intern...</option>
            {interns.map((i) => (
              <option key={i.id} value={i.id}>{i.name}</option>
            ))}
          </select>
          <input
            type="date"
            value={taskForm.dueDate}
            onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
          />
          <input
            type="number"
            placeholder="Points"
            value={taskForm.points}
            onChange={(e) => setTaskForm({ ...taskForm, points: Number(e.target.value) })}
            style={{ width: 80 }}
          />
        </div>

        <p style={{ fontSize: 12, color: 'var(--color-muted)', margin: '4px 0', fontWeight: 600 }}>Resources (optional)</p>
        {taskForm.resources.map((r, i) => (
          <div className="form-row" key={i}>
            <input
              placeholder="Label (e.g. Tutorial video)"
              value={r.label}
              onChange={(e) => updateResource(i, 'label', e.target.value)}
              style={{ flex: 1, minWidth: 160 }}
            />
            <input
              placeholder="https://..."
              value={r.url}
              onChange={(e) => updateResource(i, 'url', e.target.value)}
              style={{ flex: 2, minWidth: 200 }}
            />
            {taskForm.resources.length > 1 && (
              <button type="button" className="btn" onClick={() => removeResourceField(i)}>
                Remove
              </button>
            )}
          </div>
        ))}
        <button type="button" className="btn" onClick={addResourceField} style={{ marginBottom: 12 }}>
          + Add another link
        </button>
        <br />

        <button type="submit" className="btn btn-primary">Create task</button>
      </form>
      </div>

      {/* ── Interns list ── */}
      <div id="interns">
      <SectionHeading icon={<Users size={18} />} title="Interns" />
      <div className="card" style={{ marginTop: 12 }}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Track</th>
              <th>Status</th>
              <th>Tasks</th>
              <th>Progress</th>
            </tr>
          </thead>
          <tbody>
            {interns.map((i) => (
              <tr key={i.id}>
                <td>{i.name}</td>
                <td>{i.track || '—'}</td>
                <td>
                  <span className={`badge ${i.status === 'pending' ? 'badge-warning' : 'badge-success'}`}>
                    {i.status === 'pending' ? 'Pending invite' : 'Active'}
                  </span>
                </td>
                <td>{i.completed}/{i.totalTasks}</td>
                <td>{i.progress}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
      </div>
    </DashboardLayout>
  );
};

const SectionHeading = ({ icon, title, children }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
    <span style={{ color: 'var(--color-green-light)' }}>{icon}</span>
    <h3 style={{ margin: 0 }}>{title}</h3>
    {children}
  </div>
);

const ReviewCard = ({ task, onReview }) => {
  const [feedback, setFeedback] = useState('');

  return (
    <div className="task-card" style={{ marginBottom: 10 }}>
      <div className="task-card-top">
        <strong className="task-title">{task.title}</strong>
        <span className="badge badge-info">Pending review</span>
      </div>
      <p className="task-meta">Submitted by {task.assignedTo?.name}</p>

      {task.submission?.submissionLink && (
        <p style={{ fontSize: 13, margin: '6px 0' }}>
          Link:{' '}
          <a href={task.submission.submissionLink} target="_blank" rel="noreferrer">
            {task.submission.submissionLink}
          </a>
        </p>
      )}
      {task.submission?.submissionNotes && (
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '6px 0' }}>
          Notes: {task.submission.submissionNotes}
        </p>
      )}

      <textarea
        placeholder="Feedback (optional)"
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        style={{ marginBottom: 8 }}
      />

      <div className="form-row" style={{ marginBottom: 0 }}>
        <button
          className="btn btn-primary"
          onClick={() => onReview(task.submission._id, 'approved', feedback)}
        >
          Approve
        </button>
        <button
          className="btn"
          onClick={() => onReview(task.submission._id, 'changes_requested', feedback)}
        >
          Request changes
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
