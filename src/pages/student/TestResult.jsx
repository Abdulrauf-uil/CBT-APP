import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getResultById, getResultsByTest } from '../../utils/storage';
import Navbar from '../../components/layout/Navbar';
import { getStudentSession } from '../../utils/storage';
import MathRenderer from '../../components/common/MathRenderer';

export default function TestResult() {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const student = getStudentSession();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  const [rank, setRank] = useState({ pos: 0, total: 0 });

  useEffect(() => {
    const fetchResult = async () => {
      const r = await getResultById(resultId);
      setResult(r);
      if (r) {
        const allResults = await getResultsByTest(r.testId);
        
        // Calculate scores for all and sort
        const scouts = allResults.map(res => {
          let s = 0;
          res.questions.forEach((q, i) => {
            if (res.answers[i] === q.correct) s++;
          });
          return { id: res.id, score: s, pct: Math.round((s / res.totalQuestions) * 100) };
        });

        // Sort by pct desc, then by score desc
        scouts.sort((a, b) => b.pct - a.pct || b.score - a.score);
        
        const myIndex = scouts.findIndex(s => s.id === resultId);
        setRank({ pos: myIndex + 1, total: scouts.length });
      }
      setLoading(false);
    };
    fetchResult();
  }, [resultId]);

  const getOrdinal = (n) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  if (loading) return <div className="result-page"><Navbar role="student" userName={student?.name} /><main className="container">Loading...</main></div>;

  if (!result) {
    return (
      <div>
        <Navbar role="student" userName={student?.name} />
        <main className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
          <h2>Result not found.</h2>
          <button className="btn btn-primary" style={{ marginTop: '1rem' }}
            onClick={() => navigate('/student/dashboard')}>Dashboard</button>
        </main>
      </div>
    );
  }

  const totalQ = result.totalQuestions;
  let score = 0;
  result.questions.forEach((q, i) => {
    if (result.answers[i] === q.correct) score++;
  });
  const percentage = Math.round((score / totalQ) * 100);
  const passed = percentage >= 50;

  const gradeInfo = percentage >= 80 ? { label: 'Excellent', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' }
    : percentage >= 60 ? { label: 'Good', color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)' }
    : percentage >= 50 ? { label: 'Pass', color: '#eab308', bg: 'rgba(234,179,8,0.1)' }
    : { label: 'Fail', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' };

  return (
    <div className="result-page">
      <Navbar role="student" userName={student?.name} />
      <main className="container animate-slide-up" style={{ padding: '2.5rem 1rem' }}>
        {/* Score Header */}
        <div className="score-card card">
          <div className="score-icon">{passed ? '🏆' : '📋'}</div>
          <h1 className="score-title">{result.testTitle}</h1>
          <div className="score-circle" style={{ '--col': gradeInfo.color, '--bg': gradeInfo.bg }}>
            <span className="score-pct">{percentage}%</span>
            <span className="score-fraction">{score}/{totalQ}</span>
          </div>
          <div className="grade-badge" style={{ background: gradeInfo.bg, color: gradeInfo.color }}>
            {gradeInfo.label}
          </div>
          {rank.total > 0 && (
            <div className="rank-info" style={{ marginTop: '0.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Position: <span style={{ color: 'var(--color-primary)' }}>{getOrdinal(rank.pos)}</span> out of {rank.total}
            </div>
          )}
          <p className="score-sub">
            Submitted on {new Date(result.submittedAt).toLocaleString()}
          </p>
        </div>

        {/* Answer Breakdown */}
        <h2 className="section-title">Answer Review</h2>
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
            return (
              <div key={i} className={`breakdown-card card ${isCorrect ? 'correct' : 'wrong'}`}>
                <div className="bk-header">
                  <span className="bk-qnum">Q{i + 1}</span>
                  <span className={`bk-status ${isCorrect ? 'status-correct' : 'status-wrong'}`}>
                    {isCorrect ? '✓ Correct' : '✗ Incorrect'}
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
                          {isStudentChoice && !isCorrectOpt && <span className="bk-tag bk-tag-red">Your Answer</span>}
                        </div>
                        {opt.image && <img src={opt.image} alt="" className="bk-opt-image" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="result-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/student/dashboard')}>
            Back to Dashboard
          </button>
          <button className="btn btn-primary" onClick={() => navigate(`/student/test/${result.testId}`)}>
            Retake Test
          </button>
        </div>
      </main>

      <style>{`
        .result-page { min-height: 100vh; }

        .score-card {
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          text-align: center;
          margin-bottom: 2.5rem;
        }
        .score-icon { font-size: 3rem; }
        .score-title { font-size: 1.375rem; font-weight: 700; }

        .score-circle {
          width: 130px; height: 130px; border-radius: 50%;
          background: var(--bg); border: 6px solid var(--col);
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 0.1rem; margin: 0.75rem 0;
          box-shadow: 0 0 0 12px color-mix(in srgb, var(--col) 10%, transparent);
          transition: all 0.3s ease;
        }
        .score-pct { font-size: 2rem; font-weight: 800; color: var(--col); line-height: 1; }
        .score-fraction { font-size: 0.8125rem; color: var(--text-secondary); }

        .grade-badge {
          font-size: 0.875rem; font-weight: 700; padding: 0.35rem 1.25rem;
          border-radius: var(--radius-full);
        }
        .score-sub { font-size: 0.8125rem; color: var(--text-muted); }

        .section-title { font-size: 1.125rem; font-weight: 600; margin-bottom: 1rem; }

        .breakdown-list { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem; }
        .breakdown-card { padding: 1.25rem 1.5rem; }
        .breakdown-card.correct { border-left: 4px solid var(--color-success); }
        .breakdown-card.wrong { border-left: 4px solid var(--color-danger); }

        .bk-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.625rem; }
        .bk-qnum {
          font-size: 0.75rem; font-weight: 700; color: var(--color-primary);
          background: var(--color-primary-light); padding: 0.2rem 0.6rem; border-radius: var(--radius-full);
        }
        .bk-status { font-size: 0.8125rem; font-weight: 600; }
        .status-correct { color: var(--color-success); }
        .status-wrong { color: var(--color-danger); }

        .bk-qtext { font-weight: 600; margin-bottom: 0.5rem; font-size: 0.9375rem; }
        .bk-qimage { max-width: 100%; max-height: 200px; border-radius: var(--radius-md); margin-bottom: 1rem; }
        .bk-opt-image { max-width: 150px; max-height: 100px; border-radius: var(--radius-sm); margin: 0.25rem 0 0.5rem 34px; }

        .bk-options { display: flex; flex-direction: column; gap: 0.5rem; }
        .bk-opt {
          display: flex; align-items: center; gap: 0.625rem;
          padding: 0.5rem 0.75rem; border-radius: var(--radius-md);
          background: var(--bg-surface-hover); font-size: 0.875rem;
        }
        .bk-opt-correct { background: rgba(34,197,94,0.1); }
        .bk-opt-wrong { background: rgba(239,68,68,0.1); }

        .bk-letter {
          width: 26px; height: 26px; border-radius: 50%; flex-shrink: 0;
          background: var(--bg-surface); border: 1px solid var(--border-color);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.6875rem; font-weight: 700;
        }
        .bk-tag {
          margin-left: auto; font-size: 0.6875rem; font-weight: 600;
          padding: 0.15rem 0.5rem; border-radius: var(--radius-full);
        }
        .bk-tag-green { background: rgba(34,197,94,0.15); color: #16a34a; }
        .bk-tag-red { background: rgba(239,68,68,0.15); color: var(--color-danger); }

        .result-actions { display: flex; justify-content: flex-end; gap: 0.875rem; flex-wrap: wrap; }
      `}</style>
    </div>
  );
}
