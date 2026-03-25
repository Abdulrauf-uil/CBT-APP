import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getResultsByTest, getTestById, removeResult } from '../../utils/storage';
import * as XLSX from 'xlsx';
import Navbar from '../../components/layout/Navbar';

export default function TestSubmissions() {
  const navigate = useNavigate();
  const { testId } = useParams();
  const [results, setResults] = useState([]);
  const [test, setTest] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const [r, t] = await Promise.all([getResultsByTest(testId), getTestById(testId)]);
      setResults(r);
      setTest(t);
    };
    fetchData();
  }, [testId]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this submission? This will allow the student to retake the test.')) return;
    try {
      await removeResult(id);
      setResults(results.filter(r => r.id !== id));
    } catch (error) {
      console.error("Error deleting result:", error);
      alert("Failed to delete submission.");
    }
  };

  // Sort by newest first
  const sortedResults = [...results].sort((a, b) => b.submittedAt - a.submittedAt);

  const exportToExcel = () => {
    if (sortedResults.length === 0) return alert('No results to export.');
    
    // Format data for Excel
    const data = sortedResults.map(r => {
      let correctCount = 0;
      r.questions.forEach((q, i) => {
        if (r.answers[i] === q.correct) correctCount++;
      });
      const pct = Math.round((correctCount / r.totalQuestions) * 100);
      const passed = pct >= 50;
      
      return {
        'Student Name': r.studentName,
        'Score (%)': `${pct}%`,
        'Correct Answers': correctCount,
        'Total Questions': r.totalQuestions,
        'Status': passed ? 'Passed' : 'Failed',
        'Date Submitted': new Date(r.submittedAt).toLocaleString()
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Submissions");
    XLSX.writeFile(wb, `${test?.title || 'Test'}_Results.xlsx`);
  };

  return (
    <div className="manage-page">
      <Navbar role="admin" userName="Admin" />
      <main className="container animate-slide-up" style={{ padding: '2.5rem 1rem' }}>
        <div className="page-header-row">
          <div>
            <h1>{test?.title || 'Unknown Test'}</h1>
            <p>Student Submissions</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={exportToExcel}>
              📥 Export to Excel
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/admin/tests')}>
              ← Back to Manage Tests
            </button>
          </div>
        </div>

        {sortedResults.length === 0 ? (
          <div className="empty-state card">
            <span>📊</span>
            <p>No test results yet. When students complete tests, they will appear here.</p>
          </div>
        ) : (
          <div className="card results-table-wrapper">
            <table className="results-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {sortedResults.map((r) => {
                  let correctCount = 0;
                  r.questions.forEach((q, i) => {
                    if (r.answers[i] === q.correct) correctCount++;
                  });
                  const pct = Math.round((correctCount / r.totalQuestions) * 100);
                  const passed = pct >= 50;

                  return (
                    <tr key={r.id}>
                      <td className="fw-600">{r.studentName}</td>
                      <td className="fw-700">{pct}%</td>
                      <td>
                        <span className={`status-badge ${passed ? 'badge-pass' : 'badge-fail'}`}>
                          {passed ? 'Passed' : 'Failed'}
                        </span>
                      </td>
                      <td className="text-sm">
                        {new Date(r.submittedAt).toLocaleDateString()} {new Date(r.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <Link to={`/admin/results/${r.id}`} className="btn btn-primary btn-sm">
                          View Details
                        </Link>
                        <button 
                          className="btn btn-danger btn-sm" 
                          onClick={() => handleDelete(r.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <style>{`
        .manage-page { min-height: 100vh; }
        .page-header-row {
          display: flex; align-items: flex-start; justify-content: space-between;
          gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap;
        }
        .page-header-row h1 { font-size: 1.75rem; font-weight: 700; }
        .page-header-row p { color: var(--text-secondary); font-size: 0.9rem; }

        .results-table-wrapper { overflow-x: auto; padding: 0.5rem; }
        .results-table { width: 100%; border-collapse: collapse; text-align: left; }
        .results-table th {
          padding: 1rem; font-size: 0.8125rem; font-weight: 600;
          color: var(--text-secondary); border-bottom: 1px solid var(--border-color);
        }
        .results-table td {
          padding: 1rem; border-bottom: 1px solid var(--border-color);
          vertical-align: middle; font-size: 0.9375rem;
        }
        .results-table tbody tr:last-child td { border-bottom: none; }
        .results-table tbody tr:hover { background-color: var(--bg-surface-hover); }

        .fw-600 { font-weight: 600; }
        .fw-700 { font-weight: 700; }
        .text-sm { font-size: 0.8125rem; color: var(--text-secondary); }

        .status-badge {
          font-size: 0.75rem; font-weight: 700; padding: 0.25rem 0.625rem;
          border-radius: var(--radius-full); display: inline-block;
        }
        .badge-pass { background: rgba(34,197,94,0.15); color: #16a34a; }
        .badge-fail { background: rgba(239,68,68,0.15); color: var(--color-danger); }

        .empty-state {
          display: flex; flex-direction: column; align-items: center; gap: 0.75rem;
          padding: 3rem; text-align: center; color: var(--text-muted);
        }
        .empty-state span { font-size: 3rem; }

        .btn-sm { padding: 0.375rem 0.75rem; font-size: 0.8125rem; }
      `}</style>
    </div>
  );
}
