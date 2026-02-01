import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { User } from '@/types';
import { authService, LoginCredentials, RegisterData } from '@/features/auth/services/auth.service';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
    fetchUser: () => Promise<void>;
    setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,

            setUser: (user) => {
                set({ user, isAuthenticated: !!user });
            },

            login: async (credentials) => {
                const data = await authService.login(credentials);
                Cookies.set('auth_token', data.access_token, { expires: 7, secure: process.env.NODE_ENV === 'production' });
                set({ user: data.user, isAuthenticated: true });
            },

            register: async (userData) => {
                await authService.register(userData);
            },

            logout: async () => {
                try {
                    await authService.logout();
                } catch (error) {
                    console.error('Logout failed', error);
                } finally {
                    Cookies.remove('auth_token');
                    set({ user: null, isAuthenticated: false });
                }
            },

            fetchUser: async () => {
                if (Cookies.get('auth_token')) {
                    try {
                        const user = await authService.getUser();
                        set({ user, isAuthenticated: true });
                    } catch (error) {
                        console.error('Failed to fetch user', error);
                        Cookies.remove('auth_token');
                        set({ user: null, isAuthenticated: false });
                    }
                } else {
                    set({ user: null, isAuthenticated: false });
                }
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => sessionStorage),
        }
    )
);
