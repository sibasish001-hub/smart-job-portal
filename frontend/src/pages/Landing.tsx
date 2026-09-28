import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  HiSparkles, HiDocumentText, HiBriefcase, HiChartBar, HiArrowRight,
  HiShieldCheck, HiLightningBolt, HiGlobe,
} from 'react-icons/hi';
import { useAuthStore } from '../store/authStore';

// ─── Counter animation hook ───────────────────────────────────────────────────
const useCounter = (target: number, duration = 2000, start = false) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
};

// ─── Features data ────────────────────────────────────────────────────────────
const features = [
  {
    icon: <HiDocumentText className="w-7 h-7" />,
    title: 'AI Resume Analysis',
    desc: 'Upload your resume and get an instant ATS score, strength analysis, weakness identification, and personalized improvement suggestions.',
    gradient: 'from-purple-500/20 to-indigo-500/20',
    border: 'border-purple-500/20',
    iconBg: 'bg-purple-500/20 text-purple-400',
  },
  {
    icon: <HiSparkles className="w-7 h-7" />,
    title: 'Smart Job Matching',
    desc: 'Our AI engine analyzes your profile against job descriptions to calculate precise match scores and recommend the best opportunities.',
    gradient: 'from-cyan-500/20 to-blue-500/20',
    border: 'border-cyan-500/20',
    iconBg: 'bg-cyan-500/20 text-cyan-400',
  },
  {
    icon: <HiBriefcase className="w-7 h-7" />,
    title: 'Advanced Job Search',
    desc: 'Filter by remote type, job type, experience level, skills, salary range, and location. Find exactly what you\'re looking for.',
    gradient: 'from-green-500/20 to-teal-500/20',
    border: 'border-green-500/20',
    iconBg: 'bg-green-500/20 text-green-400',
  },
  {
    icon: <HiChartBar className="w-7 h-7" />,
    title: 'Application Tracking',
    desc: 'Track every application through the hiring pipeline — from applied to offered — with real-time status updates.',
    gradient: 'from-orange-500/20 to-yellow-500/20',
    border: 'border-orange-500/20',
    iconBg: 'bg-orange-500/20 text-orange-400',
  },
  {
    icon: <HiShieldCheck className="w-7 h-7" />,
    title: 'Secure & Private',
    desc: 'Enterprise-grade security with JWT authentication, encrypted storage, and GDPR-compliant data handling.',
    gradient: 'from-red-500/20 to-pink-500/20',
    border: 'border-red-500/20',
    iconBg: 'bg-red-500/20 text-red-400',
  },
  {
    icon: <HiGlobe className="w-7 h-7" />,
    title: 'For Recruiters',
    desc: 'Post jobs, review AI-ranked candidates, schedule interviews, and manage your entire recruitment pipeline in one place.',
    gradient: 'from-violet-500/20 to-purple-500/20',
    border: 'border-violet-500/20',
    iconBg: 'bg-violet-500/20 text-violet-400',
  },
];

const steps = [
  { num: '01', title: 'Create Account', desc: 'Sign up as a Job Seeker or Recruiter in under 60 seconds.' },
  { num: '02', title: 'Upload Resume', desc: 'Upload your PDF or DOCX resume. Our AI parses it instantly.' },
  { num: '03', title: 'Get AI Insights', desc: 'Receive your ATS score, skills analysis, and improvement tips.' },
  { num: '04', title: 'Apply & Track', desc: 'Apply to matched jobs and track your applications in real-time.' },
];

// ─── Main Component ───────────────────────────────────────────────────────────
const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const statsRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsRef, { once: true });

  const jobs = useCounter(12000, 2000, statsInView);
  const companies = useCounter(850, 2000, statsInView);
  const placed = useCounter(5400, 2500, statsInView);
  const satisfaction = useCounter(98, 1500, statsInView);

  const getDashboard = () => {
    if (!user) return '/register';
    if (user.role === 'RECRUITER') return '/recruiter/dashboard';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    return '/dashboard';
  };

  return (
    <div className="overflow-hidden">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center">
        {/* Background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/8 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/6 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-900/20 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary-500/30 bg-primary-500/10 mb-8"
          >
            <HiLightningBolt className="w-4 h-4 text-primary-400" />
            <span className="text-sm font-medium text-primary-300">AI-Powered Recruitment Platform</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight mb-6"
          >
            Find Your Next
            <br />
            <span className="gradient-text">Dream Job</span>
            <br />
            with AI Precision
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Smart Job Portal uses advanced AI to analyze your resume, score your ATS compatibility,
            and intelligently match you with the perfect opportunities.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to={getDashboard()} className="btn-primary text-base px-8 py-4 group">
              {user ? 'Go to Dashboard' : 'Get Started Free'}
              <HiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/jobs" className="btn-secondary text-base px-8 py-4">
              Browse Jobs
            </Link>
          </motion.div>

          {/* Trust bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-6 mt-16 text-sm text-white/40"
          >
            {['No credit card required', 'Free resume analysis', 'AI-powered matching', '5,000+ jobs posted'].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <span className="w-1 h-1 bg-primary-400 rounded-full" />{t}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────── */}
      <section ref={statsRef} id="stats" className="py-16 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: jobs.toLocaleString() + '+', label: 'Active Jobs' },
              { value: companies.toLocaleString() + '+', label: 'Companies' },
              { value: placed.toLocaleString() + '+', label: 'Candidates Placed' },
              { value: satisfaction + '%', label: 'Satisfaction Rate' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={statsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="text-center"
              >
                <div className="text-4xl lg:text-5xl font-black gradient-text mb-2">{stat.value}</div>
                <div className="text-sm text-white/50 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────── */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="section-title"
            >
              Everything you need to
              <span className="gradient-text"> land your next role</span>
            </motion.h2>
            <p className="section-subtitle mx-auto">
              Powerful AI-driven tools designed to give you an unfair advantage in today's competitive job market.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className={`glass-card p-6 border ${f.border} hover:bg-gradient-to-br ${f.gradient} transition-all duration-300 group`}
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 ${f.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{f.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title">How it <span className="gradient-text">works</span></h2>
            <p className="section-subtitle mx-auto">Get started in minutes and let AI do the heavy lifting.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent" />

            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.4 }}
                className="text-center relative"
              >
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 font-black text-xl text-white relative z-10"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
                  {step.num}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card p-12 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(6,182,212,0.08))' }}
          >
            {/* Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-cyan-500/5" />
            <div className="relative z-10">
              <h2 className="text-4xl font-black text-white mb-4">
                Ready to transform
                <br />
                <span className="gradient-text">your job search?</span>
              </h2>
              <p className="text-white/60 mb-8 max-w-lg mx-auto">
                Join thousands of professionals who've accelerated their careers with AI-powered recruitment tools.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register" className="btn-primary text-base px-8 py-4">
                  Start for Free <HiArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/jobs" className="btn-secondary text-base px-8 py-4">
                  Browse Jobs
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
