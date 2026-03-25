import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { addTest, updateTest, getTestById, getGroups } from '../../utils/storage';
import * as XLSX from 'xlsx';
import Navbar from '../../components/layout/Navbar';
import MathRenderer from '../../components/common/MathRenderer';
import ImageUpload from '../../components/common/ImageUpload';
import { useRef } from 'react';

const EMPTY_Q = { 
  text: '', 
  image: null, 
  options: [
    { text: '', image: null },
    { text: '', image: null },
    { text: '', image: null },
    { text: '', image: null }
  ], 
  correct: 0,
  explanation: ''
};

export default function TestEditor() {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { testId } = useParams();
  
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(30);
  const [attempts, setAttempts] = useState(1);
  const [groupId, setGroupId] = useState('');
  const [questions, setQuestions] = useState([structuredClone(EMPTY_Q)]);
  const [saving, setSaving] = useState(false);
  const [groups, setGroups] = useState([]);
  
  useEffect(() => {
    const init = async () => {
      setGroups(await getGroups());
      if (testId) {
        const test = await getTestById(testId);
        if (test) {
          setTitle(test.title);
          setDuration(test.duration);
          setAttempts(test.attempts ?? 1);
          setGroupId(test.groupId || '');
          
          // Normalize questions for backward compatibility
          const normalizedQs = test.questions.map(q => ({
            ...q,
            image: q.image || null,
            options: q.options.map(opt => 
              typeof opt === 'string' ? { text: opt, image: null } : opt
            )
          }));
          setQuestions(normalizedQs);
        } else {
          navigate('/admin/tests');
        }
      }
    };
    init();
  }, [testId, navigate]);

  const addQuestion = () => setQuestions([...questions, structuredClone(EMPTY_Q)]);

  const removeQuestion = (qi) =>
    setQuestions(questions.filter((_, i) => i !== qi));

  const updateQ = (qi, field, val) =>
    setQuestions(questions.map((q, i) => (i === qi ? { ...q, [field]: val } : q)));

  const updateOption = (qi, oi, field, val) =>
    setQuestions(questions.map((q, i) => {
      if (i !== qi) return q;
      const opts = [...q.options];
      opts[oi] = { ...opts[oi], [field]: val };
      return { ...q, options: opts };
    }));

  const addOption = (qi) =>
    setQuestions(questions.map((q, i) => {
      if (i !== qi) return q;
      return { ...q, options: [...q.options, { text: '', image: null }] };
    }));

  const removeOption = (qi, oi) =>
    setQuestions(questions.map((q, i) => {
      if (i !== qi) return q;
      if (q.options.length <= 2) return q; // guard: min 2
      const opts = q.options.filter((_, idx) => idx !== oi);
      // if correct option was removed or is now out of bounds, reset to 0
      const newCorrect = q.correct >= opts.length ? 0 : (q.correct > oi ? q.correct - 1 : q.correct);
      return { ...q, options: opts, correct: newCorrect };
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { title, duration: Number(duration), attempts: Number(attempts), groupId, questions };
    try {
      if (testId) {
        await updateTest(testId, payload);
      } else {
        await addTest(payload);
      }
      navigate('/admin/tests');
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      { 'Question Text': 'What is the capital of France?', 'Option A': 'Berlin', 'Option B': 'Madrid', 'Option C': 'Paris', 'Option D': 'Rome', 'Option E': '', 'Option F': '', 'Correct Option': 'C', 'Explanation': 'Paris is the capital and largest city of France.' },
      { 'Question Text': 'Simplify $E=mc^2$ — what does E represent?', 'Option A': 'Energy', 'Option B': 'Mass', 'Option C': 'Gravity', 'Option D': 'Time', 'Option E': 'Momentum', 'Option F': '', 'Correct Option': 'A', 'Explanation': 'E stands for Energy in Einstein\'s famous mass-energy equivalence formula.' },
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Questions");
    XLSX.writeFile(wb, "Questions_Template.xlsx");
  };

  const importFromExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        const optionKeys = ['A','B','C','D','E','F'];
        const importedQs = data.filter(row => row['Question Text']).map(row => {
          const correctLetter = String(row['Correct Option'] || 'A').toUpperCase().trim();
          // Build options array from whichever columns are present
          const opts = optionKeys
            .map(k => ({ text: String(row[`Option ${k}`] || ''), image: null }))
            .filter(o => o.text.trim() !== '');
          if (opts.length < 2) opts.push({ text: '', image: null }); // ensure at least 2
          const correctIdx = Math.max(optionKeys.indexOf(correctLetter), 0);
          return {
            text: String(row['Question Text'] || ''),
            image: null,
            options: opts,
            correct: Math.min(correctIdx, opts.length - 1),
            explanation: String(row['Explanation'] || '')
          };
        });

        if (importedQs.length > 0) {
          if (questions.length === 1 && !questions[0].text) {
            setQuestions(importedQs);
          } else {
            setQuestions([...questions, ...importedQs]);
          }
          alert(`Success: Imported ${importedQs.length} question(s)!`);
        } else {
          alert('No valid questions found. Ensure column names match the template.');
        }
      } catch (err) {
        console.error(err);
        alert('Error parsing Excel file.');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = null;
  };

  return (
    <div className="create-page">
      <Navbar role="admin" userName="Admin" />
      <main className="container animate-slide-up" style={{ padding: '2.5rem 1rem' }}>
        <div className="page-header-row">
          <div>
            <h1>{testId ? 'Edit Test' : 'Create New Test'}</h1>
            <p>{testId ? 'Modify test details and questions' : 'Add questions and set a timer for this test'}</p>
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
              <div className="input-group">
                <label className="input-label">Max Attempts (0 for unlimited)</label>
                <input className="input-field" type="number" min={0} max={100} value={attempts}
                  onChange={(e) => setAttempts(e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label">Assign to Student Group</label>
                <select className="input-field" value={groupId} onChange={(e) => setGroupId(e.target.value)}>
                  <option value="">All Students</option>
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="questions-section">
            <div className="questions-header">
              <h3>Questions ({questions.length})</h3>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={downloadTemplate} title="Download Excel template">
                  📥 Template
                </button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => fileInputRef.current?.click()} title="Import questions from Excel file">
                  📤 Import Excel
                </button>
                <input type="file" ref={fileInputRef} accept=".xlsx, .xls" onChange={importFromExcel} style={{ display: 'none' }} />
                <button type="button" className="btn btn-primary btn-sm" onClick={addQuestion}>+ Add Manual</button>
              </div>
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
                  <label className="input-label">Question Text (supports LaTeX like $E=mc^2$) *</label>
                  <textarea className="input-field" required value={q.text}
                    rows={2}
                    onChange={(e) => updateQ(qi, 'text', e.target.value)}
                    placeholder="Type your question here…" 
                    style={{ resize: 'vertical' }}
                  />
                  {q.text && <MathRenderer text={q.text} className="q-preview" />}
                  <ImageUpload 
                    image={q.image} 
                    onUpload={(img) => updateQ(qi, 'image', img)}
                    onClear={() => updateQ(qi, 'image', null)}
                    label="Add Question Image"
                  />
                </div>

                <div className="options-grid">
                  {q.options.map((opt, oi) => (
                    <div key={oi} className={`option-wrapper ${q.correct === oi ? 'option-correct' : ''}`}>
                      <div className="option-row">
                        <button type="button" className={`correct-dot ${q.correct === oi ? 'active' : ''}`}
                          title="Mark as correct answer"
                          onClick={() => updateQ(qi, 'correct', oi)}>
                          {q.correct === oi ? '✓' : String.fromCharCode(65 + oi)}
                        </button>
                        <input className="input-field option-input" required value={opt.text}
                          onChange={(e) => updateOption(qi, oi, 'text', e.target.value)}
                          placeholder={`Option ${String.fromCharCode(65 + oi)}`} />
                        {q.options.length > 2 && (
                          <button type="button" className="btn-remove-opt" title="Remove this option"
                            onClick={() => removeOption(qi, oi)}>✕</button>
                        )}
                      </div>
                      <div style={{ marginLeft: '42px', marginTop: '0.25rem' }}>
                        {opt.text && <MathRenderer text={opt.text} className="opt-preview" />}
                        <ImageUpload 
                          image={opt.image} 
                          onUpload={(img) => updateOption(qi, oi, 'image', img)}
                          onClear={() => updateOption(qi, oi, 'image', null)}
                          label="Add Option Image"
                        />
                      </div>
                    </div>
                  ))}
                  <button type="button" className="btn-add-opt" onClick={() => addOption(qi)}>
                    ＋ Add Option
                  </button>
                </div>

                {/* Explanation toggle */}
                <div className="explanation-section">
                  {!q.explanation && q.explanation !== undefined ? null : null}
                  <button
                    type="button"
                    className={`btn-explanation-toggle ${q.explanation ? 'has-explanation' : ''}`}
                    onClick={() => updateQ(qi, '_showExplanation', !q._showExplanation)}
                  >
                    💡 {q._showExplanation || q.explanation ? 'Explanation (optional)' : '+ Add Explanation'}
                  </button>
                  {(q._showExplanation || q.explanation) && (
                    <textarea
                      className="input-field explanation-input"
                      rows={2}
                      placeholder="Explain the correct answer… (shown to students after submission)"
                      value={q.explanation || ''}
                      onChange={(e) => updateQ(qi, 'explanation', e.target.value)}
                      style={{ resize: 'vertical', marginTop: '0.5rem' }}
                    />
                  )}
                </div>

                <p className="q-hint">Click the letter badge to set the correct answer.</p>
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
        .meta-grid { display: grid; grid-template-columns: 1fr 120px 120px 1fr; gap: 0 1.25rem; }
        @media (max-width: 768px) { .meta-grid { grid-template-columns: 1fr; } }

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

        .option-wrapper { display: flex; flex-direction: column; gap: 0.25rem; }
        .option-row { display: flex; align-items: center; gap: 0.625rem; }
        .option-correct .option-input { border-color: var(--color-success); }
        .q-preview, .opt-preview { 
          margin-top: 0.5rem; padding: 0.5rem; background: var(--bg-surface-hover); 
          border-radius: var(--radius-md); font-size: 0.9rem;
        }

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
        .q-hint { font-size: 0.75rem; color: var(--text-muted); margin-top: 0.5rem; }

        .btn-remove-opt {
          flex-shrink: 0; width: 26px; height: 26px; border-radius: 50%;
          border: 1px solid var(--color-danger); color: var(--color-danger);
          background: transparent; cursor: pointer; font-size: 0.75rem; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.15s ease; line-height: 1;
        }
        .btn-remove-opt:hover { background: var(--color-danger); color: white; }

        .btn-add-opt {
          margin-top: 0.375rem; display: inline-flex; align-items: center; gap: 0.4rem;
          padding: 0.35rem 0.75rem; border-radius: var(--radius-md);
          border: 1.5px dashed var(--color-primary); color: var(--color-primary);
          background: transparent; cursor: pointer; font-size: 0.8rem; font-weight: 600;
          transition: all 0.15s ease;
        }
        .btn-add-opt:hover { background: var(--color-primary-light); }

        .explanation-section { margin-top: 0.75rem; }
        .btn-explanation-toggle {
          display: inline-flex; align-items: center; gap: 0.4rem;
          padding: 0.3rem 0.75rem; border-radius: var(--radius-full);
          border: 1.5px dashed var(--color-warning); color: var(--color-warning);
          background: transparent; cursor: pointer; font-size: 0.8rem; font-weight: 600;
          transition: all 0.15s ease;
        }
        .btn-explanation-toggle.has-explanation { border-style: solid; background: rgba(234,179,8,0.08); }
        .btn-explanation-toggle:hover { background: rgba(234,179,8,0.1); }
        .explanation-input { width: 100%; font-style: italic; color: var(--text-secondary); }

        .submit-row { display: flex; justify-content: flex-end; gap: 0.875rem; flex-wrap: wrap; }
        .btn-sm { padding: 0.375rem 0.75rem; font-size: 0.8125rem; }
      `}</style>
    </div>
  );
}
