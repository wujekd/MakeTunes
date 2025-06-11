import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomeView from './views/HomeView';
import ProjectDetailView from './views/ProjectDetailView';
import VotingView from './views/VotingView';
import DebugSubmissionView from './views/DebugSubmissionView';
import Projects from './components/Projects';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AccountView } from './views/AccountView';

// Protected Route wrapper component
const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  
  if (!token) {
    return <Navigate to="/account" />;
  }
  
  return children;
};

function AppContent() {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/projects" element={<Projects />} />
      
      {/* Auth route */}
      <Route path="/account" element={<AccountView />} />
      
      {/* Protected routes */}
      <Route path="/projects/:projectId/manage" element={
        <ProtectedRoute>
          <ProjectDetailView />
        </ProtectedRoute>
      } />
      
      <Route path="/projects/:projectId/debug" element={
        <ProtectedRoute>
          <DebugSubmissionView />
        </ProtectedRoute>
      } />
      
      <Route path="/projects/:projectId" element={
        <ProtectedRoute>
          <VotingView />
        </ProtectedRoute>
      } />
      
      <Route path="/" element={
        <ProtectedRoute>
          <HomeView />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;