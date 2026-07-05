import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { ResumeDetails } from './pages/ResumeDetails';
import { JobMatch } from './pages/JobMatch';
import { InterviewPrep } from './pages/InterviewPrep';
import { ResumeCompare } from './pages/ResumeCompare';
import { Profile } from './pages/Profile';
import { Loader2 } from 'lucide-react';

// Wrapper for protected route pages requiring active session tokens
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      {children}
    </div>
  );
};

export const App: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Guest Routes */}
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} 
      />
      <Route 
        path="/register" 
        element={isAuthenticated ? <Navigate to="/" replace /> : <Register />} 
      />

      {/* Protected Dashboard Workspace Routes */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/resumes/:id" 
        element={
          <ProtectedRoute>
            <ResumeDetails />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/job-match" 
        element={
          <ProtectedRoute>
            <JobMatch />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/interview-prep" 
        element={
          <ProtectedRoute>
            <InterviewPrep />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/compare" 
        element={
          <ProtectedRoute>
            <ResumeCompare />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } 
      />

      {/* Redirect fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
