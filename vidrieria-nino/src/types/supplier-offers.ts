/**
 * Tipos de la API para módulo de Ofertas de Proveedores
 * 
 * Espeja los modelos de Laravel para type safety en el frontend.
 */

// ========== UNITS OF MEASURE ==========

export interface UnitOfMeasure {
    id: number;
    name: string;
    abbreviation: string;
    type: 'length' | 'area' | 'volume' | 'unit';
    created_at: string;
    updated_at: string;
}

// ========== SUPPLIERS ==========

export interface Supplier {
    id: number;
    name: string;
    contact_person: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    notes: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

// ========== PRODUCTS & VARIANTS ==========

export interface Product {
    id: number;
    name: string;
    description: string | null;
    category_id: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface ProductVariant {
    id: number;
    product_id: number;
    sku: string | null;
    name: string;
    attribute_values: Record<string, any>;
    stock_quantity: number;
    unit_of_measure_id: number;
    cost: string;
    price: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;

    // Relaciones opcionales
    product?: Product;
    unit_of_measure?: UnitOfMeasure;
    supplier_offers?: SupplierProductOffer[];
}

// ========== SUPPLIER PRODUCT OFFERS ==========

/**
 * Oferta comercial de un proveedor para una variante de producto.
 * 
 * Lógica de Negocio:
 * - Permite comparar precios entre proveedores
 * - base_unit_cost es el costo normalizado por m² o metro lineal
 * - document_url contiene la URL del PDF o imagen de cotización
 */
export interface SupplierProductOffer {
    id: number;
    supplier_id: number;
    product_variant_id: number;
    purchase_unit_id: number;

    // Datos de compra
    cost: string;
    purchase_width: string | null;
    purchase_height: string | null;
    purchase_length: string | null;

    // Cálculos derivados
    base_unit_cost?: string;
    total_area?: string;

    // Metadata
    is_preferred: boolean;
    is_active: boolean;
    notes: string | null;
    document_url: string | null;

    // Timestamps
    created_at: string;
    updated_at: string;

    // Relaciones opcionales (cargadas con `with`)
    supplier?: Supplier;
    product_variant?: ProductVariant;
    purchase_unit?: UnitOfMeasure;
}

/**
 * Entrada de historial de cambios en una oferta.
 */
export interface SupplierProductOfferHistory {
    id: number;
    supplier_product_offer_id: number;
    supplier_id: number;
    product_variant_id: number;
    purchase_unit_id: number;

    // Snapshot de datos históricos
    cost: string;
    purchase_width: string | null;
    purchase_height: string | null;
    purchase_length: string | null;
    is_preferred: boolean;
    is_active: boolean;
    notes: string | null;
    document_url: string | null;

    // Metadata de auditoría
    change_type: 'created' | 'updated' | 'deactivated';
    changed_by_user_id: number | null;
    change_reason: string | null;
    changed_at: string;
    created_at: string;

    // Relaciones opcionales
    supplier?: Supplier;
    product_variant?: ProductVariant;
    purchase_unit?: UnitOfMeasure;
    changed_by_user?: {
        id: number;
        name: string;
        email: string;
    };
}

// ========== FORM DATA TYPES ==========

/**
 * Datos para crear una nueva oferta de proveedor.
 */
export interface CreateSupplierProductOfferData {
    supplier_id: number;
    product_variant_id: number;
    cost: number | string;
    purchase_unit_id: number;
    purchase_width?: number | string | null;
    purchase_height?: number | string | null;
    purchase_length?: number | string | null;
    is_preferred?: boolean;
    is_active?: boolean;
    notes?: string | null;
    document_url?: string | null;
}

/**
 * Datos para actualizar una oferta existente.
 */
export interface UpdateSupplierProductOfferData {
    supplier_id?: number;
    product_variant_id?: number;
    cost?: number | string;
    purchase_unit_id?: number;
    purchase_width?: number | string | null;
    purchase_height?: number | string | null;
    purchase_length?: number | string | null;
    is_preferred?: boolean;
    is_active?: boolean;
    notes?: string | null;
    document_url?: string | null;
    change_reason?: string | null;
}
