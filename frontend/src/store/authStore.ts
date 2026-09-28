import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '../types';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  pendingVerificationEmail: string | null;

  setAuth: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  setPendingEmail: (email: string) => void;
  clearPendingEmail: () => void;
  updateTokens: (accessToken: string, refreshToken: string) => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      pendingVerificationEmail: null,

      setAuth: (user, accessToken, refreshToken) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        set({ user, accessToken, refreshToken });
      },

      clearAuth: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({ user: null, accessToken: null, refreshToken: null });
      },

      setPendingEmail: (email) => set({ pendingVerificationEmail: email }),
      clearPendingEmail: () => set({ pendingVerificationEmail: null }),

      updateTokens: (accessToken, refreshToken) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        set({ accessToken, refreshToken });
      },

      isAuthenticated: () => !!get().user && !!get().accessToken,
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        pendingVerificationEmail: state.pendingVerificationEmail,
      }),
    }
  )
);
