import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    id: string;
    email: string;
    name: string;
}

interface AuthState {
    token: string | null;
    refreshToken: string | null;
    user: User | null;
    isAuthenticated: boolean;
    setAuth: (token: string, user: User, refreshToken?: string) => void;
    clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            refreshToken: null,
            user: null,
            isAuthenticated: false,
            setAuth: (token, user, refreshToken) =>
                set((state) => ({
                    token,
                    user,
                    isAuthenticated: true,
                    refreshToken: refreshToken ?? state.refreshToken,
                })),
            clearAuth: () =>
                set({ token: null, refreshToken: null, user: null, isAuthenticated: false }),
        }),
        {
            name: 'velocity-auth-storage',
        }
    )
);
