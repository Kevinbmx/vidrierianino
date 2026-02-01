import { useAuthStore } from '@/stores/authStore';

export const useAuth = () => {
    const user = useAuthStore((state) => state.user);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const login = useAuthStore((state) => state.login);
    const logout = useAuthStore((state) => state.logout);
    const register = useAuthStore((state) => state.register);
    const fetchUser = useAuthStore((state) => state.fetchUser);

    return { user, isAuthenticated, login, logout, register, fetchUser };
};
