import { useAuth } from './useAuth';

export const usePermissions = () => {
    const { user } = useAuth();

    const hasRole = (roles: string | string[]): boolean => {
        if (!user) return false;
        const userRoles = user.roles.map(r => r.name);
        const requiredRoles = Array.isArray(roles) ? roles : [roles];
        return requiredRoles.some(role => userRoles.includes(role));
    };

    const hasPermission = (permissions: string | string[]): boolean => {
        if (!user) return false;
        if (hasRole('super-admin')) return true; // super-admin has all permissions
        const userPermissions = user.permissions.map(p => p.name);
        const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];
        return requiredPermissions.every(permission => userPermissions.includes(permission));
    };

    const hasAnyPermission = (permissions: string[]): boolean => {
        if (!user) return false;
        if (hasRole('super-admin')) return true;
        const userPermissions = user.permissions.map(p => p.name);
        return permissions.some(permission => userPermissions.includes(permission));
    };

    return { user, hasRole, hasPermission, hasAnyPermission };
};
