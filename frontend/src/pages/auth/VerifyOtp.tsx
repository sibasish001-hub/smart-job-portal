import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import { authApi } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import type { AuthUser } from '../../types';

const VerifyOtp: React.FC = () => {
  const navigate = useNavigate();
  const { pendingVerificationEmail, clearPendingEmail, setAuth } = useAuthStore();
  const [otp, setOtp] = useState(Array(6).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [countdown, setCountdown] = useState(120);

  useEffect(() => {
    inputRefs.current[0]?.focus();
    const timer = setInterval(() => setCountdown((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[index] = val.slice(-1);
    setOtp(newOtp);
    if (val && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...Array(6).fill('')];
    pasted.split('').forEach((ch, i) => { newOtp[i] = ch; });
    setOtp(newOtp);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const mutation = useMutation({
    mutationFn: () => authApi.verifyOtp({ email: pendingVerificationEmail!, otp: otp.join('') }),
    onSuccess: (data) => {
      // Auto-login: set auth state with returned tokens and user info
      const user: AuthUser = {
        id: data.id,
        email: data.email,
        role: data.role,
        isVerified: data.isVerified,
        firstName: data.firstName,
        lastName: data.lastName,
      };
      setAuth(user, data.accessToken, data.refreshToken);
      clearPendingEmail();
      toast.success(`Welcome, ${data.firstName}! Your account is verified 🎉`);

      // Redirect directly to the correct dashboard — no login needed!
      if (data.role === 'RECRUITER') navigate('/recruiter/dashboard');
      else if (data.role === 'ADMIN') navigate('/admin/dashboard');
      else navigate('/dashboard');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Invalid or expired OTP');
      setOtp(Array(6).fill(''));
      inputRefs.current[0]?.focus();
    },
  });

  const resendMutation = useMutation({
    mutationFn: () => authApi.forgotPassword({ email: pendingVerificationEmail! }),
    onSuccess: () => { toast.success('New OTP sent!'); setCountdown(120); },
    onError: () => toast.error('Could not resend OTP'),
  });

  if (!pendingVerificationEmail) {
    navigate('/register');
    return null;
  }

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
          style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.2),rgba(6,182,212,0.2))' }}>
          📧
        </div>
      </div>

      <h2 className="text-2xl font-bold text-white mb-1 text-center">Check your email</h2>
      <p className="text-white/50 text-sm text-center mb-2">We sent a 6-digit code to</p>
      <p className="text-primary-400 text-sm font-medium text-center mb-8">{pendingVerificationEmail}</p>

      {/* OTP inputs */}
      <div className="flex justify-center gap-3 mb-8" onPaste={handlePaste}>
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className={`w-12 h-14 text-center text-2xl font-bold rounded-xl border transition-all duration-200 outline-none
              ${digit ? 'border-primary-500 bg-primary-500/10 text-white' : 'border-white/10 bg-white/5 text-white/60'}
              focus:border-primary-500 focus:bg-primary-500/10 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.2)]`}
          />
        ))}
      </div>

      <Button
        className="w-full mb-4"
        isLoading={mutation.isPending}
        disabled={otp.join('').length < 6}
        onClick={() => mutation.mutate()}
      >
        Verify &amp; Go to Dashboard
      </Button>

      <div className="text-center">
        {countdown > 0 ? (
          <p className="text-sm text-white/40">
            Resend code in <span className="text-primary-400 font-medium">{fmt(countdown)}</span>
          </p>
        ) : (
          <button
            onClick={() => resendMutation.mutate()}
            disabled={resendMutation.isPending}
            className="text-sm text-primary-400 hover:text-primary-300 font-medium transition-colors"
          >
            {resendMutation.isPending ? 'Sending...' : 'Resend OTP'}
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default VerifyOtp;
