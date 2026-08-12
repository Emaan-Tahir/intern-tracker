import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './features/auth/AuthContext';
import ProtectedRoute from './shared/components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import AcceptInvitePage from './pages/AcceptInvitePage';
import AdminDashboard from './pages/admin/AdminDashboard';
import InternDashboard from './pages/intern/InternDashboard';
import ThisWeekPage from './pages/intern/ThisWeekPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/accept-invite" element={<AcceptInvitePage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/intern"
            element={
              <ProtectedRoute role="intern">
                <InternDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/intern/this-week"
            element={
              <ProtectedRoute role="intern">
                <ThisWeekPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
