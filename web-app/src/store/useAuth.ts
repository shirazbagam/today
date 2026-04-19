import { create } from 'zustand';

interface AuthState {
  user: any | null;
  token: string | null;
  setAuth: (user: any, token: string) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  token: null,
  setAuth: (user, token) => {
    localStorage.setItem('ajk_token', token);
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem('ajk_token');
    set({ user: null, token: null });
  },
}));
