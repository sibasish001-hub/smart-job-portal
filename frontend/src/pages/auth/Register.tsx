import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiMail, HiLockClosed, HiUser, HiEye, HiEyeOff } from 'react-icons/hi';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { authApi } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { setPendingEmail } = useAuthStore();
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'JOB_SEEKER' as 'JOB_SEEKER' | 'RECRUITER',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = 'First name is required';
    if (!form.lastName.trim()) e.lastName = 'Last name is required';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email address';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const mutation = useMutation({
    mutationFn: () => authApi.register(form),
    onSuccess: () => {
      setPendingEmail(form.email);
      toast.success('Account created! Please verify your email.');
      navigate('/verify-otp');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Registration failed. Please try again.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) mutation.mutate();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <h2 className="text-2xl font-bold text-white mb-1">Create your account</h2>
      <p className="text-white/50 text-sm mb-8">Join thousands of professionals on Smart Job Portal</p>

      {/* Role toggle */}
      <div className="flex p-1 bg-white/5 rounded-xl border border-white/10 mb-6">
        {(['JOB_SEEKER', 'RECRUITER'] as const).map((role) => (
          <button
            key={role}
            type="button"
            onClick={() => setForm({ ...form, role })}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              form.role === role
                ? 'bg-primary-500 text-white shadow-lg'
                : 'text-white/50 hover:text-white'
            }`}
          >
            {role === 'JOB_SEEKER' ? '🔍 Job Seeker' : '🏢 Recruiter'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name" placeholder="John"
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            icon={<HiUser className="w-4 h-4" />}
            error={errors.firstName}
          />
          <Input
            label="Last Name" placeholder="Doe"
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            error={errors.lastName}
          />
        </div>

        <Input
          label="Email Address" type="email" placeholder="you@example.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          icon={<HiMail className="w-4 h-4" />}
          error={errors.email}
        />

        <div>
          <label className="field-label">Password</label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
              <HiLockClosed className="w-4 h-4" />
            </div>
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="At least 6 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-500/60' : ''}`}
            />
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
              {showPass ? <HiEyeOff className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="mt-1.5 text-xs text-red-400">{errors.password}</p>}
        </div>

        <Button type="submit" isLoading={mutation.isPending} className="w-full mt-2">
          Create Account
        </Button>
      </form>

      <p className="text-center text-sm text-white/50 mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Sign in</Link>
      </p>
    </motion.div>
  );
};

export default Register;
