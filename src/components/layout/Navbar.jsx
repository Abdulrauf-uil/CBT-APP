import { useNavigate, useLocation } from 'react-router-dom';
import { clearAdminSession, clearStudentSession } from '../../utils/storage';

export default function Navbar({ role, userName }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === '/';
  const isLoginPage = location.pathname.includes('/login');

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
        <div className="navbar-left">
          <div className="navbar-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <img src="/logo.png" alt="Logo" className="navbar-logo-img" />
            <span className="navbar-title">CBT Portal</span>
          </div>

          {role === 'admin' && (
            <nav className="navbar-menu">
              <span className="nav-link" onClick={() => navigate('/admin/dashboard')}>Dashboard</span>
              <span className="nav-link" onClick={() => navigate('/admin/students')}>Students</span>
              <span className="nav-link" onClick={() => navigate('/admin/tests')}>Tests</span>
            </nav>
          )}
        </div>

        {!isHome && !isLoginPage && (
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

        .navbar-left {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .navbar-menu {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .nav-link {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-secondary);
          cursor: pointer;
          transition: color 0.2s;
        }

        .nav-link:hover {
          color: var(--color-primary);
        }

        .navbar-logo-img {
          height: 36px;
          border-radius: var(--radius-sm);
          object-fit: contain;
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
