<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * StoreProductVariantRequest
 * 
 * Validación para creación de variantes de producto.
 */
class StoreProductVariantRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'product_id' => 'required|exists:products,id',
            'sku' => 'nullable|string|unique:product_variants,sku|max:255',
            'name' => 'nullable|string|max:255',

            // Flexible Pricing
            'pricing_mode' => 'nullable|in:fixed,markup',
            'price' => 'required_if:pricing_mode,fixed|nullable|numeric|min:0',
            'markup_percentage' => 'required_if:pricing_mode,markup|nullable|numeric|min:0|max:1000',

            // Units
            'sale_unit_id' => 'required|exists:units_of_measure,id',

            // Stock
            'stock_quantity' => 'nullable|integer|min:0',
            'min_stock' => 'nullable|integer|min:0',

            // Attributes
            'attribute_values' => 'nullable|array',
            'attribute_values.*' => 'exists:attribute_values,id',

            // New: Packagings
            'packagings' => 'nullable|array',
            'packagings.*.name' => 'required|string|max:50',
            'packagings.*.quantity' => 'required|numeric|min:0.0001',
            'packagings.*.description' => 'nullable|string|max:255',
            'packagings.*.is_default_purchase' => 'nullable|boolean',

            // New: Dimensions (Multi-Format)
            'dimensions' => 'nullable|array',
            'dimensions.*.name' => 'nullable|string|max:50',
            'dimensions.*.width' => 'nullable|numeric|min:0',
            'dimensions.*.height' => 'nullable|numeric|min:0',
            'dimensions.*.length' => 'nullable|numeric|min:0',
            'dimensions.*.weight' => 'nullable|numeric|min:0',
            'dimensions.*.is_default' => 'nullable|boolean',

            'is_active' => 'nullable|boolean',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array
     */
    public function messages(): array
    {
        return [
            'product_id.required' => 'El producto es obligatorio.',
            'price.required' => 'El precio de venta es obligatorio.',
            'cost.required' => 'El costo de compra es obligatorio.',
            'purchase_unit_id.required' => 'La unidad de compra es obligatoria.',
            'sale_unit_id.required' => 'La unidad de venta es obligatoria.',
        ];
    }
}
