import React, { useState } from 'react';
import { Link, useNavigate, Outlet } from 'react-router-dom';
import { HiMenu, HiX, HiBriefcase, HiSearch } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';

const MainLayout: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'RECRUITER') return '/recruiter/dashboard';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    return '/dashboard';
  };

  return (
    <div className="min-h-screen bg-dark-800">
      {/* Mesh background */}
      <div className="mesh-bg" />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-40 border-b border-white/5"
        style={{ background: 'rgba(10,10,26,0.85)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)' }}>
                <HiBriefcase className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white text-lg">SmartJob<span className="gradient-text">Portal</span></span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-8">
              <Link to="/jobs" className="nav-link">Find Jobs</Link>
              <Link to="/#features" className="nav-link">Features</Link>
              <Link to="/#how-it-works" className="nav-link">How It Works</Link>
            </div>

            {/* Desktop actions */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <>
                  <Link to={getDashboardLink()} className="btn-secondary text-sm px-4 py-2">
                    Dashboard
                  </Link>
                  <button onClick={handleLogout} className="btn-primary text-sm px-4 py-2">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-secondary text-sm px-4 py-2">Login</Link>
                  <Link to="/register" className="btn-primary text-sm px-4 py-2">Get Started</Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
            >
              {menuOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/5"
              style={{ background: 'rgba(10,10,26,0.98)' }}
            >
              <div className="px-4 py-4 space-y-3">
                <Link to="/jobs" className="block py-2 text-white/70 hover:text-white" onClick={() => setMenuOpen(false)}>Find Jobs</Link>
                {user ? (
                  <>
                    <Link to={getDashboardLink()} className="block py-2 text-white/70 hover:text-white" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                    <button onClick={handleLogout} className="w-full btn-primary mt-2">Logout</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMenuOpen(false)} className="block w-full btn-secondary text-center mt-2">Login</Link>
                    <Link to="/register" onClick={() => setMenuOpen(false)} className="block w-full btn-primary text-center mt-2">Get Started</Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Page content */}
      <main className="pt-16">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-20 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)' }}>
                <HiBriefcase className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-white/70">SmartJobPortal</span>
            </div>
            <p className="text-sm text-white/30">
              © {new Date().getFullYear()} Smart Job Portal. AI-powered recruitment platform.
            </p>
            <div className="flex gap-5">
              {['Privacy', 'Terms', 'Contact'].map((link) => (
                <a key={link} href="#" className="text-sm text-white/30 hover:text-white/60 transition-colors">{link}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
