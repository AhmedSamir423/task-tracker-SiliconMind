import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';

function App() {
  const isAuthenticated = () => !!localStorage.getItem('token');

  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={isAuthenticated() ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route path="/" element={<Navigate to={isAuthenticated() ? '/dashboard' : '/login'} />} />
        <Route path="*" element={<Navigate to={isAuthenticated() ? '/dashboard' : '/login'} />} />
      </Routes>
    </Router>
  );
}

export default App;
