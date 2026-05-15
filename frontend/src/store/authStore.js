import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: true,

      setAccessToken: (token) => set({ accessToken: token }),

      login: async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        set({
          user: data.data.user,
          accessToken: data.data.accessToken,
          isAuthenticated: true,
        });
        return data.data.user;
      },

      register: async (name, email, password) => {
        const { data } = await api.post('/auth/register', { name, email, password });
        set({
          user: data.data.user,
          accessToken: data.data.accessToken,
          isAuthenticated: true,
        });
        return data.data.user;
      },

      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch {
          // ignore errors
        }
        set({ user: null, accessToken: null, isAuthenticated: false });
      },

      fetchMe: async () => {
        try {
          const { data } = await api.get('/auth/me');
          set({ user: data.data.user, isAuthenticated: true, isLoading: false });
        } catch {
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      updateUser: (updates) => set((state) => ({ user: { ...state.user, ...updates } })),
    }),
    {
      name: 'devtrack-auth',
      partializer: (state) => ({ accessToken: state.accessToken }),
    }
  )
);
