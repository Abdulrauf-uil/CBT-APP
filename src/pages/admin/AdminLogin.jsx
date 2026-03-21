import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateAdmin, setAdminSession } from '../../utils/storage';
import Navbar from '../../components/layout/Navbar';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const isValid = await validateAdmin(form.username, form.password);
      if (isValid) {
        setAdminSession();
        navigate('/admin/dashboard');
      } else {
        setError('Invalid username or password.');
      }
    } catch (err) {
      console.error(err);
      setError('Error connecting to database.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Navbar />
      <main className="auth-main container animate-slide-up">
        <div className="auth-card card">
          <div className="auth-header">
            <span className="auth-icon">🛡️</span>
            <h1>Admin Login</h1>
            <p>Sign in to manage students and tests</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">Username</label>
              <input
                className="input-field"
                type="text"
                required
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="admin"
                autoComplete="username"
              />
            </div>
            <div className="input-group">
              <label className="input-label">Password</label>
              <input
                className="input-field"
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
            {error && <p className="auth-error">{error}</p>}
            <button type="submit" className="btn btn-primary auth-submit-btn" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
      </main>

      <style>{`
        .auth-page {
          min-height: 100vh;
          background: radial-gradient(ellipse at top, rgba(79,70,229,0.08) 0%, transparent 60%);
        }
        .auth-main {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 4rem 1rem;
        }
        .auth-card {
          width: 100%;
          max-width: 420px;
          padding: 2.5rem;
        }
        .auth-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .auth-icon {
          font-size: 2.5rem;
          display: block;
          margin-bottom: 0.75rem;
        }
        .auth-header h1 {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }
        .auth-header p {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }
        .auth-error {
          font-size: 0.8125rem;
          color: var(--color-danger);
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: var(--radius-md);
          padding: 0.5rem 0.75rem;
          margin-bottom: 1rem;
        }
        .auth-submit-btn {
          width: 100%;
          padding: 0.7rem;
          font-size: 0.9375rem;
          margin-top: 0.25rem;
        }
        .auth-hint {
          margin-top: 1.5rem;
          font-size: 0.75rem;
          color: var(--text-muted);
          text-align: center;
        }
        .auth-hint code {
          background: var(--bg-surface-hover);
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
        }
      `}</style>
    </div>
  );
}
