import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppLayout } from './components/layout/AppLayout';
import { CandidateLayout } from './components/layout/CandidateLayout';
import { RoleGuard } from './components/layout/RoleGuard';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { PlansPage } from './pages/public/PlansPage';
import { PublicVerifyPage } from './pages/public/PublicVerifyPage';

// Instructor Pages
import { AskVerifyIQPage } from './pages/instructor/AskVerifyIQPage';
import { InstructorDashboard } from './pages/instructor/InstructorDashboard';
import { SessionsListPage } from './pages/instructor/SessionsListPage';
import { SessionReviewPage } from './pages/instructor/SessionReviewPage';
import { AssessmentsListPage } from './pages/instructor/AssessmentsListPage';
import { MLLabPage } from './pages/instructor/MLLabPage';
import { CredentialsManagementPage } from './pages/instructor/CredentialsManagementPage';
import { SettingsPage } from './pages/instructor/SettingsPage';
import { AuditLogsPage } from './pages/instructor/AuditLogsPage';

// Candidate Pages
import { CandidateDashboard } from './pages/candidate/CandidateDashboard';
import { ConsentPage } from './pages/candidate/ConsentPage';
import { PreCheckPage } from './pages/candidate/PreCheckPage';
import { AssessmentPage } from './pages/candidate/AssessmentPage';
import { SubmissionConfirmationPage } from './pages/candidate/SubmissionConfirmationPage';
import { CandidateResultPage } from './pages/candidate/CandidateResultPage';
import { CandidateCredentialsPage } from './pages/candidate/CandidateCredentialsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 mins
      retry: 1,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/plans" element={<PlansPage />} />
          <Route path="/verify/:id" element={<PublicVerifyPage />} />

          {/* Candidate Focus Exam Routes (No rail / focus environment) */}
          <Route
            element={
              <RoleGuard allowedRoles={['candidate', 'instructor', 'admin']}>
                <CandidateLayout />
              </RoleGuard>
            }
          >
            <Route path="/candidate/consent" element={<ConsentPage />} />
            <Route path="/candidate/precheck" element={<PreCheckPage />} />
            <Route path="/candidate/assessment" element={<AssessmentPage />} />
            <Route path="/candidate/confirmation" element={<SubmissionConfirmationPage />} />
            <Route path="/candidate/result" element={<CandidateResultPage />} />
          </Route>

          {/* Main App Layout with Left Rail & TopBar */}
          <Route
            element={
              <RoleGuard allowedRoles={['candidate', 'instructor', 'admin']}>
                <AppLayout />
              </RoleGuard>
            }
          >
            {/* Candidate Portal in Rail */}
            <Route path="/candidate" element={<CandidateDashboard />} />
            <Route path="/candidate/credentials" element={<CandidateCredentialsPage />} />

            {/* Instructor / Admin Routes */}
            <Route path="/ask" element={<AskVerifyIQPage />} />
            <Route path="/dashboard" element={<InstructorDashboard />} />
            <Route path="/sessions" element={<SessionsListPage />} />
            <Route path="/sessions/:id" element={<SessionReviewPage />} />
            <Route path="/assessments" element={<AssessmentsListPage />} />
            <Route path="/ml-lab" element={<MLLabPage />} />
            <Route path="/credentials" element={<CredentialsManagementPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/audit-logs" element={<AuditLogsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
