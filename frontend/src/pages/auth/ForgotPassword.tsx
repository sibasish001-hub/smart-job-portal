import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiMail } from 'react-icons/hi';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { authApi } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const { setPendingEmail } = useAuthStore();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: () => authApi.forgotPassword({ email }),
    onSuccess: () => {
      setPendingEmail(email);
      toast.success('Reset OTP sent to your email');
      navigate('/reset-password');
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to send OTP'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError('Email is required'); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Invalid email'); return; }
    setError('');
    mutation.mutate();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
          style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.2),rgba(6,182,212,0.2))' }}>
          🔑
        </div>
      </div>
      <h2 className="text-2xl font-bold text-white mb-1 text-center">Forgot password?</h2>
      <p className="text-white/50 text-sm mb-8 text-center">
        Enter your email and we'll send you a reset code.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <Input
          label="Email Address" type="email" placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<HiMail className="w-4 h-4" />}
          error={error}
        />
        <Button type="submit" isLoading={mutation.isPending} className="w-full">
          Send Reset Code
        </Button>
      </form>

      <p className="text-center text-sm text-white/50 mt-8">
        <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">← Back to login</Link>
      </p>
    </motion.div>
  );
};

export default ForgotPassword;
