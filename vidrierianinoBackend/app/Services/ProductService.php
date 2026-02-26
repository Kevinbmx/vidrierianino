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

        // Manejar actualización de variantes si vienen en el request
        $allVariantsInactive = true;
        if (isset($data['variants']) && is_array($data['variants'])) {
            foreach ($data['variants'] as $variantData) {
                if (!empty($variantData['is_active'])) {
                    $allVariantsInactive = false;
                }

                if (isset($variantData['id'])) {
                    $variant = $product->variants()->find($variantData['id']);
                    if ($variant) {
                        $this->updateVariant($variant, $variantData);
                    }
                } else {
                    $this->createVariant($product, $variantData);
                }
            }
        } else {
            // Si no enviaron variants en el update, no cambiamos los existentes
            $allVariantsInactive = !$product->activeVariants()->exists();
        }

        // Auto-desactivar o activar producto según el estado de las variantes
        $data['is_active'] = !$allVariantsInactive;

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

        // BACKWARD COMPATIBILITY: If dimensions provided in new format, sync to old fields for now
        if (isset($data['dimensions']) && is_array($data['dimensions']) && count($data['dimensions']) > 0) {
            $firstDim = $data['dimensions'][0];
            $data['width'] = $firstDim['width'] ?? null;
            $data['height'] = $firstDim['height'] ?? null;
            $data['length'] = $firstDim['length'] ?? null;
        }

        $variant = ProductVariant::create($data);

        // Crear dimensiones permitidas
        if (isset($data['dimensions']) && is_array($data['dimensions'])) {
            foreach ($data['dimensions'] as $dim) {
                $variant->dimensions()->create([
                    'name' => $dim['name'] ?? 'Estándar',
                    'width' => $dim['width'] ?? null,
                    'height' => $dim['height'] ?? null,
                    'length' => $dim['length'] ?? null,
                    'weight' => $dim['weight'] ?? null,
                    'is_default' => $dim['is_default'] ?? false
                ]);
            }
        }

        // Crear empaques si existen
        if (isset($data['packagings']) && is_array($data['packagings'])) {
            foreach ($data['packagings'] as $pkg) {
                if (!empty($pkg['name']) && !empty($pkg['quantity'])) {
                    $variant->packagings()->create([
                        'name' => $pkg['name'],
                        'quantity' => $pkg['quantity'],
                        'description' => $pkg['description'] ?? null,
                        'is_default_purchase' => $pkg['is_default_purchase'] ?? false
                    ]);
                }
            }
        }

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
        // BACKWARD COMPATIBILITY
        if (isset($data['dimensions']) && is_array($data['dimensions']) && count($data['dimensions']) > 0) {
            $firstDim = $data['dimensions'][0];
            $data['width'] = $firstDim['width'] ?? null;
            $data['height'] = $firstDim['height'] ?? null;
            $data['length'] = $firstDim['length'] ?? null;
        }

        $variant->update($data);

        // Sync Dimensiones: Delete old and re-create (simple approach) or update check
        // For simplicity in this edit, we'll delete and recreate if dimensions are provided
        if (isset($data['dimensions']) && is_array($data['dimensions'])) {
            $variant->dimensions()->delete(); // Remove existing
            foreach ($data['dimensions'] as $dim) {
                $variant->dimensions()->create([
                    'name' => $dim['name'] ?? 'Estándar',
                    'width' => $dim['width'] ?? null,
                    'height' => $dim['height'] ?? null,
                    'length' => $dim['length'] ?? null,
                    'weight' => $dim['weight'] ?? null,
                    'is_default' => $dim['is_default'] ?? false
                ]);
            }
        }

        // Sync Packagings: Similar logic
        if (isset($data['packagings']) && is_array($data['packagings'])) {
            $variant->packagings()->delete();
            foreach ($data['packagings'] as $pkg) {
                if (!empty($pkg['name']) && !empty($pkg['quantity'])) {
                    $variant->packagings()->create([
                        'name' => $pkg['name'],
                        'quantity' => $pkg['quantity'],
                        'description' => $pkg['description'] ?? null,
                        'is_default_purchase' => $pkg['is_default_purchase'] ?? false
                    ]);
                }
            }
        }

        // Actualizar attribute_values si se proporcionan
        if (isset($data['attribute_values']) && is_array($data['attribute_values'])) {
            $variant->attributeValues()->sync($data['attribute_values']);
        }

        return $variant->fresh(['saleUnit', 'attributeValues', 'supplierOffers', 'dimensions']);
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
