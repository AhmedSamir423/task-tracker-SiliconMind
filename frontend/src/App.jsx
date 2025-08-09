import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';

// Authentication context or helper
const isAuthenticated = () => !!localStorage.getItem('token');

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const isAuth = isAuthenticated();

  useEffect(() => {
    // This effect ensures the route re-evaluates authentication on token change
    // (Note: This is a workaround; for production, consider a global state like Context API)
  }, [location.pathname, isAuth]);

  return isAuth ? children : <Navigate to="/login" replace state={{ from: location }} />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/login"
          element={!isAuthenticated() ? <LoginPage /> : <Navigate to="/dashboard" replace />}
        />

        {/* Protected route with wrapper */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Default route */}
        <Route
          path="/"
          element={<Navigate to={isAuthenticated() ? '/dashboard' : '/login'} replace />}
        />
        <Route
          path="*"
          element={<Navigate to={isAuthenticated() ? '/dashboard' : '/login'} replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;