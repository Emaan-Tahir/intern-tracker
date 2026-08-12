import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import api from '../lib/axios';
import { useAuth } from '../features/auth/AuthContext';

const MIN_PASSWORD_LENGTH = 8;

const AcceptInvitePage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { setUserAfterInvite } = useAuth();

  const [status, setStatus] = useState('checking'); // checking | valid | invalid
  const [invitee, setInvitee] = useState(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('invalid');
      return;
    }
    api
      .get(`/auth/invite/${token}`)
      .then(({ data }) => {
        setInvitee(data);
        setStatus('valid');
      })
      .catch(() => setStatus('invalid'));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < MIN_PASSWORD_LENGTH) {
      return setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
    }
    if (password !== confirm) {
      return setError('Passwords do not match');
    }

    try {
      const { data } = await api.post('/auth/accept-invite', { token, password });
      setUserAfterInvite(data.token, data.user);
      navigate(data.user.role === 'admin' ? '/admin' : '/intern');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  if (status === 'checking') {
    return <div className="login-wrap"><p>Checking your invite...</p></div>;
  }

  if (status === 'invalid') {
    return (
      <div className="login-wrap">
        <div className="login-card">
          <h2>Invite link invalid</h2>
          <p>This invite link is invalid or has expired. Ask your admin to send you a new one.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <h2>Welcome, {invitee.name}</h2>
        <p className="page-subtitle" style={{ marginBottom: 16 }}>
          Set a password to activate your account ({invitee.email})
        </p>
        <form onSubmit={handleSubmit}>
          <label className="field-label">Password</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={MIN_PASSWORD_LENGTH}
              required
              style={{ width: '100%', paddingRight: 40 }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              style={{
                position: 'absolute',
                right: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                padding: 4,
                cursor: 'pointer',
                color: 'var(--color-muted)',
                display: 'flex',
              }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <p style={{ fontSize: 11.5, color: 'var(--color-muted)', margin: '4px 0 14px' }}>
            At least {MIN_PASSWORD_LENGTH} characters
          </p>

          <label className="field-label">Confirm password</label>
          <input
            type={showPassword ? 'text' : 'password'}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            minLength={MIN_PASSWORD_LENGTH}
            required
          />

          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Set password & continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default AcceptInvitePage;
