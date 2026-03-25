import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTests, getStudentSession, getResultsByStudent } from '../../utils/storage';
import Navbar from '../../components/layout/Navbar';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const student = getStudentSession();
  const [tests, setTests] = useState([]);
  const [results, setResults] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const [allTests, allResults] = await Promise.all([
        getTests(),
        getResultsByStudent(student?.id ?? '')
      ]);
      // Filter tests: either assigned to All Students (no groupId) or matches student's groupId
      const filtered = allTests.filter(t => !t.groupId || t.groupId === student?.groupId);
      setTests(filtered);
      setResults(allResults);
    };
    fetchData();
  }, [student?.id, student?.groupId]);

  const getAttempts = (testId) => results.filter((r) => r.testId === testId).length;
  const getLatestResultId = (testId) => {
    const testResults = results.filter((r) => r.testId === testId);
    if (testResults.length === 0) return null;
    return testResults.sort((a, b) => b.submittedAt - a.submittedAt)[0].id;
  };

  return (
    <div className="student-dash-page">
      <Navbar role="student" userName={student?.name} />
      <main className="container animate-slide-up" style={{ padding: '2.5rem 1rem' }}>
        <div className="page-header">
          <h1>Welcome, {student?.name}! 👋</h1>
          <p>Select a test below to begin. Make sure you're ready before starting — the timer begins immediately.</p>
        </div>

        {tests.length === 0 ? (
          <div className="empty-state card">
            <span>📋</span>
            <p>No tests are available yet. Check back with your administrator.</p>
          </div>
        ) : (
          <div className="tests-grid">
            {tests.map((t) => {
              const attempts = getAttempts(t.id);
              return (
                <div key={t.id} className="test-card card">
                  <div className="test-card-top">
                    <div className="test-icon-badge">📝</div>
                    <div className="test-badges">
                      <span className="badge badge-primary">{t.duration} min</span>
                      <span className="badge badge-neutral">{t.questions?.length ?? 0} Qs</span>
                      {attempts > 0 && <span className="badge badge-green">Attempted ×{attempts}</span>}
                      {t.attempts > 0 && <span className="badge badge-neutral">Limit: {t.attempts}</span>}
                      {t.isOpen === false && <span className="badge badge-danger">Closed</span>}
                    </div>
                  </div>
                  <h3 className="test-title">{t.title}</h3>

                  <div className="test-actions">
                    <button
                      className={`btn start-btn ${t.isOpen === false ? 'btn-danger' : (attempts >= t.attempts && t.attempts > 0 ? 'btn-secondary' : 'btn-primary')}`}
                      disabled={t.isOpen === false || (attempts >= t.attempts && t.attempts > 0)}
                      onClick={() => navigate(`/student/test/${t.id}`)}
                    >
                      {t.isOpen === false 
                        ? 'Test Closed' 
                        : (t.attempts > 0 && attempts >= t.attempts 
                            ? 'Limit Reached' 
                            : (attempts > 0 ? 'Retake Test' : 'Start Test') + ' →')}
                    </button>
                    {attempts > 0 && (
                      <button 
                        className="btn btn-secondary view-results-btn"
                        onClick={() => navigate(`/student/result/${getLatestResultId(t.id)}`)}
                      >
                        View Results
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <style>{`
        .student-dash-page { min-height: 100vh; }
        .page-header { margin-bottom: 2rem; }
        .page-header h1 { font-size: 1.75rem; font-weight: 700; margin-bottom: 0.4rem; }
        .page-header p { color: var(--text-secondary); font-size: 0.9375rem; max-width: 580px; line-height: 1.6; }

        .tests-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.25rem;
        }

        .test-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .test-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
          border-color: var(--color-secondary);
        }

        .test-card-top { display: flex; align-items: flex-start; justify-content: space-between; }
        .test-icon-badge { font-size: 2rem; }
        .test-badges { display: flex; flex-wrap: wrap; gap: 0.375rem; justify-content: flex-end; }

        .badge {
          font-size: 0.6875rem; font-weight: 600; padding: 0.2rem 0.5rem;
          border-radius: var(--radius-full); display: inline-block;
        }
        .badge-primary { background: var(--color-primary-light); color: var(--color-primary); }
        .badge-neutral { background: var(--bg-surface-hover); color: var(--text-secondary); }
        .badge-green { background: rgba(34,197,94,0.1); color: #16a34a; }
        .badge-danger { background: var(--color-danger-light); color: var(--color-danger); }

        .test-title { font-size: 1.0625rem; font-weight: 700; flex: 1; }
        .test-actions { display: flex; flex-direction: column; gap: 0.5rem; }
        .start-btn { width: 100%; font-size: 0.9375rem; padding: 0.625rem; }
        .view-results-btn { width: 100%; font-size: 0.9375rem; padding: 0.625rem; }

        .empty-state {
          display: flex; flex-direction: column; align-items: center; gap: 0.75rem;
          padding: 3rem; text-align: center; color: var(--text-muted);
        }
        .empty-state span { font-size: 3rem; }
      `}</style>
    </div>
  );
}
