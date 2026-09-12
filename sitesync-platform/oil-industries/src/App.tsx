import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AdminLayout } from './components/layout/AdminLayout';
import { WorkerLayout } from './components/layout/WorkerLayout';

// Auth & Error Pages
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProfilePage } from './pages/admin/AdminProfilePage';
import { ProjectsPage } from './pages/admin/ProjectsPage';
import { ProjectDetailPage } from './pages/admin/ProjectDetailPage';
import { SchedulePage } from './pages/admin/SchedulePage';
import { ProgressPage } from './pages/admin/ProgressPage';
import { ReportsPage } from './pages/admin/ReportsPage';
import { ReviewQueuePage } from './pages/admin/ReviewQueuePage';
import { WorkersPage } from './pages/admin/WorkersPage';
import { AnalyticsPage } from './pages/admin/AnalyticsPage';
import { SettingsPage } from './pages/admin/SettingsPage';

// Worker Pages
import { WorkerDashboard } from './pages/worker/WorkerDashboard';
import { WorkerTasksPage } from './pages/worker/WorkerTasksPage';
import { WorkerTaskDetailPage } from './pages/worker/WorkerTaskDetailPage';
import { WorkerReportPage } from './pages/worker/WorkerReportPage';
import { WorkerReportsHistoryPage } from './pages/worker/WorkerReportsHistoryPage';
import { WorkerProfilePage } from './pages/worker/WorkerProfilePage';

// Shared Pages
import { IntelligenceChatPage } from './pages/IntelligenceChatPage';

// Component to handle root redirect based on auth & role
const RootRedirect: React.FC = () => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-graphite-950 flex items-center justify-center text-white font-mono text-xs">
        INITIALIZING SITESYNC...
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return user.role.toUpperCase() === 'ADMIN' ? (
    <Navigate to="/admin/dashboard" replace />
  ) : (
    <Navigate to="/worker/dashboard" replace />
  );
};

export function App() {
  return (
    <AuthProvider>
      <ProjectProvider>
        <LanguageProvider>
          <ThemeProvider>
          <BrowserRouter>
            <Routes>
            {/* Unprotected Auth & Info Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Root Route Handler */}
            <Route path="/" element={<RootRedirect />} />

            {/* Strictly Protected Admin Routes */}
            <Route element={<ProtectedRoute allowedRole="ADMIN" />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="profile" element={<AdminProfilePage />} />
                <Route path="projects" element={<ProjectsPage />} />
                <Route path="projects/:projectId" element={<ProjectDetailPage />} />
                <Route path="projects/:projectId/schedule" element={<SchedulePage />} />
                <Route path="projects/:projectId/progress" element={<ProgressPage />} />
                <Route path="projects/:projectId/reports" element={<ReportsPage />} />
                <Route path="review" element={<SchedulePage initialTab="REVIEW" />} />
                <Route path="workers" element={<WorkersPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="intelligence" element={<IntelligenceChatPage />} />
              </Route>
            </Route>

            {/* Strictly Protected Worker Routes */}
            <Route element={<ProtectedRoute allowedRole="WORKER" />}>
              <Route path="/worker" element={<WorkerLayout />}>
                <Route index element={<Navigate to="/worker/dashboard" replace />} />
                <Route path="dashboard" element={<WorkerDashboard />} />
                <Route path="tasks" element={<WorkerTasksPage />} />
                <Route path="tasks/:activityId" element={<WorkerTaskDetailPage />} />
                <Route path="tasks/:activityId/progress" element={<WorkerTaskDetailPage />} />
                <Route path="report" element={<WorkerReportPage />} />
                <Route path="report/:reportId" element={<WorkerReportPage />} />
                <Route path="reports" element={<WorkerReportsHistoryPage />} />
                <Route path="profile" element={<WorkerProfilePage />} />
                <Route path="intelligence" element={<IntelligenceChatPage />} />
              </Route>
            </Route>

            {/* Fallback Route */}
            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </BrowserRouter>
          </ThemeProvider>
        </LanguageProvider>
      </ProjectProvider>
    </AuthProvider>
  );
}

export default App;
