import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Cookies from 'js-cookie';
import api, { getCsrfToken } from '@/lib/axios';
import { User } from '@/types';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    login: (credentials: any) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => void;
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
                await getCsrfToken();
                const { data } = await api.post('/api/login', credentials);
                Cookies.set('auth_token', data.access_token, { expires: 7, secure: process.env.NODE_ENV === 'production' });
                set({ user: data.user, isAuthenticated: true });
            },

            register: async (userData) => {
                await getCsrfToken();
                await api.post('/api/register', userData);
            },

            logout: async () => {
                try {
                    await api.post('/api/logout');
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
                        const { data } = await api.get('/api/user');
                        set({ user: data, isAuthenticated: true });
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
            storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
        }
    )
);
