import { create } from 'zustand';
import { User, UserRole } from '../types';
import { authApi } from '../lib/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
  switchRole: (role: UserRole) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => {
  const storedUserStr = localStorage.getItem('verifyiq_current_user');
  const storedToken = localStorage.getItem('verifyiq_access_token');
  
  let initialUser: User | null = null;
  if (storedUserStr) {
    try {
      initialUser = JSON.parse(storedUserStr);
    } catch {
      initialUser = null;
    }
  }

  return {
    user: initialUser,
    isAuthenticated: !!initialUser && !!storedToken,
    token: storedToken,

    setUser: (user) => {
      if (user) {
        localStorage.setItem('verifyiq_current_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('verifyiq_current_user');
      }
      set((state) => ({ user, isAuthenticated: !!user && (!!state.token || !!localStorage.getItem('verifyiq_access_token')) }));
    },

    setToken: (token) => {
      if (token) {
        localStorage.setItem('verifyiq_access_token', token);
      } else {
        localStorage.removeItem('verifyiq_access_token');
      }
      set((state) => ({ token, isAuthenticated: (!!state.user || !!localStorage.getItem('verifyiq_current_user')) && !!token }));
    },

    logout: () => {
      localStorage.removeItem('verifyiq_access_token');
      localStorage.removeItem('verifyiq_refresh_token');
      localStorage.removeItem('verifyiq_current_user');
      set({ user: null, isAuthenticated: false, token: null });
    },

    // Demo role-hopping removed — each person registers their own account
    switchRole: async (_role: UserRole) => {
      console.warn('Role switching is disabled. Register or log in with the correct account.');
    },
  };
});
