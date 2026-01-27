

'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import PermissionGuard from '@/components/auth/PermissionGuard';
import { Button } from '@heroui/react';

export default function AdminPage() {
    const { user, logout } = useAuth();
    const { hasRole } = usePermissions();

    return (
        <div>
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <Button onClick={logout} color="danger">Logout</Button>
            </header>
            
            <div className="space-y-4">
                <p>Welcome, {user?.name || user?.email || 'User'}!</p>
                <p>Your roles: {user?.roles.map(r => r.name).join(', ')}</p>

                <PermissionGuard permissions="ver-usuarios">
                    <div className="p-4 border rounded-lg bg-default-100">
                        <h2 className="text-xl">User Management</h2>
                        <p>Here you can manage users because you have the 'ver-usuarios' permission.</p>
                    </div>
                </PermissionGuard>

                <PermissionGuard permissions="ver-reportes-financieros">
                    <div className="p-4 border rounded-lg bg-default-100">
                        <h2 className="text-xl">Financial Reports</h2>
                        <p>Here you can see financial reports because you have the 'ver-reportes-financieros' permission.</p>
                    </div>
                </PermissionGuard>

                {hasRole('super-admin') && (
                     <div className="p-4 border rounded-lg bg-primary-50 text-primary-600">
                        <h2 className="text-xl">Super Admin Area</h2>
                        <p>You see this because you are a Super Admin.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

