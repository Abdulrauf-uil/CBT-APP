import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTests, removeTest } from '../../utils/storage';
import Navbar from '../../components/layout/Navbar';

export default function ManageTests() {
  const navigate = useNavigate();
  const [tests, setTests] = useState(getTests);

  const refresh = () => setTests(getTests());

  const handleDelete = (id) => {
    if (confirm('Delete this test? All student results for it will be unaffected but the test will no longer be available.')) {
      removeTest(id);
      refresh();
    }
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
            {tests.map((t) => (
              <div key={t.id} className="test-card card">
                <div className="test-card-header">
                  <div className="test-icon">📝</div>
                  <div className="test-badge">{t.duration} min</div>
                </div>
                <h3 className="test-title">{t.title}</h3>
                <p className="test-meta">{t.questions?.length ?? 0} question{(t.questions?.length ?? 0) !== 1 ? 's' : ''}</p>
                <p className="test-date">Created: {new Date(t.createdAt).toLocaleDateString()}</p>
                <div className="test-actions">
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t.id)}>Delete</button>
                </div>
              </div>
            ))}
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
        .test-meta { font-size: 0.8125rem; color: var(--text-secondary); }
        .test-date { font-size: 0.75rem; color: var(--text-muted); }
        .test-actions { display: flex; justify-content: flex-end; margin-top: 0.75rem; }

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

        .btn-sm { padding: 0.375rem 0.75rem; font-size: 0.8125rem; }
      `}</style>
    </div>
  );
}
