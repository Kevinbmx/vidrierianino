<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\LeadController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Example of a protected route with permission middleware
    Route::get('/products', function () {
        return response()->json(['message' => 'You can see products']);
    })->middleware('permission:ver-productos');

    // Rutas para la gestion de imagenes
    Route::apiResource('images', App\Http\Controllers\ImageController::class)->except(['show']);

    // ========== MÓDULO 1: CATÁLOGO Y UOM ==========

    // Categories
    Route::apiResource('categories', App\Http\Controllers\CategoryController::class);
    Route::get('categories/roots/list', [App\Http\Controllers\CategoryController::class, 'roots']);

    // Products and Variants
    Route::apiResource('products', App\Http\Controllers\ProductController::class);
    Route::post('products/{product}/variants', [App\Http\Controllers\ProductController::class, 'addVariant']);
    Route::get('products/{product}/variants', [App\Http\Controllers\ProductController::class, 'variants']);
    Route::post('products/variants/{variant}/adjust-stock', [App\Http\Controllers\ProductController::class, 'adjustStock']);

    // Units of Measure (read-only)
    Route::get('units-of-measure', [App\Http\Controllers\UnitOfMeasureController::class, 'index']);
    Route::get('units-of-measure/by-type/{type}', [App\Http\Controllers\UnitOfMeasureController::class, 'byType']);

    // Suppliers (CRUD completo)
    Route::apiResource('suppliers', App\Http\Controllers\SupplierController::class);
    Route::post('suppliers/{supplier}/deactivate', [App\Http\Controllers\SupplierController::class, 'deactivate']);
    Route::post('suppliers/{supplier}/activate', [App\Http\Controllers\SupplierController::class, 'activate']);

    // Contactos por proveedor (vendedoras, gerentes, etc.)
    Route::get('suppliers/{supplier}/contacts', [App\Http\Controllers\SupplierContactController::class, 'index']);
    Route::post('suppliers/{supplier}/contacts', [App\Http\Controllers\SupplierContactController::class, 'store']);
    Route::put('suppliers/{supplier}/contacts/{contact}', [App\Http\Controllers\SupplierContactController::class, 'update']);
    Route::delete('suppliers/{supplier}/contacts/{contact}', [App\Http\Controllers\SupplierContactController::class, 'destroy']);
    Route::post('suppliers/{supplier}/contacts/{contact}/set-primary', [App\Http\Controllers\SupplierContactController::class, 'setPrimary']);

    // Sucursales por proveedor
    Route::get('suppliers/{supplier}/branches', [App\Http\Controllers\SupplierBranchController::class, 'index']);
    Route::post('suppliers/{supplier}/branches', [App\Http\Controllers\SupplierBranchController::class, 'store']);
    Route::put('suppliers/{supplier}/branches/{branch}', [App\Http\Controllers\SupplierBranchController::class, 'update']);
    Route::delete('suppliers/{supplier}/branches/{branch}', [App\Http\Controllers\SupplierBranchController::class, 'destroy']);
    Route::post('suppliers/{supplier}/branches/{branch}/set-main', [App\Http\Controllers\SupplierBranchController::class, 'setMain']);

    // Supplier Product Offers (Ofertas de proveedores por variante)
    Route::get('product-variants/{variant}/offers', [App\Http\Controllers\SupplierProductOfferController::class, 'index']);
    Route::post('product-variants/{variant}/offers', [App\Http\Controllers\SupplierProductOfferController::class, 'store']);
    Route::get('product-variants/{variant}/best-offer', [App\Http\Controllers\SupplierProductOfferController::class, 'bestOffer']);

    // Gestión individual de ofertas
    Route::get('offers/{offer}', [App\Http\Controllers\SupplierProductOfferController::class, 'show']);
    Route::put('offers/{offer}', [App\Http\Controllers\SupplierProductOfferController::class, 'update']);
    Route::delete('offers/{offer}', [App\Http\Controllers\SupplierProductOfferController::class, 'destroy']);
    Route::post('offers/{offer}/mark-preferred', [App\Http\Controllers\SupplierProductOfferController::class, 'markPreferred']);

    // Admin Lead Management (Protected)
    Route::prefix('leads')->group(function () {
        Route::get('/', [LeadController::class, 'index']);
        Route::get('/stats', [LeadController::class, 'getDashboardStats']);
        Route::get('/{lead}', [LeadController::class, 'show']);
        Route::patch('/{lead}/status', [LeadController::class, 'updateStatus']);
        Route::post('/{lead}/appointment', [LeadController::class, 'scheduleAppointment']);
        Route::post('/{lead}/appointment/cancel', [LeadController::class, 'cancelAppointment']);
        Route::post('/{lead}/visit-done', [LeadController::class, 'markVisitDone']);
        Route::post('/{lead}/quote', [LeadController::class, 'sendQuote']);
        Route::post('/{lead}/approve', [LeadController::class, 'approveProject']);
        Route::post('/{lead}/reject', [LeadController::class, 'rejectProject']);
        Route::post('/{lead}/install', [LeadController::class, 'markInstalled']);
        Route::post('/{lead}/notes', [LeadController::class, 'addNote']);
        Route::post('/{lead}/photos', [LeadController::class, 'uploadPhoto']);
        Route::get('/{lead}/whatsapp', [LeadController::class, 'getWhatsAppLink']);
    });
    // ========== MÓDULO 2: COMPRAS Y RFQ ==========

    // Solicitudes de Cotización (RFQ)
    Route::apiResource('quotation-requests', App\Http\Controllers\QuotationRequestController::class);
    Route::get('quotation-requests/{id}/analyze', [App\Http\Controllers\QuotationRequestController::class, 'analyze']);
    Route::post('quotation-requests/{id}/generate-po', [App\Http\Controllers\QuotationRequestController::class, 'generatePurchaseOrder']);

    // Distribución de RFQ (Padre → Hijos)
    Route::get('quotation-requests/{id}/smart-matrix', [App\Http\Controllers\QuotationRequestController::class, 'getSmartMatrix']);
    Route::post('quotation-requests/{id}/distribute', [App\Http\Controllers\QuotationRequestController::class, 'distribute']);
    Route::post('quotation-requests/{id}/add-supplier', [App\Http\Controllers\QuotationRequestController::class, 'addSupplier']);

    // Gestión de Respuestas (Precios)
    Route::put('quotation-responses/{id}', [App\Http\Controllers\QuotationResponseController::class, 'update']);


    // Órdenes de Compra (PO)
    Route::apiResource('purchase-orders', App\Http\Controllers\PurchaseOrderController::class)->only(['index', 'show']);
    Route::post('purchase-orders/{id}/confirm', [App\Http\Controllers\PurchaseOrderController::class, 'confirm']);
    Route::post('purchase-orders/{id}/receive', [App\Http\Controllers\PurchaseOrderController::class, 'receive']);
    Route::post('purchase-orders/{id}/cancel', [App\Http\Controllers\PurchaseOrderController::class, 'cancel']);

    // Templates (Efficiency)
    Route::get('/packaging-types', [App\Http\Controllers\Api\TemplateController::class, 'getPackagingTypes']);
    Route::get('/dimension-templates', [App\Http\Controllers\Api\TemplateController::class, 'getDimensionTemplates']);

});

// Public Lead Capture (STEP 1)
Route::post('/leads', [LeadController::class, 'store']);

Route::post('/contact', [App\Http\Controllers\MailController::class, 'send']);
