
export interface QuotationRequest {
    id: number;
    code: string;
    parent_id?: number | null; // Jerarquía
    deadline: string;
    status: 'draft' | 'ready' | 'sent' | 'viewed' | 'replied' | 'analyzing' | 'awarded' | 'discarded' | 'cancelled';
    comments?: string;
    created_at: string;

    items: QuotationRequestItem[];
    suppliers: QuotationRequestSupplier[];
    responses: QuotationResponse[];
    children?: QuotationRequest[]; // RFQs hijas
}

export interface QuotationRequestItem {
    id: number;
    quotation_request_id: number;
    product_variant_id: number;
    quantity: number;
    unit_id: number;
    notes?: string;

    product_variant?: {
        id: number;
        name: string;
        sku: string;
    };
    unit?: {
        id: number;
        name: string;
        abbreviation: string;
    };
}

export interface QuotationRequestSupplier {
    id: number; // Supplier ID
    name: string;
    email: string;
    phone: string;

    invitation: {
        status: 'pending' | 'viewed' | 'replied' | 'declined';
        submission_channel?: string; // whatsapp, email, portal, manual
        sent_at: string;
        viewed_at?: string;
        replied_at?: string;
        response_document_url?: string;
    };
}

export interface QuotationResponse {
    id: number;
    quotation_request_item_id: number;
    supplier_id: number;
    unit_price: number | null;
    currency: string;
    is_awarded: boolean;
    notes?: string;
    updated_at: string;

    item?: QuotationRequestItem;
    supplier?: {
        id: number;
        name: string;
    };
}

export interface PurchaseOrder {
    id: number;
    code: string;
    supplier_id: number;
    quotation_request_id?: number;
    order_date: string;
    expected_delivery_date?: string;
    status: 'draft' | 'sent' | 'confirmed' | 'completed' | 'cancelled';
    subtotal: number;
    tax_amount: number;
    total_amount: number;
    currency: string;
    notes?: string;
    cancellation_reason?: string;
    created_by: number;
    confirmed_by?: number;
    confirmed_at?: string;
    cancelled_at?: string;

    supplier?: {
        id: number;
        name: string;
    };
    items: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
    id: number;
    purchase_order_id: number;
    product_variant_id: number;
    quantity: number;
    unit_price: number;
    total_line: number;

    product_variant?: {
        id: number;
        name: string;
        sku: string;
    };
}

export interface AnalysisScenario {
    type: 'SINGLE_SUPPLIER' | 'BEST_MIX';
    total_cost: number;
    savings?: number;
    items?: any[]; // Detalle granular
    best_supplier?: any; // Detalle total
}
