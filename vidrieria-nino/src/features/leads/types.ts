export interface Lead {
    id: number;
    name: string;
    phone: string;
    email: string;
    location: string;
    project_type: string;
    is_local: boolean;
    status: 'new' | 'contacted' | 'video_call_scheduled' | 'visit_scheduled' | 'quoted' | 'closed';
    created_at: string;
}

export interface CreateLeadDTO {
    name: string;
    phone: string;
    email: string;
    location: string;
    project_type: string;
}

export const LEAD_LOCATIONS = [
    "Montero",
    "Otra ciudad en Santa Cruz",
    "Santa Cruz de la Sierra",
    "Otra ciudad/departamento"
] as const;
