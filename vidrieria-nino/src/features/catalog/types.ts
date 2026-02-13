export interface Category {
    id: number;
    name: string;
    slug: string;
    description?: string;
    parent_id?: number | null;
    order: number;
    is_active: boolean;
    parent?: Category;
    children?: Category[];
    products_count?: number;
    created_at?: string;
    updated_at?: string;
}

export type UnitType = 'area' | 'length' | 'unit' | 'weight';

export interface UnitOfMeasure {
    id: number;
    name: string;
    abbreviation: string;
    type: UnitType;
    created_at?: string;
}

export interface Attribute {
    id: number;
    name: string;
    slug: string;
    input_type: 'text' | 'number' | 'select' | 'color';
}

export interface AttributeValue {
    id: number;
    value: string;
    attribute?: Attribute;
}

export type PricingMode = 'fixed' | 'markup';

export interface Supplier {
    id: number;
    name: string;
    contact_name?: string;
    email?: string;
    phone?: string;
    address?: string;
    notes?: string;
    is_active: boolean;
    offers_count?: number;
    created_at?: string;
    updated_at?: string;
}

export interface SupplierProductOffer {
    id: number;
    supplier_id: number;
    product_variant_id: number;

    // Datos de compra
    cost: number | string;
    purchase_unit_id: number;
    purchase_width?: number | string | null;
    purchase_height?: number | string | null;
    purchase_length?: number | string | null;

    // Cálculos automáticos
    base_unit_cost: number | string;
    total_area?: number | string | null;

    // Metadata
    is_preferred: boolean;
    is_active: boolean;
    notes?: string;

    // Relaciones
    supplier?: Supplier;
    purchase_unit?: UnitOfMeasure;
    product_variant?: ProductVariant;

    created_at?: string;
    updated_at?: string;
}

export interface ProductVariant {
    id: number;
    sku: string;
    name?: string;

    // Flexible Pricing
    pricing_mode: PricingMode;
    price: number | string; // Usado solo si pricing_mode = 'fixed'
    markup_percentage?: number | string | null; // Usado solo si pricing_mode = 'markup'
    final_price: number | string; // Calculado dinámicamente

    sale_unit_id: number;
    sale_unit?: UnitOfMeasure;

    stock_quantity: number;
    min_stock: number;
    is_low_stock: boolean;
    has_stock: boolean;

    attributes?: AttributeValue[];

    // Ofertas de proveedores
    supplier_offers?: SupplierProductOffer[];
    best_offer?: SupplierProductOffer;

    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface Product {
    id: number;
    name: string;
    slug: string;
    description?: string;
    category_id?: number;
    category?: Category;
    variants?: ProductVariant[];
    has_stock?: boolean;
    cheapest_price?: number | string;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

// API Responses
export interface PaginatedResponse<T> {
    data: T[];
    links: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
    };
    meta: {
        current_page: number;
        from: number;
        last_page: number;
        path: string;
        per_page: number;
        to: number;
        total: number;
    };
}

export interface SingleResponse<T> {
    data: T;
}
