import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStudents, getTests } from '../../utils/storage';
import Navbar from '../../components/layout/Navbar';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [statsData, setStatsData] = useState({ students: 0, tests: 0 });

  useEffect(() => {
    const fetchData = async () => {
      const [s, t] = await Promise.all([getStudents(), getTests()]);
      setStatsData({ students: s.length, tests: t.length });
    };
    fetchData();
  }, []);

  const stats = [
    { label: 'Students', value: statsData.students, icon: '👥', color: '#4F46E5' },
    { label: 'Tests', value: statsData.tests, icon: '📝', color: '#0ea5e9' },
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 className="section-title" style={{ margin: 0 }}>Quick Actions</h2>
          <button 
            className="btn btn-secondary btn-sm" 
            onClick={async () => {
              if (confirm('Migrate all local data to Firestore? This will merge your current device data with the cloud database.')) {
                const { migrateToCloud } = await import('../../utils/storage');
                await migrateToCloud();
                alert('Migration complete!');
                window.location.reload();
              }
            }}
          >
            ☁️ Migrate Local Data to Cloud
          </button>
        </div>
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
