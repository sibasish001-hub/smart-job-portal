import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiMail, HiLockClosed, HiEye, HiEyeOff } from 'react-icons/hi';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { authApi } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import type { AuthUser } from '../../types';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email address';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const mutation = useMutation({
    mutationFn: () => authApi.login(form),
    onSuccess: (data) => {
      const user: AuthUser = {
        id: data.id,
        email: data.email,
        role: data.role,
        isVerified: data.isVerified,
        firstName: data.firstName,
        lastName: data.lastName,
      };
      setAuth(user, data.accessToken, data.refreshToken);
      toast.success(`Welcome back, ${data.firstName}!`);
      if (data.role === 'JOB_SEEKER') navigate('/dashboard');
      else if (data.role === 'RECRUITER') navigate('/recruiter/dashboard');
      else navigate('/admin/dashboard');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Invalid email or password');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) mutation.mutate();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
      <p className="text-white/50 text-sm mb-8">Sign in to your account to continue</p>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <Input
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          icon={<HiMail className="w-4 h-4" />}
          error={errors.email}
          autoComplete="email"
        />

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="field-label mb-0">Password</label>
            <Link to="/forgot-password" className="text-xs text-primary-400 hover:text-primary-300 transition-colors">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
              <HiLockClosed className="w-4 h-4" />
            </div>
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-500/60' : ''}`}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
            >
              {showPass ? <HiEyeOff className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="mt-1.5 text-xs text-red-400">{errors.password}</p>}
        </div>

        <Button type="submit" isLoading={mutation.isPending} className="w-full">
          Sign In
        </Button>
      </form>

      <p className="text-center text-sm text-white/50 mt-8">
        Don't have an account?{' '}
        <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
          Create one free
        </Link>
      </p>

      {/* Demo credentials hint */}
      <div className="mt-6 p-4 rounded-xl bg-white/3 border border-white/8">
        <p className="text-xs text-white/40 text-center">
          <span className="font-medium text-white/60">Demo tip:</span> Register a new account to explore all features
        </p>
      </div>
    </motion.div>
  );
};

export default Login;
