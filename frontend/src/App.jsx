import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import Login from './pages/Login';
import Signup from './pages/Signup';
import LandingPage from './pages/LandingPage';
import MyRegistrations from './pages/MyRegistrations';
import AdminDashboard from './pages/AdminDashboard';
import { RefreshCw } from 'lucide-react';

// Private Route Wrapper (Requires authentication)
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 space-y-4">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-sm text-slate-400 font-semibold">Validating session...</p>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
};

// Role-based Route Wrapper (Requires specific roles)
const RoleRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 space-y-4">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-sm text-slate-400 font-semibold">Checking access privileges...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return allowedRoles.includes(user.role) ? children : <Navigate to="/" replace />;
};

// Inner App with Routing Context
const AppContent = () => {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  return (
    <Router>
      <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100 selection:bg-indigo-500">
        <Navbar />
        
        {/* Main Content Area */}
        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login onShowToast={showToast} />} />
            <Route path="/signup" element={<Signup onShowToast={showToast} />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <LandingPage onShowToast={showToast} />
                </PrivateRoute>
              }
            />
            <Route
              path="/my-registrations"
              element={
                <RoleRoute allowedRoles={['Student']}>
                  <MyRegistrations onShowToast={showToast} />
                </RoleRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <RoleRoute allowedRoles={['Admin', 'Club_Organizer']}>
                  <AdminDashboard onShowToast={showToast} />
                </RoleRoute>
              }
            />

            {/* Fallback Catch-All */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Global Toast Alerts */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
        
        {/* Footer */}
        <footer className="py-6 text-center border-t border-slate-900 bg-slate-950/80 text-xs text-slate-550 mt-12">
          <p>© {new Date().getFullYear()} CampusEvent Portal. Crafted using the MERN stack with Tailwind CSS.</p>
        </footer>
      </div>
    </Router>
  );
};

// Global App wrapper with providers
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
