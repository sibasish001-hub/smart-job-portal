import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiHome, HiBriefcase, HiDocumentText, HiClipboardList,
  HiCalendar, HiBookmark, HiBell, HiLogout, HiMenu, HiX,
  HiChartBar, HiUsers, HiOfficeBuilding, HiUserGroup, HiUser,
} from 'react-icons/hi';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { notificationsApi } from '../services/api';

type Role = 'JOB_SEEKER' | 'RECRUITER' | 'ADMIN';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  roles: Role[];
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard',               label: 'Dashboard',       icon: <HiHome />,         roles: ['JOB_SEEKER'] },
  { to: '/jobs',                    label: 'Find Jobs',       icon: <HiBriefcase />,    roles: ['JOB_SEEKER'] },
  { to: '/resume',                  label: 'My Resume',       icon: <HiDocumentText />, roles: ['JOB_SEEKER'] },
  { to: '/applications',            label: 'Applications',    icon: <HiClipboardList />,roles: ['JOB_SEEKER'] },
  { to: '/interviews',              label: 'Interviews',      icon: <HiCalendar />,     roles: ['JOB_SEEKER'] },
  { to: '/saved-jobs',              label: 'Saved Jobs',      icon: <HiBookmark />,     roles: ['JOB_SEEKER'] },
  { to: '/profile',                 label: 'My Profile',      icon: <HiUser />,         roles: ['JOB_SEEKER'] },

  { to: '/recruiter/dashboard',     label: 'Dashboard',       icon: <HiHome />,         roles: ['RECRUITER'] },
  { to: '/recruiter/jobs',          label: 'Manage Jobs',     icon: <HiBriefcase />,    roles: ['RECRUITER'] },
  { to: '/recruiter/applications',  label: 'Applicants',      icon: <HiUserGroup />,    roles: ['RECRUITER'] },
  { to: '/recruiter/company',       label: 'Company',         icon: <HiOfficeBuilding />,roles: ['RECRUITER'] },
  { to: '/profile',                 label: 'My Profile',      icon: <HiUser />,         roles: ['RECRUITER'] },

  { to: '/admin/dashboard',         label: 'Dashboard',       icon: <HiHome />,         roles: ['ADMIN'] },
  { to: '/admin/users',             label: 'Users',           icon: <HiUsers />,        roles: ['ADMIN'] },
  { to: '/admin/jobs',              label: 'All Jobs',        icon: <HiBriefcase />,    roles: ['ADMIN'] },
  { to: '/admin/analytics',         label: 'Analytics',       icon: <HiChartBar />,     roles: ['ADMIN'] },
];

interface DashboardLayoutProps {
  allowedRoles?: Role[];
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ allowedRoles }) => {
  const { user, clearAuth } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Redirect if not authenticated
  if (!user) return <Navigate to="/login" replace />;

  // Role guard
  if (allowedRoles && !allowedRoles.includes(user.role as Role)) {
    if (user.role === 'RECRUITER') return <Navigate to="/recruiter/dashboard" replace />;
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsApi.list,
    refetchInterval: 30000,
  });
  const unreadCount = notifications?.filter((n) => !n.isRead).length || 0;

  const navItems = NAV_ITEMS.filter((item) => item.roles.includes(user.role as Role));

  const logout = () => { clearAuth(); navigate('/login'); };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)' }}>
          <HiBriefcase className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-white">SmartJob<span className="gradient-text">Portal</span></span>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
            {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-white/40 truncate">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={isActive ? 'sidebar-link-active' : 'sidebar-link'}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="px-3 py-4 border-t border-white/5 space-y-1">
        <button
          onClick={logout}
          className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <HiLogout className="text-lg" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-dark-800 overflow-hidden">
      {/* Mesh bg */}
      <div className="mesh-bg" />

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-64 border-r border-white/5 lg:hidden"
              style={{ background: 'rgba(10,10,26,0.98)' }}
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 border-r border-white/5 relative z-10"
        style={{ background: 'rgba(10,10,26,0.8)' }}>
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex-shrink-0 h-14 flex items-center justify-between px-4 sm:px-6 border-b border-white/5 relative z-10"
          style={{ background: 'rgba(10,10,26,0.8)', backdropFilter: 'blur(10px)' }}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10"
          >
            <HiMenu className="w-5 h-5" />
          </button>

          <div className="flex-1 lg:flex-none" />

          <div className="flex items-center gap-3">
            {/* Notifications bell */}
            <Link to="/notifications" className="relative p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors">
              <HiBell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            {/* Role badge */}
            <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full text-xs font-semibold badge-primary">
              {user.role?.replace('_', ' ')}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
