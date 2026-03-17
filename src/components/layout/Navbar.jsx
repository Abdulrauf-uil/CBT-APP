import { useNavigate, useLocation } from 'react-router-dom';
import { clearAdminSession, clearStudentSession } from '../../utils/storage';

export default function Navbar({ role, userName }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === '/';

  const handleLogout = () => {
    if (role === 'admin') {
      clearAdminSession();
      navigate('/admin/login');
    } else if (role === 'student') {
      clearStudentSession();
      navigate('/student/login');
    } else {
      navigate('/');
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-inner container">
        <div className="navbar-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <span className="navbar-logo">📋</span>
          <span className="navbar-title">CBT Portal</span>
        </div>

        {!isHome && (
          <div className="navbar-right">
            {userName && (
              <span className="navbar-user">
                <span className="navbar-user-icon">
                  {role === 'admin' ? '🛡️' : '👤'}
                </span>
                {userName}
              </span>
            )}
            <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>

      <style>{`
        .navbar {
          position: sticky;
          top: 0;
          z-index: 100;
          background: var(--glass-bg);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--glass-border);
          padding: 0.75rem 0;
        }

        .navbar-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .navbar-logo {
          font-size: 1.4rem;
        }

        .navbar-title {
          font-size: 1.125rem;
          font-weight: 700;
          background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .navbar-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .navbar-user {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .btn-sm {
          padding: 0.375rem 0.75rem;
          font-size: 0.8125rem;
        }
      `}</style>
    </header>
  );
}
