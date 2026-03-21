import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTests, removeTest, getGroups, getResultsByTest, updateTest } from '../../utils/storage';
import Navbar from '../../components/layout/Navbar';

export default function ManageTests() {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    const [t, g] = await Promise.all([getTests(), getGroups()]);
    setTests(t);
    setGroups(g);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleDelete = async (id) => {
    if (confirm('Delete this test? All student results for it will be unaffected but the test will no longer be available.')) {
      await removeTest(id);
      refresh();
    }
  };

  const handleToggleStatus = async (test) => {
    const newStatus = test.isOpen === false ? true : false;
    await updateTest(test.id, { isOpen: newStatus });
    refresh();
  };

  return (
    <div className="manage-page">
      <Navbar role="admin" userName="Admin" />
      <main className="container animate-slide-up" style={{ padding: '2.5rem 1rem' }}>
        <div className="page-header-row">
          <div>
            <h1>Manage Tests</h1>
            <p>{tests.length} test{tests.length !== 1 ? 's' : ''} available</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/admin/tests/create')}>
            + Create Test
          </button>
        </div>

        {tests.length === 0 ? (
          <div className="empty-state card">
            <span>📋</span>
            <p>No tests created yet. Create your first test!</p>
            <button className="btn btn-primary" onClick={() => navigate('/admin/tests/create')}>
              Create a Test
            </button>
          </div>
        ) : (
          <div className="tests-grid">
            {tests.map((t) => {
              const groupLabel = t.groupId ? groups.find(g => g.id === t.groupId)?.name || 'Unknown Group' : 'All Students';
              const resultsCount = getResultsByTest(t.id).length;

              return (
                <div key={t.id} className="test-card card">
                  <div className="test-card-header">
                    <div className="test-icon">📝</div>
                    <div className="test-badge">{t.duration} min</div>
                  </div>
                  <h3 className="test-title">{t.title}</h3>
                  <p className="test-meta">
                    {(t.questions?.length ?? 0)} question{((t.questions?.length ?? 0) !== 1 ? 's' : '')}
                    <span className="dot-divider">•</span> Assigned: <span className="group-badge">{groupLabel}</span>
                  </p>
                  
                  <div className="status-toggle-row">
                    <span className={`status-label ${t.isOpen !== false ? 'status-open' : 'status-closed'}`}>
                      {t.isOpen !== false ? '● Open' : '○ Closed'}
                    </span>
                    <label className="switch">
                      <input 
                        type="checkbox" 
                        checked={t.isOpen !== false} 
                        onChange={() => handleToggleStatus(t)}
                      />
                      <span className="slider round"></span>
                    </label>
                  </div>

                  <p className="test-date">Created: {new Date(t.createdAt).toLocaleDateString()}</p>
                  
                  <div className="test-stats-row">
                    <span className="stat-pill">{resultsCount} Submission{resultsCount !== 1 ? 's' : ''}</span>
                  </div>

                  <div className="test-actions">
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/admin/results/test/${t.id}`)}>View Submissions</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/admin/tests/edit/${t.id}`)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t.id)}>Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <style>{`
        .manage-page { min-height: 100vh; }
        .page-header-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }
        .page-header-row h1 { font-size: 1.75rem; font-weight: 700; }
        .page-header-row p { color: var(--text-secondary); font-size: 0.9rem; }

        .tests-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 1.25rem;
        }

        .test-card { padding: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem; }
        .test-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; }
        .test-icon { font-size: 1.75rem; }
        .test-badge {
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.25rem 0.625rem;
          border-radius: var(--radius-full);
          background: var(--color-primary-light);
          color: var(--color-primary);
        }
        .test-title { font-size: 1.0625rem; font-weight: 700; }
        .test-meta { font-size: 0.8125rem; color: var(--text-secondary); margin-top: 0.25rem; }
        .dot-divider { margin: 0 0.5rem; color: var(--border-color); }
        .group-badge { font-weight: 600; color: var(--text-primary); }
        .test-date { font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem; }

        .test-stats-row { margin-top: 1rem; border-top: 1px solid var(--border-color); padding-top: 1rem; }
        .stat-pill { font-size: 0.8125rem; font-weight: 600; color: var(--text-secondary); background: var(--bg-surface-hover); padding: 0.2rem 0.5rem; border-radius: var(--radius-sm); }

        .test-actions { display: flex; gap: 0.5rem; margin-top: 1rem; flex-wrap: wrap; }
        .test-actions .btn { flex: 1; text-align: center; }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 3rem;
          text-align: center;
          color: var(--text-muted);
        }
        .empty-state span { font-size: 3rem; }

        .status-toggle-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 0.5rem;
          padding: 0.5rem 0.75rem;
          background: var(--bg-surface-hover);
          border-radius: var(--radius-md);
        }
        .status-label { font-size: 0.8125rem; font-weight: 700; }
        .status-open { color: var(--color-success); }
        .status-closed { color: var(--color-danger); }

        /* Switch styles */
        .switch {
          position: relative;
          display: inline-block;
          width: 34px;
          height: 20px;
        }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: #ccc;
          transition: .4s;
          border-radius: 20px;
        }
        .slider:before {
          position: absolute;
          content: "";
          height: 14px;
          width: 14px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }
        input:checked + .slider { background-color: var(--color-primary); }
        input:focus + .slider { box-shadow: 0 0 1px var(--color-primary); }
        input:checked + .slider:before { transform: translateX(14px); }

        .btn-sm { padding: 0.375rem 0.75rem; font-size: 0.8125rem; }
      `}</style>
    </div>
  );
}
