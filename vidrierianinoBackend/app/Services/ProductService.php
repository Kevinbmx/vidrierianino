<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Support\Str;

/**
 * ProductService
 * 
 * Maneja CRUD de productos y sus variantes.
 * Adaptado para soportar precios flexibles (fixed/markup) y múltiples proveedores.
 */
class ProductService
{
    /**
     * Crea un producto con sus variantes.
     * 
     * @param array $data ['name', 'category_id', 'variants' => [...]]
     * @return Product
     */
    public function createWithVariants(array $data): Product
    {
        $productData = [
            'name' => $data['name'],
            'slug' => $data['slug'] ?? Str::slug($data['name']),
            'category_id' => $data['category_id'],
            'description' => $data['description'] ?? null,
            'is_active' => $data['is_active'] ?? true,
        ];

        $product = Product::create($productData);

        // Crear variantes si existen
        if (isset($data['variants']) && is_array($data['variants'])) {
            foreach ($data['variants'] as $variantData) {
                $this->createVariant($product, $variantData);
            }
        }

        return $product->load('variants.saleUnit', 'variants.supplierOffers');
    }

    /**
     * Actualiza un producto existente.
     * 
     * @param Product $product
     * @param array $data
     * @return Product
     */
    public function update(Product $product, array $data): Product
    {
        if (isset($data['name']) && !isset($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        $product->update($data);
        return $product->fresh(['category', 'variants.saleUnit']);
    }

    /**
     * Crea una variante de producto.
     * 
     * @param Product $product
     * @param array $data
     * @return ProductVariant
     */
    public function createVariant(Product $product, array $data): ProductVariant
    {
        $data['product_id'] = $product->id;

        // Generar SKU si no existe
        if (!isset($data['sku'])) {
            $data['sku'] = $this->generateSKU($product);
        }

        // Ya no calculamos conversion_factor ni guardamos dimensiones de compra aquí
        // Eso se maneja en SupplierProductOffer ahora.

        $variant = ProductVariant::create($data);

        // Asociar attribute_values si existen
        if (isset($data['attribute_values']) && is_array($data['attribute_values'])) {
            $variant->attributeValues()->attach($data['attribute_values']);
        }

        return $variant;
    }

    /**
     * Actualiza una variante existente.
     * 
     * @param ProductVariant $variant
     * @param array $data
     * @return ProductVariant
     */
    public function updateVariant(ProductVariant $variant, array $data): ProductVariant
    {
        // Ya no hay recálculo de conversion_factor aquí pues las dimensiones se fueron a SupplierProductOffer

        $variant->update($data);

        // Actualizar attribute_values si se proporcionan
        if (isset($data['attribute_values']) && is_array($data['attribute_values'])) {
            $variant->attributeValues()->sync($data['attribute_values']);
        }

        return $variant->fresh(['saleUnit', 'attributeValues', 'supplierOffers']);
    }

    /**
     * Genera un SKU único para la variante.
     * 
     * @param Product $product
     * @return string
     */
    private function generateSKU(Product $product): string
    {
        $prefix = strtoupper(substr(str_replace(' ', '', $product->name), 0, 3));
        $random = strtoupper(Str::random(6));
        $timestamp = now()->format('ymd');

        return "{$prefix}-{$timestamp}-{$random}";
    }

    /**
     * Valida disponibilidad física de material.
     * 
     * @param ProductVariant $variant
     * @param string $requiredQuantity En unidades de venta
     * @return bool
     */
    public function validatePhysicalAvailability(ProductVariant $variant, string $requiredQuantity): bool
    {
        // Simplificación: Validar solo contra stock_quantity actual
        // En el futuro, esto podría verificar lotes específicos o dimensiones de retazos

        return $variant->stock_quantity >= $requiredQuantity;
    }

    /**
     * Ajusta el stock de una variante.
     * 
     * @param ProductVariant $variant
     * @param int $quantity Cantidad a sumar (positivo) o restar (negativo)
     * @param string $reason Motivo del ajuste
     * @return ProductVariant
     */
    public function adjustStock(ProductVariant $variant, int $quantity, string $reason = 'Ajuste manual'): ProductVariant
    {
        $newStock = $variant->stock_quantity + $quantity;

        // Evitar stock negativo
        if ($newStock < 0) {
            throw new \Exception('El stock no puede ser negativo');
        }

        $variant->update(['stock_quantity' => $newStock]);

        // TODO: Registrar en tabla de movimientos de inventario

        return $variant->fresh();
    }
}
