import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY } from "@/constants";
import type { AuthUser, AuthTokens } from "@/types";

interface AuthState {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  setAuth: (user: AuthUser, tokens: AuthTokens) => void;
  updateUser: (data: Partial<AuthUser>) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,

      setAuth: (user, tokens) => {
        localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
        set({ user, tokens, isAuthenticated: true });
      },

      updateUser: (data) =>
        set((s) => ({ user: s.user ? { ...s.user, ...data } : null })),

      clearAuth: () => {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        set({ user: null, tokens: null, isAuthenticated: false });
      },
    }),
    {
      name: USER_KEY,
      partialize: (s) => ({ user: s.user, tokens: s.tokens, isAuthenticated: s.isAuthenticated }),
    }
  )
);
