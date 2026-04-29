import React from 'react';
import Navigation from './components/Navigation';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import LeadsPage from './pages/LeadsPage';
import LeadDetailPage from './pages/LeadDetailPage';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AppContent = () => {
  const { token } = useAuth();

  return (
    <Router>
      {token && <Navigation />}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div className="max-w-7xl mx-auto px-6 py-8">
                <DashboardPage />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/leads"
          element={
            <ProtectedRoute>
              <div className="max-w-7xl mx-auto px-6 py-8">
                <LeadsPage />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/leads/:id"
          element={
            <ProtectedRoute>
              <div className="max-w-7xl mx-auto px-6 py-8">
                <LeadDetailPage />
              </div>
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
