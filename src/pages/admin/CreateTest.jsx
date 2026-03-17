import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addTest } from '../../utils/storage';
import Navbar from '../../components/layout/Navbar';

const EMPTY_Q = { text: '', options: ['', '', '', ''], correct: 0 };

export default function CreateTest() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(30);
  const [questions, setQuestions] = useState([structuredClone(EMPTY_Q)]);
  const [saving, setSaving] = useState(false);

  const addQuestion = () => setQuestions([...questions, structuredClone(EMPTY_Q)]);

  const removeQuestion = (qi) =>
    setQuestions(questions.filter((_, i) => i !== qi));

  const updateQ = (qi, field, val) =>
    setQuestions(questions.map((q, i) => (i === qi ? { ...q, [field]: val } : q)));

  const updateOption = (qi, oi, val) =>
    setQuestions(questions.map((q, i) => {
      if (i !== qi) return q;
      const opts = [...q.options];
      opts[oi] = val;
      return { ...q, options: opts };
    }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      addTest({ title, duration: Number(duration), questions });
      navigate('/admin/tests');
    }, 300);
  };

  return (
    <div className="create-page">
      <Navbar role="admin" userName="Admin" />
      <main className="container animate-slide-up" style={{ padding: '2.5rem 1rem' }}>
        <div className="page-header-row">
          <div>
            <h1>Create New Test</h1>
            <p>Add questions and set a timer for this test</p>
          </div>
          <button className="btn btn-secondary" onClick={() => navigate('/admin/tests')}>← Back</button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Test Meta */}
          <div className="card meta-card">
            <h3>Test Details</h3>
            <div className="meta-grid">
              <div className="input-group">
                <label className="input-label">Test Title *</label>
                <input className="input-field" required value={title}
                  onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Mathematics – Chapter 5" />
              </div>
              <div className="input-group">
                <label className="input-label">Duration (minutes) *</label>
                <input className="input-field" type="number" min={1} max={300} required value={duration}
                  onChange={(e) => setDuration(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="questions-section">
            <div className="questions-header">
              <h3>Questions ({questions.length})</h3>
              <button type="button" className="btn btn-secondary btn-sm" onClick={addQuestion}>+ Add Question</button>
            </div>

            {questions.map((q, qi) => (
              <div key={qi} className="card q-card animate-fade-in">
                <div className="q-header">
                  <span className="q-num">Q{qi + 1}</span>
                  {questions.length > 1 && (
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => removeQuestion(qi)}>Remove</button>
                  )}
                </div>

                <div className="input-group">
                  <label className="input-label">Question Text *</label>
                  <input className="input-field" required value={q.text}
                    onChange={(e) => updateQ(qi, 'text', e.target.value)}
                    placeholder="Type your question here…" />
                </div>

                <div className="options-grid">
                  {q.options.map((opt, oi) => (
                    <div key={oi} className={`option-row ${q.correct === oi ? 'option-correct' : ''}`}>
                      <button type="button" className={`correct-dot ${q.correct === oi ? 'active' : ''}`}
                        title="Mark as correct answer"
                        onClick={() => updateQ(qi, 'correct', oi)}>
                        {q.correct === oi ? '✓' : String.fromCharCode(65 + oi)}
                      </button>
                      <input className="input-field option-input" required value={opt}
                        onChange={(e) => updateOption(qi, oi, e.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + oi)}`} />
                    </div>
                  ))}
                </div>
                <p className="q-hint">Click the letter badge to mark the correct answer.</p>
              </div>
            ))}
          </div>

          <div className="submit-row">
            <button type="button" className="btn btn-secondary" onClick={addQuestion}>+ Add Another Question</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : '✓ Save Test'}
            </button>
          </div>
        </form>
      </main>

      <style>{`
        .create-page { min-height: 100vh; }
        .page-header-row {
          display: flex; align-items: flex-start; justify-content: space-between;
          gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap;
        }
        .page-header-row h1 { font-size: 1.75rem; font-weight: 700; }
        .page-header-row p { color: var(--text-secondary); font-size: 0.9rem; }

        .meta-card { padding: 1.5rem; margin-bottom: 1.5rem; }
        .meta-card h3 { font-size: 1rem; font-weight: 600; margin-bottom: 1rem; }
        .meta-grid { display: grid; grid-template-columns: 1fr auto; gap: 0 1.25rem; }

        .questions-section { margin-bottom: 1.5rem; }
        .questions-header {
          display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;
        }
        .questions-header h3 { font-size: 1.1rem; font-weight: 600; }

        .q-card { padding: 1.5rem; margin-bottom: 1rem; }
        .q-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
        .q-num {
          background: var(--color-primary-light); color: var(--color-primary);
          font-size: 0.8125rem; font-weight: 700; padding: 0.25rem 0.625rem;
          border-radius: var(--radius-full);
        }

        .options-grid { display: flex; flex-direction: column; gap: 0.625rem; margin-bottom: 0.5rem; }
        .option-row { display: flex; align-items: center; gap: 0.625rem; }
        .option-row.option-correct .option-input { border-color: var(--color-success); }

        .correct-dot {
          width: 32px; height: 32px; border-radius: var(--radius-full); flex-shrink: 0;
          border: 2px solid var(--border-color); background: var(--bg-surface-hover);
          color: var(--text-secondary); font-size: 0.75rem; font-weight: 700;
          cursor: pointer; transition: all 0.15s ease;
          display: flex; align-items: center; justify-content: center;
        }
        .correct-dot.active { background: var(--color-success); border-color: var(--color-success); color: white; }
        .correct-dot:hover:not(.active) { border-color: var(--color-success); color: var(--color-success); }

        .option-input { flex: 1; }
        .q-hint { font-size: 0.75rem; color: var(--text-muted); }

        .submit-row { display: flex; justify-content: flex-end; gap: 0.875rem; flex-wrap: wrap; }
        .btn-sm { padding: 0.375rem 0.75rem; font-size: 0.8125rem; }
      `}</style>
    </div>
  );
}
