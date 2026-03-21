import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTestById, getStudentSession, saveResult, getResultsByStudent } from '../../utils/storage';
import Navbar from '../../components/layout/Navbar';
import MathRenderer from '../../components/common/MathRenderer';

export default function TakeTest() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const student = getStudentSession();
  const test = getTestById(testId);
  const results = getResultsByStudent(student?.id ?? '');

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(test ? test.duration * 60 : 0);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = useCallback(() => {
    if (submitted) return;
    setSubmitted(true);
    const result = saveResult({
      testId: test.id,
      testTitle: test.title,
      studentId: student.id,
      studentName: student.name,
      answers,
      questions: test.questions,
      totalQuestions: test.questions.length,
    });
    navigate(`/student/result/${result.id}`);
  }, [submitted, test, student, answers, navigate]);

  // Countdown timer
  useEffect(() => {
    if (!test || submitted) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft, submitted, test, handleSubmit]);

  if (!test) {
    return (
      <div className="take-test-page">
        <Navbar role="student" userName={student?.name} />
        <main className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
          <h2>Test not found.</h2>
          <button className="btn btn-primary" style={{ marginTop: '1rem' }}
            onClick={() => navigate('/student/dashboard')}>Back to Dashboard</button>
        </main>
      </div>
    );
  }

  // Check attempt limit
  const attemptCount = results.filter(r => r.testId === test.id).length;
  if (test.attempts > 0 && attemptCount >= test.attempts && !submitted) {
    return (
      <div className="take-test-page">
        <Navbar role="student" userName={student?.name} />
        <main className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
          <h2>Attempt Limit Reached</h2>
          <p>You have already completed this test the maximum number of times allowed ({test.attempts}).</p>
          <button className="btn btn-primary" style={{ marginTop: '1rem' }}
            onClick={() => navigate('/student/dashboard')}>Back to Dashboard</button>
        </main>
      </div>
    );
  }

  // Check if test is closed
  if (test.isOpen === false && !submitted) {
    return (
      <div className="take-test-page">
        <Navbar role="student" userName={student?.name} />
        <main className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
          <div className="card shadow-lg" style={{ maxWidth: '500px', margin: '0 auto', padding: '3rem' }}>
            <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1.5rem' }}>🔒</span>
            <h2 style={{ color: 'var(--color-danger)', marginBottom: '1rem' }}>Test Closed</h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              This test is currently closed. Please contact your administration for access to this test.
            </p>
            <button className="btn btn-primary" style={{ marginTop: '2rem', width: '100%' }}
              onClick={() => navigate('/student/dashboard')}>Back to Dashboard</button>
          </div>
        </main>
      </div>
    );
  }

  // Normalize current question for backward compatibility
  const rawQ = test.questions[current];
  const q = {
    ...rawQ,
    image: rawQ.image || null,
    options: rawQ.options.map(opt => 
      typeof opt === 'string' ? { text: opt, image: null } : opt
    )
  };
  const totalQ = test.questions.length;
  const answered = Object.keys(answers).length;
  const progress = (answered / totalQ) * 100;

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const secs = String(timeLeft % 60).padStart(2, '0');
  const timeWarning = timeLeft < 60;

  return (
    <div className="take-test-page">
      <Navbar role="student" userName={student?.name} />

      {/* Sticky Timer & Progress */}
      <div className="test-topbar container">
        <div className="test-info">
          <span className="test-info-title">{test.title}</span>
          <span className="test-info-count">Question {current + 1} of {totalQ}</span>
        </div>
        <div className={`timer-box ${timeWarning ? 'timer-warning' : ''}`}>
          ⏱ {mins}:{secs}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar-container">
        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
      </div>

      <main className="container animate-slide-up" style={{ padding: '2rem 1rem' }}>
        <div className="question-card card">
          <div className="q-number">Q{current + 1}</div>
          <div className="q-content">
            <MathRenderer text={q.text} className="q-text" />
            {q.image && (
              <div className="q-image-container">
                <img src={q.image} alt="Question" className="q-image" />
              </div>
            )}
          </div>

          <div className="options-list">
            {q.options.map((opt, oi) => {
              const selected = answers[current] === oi;
              return (
                <button
                  key={oi}
                  className={`option-btn ${selected ? 'option-selected' : ''}`}
                  onClick={() => setAnswers({ ...answers, [current]: oi })}
                >
                  <div className="option-content">
                    <span className="option-letter">{String.fromCharCode(65 + oi)}</span>
                    <MathRenderer text={opt.text} className="option-text" />
                  </div>
                  {opt.image && <img src={opt.image} alt="" className="opt-image" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="nav-row">
          <button className="btn btn-secondary" disabled={current === 0}
            onClick={() => setCurrent((c) => c - 1)}>← Previous</button>

          <div className="q-dots">
            {test.questions.map((_, i) => (
              <button
                key={i}
                className={`q-dot ${i === current ? 'dot-active' : ''} ${answers[i] !== undefined ? 'dot-answered' : ''}`}
                onClick={() => setCurrent(i)}
              >{i + 1}</button>
            ))}
          </div>

          {current < totalQ - 1 ? (
            <button className="btn btn-primary" onClick={() => setCurrent((c) => c + 1)}>Next →</button>
          ) : (
            <button className="btn btn-primary finish-btn" onClick={handleSubmit}>
              ✓ Submit Test
            </button>
          )}
        </div>

        <p className="answered-count">{answered} of {totalQ} answered</p>
      </main>

      <style>{`
        .take-test-page { min-height: 100vh; }

        .test-topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0.875rem 1rem; gap: 1rem; flex-wrap: wrap;
        }
        .test-info { display: flex; flex-direction: column; }
        .test-info-title { font-weight: 700; font-size: 1rem; }
        .test-info-count { font-size: 0.8125rem; color: var(--text-secondary); }

        .timer-box {
          font-size: 1.125rem; font-weight: 700; font-variant-numeric: tabular-nums;
          background: var(--bg-surface); border: 2px solid var(--border-color);
          padding: 0.375rem 1rem; border-radius: var(--radius-full);
          transition: all 0.3s ease;
        }
        .timer-warning {
          border-color: var(--color-danger); color: var(--color-danger);
          animation: pulse 1s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }

        .progress-bar-container { height: 4px; background: var(--border-color); }
        .progress-bar-fill {
          height: 100%; background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
          transition: width 0.4s ease;
        }

        .question-card { padding: 2rem; margin-bottom: 1.5rem; }
        .q-number {
          font-size: 0.75rem; font-weight: 700; color: var(--color-primary);
          background: var(--color-primary-light); display: inline-block;
          padding: 0.2rem 0.6rem; border-radius: var(--radius-full); margin-bottom: 1rem;
        }
        .q-text { font-size: 1.1875rem; font-weight: 600; line-height: 1.5; margin-bottom: 1.75rem; }

        .options-list { display: flex; flex-direction: column; gap: 0.75rem; }
        .option-btn {
          display: flex; align-items: center; gap: 1rem;
          background: var(--bg-surface); border: 2px solid var(--border-color);
          border-radius: var(--radius-lg); padding: 0.875rem 1rem;
          text-align: left; cursor: pointer; width: 100%;
          transition: all 0.15s ease; font-family: inherit;
        }
        .option-btn:hover { border-color: var(--color-primary); background: var(--color-primary-light); }
        .option-selected { border-color: var(--color-primary)!important; background: var(--color-primary-light)!important; }

        .option-letter {
          width: 32px; height: 32px; flex-shrink: 0;
          background: var(--bg-surface-hover); border-radius: var(--radius-full);
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 0.8125rem; color: var(--text-secondary);
        }
        .option-selected .option-letter { background: var(--color-primary); color: white; }
        .option-text { font-size: 0.9375rem; color: var(--text-primary); }

        .nav-row {
          display: flex; align-items: center; justify-content: space-between;
          gap: 1rem; flex-wrap: wrap; margin-bottom: 1rem;
        }

        .q-dots { display: flex; flex-wrap: wrap; gap: 0.375rem; justify-content: center; flex: 1; }

        .q-dot {
          width: 32px; height: 32px; border-radius: var(--radius-full);
          border: 2px solid var(--border-color); background: var(--bg-surface);
          font-size: 0.6875rem; font-weight: 600; cursor: pointer;
          transition: all 0.15s ease; color: var(--text-secondary);
        }
        .dot-active { border-color: var(--color-primary); background: var(--color-primary); color: white; }
        .dot-answered:not(.dot-active) { border-color: var(--color-success); color: var(--color-success); background: rgba(34,197,94,0.08); }

        .finish-btn { background: var(--color-success); }
        .finish-btn:hover { background: #16a34a; }

        .answered-count { text-align: center; font-size: 0.8125rem; color: var(--text-muted); }
      `}</style>
    </div>
  );
}
