export interface User {
    id: number;
    name: string | null;
    email: string | null;
    phone: string | null;
    is_active: boolean;
    roles: Role[];
    permissions: Permission[];
}

export interface Role {
    name: string;
}

export interface Permission {
    name: string;
}
