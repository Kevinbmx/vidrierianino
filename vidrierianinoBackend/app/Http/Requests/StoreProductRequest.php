<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * StoreProductRequest
 * 
 * Validación para creación de productos con variantes.
 */
class StoreProductRequest extends FormRequest
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
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|unique:products,slug|max:255',
            'category_id' => 'required|exists:categories,id',
            'description' => 'nullable|string',
            'is_active' => 'nullable|boolean',

            // Validación de variantes opcionales
            'variants' => 'nullable|array',
            'variants.*.sku' => 'nullable|string|unique:product_variants,sku|max:255',
            'variants.*.name' => 'nullable|string|max:255',

            // Flexible Pricing
            'variants.*.pricing_mode' => 'nullable|in:fixed,markup',
            'variants.*.price' => 'required_if:variants.*.pricing_mode,fixed|nullable|numeric|min:0',
            'variants.*.markup_percentage' => 'required_if:variants.*.pricing_mode,markup|nullable|numeric|min:0|max:1000',

            // Units
            'variants.*.sale_unit_id' => 'required|exists:units_of_measure,id',

            // Stock
            'variants.*.stock_quantity' => 'nullable|integer|min:0',
            'variants.*.min_stock' => 'nullable|integer|min:0',

            // Attributes
            'variants.*.attribute_values' => 'nullable|array',
            'variants.*.attribute_values.*' => 'exists:attribute_values,id',
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
            'name.required' => 'El nombre del producto es obligatorio.',
            'category_id.required' => 'Debe seleccionar una categoría.',
            'category_id.exists' => 'La categoría seleccionada no existe.',
            'variants.*.price.required_if' => 'El precio es obligatorio cuando el modo es Precio Fijo.',
            'variants.*.markup_percentage.required_if' => 'El porcentaje de markup es obligatorio cuando el modo es Markup.',
            'variants.*.sale_unit_id.required' => 'La unidad de venta es obligatoria.',
        ];
    }
}
