import { useParams, useNavigate } from 'react-router-dom';
import { getResults } from '../../utils/storage';
import Navbar from '../../components/layout/Navbar';
import MathRenderer from '../../components/common/MathRenderer';

export default function AdminResultDetail() {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const results = getResults();
  const result = results.find((r) => r.id === resultId);

  if (!result) {
    return (
      <div className="manage-page">
        <Navbar role="admin" userName="Admin" />
        <main className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
          <h2>Result not found.</h2>
          <button className="btn btn-primary" style={{ marginTop: '1rem' }}
            onClick={() => navigate('/admin/tests')}>Back to Manage Tests</button>
        </main>
      </div>
    );
  }

  const totalQ = result.totalQuestions;
  let correctCount = 0;
  result.questions.forEach((q, i) => {
    if (result.answers[i] === q.correct) correctCount++;
  });
  const percentage = Math.round((correctCount / totalQ) * 100);
  const passed = percentage >= 50;

  return (
    <div className="manage-page">
      <Navbar role="admin" userName="Admin" />
      <main className="container animate-slide-up" style={{ padding: '2.5rem 1rem' }}>
        <div className="page-header-row">
          <div>
            <h1>{result.studentName}'s Test Submission</h1>
            <p>Score details and question breakdown for <strong>{result.testTitle}</strong></p>
          </div>
          <button className="btn btn-secondary" onClick={() => navigate(`/admin/results/test/${result.testId}`)}>
            ← Back to Submissions
          </button>
        </div>

        {/* Admin Score Card */}
        <div className="admin-score-card card">
          <div className="admin-score-header">
            <div>
              <div className="meta-label">Submitted On</div>
              <div className="meta-value">{new Date(result.submittedAt).toLocaleString()}</div>
            </div>
            <div>
              <div className="meta-label">Score</div>
              <div className="meta-value" style={{ fontSize: '1.5rem', color: passed ? 'var(--color-success)' : 'var(--color-danger)' }}>
                {percentage}% <span className="fraction">({correctCount}/{totalQ})</span>
              </div>
            </div>
            <div>
              <div className="meta-label">Status</div>
              <div className="meta-value">
                <span className={`status-badge ${passed ? 'badge-pass' : 'badge-fail'}`}>
                  {passed ? 'Passed' : 'Failed'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <h2 className="section-title">Question Breakdown</h2>
        <div className="breakdown-list">
           {result.questions.map((rawQ, i) => {
            const q = {
              ...rawQ,
              image: rawQ.image || null,
              options: rawQ.options.map(opt => 
                typeof opt === 'string' ? { text: opt, image: null } : opt
              )
            };
            const studentAns = result.answers[i];
            const isCorrect = studentAns === q.correct;
            const notAnswered = studentAns === undefined || studentAns === null;

            return (
              <div key={i} className={`breakdown-card card ${isCorrect ? 'correct' : 'wrong'}`}>
                <div className="bk-header">
                  <span className="bk-qnum">Question {i + 1}</span>
                  <span className={`bk-status ${isCorrect ? 'status-correct' : 'status-wrong'}`}>
                    {isCorrect ? '✓ Passed' : '✗ Failed'}
                  </span>
                </div>
                <div className="bk-q-content">
                  <MathRenderer text={q.text} className="bk-qtext" />
                  {q.image && <img src={q.image} alt="" className="bk-qimage" />}
                </div>
                <div className="bk-options">
                  {q.options.map((opt, oi) => {
                    const isStudentChoice = studentAns === oi;
                    const isCorrectOpt = q.correct === oi;
                    
                    let cls = 'bk-opt';
                    if (isCorrectOpt) cls += ' bk-opt-correct';
                    if (isStudentChoice && !isCorrectOpt) cls += ' bk-opt-wrong';
                    
                    return (
                      <div key={oi} className={cls} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%' }}>
                          <span className="bk-letter">{String.fromCharCode(65 + oi)}</span>
                          <MathRenderer text={opt.text} />
                          {isCorrectOpt && <span className="bk-tag bk-tag-green">Correct Answer</span>}
                          {isStudentChoice && !isCorrectOpt && <span className="bk-tag bk-tag-red">Student's Answer</span>}
                        </div>
                        {opt.image && <img src={opt.image} alt="" className="bk-opt-image" />}
                      </div>
                    );
                  })}
                  {notAnswered && (
                    <div className="not-answered-alert row">
                      Student did not select an answer.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <style>{`
        .manage-page { min-height: 100vh; }
        .page-header-row {
          display: flex; align-items: flex-start; justify-content: space-between;
          gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap;
        }
        .page-header-row h1 { font-size: 1.75rem; font-weight: 700; margin-bottom: 0.25rem; }
        .page-header-row p { color: var(--text-secondary); font-size: 0.9375rem; }
        .page-header-row p strong { color: var(--text-primary); }

        .admin-score-card { padding: 2rem; margin-bottom: 2.5rem; }
        .admin-score-header {
          display: flex; justify-content: space-around; flex-wrap: wrap; gap: 2rem;
          text-align: center;
        }
        .meta-label { font-size: 0.8125rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem; }
        .meta-value { font-size: 1.125rem; font-weight: 700; }
        .fraction { font-size: 0.875rem; color: var(--text-muted); font-weight: 600; }

        .status-badge {
          font-size: 0.875rem; font-weight: 700; padding: 0.35rem 1rem;
          border-radius: var(--radius-full); display: inline-block;
        }
        .badge-pass { background: rgba(34,197,94,0.15); color: #16a34a; }
        .badge-fail { background: rgba(239,68,68,0.15); color: var(--color-danger); }

        .section-title { font-size: 1.125rem; font-weight: 600; margin-bottom: 1rem; }

        .breakdown-list { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem; }
        .breakdown-card { padding: 1.25rem 1.75rem; }
        .breakdown-card.correct { border-left: 4px solid var(--color-success); }
        .breakdown-card.wrong { border-left: 4px solid var(--color-danger); }

        .bk-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; }
        .bk-qnum {
          font-size: 0.75rem; font-weight: 700; color: var(--text-secondary);
          background: var(--bg-surface-hover); padding: 0.2rem 0.6rem; border-radius: var(--radius-full);
        }
        .bk-status { font-size: 0.8125rem; font-weight: 600; }
        .status-correct { color: var(--color-success); }
        .status-wrong { color: var(--color-danger); }

        .bk-qtext { font-weight: 600; margin-bottom: 0.5rem; font-size: 1rem; }
        .bk-qimage { max-width: 100%; max-height: 200px; border-radius: var(--radius-md); margin-bottom: 1rem; }
        .bk-opt-image { max-width: 150px; max-height: 100px; border-radius: var(--radius-sm); margin: 0.25rem 0 0.5rem 34px; }

        .bk-options { display: flex; flex-direction: column; gap: 0.5rem; }
        .bk-opt {
          display: flex; align-items: center; gap: 0.75rem;
          padding: 0.625rem 0.875rem; border-radius: var(--radius-md);
          background: var(--bg-surface-hover); font-size: 0.9375rem;
        }
        .bk-opt-correct { background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.2); }
        .bk-opt-wrong { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); }

        .bk-letter {
          width: 26px; height: 26px; border-radius: 50%; flex-shrink: 0;
          background: var(--bg-surface); border: 1px solid var(--border-color);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.6875rem; font-weight: 700; color: var(--text-secondary);
        }
        .bk-tag {
          margin-left: auto; font-size: 0.6875rem; font-weight: 600;
          padding: 0.2rem 0.5rem; border-radius: var(--radius-full);
        }
        .bk-tag-green { background: rgba(34,197,94,0.15); color: #16a34a; }
        .bk-tag-red { background: rgba(239,68,68,0.15); color: var(--color-danger); }

        .not-answered-alert {
          margin-top: 0.5rem; font-size: 0.8125rem; font-weight: 600;
          color: var(--color-warning); background: rgba(234,179,8,0.1);
          padding: 0.75rem; border-radius: var(--radius-md); text-align: center;
        }
      `}</style>
    </div>
  );
}
