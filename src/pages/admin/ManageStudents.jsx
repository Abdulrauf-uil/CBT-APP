import { useState } from 'react';
import { getStudents, addStudent, removeStudent } from '../../utils/storage';
import Navbar from '../../components/layout/Navbar';

const EMPTY_FORM = { name: '', email: '', password: '' };

export default function ManageStudents() {
  const [students, setStudents] = useState(getStudents);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const refresh = () => setStudents(getStudents());

  const handleAdd = (e) => {
    e.preventDefault();
    setError('');
    if (students.find((s) => s.email === form.email)) {
      setError('A student with that email already exists.');
      return;
    }
    addStudent(form);
    refresh();
    setForm(EMPTY_FORM);
    setShowForm(false);
  };

  const handleRemove = (id) => {
    if (confirm('Remove this student? They will no longer be able to log in.')) {
      removeStudent(id);
      refresh();
    }
  };

  return (
    <div className="manage-page">
      <Navbar role="admin" userName="Admin" />
      <main className="container animate-slide-up" style={{ padding: '2.5rem 1rem' }}>
        <div className="page-header-row">
          <div>
            <h1>Manage Students</h1>
            <p>{students.length} registered student{students.length !== 1 ? 's' : ''}</p>
          </div>
          <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setError(''); }}>
            {showForm ? '✕ Cancel' : '+ Add Student'}
          </button>
        </div>

        {showForm && (
          <div className="card form-card animate-slide-up">
            <h3>New Student</h3>
            <form onSubmit={handleAdd}>
              <div className="form-grid">
                <div className="input-group">
                  <label className="input-label">Full Name</label>
                  <input className="input-field" type="text" required placeholder="John Doe"
                    value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="input-group">
                  <label className="input-label">Email / Login ID</label>
                  <input className="input-field" type="text" required placeholder="john@school.com"
                    value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="input-group">
                  <label className="input-label">Password</label>
                  <input className="input-field" type="text" required placeholder="Set a password"
                    value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                </div>
              </div>
              {error && <p className="form-error">{error}</p>}
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Add Student</button>
              </div>
            </form>
          </div>
        )}

        {students.length === 0 ? (
          <div className="empty-state card">
            <span>👥</span>
            <p>No students registered yet. Add your first student above.</p>
          </div>
        ) : (
          <div className="student-list">
            {students.map((s) => (
              <div key={s.id} className="student-row card">
                <div className="student-avatar">{s.name.charAt(0).toUpperCase()}</div>
                <div className="student-info">
                  <div className="student-name">{s.name}</div>
                  <div className="student-email">{s.email}</div>
                </div>
                <button className="btn btn-danger btn-sm" onClick={() => handleRemove(s.id)}>Remove</button>
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

        .form-card { padding: 1.75rem; margin-bottom: 2rem; }
        .form-card h3 { font-size: 1.1rem; font-weight: 600; margin-bottom: 1.25rem; }
        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 0 1.25rem;
        }
        .form-error {
          font-size: 0.8125rem;
          color: var(--color-danger);
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: var(--radius-md);
          padding: 0.5rem 0.75rem;
          margin: 0.5rem 0 1rem;
        }
        .form-actions { display: flex; justify-content: flex-end; }

        .student-list { display: flex; flex-direction: column; gap: 0.75rem; }
        .student-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.25rem;
        }
        .student-avatar {
          width: 42px;
          height: 42px;
          border-radius: var(--radius-full);
          background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
          color: white;
          font-weight: 700;
          font-size: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .student-info { flex: 1; min-width: 0; }
        .student-name { font-weight: 600; font-size: 0.9375rem; }
        .student-email { font-size: 0.8125rem; color: var(--text-secondary); }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
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
