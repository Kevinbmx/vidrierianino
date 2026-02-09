// Lead Status Types - 10 Step Workflow
export type LeadStatus =
    | 'new'
    | 'contacted'
    | 'no_answer'
    | 'appointment_scheduled'
    | 'visit_done'
    | 'quoted'
    | 'approved'
    | 'rejected'
    | 'installed'
    | 'warranty_active';

export type AppointmentType = 'visita' | 'videollamada';
export type PhotoStage = 'captura' | 'visita' | 'instalacion' | 'garantia';

// Main Lead Interface
export interface Lead {
    id: number;
    name: string;
    phone: string;
    email: string;
    location: string;
    project_type: string;
    is_local: boolean;
    status: LeadStatus;

    // Appointment fields
    appointment_at: string | null;
    appointment_type: AppointmentType | null;
    address_details: string | null;

    // Quote fields
    quote_sent_at: string | null;
    quote_amount: number | null;
    payment_advance: number | null;
    days_in_quoted: number | null;

    // Installation & Warranty
    installed_at: string | null;
    warranty_ends_at: string | null;
    warranty_next_check: string | null;
    warranty_days_remaining: number | null;

    // Rejection
    rejection_reason: string | null;

    // Timestamps
    created_at: string;
    updated_at: string;

    // Relationships
    notes?: LeadNote[];
    photos?: LeadPhoto[];
    status_history?: LeadStatusHistory[];
    appointment_history?: LeadAppointmentHistory[];
}

export interface LeadAppointmentHistory {
    id: number;
    type: 'scheduled' | 'cancelled';
    appointment_at: string;
    appointment_type?: AppointmentType;
    reason?: string;
    user_name: string;
    created_at: string;
}

export interface LeadNote {
    id: number;
    content: string;
    created_at: string;
}

export interface LeadPhoto {
    id: number;
    firebase_url: string;
    stage: PhotoStage;
    comment: string | null;
    created_at: string;
}

export interface LeadStatusHistory {
    id: number;
    from_status: LeadStatus | null;
    to_status: LeadStatus;
    user_name: string;
    created_at: string;
}

// DTOs for mutations
export interface CreateLeadDTO {
    name: string;
    phone: string;
    email: string;
    location: string;
    project_type: string;
}

export interface UpdateStatusDTO {
    status: LeadStatus;
    note?: string;
}

export interface ScheduleAppointmentDTO {
    appointment_at: string; // ISO date string
    appointment_type: AppointmentType;
    address_details?: string;
}

export interface SendQuoteDTO {
    amount: number;
    note?: string;
}

export interface ApproveProjectDTO {
    advance: number;
    note?: string;
}

export interface RejectProjectDTO {
    reason: string;
}

export interface MarkInstalledDTO {
    installed_at: string; // ISO date string
    note?: string;
}

export interface AddNoteDTO {
    content: string;
}

export interface UploadPhotoDTO {
    firebase_url: string;
    firebase_path?: string;
    stage: PhotoStage;
    comment?: string;
}

// Dashboard Stats
export interface DashboardStats {
    new_today: number;
    no_answer: number;
    appointments_this_week: number;
    quoted: number;
    active_projects: number;
    warranties: number;
}

// Constants
export const LEAD_LOCATIONS = [
    "Montero",
    "Santa Cruz de la Sierra",
    "Warnes",
    "Otra ciudad en Santa Cruz",
    "Otro departamento"
] as const;

export const STATUS_COLORS: Record<LeadStatus, string> = {
    new: 'red',
    contacted: 'yellow',
    no_answer: 'orange',
    appointment_scheduled: 'blue',
    visit_done: 'purple',
    quoted: 'purple',
    approved: 'green',
    rejected: 'gray',
    installed: 'emerald',
    warranty_active: 'sky',
};

export const STATUS_LABELS: Record<LeadStatus, string> = {
    new: 'Nuevo',
    contacted: 'Contactado',
    no_answer: 'Sin Respuesta',
    appointment_scheduled: 'Cita Agendada',
    visit_done: 'Visita Realizada',
    quoted: 'Presupuesto Enviado',
    approved: 'Proyecto Aprobado',
    rejected: 'No Concretado',
    installed: 'Instalado',
    warranty_active: 'Garantía Activa',
};
