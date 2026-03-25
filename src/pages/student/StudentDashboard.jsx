import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTests, getStudentSession, getResultsByStudent, updateStudent, setStudentSession } from '../../utils/storage';
import Navbar from '../../components/layout/Navbar';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const student = getStudentSession();
  const [tests, setTests] = useState([]);
  const [results, setResults] = useState([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isUpdatingPwd, setIsUpdatingPwd] = useState(false);

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

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    
    if (passwordForm.current !== student?.password) {
      setPasswordError('Current password is incorrect.');
      return;
    }
    if (passwordForm.new !== passwordForm.confirm) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (passwordForm.new.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }
    
    try {
      setIsUpdatingPwd(true);
      await updateStudent(student.id, { password: passwordForm.new });
      const updatedStudent = { ...student, password: passwordForm.new };
      setStudentSession(updatedStudent);
      setPasswordSuccess('Password successfully updated!');
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordForm({ current: '', new: '', confirm: '' });
        setPasswordSuccess('');
      }, 2000);
    } catch (err) {
      console.error(err);
      setPasswordError('Failed to update password. Please try again.');
    } finally {
      setIsUpdatingPwd(false);
    }
  };

  return (
    <div className="student-dash-page">
      <Navbar role="student" userName={student?.name} />
      <main className="container animate-slide-up" style={{ padding: '2.5rem 1rem' }}>
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>Welcome, {student?.name}! 👋</h1>
            <p>Select a test below to begin. Make sure you're ready before starting — the timer begins immediately.</p>
          </div>
          <button className="btn btn-secondary" onClick={() => setShowPasswordModal(true)}>
            Change Password
          </button>
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

      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal-content card">
            <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Change Password</h2>
            {passwordError && <div className="alert alert-danger">{passwordError}</div>}
            {passwordSuccess && <div className="alert alert-success">{passwordSuccess}</div>}
            <form onSubmit={handlePasswordChange}>
              <div className="form-group">
                <label>Current Password</label>
                <input 
                  type="password" 
                  className="form-control" 
                  value={passwordForm.current} 
                  onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input 
                  type="password" 
                  className="form-control" 
                  value={passwordForm.new} 
                  onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input 
                  type="password" 
                  className="form-control" 
                  value={passwordForm.confirm} 
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })} 
                  required 
                />
              </div>
              <div className="modal-actions" style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowPasswordModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isUpdatingPwd}>
                  {isUpdatingPwd ? 'Updating...' : 'Save Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

        .modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.5);
          display: flex; align-items: center; justify-content: center; z-index: 1000;
        }
        .modal-content {
          background: var(--bg-surface); padding: 2rem; border-radius: var(--radius-lg);
          width: 90%; max-width: 400px;
        }
        .form-group { margin-bottom: 1rem; }
        .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; font-size: 0.9375rem; color: var(--text-primary); }
        .form-control { 
          width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); 
          border-radius: var(--radius-md); background: var(--bg-surface); color: var(--text-primary); 
        }
        .form-control:focus { outline: none; border-color: var(--color-primary); box-shadow: 0 0 0 3px var(--color-primary-light); }
        .alert { padding: 0.75rem; border-radius: var(--radius-md); margin-bottom: 1rem; font-size: 0.9375rem; }
        .alert-danger { background: var(--color-danger-light); color: var(--color-danger); border: 1px solid rgba(239, 68, 68, 0.2); }
        .alert-success { background: rgba(34,197,94,0.1); color: #16a34a; border: 1px solid rgba(22, 163, 74, 0.2); }
      `}</style>
    </div>
  );
}
