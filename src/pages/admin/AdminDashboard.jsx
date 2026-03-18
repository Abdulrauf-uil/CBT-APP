import { useNavigate } from 'react-router-dom';
import { getStudents, getTests, getResults } from '../../utils/storage';
import Navbar from '../../components/layout/Navbar';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const students = getStudents();
  const tests = getTests();
  const results = getResults();

  const stats = [
    { label: 'Students', value: students.length, icon: '👥', color: '#4F46E5' },
    { label: 'Tests', value: tests.length, icon: '📝', color: '#0ea5e9' },
    { label: 'Submissions', value: results.length, icon: '✅', color: '#22c55e' },
  ];

  const actions = [
    { label: 'Manage Students', desc: 'Add or remove registered students', icon: '👥', path: '/admin/students' },
    { label: 'Manage Tests', desc: 'View, edit, and delete existing tests', icon: '📋', path: '/admin/tests' },
    { label: 'Create New Test', desc: 'Build a new timed multiple-choice test', icon: '➕', path: '/admin/tests/create' },
  ];

  return (
    <div className="admin-page">
      <Navbar role="admin" userName="Admin" />
      <main className="container animate-slide-up" style={{ padding: '2.5rem 1rem' }}>
        <div className="page-header">
          <h1>Admin Dashboard</h1>
          <p>Overview of your CBT platform</p>
        </div>

        {/* Stats Row */}
        <div className="stats-grid">
          {stats.map((s) => (
            <div key={s.label} className="stat-card card">
              <div className="stat-icon" style={{ background: s.color + '1A', color: s.color }}>
                {s.icon}
              </div>
              <div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <h2 className="section-title">Quick Actions</h2>
        <div className="actions-grid">
          {actions.map((action) => (
            <div key={action.label} className="action-card card" onClick={() => navigate(action.path)}>
              <div className="action-icon">{action.icon}</div>
              <div>
                <div className="action-title">{action.label}</div>
                <div className="action-desc">{action.desc}</div>
              </div>
              <span className="action-arrow">→</span>
            </div>
          ))}
        </div>
      </main>

      <style>{`
        .admin-page { min-height: 100vh; }
        .page-header { margin-bottom: 2rem; }
        .page-header h1 { font-size: 1.75rem; font-weight: 700; margin-bottom: 0.25rem; }
        .page-header p { color: var(--text-secondary); font-size: 0.9375rem; }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1.25rem;
          margin-bottom: 2.5rem;
        }
        .stat-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
        }
        .stat-icon {
          font-size: 1.6rem;
          width: 52px;
          height: 52px;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .stat-value { font-size: 1.75rem; font-weight: 700; line-height: 1; }
        .stat-label { font-size: 0.8125rem; color: var(--text-secondary); margin-top: 0.25rem; }

        .section-title { font-size: 1.125rem; font-weight: 600; margin-bottom: 1rem; }

        .actions-grid {
          display: flex;
          flex-direction: column;
          gap: 0.875rem;
        }
        .action-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem 1.5rem;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
        }
        .action-card:hover {
          border-color: var(--color-primary);
          transform: translateX(4px);
          box-shadow: var(--shadow-md);
        }
        .action-icon { font-size: 1.5rem; width: 40px; flex-shrink: 0; text-align: center; }
        .action-title { font-size: 0.9375rem; font-weight: 600; }
        .action-desc { font-size: 0.8125rem; color: var(--text-secondary); margin-top: 0.125rem; }
        .action-arrow { margin-left: auto; font-size: 1.25rem; color: var(--text-muted); }
      `}</style>
    </div>
  );
}
