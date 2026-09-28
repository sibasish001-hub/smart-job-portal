import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../services/api';
import type { LoginRequest, RegisterRequest, AuthUser } from '../types';

export const useAuth = () => {
  const { user, setAuth, clearAuth, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (data) => {
      const authUser: AuthUser = {
        id: data.id,
        email: data.email,
        role: data.role,
        isVerified: data.isVerified,
        firstName: data.firstName,
        lastName: data.lastName,
      };
      setAuth(authUser, data.accessToken, data.refreshToken);
      toast.success(`Welcome back, ${data.firstName}!`);

      // Role-based redirect
      if (data.role === 'JOB_SEEKER') navigate('/dashboard');
      else if (data.role === 'RECRUITER') navigate('/recruiter/dashboard');
      else if (data.role === 'ADMIN') navigate('/admin/dashboard');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Login failed. Please try again.';
      toast.error(msg);
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: (_, variables) => {
      useAuthStore.getState().setPendingEmail(variables.email);
      toast.success('Account created! Please verify your email.');
      navigate('/verify-otp');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Registration failed.';
      toast.error(msg);
    },
  });

  const logout = () => {
    clearAuth();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return {
    user,
    isAuthenticated: isAuthenticated(),
    loginMutation,
    registerMutation,
    logout,
  };
};
