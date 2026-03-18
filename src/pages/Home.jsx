import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <Navbar />

      <main className="home-main container animate-slide-up">
        <div className="home-hero">
          <div className="hero-image-wrapper">
            <img src="/front.png" alt="Hero Illustration" className="hero-image" />
          </div>
          <h1 className="home-heading">Computer Based Test</h1>
        </div>

        <div className="home-cards">
          {/* Admin Card */}
          <div className="portal-card portal-admin" onClick={() => navigate('/admin/login')}>
            <div className="portal-icon">🛡️</div>
            <h2>Admin Portal</h2>
            <p>Manage students, create tests, and view performance results.</p>
            <button className="btn btn-primary portal-btn">Enter as Admin</button>
          </div>

          {/* Student Card */}
          <div className="portal-card portal-student" onClick={() => navigate('/student/login')}>
            <div className="portal-icon">🎓</div>
            <h2>Student Portal</h2>
            <p>Log in and take your assigned tests in a timed environment.</p>
            <button className="btn portal-btn portal-student-btn">Enter as Student</button>
          </div>
        </div>
      </main>

      <style>{`
        .home-page {
          min-height: 100vh;
          background: radial-gradient(ellipse at top, rgba(79,70,229,0.08) 0%, transparent 65%);
        }

        .home-main {
          padding: 5rem 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3.5rem;
        }

        .home-hero {
          text-align: center;
          width: 100%;
          max-width: 720px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }

        .home-heading {
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 800;
          line-height: 1.2;
          background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0;
        }

        .hero-image-wrapper {
          width: 100%;
          max-width: 420px;
          border-radius: var(--radius-xl);
          overflow: hidden;
          box-shadow: var(--shadow-2xl, 0 25px 50px -12px rgba(0,0,0,0.25));
          border: 1px solid var(--border-color);
          background: var(--bg-surface);
        }

        .hero-image {
          width: 100%;
          height: auto;
          display: block;
          object-fit: cover;
        }

        .home-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          width: 100%;
          max-width: 680px;
        }

        .portal-card {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
          padding: 2.5rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 0.75rem;
          cursor: pointer;
          transition: transform 0.25s cubic-bezier(0.4,0,0.2,1), box-shadow 0.25s ease, border-color 0.25s ease;
        }

        .portal-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-xl);
        }

        .portal-admin:hover {
          border-color: var(--color-primary);
        }

        .portal-student:hover {
          border-color: var(--color-secondary);
        }

        .portal-icon {
          font-size: 3rem;
          margin-bottom: 0.5rem;
          line-height: 1;
        }

        .portal-card h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .portal-card p {
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.6;
          flex: 1;
        }

        .portal-btn {
          margin-top: 1rem;
          width: 100%;
          padding: 0.625rem 1rem;
        }

        .portal-student-btn {
          background-color: var(--color-secondary);
          color: white;
        }

        .portal-student-btn:hover {
          background-color: var(--color-secondary-hover);
          box-shadow: var(--shadow-md);
        }
      `}</style>
    </div>
  );
}
