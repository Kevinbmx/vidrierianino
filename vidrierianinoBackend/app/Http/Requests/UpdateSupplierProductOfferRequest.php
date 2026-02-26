<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * UpdateSupplierProductOfferRequest
 * 
 * Valida los datos para actualizar una oferta existente.
 * 
 * Diferencias con Store:
 * - Todos los campos son opcionales (actualización parcial)
 * - Incluye change_reason para auditoría de cambios
 */
class UpdateSupplierProductOfferRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Implementar lógica de autorización según roles
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Relaciones (opcionales en update)
            'supplier_id' => ['sometimes', 'integer', 'exists:suppliers,id'],
            'product_variant_id' => ['sometimes', 'integer', 'exists:product_variants,id'],

            // Datos de compra
            'cost' => ['sometimes', 'numeric', 'min:0', 'regex:/^\d+(\.\d{1,4})?$/'],
            'purchase_unit_id' => ['sometimes', 'integer', 'exists:units_of_measure,id'],

            // Dimensiones físicas
            'purchase_width' => ['nullable', 'numeric', 'min:0', 'regex:/^\d+(\.\d{1,4})?$/'],
            'purchase_height' => ['nullable', 'numeric', 'min:0', 'regex:/^\d+(\.\d{1,4})?$/'],
            'purchase_length' => ['nullable', 'numeric', 'min:0', 'regex:/^\d+(\.\d{1,4})?$/'],

            // Metadata
            'is_preferred' => ['boolean'],
            'is_active' => ['boolean'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'document_url' => ['nullable', 'string', 'url', 'max:500'],

            // Auditoría (específico para updates)
            'changed_by_user_id' => ['nullable', 'integer', 'exists:users,id'],
            'change_reason' => ['nullable', 'string', 'max:500'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'supplier_id.exists' => 'El proveedor seleccionado no existe.',
            'product_variant_id.exists' => 'La variante de producto seleccionada no existe.',
            'cost.numeric' => 'El costo debe ser un número.',
            'cost.min' => 'El costo no puede ser negativo.',
            'cost.regex' => 'El costo puede tener máximo 4 decimales.',
            'purchase_unit_id.exists' => 'La unidad de medida seleccionada no existe.',
            'document_url.url' => 'El enlace del documento debe ser una URL válida.',
            'document_url.max' => 'El enlace del documento no puede exceder 500 caracteres.',
            'change_reason.max' => 'El motivo del cambio no puede exceder 500 caracteres.',
        ];
    }
}
