import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import Landing from './pages/Landing';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyOtp from './pages/auth/VerifyOtp';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Seeker Pages
import SeekerDashboard from './pages/seeker/Dashboard';
import JobSearch from './pages/seeker/JobSearch';
import JobDetail from './pages/seeker/JobDetail';
import ResumeManager from './pages/seeker/ResumeManager';
import MyApplications from './pages/seeker/MyApplications';
import MyInterviews from './pages/seeker/MyInterviews';
import SavedJobs from './pages/seeker/SavedJobs';

// Shared Pages
import ProfileSettings from './pages/ProfileSettings';
import Notifications from './pages/Notifications';

// Recruiter Pages
import RecruiterDashboard from './pages/recruiter/Dashboard';
import ManageJobs from './pages/recruiter/ManageJobs';
import PostJob from './pages/recruiter/PostJob';
import EditJob from './pages/recruiter/EditJob';
import Applicants from './pages/recruiter/Applicants';
import CompanyProfile from './pages/recruiter/CompanyProfile';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminAllJobs from './pages/admin/AllJobs';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 mins
    },
  },
});

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ScrollToTop />
        <Toaster 
          position="top-right" 
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1a1a3e',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }} 
        />
        
        <Routes>
          {/* Public Routes with Main Layout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Landing />} />
          </Route>

          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>

          {/* Seeker Protected Routes */}
          <Route element={<DashboardLayout allowedRoles={['JOB_SEEKER']} />}>
            <Route path="/dashboard" element={<SeekerDashboard />} />
            <Route path="/jobs" element={<JobSearch />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route path="/resume" element={<ResumeManager />} />
            <Route path="/applications" element={<MyApplications />} />
            <Route path="/interviews" element={<MyInterviews />} />
            <Route path="/saved-jobs" element={<SavedJobs />} />
            <Route path="/profile" element={<ProfileSettings />} />
            <Route path="/notifications" element={<Notifications />} />
          </Route>

          {/* Recruiter Protected Routes */}
          <Route element={<DashboardLayout allowedRoles={['RECRUITER']} />}>
            <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
            <Route path="/recruiter/jobs" element={<ManageJobs />} />
            <Route path="/recruiter/jobs/new" element={<PostJob />} />
            <Route path="/recruiter/jobs/:id/edit" element={<EditJob />} />
            <Route path="/recruiter/applications" element={<Applicants />} />
            <Route path="/recruiter/company" element={<CompanyProfile />} />
            <Route path="/profile" element={<ProfileSettings />} />
            <Route path="/notifications" element={<Notifications />} />
          </Route>

          {/* Admin Protected Routes */}
          <Route element={<DashboardLayout allowedRoles={['ADMIN']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/jobs" element={<AdminAllJobs />} />
            <Route path="/profile" element={<ProfileSettings />} />
            <Route path="/notifications" element={<Notifications />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
};

export default App;
