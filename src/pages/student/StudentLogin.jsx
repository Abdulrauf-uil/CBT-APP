import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateStudent, setStudentSession } from '../../utils/storage';
import Navbar from '../../components/layout/Navbar';

export default function StudentLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const student = await validateStudent(form.email, form.password);
      if (student) {
        setStudentSession(student);
        navigate('/student/dashboard');
      } else {
        setError('Invalid credentials or you are not registered. Please contact your admin.');
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
            <span className="auth-icon">🎓</span>
            <h1>Student Login</h1>
            <p>Only registered students can access tests</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">Email / Login ID</label>
              <input className="input-field" type="text" required
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="your@email.com" autoComplete="username" />
            </div>
            <div className="input-group">
              <label className="input-label">Password</label>
              <input className="input-field" type="password" required
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••" autoComplete="current-password" />
            </div>

            {error && <p className="auth-error">{error}</p>}

            <button type="submit" className="btn btn-primary auth-submit-btn" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="auth-hint">
            Not registered? Ask your administrator to add your account.
          </p>
        </div>
      </main>

      <style>{`
        .auth-page {
          min-height: 100vh;
          background: radial-gradient(ellipse at top, rgba(14,165,233,0.08) 0%, transparent 60%);
        }
        .auth-main { display: flex; justify-content: center; align-items: center; padding: 4rem 1rem; }
        .auth-card { width: 100%; max-width: 420px; padding: 2.5rem; }
        .auth-header { text-align: center; margin-bottom: 2rem; }
        .auth-icon { font-size: 2.5rem; display: block; margin-bottom: 0.75rem; }
        .auth-header h1 { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.25rem; }
        .auth-header p { font-size: 0.875rem; color: var(--text-secondary); }
        .auth-error {
          font-size: 0.8125rem; color: var(--color-danger);
          background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2);
          border-radius: var(--radius-md); padding: 0.5rem 0.75rem; margin-bottom: 1rem;
        }
        .auth-submit-btn { width: 100%; padding: 0.7rem; font-size: 0.9375rem; margin-top: 0.25rem; }
        .auth-hint { margin-top: 1.5rem; font-size: 0.75rem; color: var(--text-muted); text-align: center; }
      `}</style>
    </div>
  );
}
