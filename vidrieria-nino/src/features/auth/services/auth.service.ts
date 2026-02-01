import api from '@/lib/axios';
import { User } from '@/types';
import Cookies from 'js-cookie';

export interface LoginCredentials {
    login: string;
    password: string;
}

export interface RegisterData {
    name?: string;
    email?: string;
    phone?: string;
    password: string;
    password_confirmation: string;
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
    user: User;
}

export const authService = {
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        await api.get('/sanctum/csrf-cookie');
        const { data } = await api.post<AuthResponse>('/api/login', credentials);
        return data;
    },

    async register(userData: RegisterData): Promise<{ message: string; user: User }> {
        await api.get('/sanctum/csrf-cookie');
        const { data } = await api.post('/api/register', userData);
        return data;
    },

    async logout(): Promise<void> {
        await api.post('/api/logout');
    },

    async getUser(): Promise<User> {
        const { data } = await api.get<User>('/api/user');
        return data;
    }
};
