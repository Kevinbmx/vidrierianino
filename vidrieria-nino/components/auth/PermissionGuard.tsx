import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';

interface PermissionGuardProps {
    children: React.ReactNode;
    permissions: string | string[];
    fallback?: React.ReactNode;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({ children, permissions, fallback = null }) => {
    const { hasPermission } = usePermissions();

    if (hasPermission(permissions)) {
        return <>{children}</>;
    }

    return <>{fallback}</>;
};

export default PermissionGuard;
