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

/**
 * Representa un lote físico de inventario.
 * Contiene las dimensiones reales de las piezas compradas.
 */
export interface InventoryBatch {
    id: number;
    batch_code: string;
    physical_quantity: number | string;       // Cantidad física (ej: 10 planchas)
    dimensions: {
        width?: number;
        height?: number;
        length?: number;
        weight?: number;
    } | null;
    dimension_label: string;                  // Etiqueta legible ej: "3.60 × 2.50 m"
    location?: string;
    status: 'available' | 'reserved' | 'consumed' | 'quarantine';
    purchase_order_id?: number;
    created_at?: string;
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
    rif?: string | null;
    payment_terms?: string | null;
    website?: string | null;
    notes?: string | null;
    is_active: boolean;
    offers_count?: number;
    product_offers?: any[];
    primary_contact?: {
        id: number;
        name: string;
        role?: string;
        phone?: string;
        email?: string;
    };
    main_branch?: {
        id: number;
        name: string;
        address?: string;
        city?: string;
    };
    created_at?: string;
    updated_at?: string;
}

export interface SupplierProductOffer {
    id: number;
    supplier_id: number;
    product_variant_id: number;

    // Datos de compra
    supplier_sku?: string; // Código del proveedor
    cost: number | string;
    purchase_unit_id: number;
    pack_quantity: number | string; // Factor de empaque (ej: 30)
    purchase_width?: number | string | null;
    purchase_height?: number | string | null;
    purchase_length?: number | string | null;
    delivery_days?: number; // Tiempo de entrega

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
    price: number | string;
    markup_percentage?: number | string | null;
    final_price: number | string;

    sale_unit_id: number;
    sale_unit?: UnitOfMeasure;
    sale_unit_type?: 'area' | 'length' | 'weight' | 'unit'; // Tipo para cálculos
    sale_unit_abbr?: string;                                 // Abreviación para la UI (m², ml, etc.)

    // Dimensiones (legacy, retrocompatibilidad)
    width?: number;
    height?: number;
    length?: number;
    total_dimension?: number;

    // Dimensiones múltiples
    dimensions?: ProductVariantDimension[];

    // Empaques
    packagings?: ProductVariantPackaging[];

    // 📦 Stock real calculado desde inventory_batches
    total_abstract_stock: number | string;  // ej: 150.5 (m², ml, kg o pzas)
    inventory_valuation: number | string;   // ej: 375000.00 ($)

    // Stock legacy
    stock_quantity: number;
    min_stock: number;
    is_low_stock: boolean;  // true si total_abstract_stock < min_stock
    has_stock: boolean;

    attributes?: AttributeValue[];

    // Lotes de inventario físico
    inventory_batches?: InventoryBatch[];

    // Ofertas de proveedores
    supplier_offers?: SupplierProductOffer[];
    best_offer?: SupplierProductOffer;

    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface ProductVariantPackaging {
    id: number;
    name: string; // "Caja"
    quantity: number; // 30
    description?: string;
    is_default_purchase: boolean;
}

export interface ProductVariantDimension {
    id: number;
    name: string;
    width?: number;
    height?: number;
    length?: number;
    weight?: number;
    is_default: boolean;
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
export interface PackagingType {
    id: number;
    name: string;
    default_quantity: number;
    description?: string;
}

export interface DimensionTemplate {
    id: number;
    name: string;
    width?: number;
    height?: number;
    length?: number;
    type: 'area' | 'length' | 'unit';
    description?: string;
}
