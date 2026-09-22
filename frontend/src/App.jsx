import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import { LoadingSpinner } from './components/common/LoadingSpinner.jsx';

// Layout
import { AppLayout } from './components/layout/AppLayout.jsx';

// Pages
import { LandingPage } from './pages/LandingPage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { JobsPage } from './pages/JobsPage.jsx';
import { JobDetailsPage } from './pages/JobDetailsPage.jsx';
import { ApplicationsPage } from './pages/ApplicationsPage.jsx';
import { InterviewsPage } from './pages/InterviewsPage.jsx';
import { ResumeCenterPage } from './pages/ResumeCenterPage.jsx';
import { SkillGapPage } from './pages/SkillGapPage.jsx';
import { InterviewPrepPage } from './pages/InterviewPrepPage.jsx';
import { CareerRoadmapPage } from './pages/CareerRoadmapPage.jsx';
import { EmailGuardianPage } from './pages/EmailGuardianPage.jsx';
import { AnalyticsPage } from './pages/AnalyticsPage.jsx';
import { ProfilePage } from './pages/ProfilePage.jsx';
import { SettingsPage } from './pages/SettingsPage.jsx';

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner text="Checking authentication session..." fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export const App = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Authenticated Application Pages wrapped in AppLayout */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/:id" element={<JobDetailsPage />} />
        <Route path="/applications" element={<ApplicationsPage />} />
        <Route path="/interviews" element={<InterviewsPage />} />
        <Route path="/resume" element={<ResumeCenterPage />} />
        <Route path="/skill-gap" element={<SkillGapPage />} />
        <Route path="/interview-prep" element={<InterviewPrepPage />} />
        <Route path="/career-roadmap" element={<CareerRoadmapPage />} />
        <Route path="/email-guardian" element={<EmailGuardianPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback Catch-All Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
