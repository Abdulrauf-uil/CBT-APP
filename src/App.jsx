import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { isAdminLoggedIn, getStudentSession } from './utils/storage';

// Pages
import Home from './pages/Home';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageStudents from './pages/admin/ManageStudents';
import ManageTests from './pages/admin/ManageTests';
import CreateTest from './pages/admin/CreateTest';
import StudentLogin from './pages/student/StudentLogin';
import StudentDashboard from './pages/student/StudentDashboard';
import TakeTest from './pages/student/TakeTest';
import TestResult from './pages/student/TestResult';

// Protected Route Guards
function AdminRoute({ children }) {
  return isAdminLoggedIn() ? children : <Navigate to="/admin/login" replace />;
}

function StudentRoute({ children }) {
  return getStudentSession() ? children : <Navigate to="/student/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/students" element={<AdminRoute><ManageStudents /></AdminRoute>} />
        <Route path="/admin/tests" element={<AdminRoute><ManageTests /></AdminRoute>} />
        <Route path="/admin/tests/create" element={<AdminRoute><CreateTest /></AdminRoute>} />

        {/* Student */}
        <Route path="/student/login" element={<StudentLogin />} />
        <Route path="/student/dashboard" element={<StudentRoute><StudentDashboard /></StudentRoute>} />
        <Route path="/student/test/:testId" element={<StudentRoute><TakeTest /></StudentRoute>} />
        <Route path="/student/result/:resultId" element={<StudentRoute><TestResult /></StudentRoute>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
