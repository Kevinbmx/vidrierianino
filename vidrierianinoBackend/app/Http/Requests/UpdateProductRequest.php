<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * UpdateProductRequest
 * 
 * Validación para actualización de productos.
 */
class UpdateProductRequest extends FormRequest
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
        $productId = $this->route('product');

        return [
            'name' => 'sometimes|required|string|max:255',
            'slug' => "nullable|string|unique:products,slug,{$productId}|max:255",
            'category_id' => 'sometimes|required|exists:categories,id',
            'description' => 'nullable|string',
            'is_active' => 'nullable|boolean',

            // Validación de variantes
            'variants' => 'nullable|array',
            'variants.*.id' => 'nullable|integer|exists:product_variants,id', // Para saber cuáles editar
            'variants.*.sku' => 'nullable|string|max:255',
            'variants.*.name' => 'nullable|string|max:255',
            'variants.*.pricing_mode' => 'nullable|in:fixed,markup',
            'variants.*.price' => 'required_if:variants.*.pricing_mode,fixed|nullable|numeric|min:0',
            'variants.*.markup_percentage' => 'required_if:variants.*.pricing_mode,markup|nullable|numeric|min:0|max:1000',
            'variants.*.sale_unit_id' => 'required_with:variants|exists:units_of_measure,id',
            'variants.*.min_stock' => 'nullable|integer|min:0',
            'variants.*.is_active' => 'nullable|boolean',

            // Empaques
            'variants.*.packagings' => 'nullable|array',
            'variants.*.packagings.*.name' => 'required|string|max:50',
            'variants.*.packagings.*.quantity' => 'required|numeric|min:0.0001',
            'variants.*.packagings.*.description' => 'nullable|string|max:255',
            'variants.*.packagings.*.is_default_purchase' => 'nullable|boolean',

            // Dimensiones
            'variants.*.dimensions' => 'nullable|array',
            'variants.*.dimensions.*.name' => 'nullable|string|max:50',
            'variants.*.dimensions.*.width' => 'nullable|numeric|min:0',
            'variants.*.dimensions.*.height' => 'nullable|numeric|min:0',
            'variants.*.dimensions.*.length' => 'nullable|numeric|min:0',
            'variants.*.dimensions.*.weight' => 'nullable|numeric|min:0',
            'variants.*.dimensions.*.is_default' => 'nullable|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'El nombre del producto es obligatorio.',
            'category_id.required' => 'Debe seleccionar una categoría.',
            'category_id.exists' => 'La categoría seleccionada no existe.',
            'variants.*.price.required_if' => 'El precio es obligatorio cuando el modo es Precio Fijo.',
            'variants.*.sale_unit_id.required_with' => 'La unidad de venta es obligatoria.',
        ];
    }
}
