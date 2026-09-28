import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiLockClosed } from 'react-icons/hi';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { authApi } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const { pendingVerificationEmail, clearPendingEmail } = useAuthStore();
  const [form, setForm] = useState({ otp: '', newPassword: '', confirm: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.otp || form.otp.length < 6) e.otp = 'Valid 6-digit OTP is required';
    if (!form.newPassword || form.newPassword.length < 6) e.newPassword = 'Password must be at least 6 characters';
    if (form.newPassword !== form.confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const mutation = useMutation({
    mutationFn: () => authApi.resetPassword({ email: pendingVerificationEmail!, otp: form.otp, newPassword: form.newPassword }),
    onSuccess: () => {
      toast.success('Password reset successfully!');
      clearPendingEmail();
      navigate('/login');
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Reset failed'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) mutation.mutate();
  };

  if (!pendingVerificationEmail) {
    navigate('/forgot-password');
    return null;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <h2 className="text-2xl font-bold text-white mb-1">Reset your password</h2>
      <p className="text-white/50 text-sm mb-8">
        Enter the OTP sent to <span className="text-primary-400">{pendingVerificationEmail}</span>
      </p>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <Input
          label="OTP Code" type="text" placeholder="6-digit code" maxLength={6}
          value={form.otp}
          onChange={(e) => setForm({ ...form, otp: e.target.value.replace(/\D/g, '') })}
          error={errors.otp}
        />
        <Input
          label="New Password" type="password" placeholder="At least 6 characters"
          value={form.newPassword}
          onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
          icon={<HiLockClosed className="w-4 h-4" />}
          error={errors.newPassword}
        />
        <Input
          label="Confirm Password" type="password" placeholder="Repeat new password"
          value={form.confirm}
          onChange={(e) => setForm({ ...form, confirm: e.target.value })}
          icon={<HiLockClosed className="w-4 h-4" />}
          error={errors.confirm}
        />
        <Button type="submit" isLoading={mutation.isPending} className="w-full">Reset Password</Button>
      </form>

      <p className="text-center text-sm text-white/50 mt-8">
        <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">← Back to login</Link>
      </p>
    </motion.div>
  );
};

export default ResetPassword;
