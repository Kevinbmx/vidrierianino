<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * StoreSupplierProductOfferRequest
 * 
 * Valida los datos para crear una nueva oferta de proveedor.
 * 
 * Reglas de Negocio:
 * - supplier_id y product_variant_id son obligatorios
 * - cost debe ser un número positivo con máximo 4 decimales
 * - Las dimensiones (width, height, length) son opcionales pero deben ser positivas
 * - document_url es opcional pero debe ser una URL válida si se proporciona
 */
class StoreSupplierProductOfferRequest extends FormRequest
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
            // Relaciones obligatorias
            'supplier_id' => ['required', 'integer', 'exists:suppliers,id'],
            'product_variant_id' => ['required', 'integer', 'exists:product_variants,id'],

            // Datos de compra
            'cost' => ['required', 'numeric', 'min:0', 'regex:/^\d+(\.\d{1,4})?$/'],
            'purchase_unit_id' => ['required', 'integer', 'exists:units_of_measure,id'],

            // Dimensiones físicas (opcionales, pero positivas si se proporcionan)
            'purchase_width' => ['nullable', 'numeric', 'min:0', 'regex:/^\d+(\.\d{1,4})?$/'],
            'purchase_height' => ['nullable', 'numeric', 'min:0', 'regex:/^\d+(\.\d{1,4})?$/'],
            'purchase_length' => ['nullable', 'numeric', 'min:0', 'regex:/^\d+(\.\d{1,4})?$/'],

            // Metadata
            'is_preferred' => ['boolean'],
            'is_active' => ['boolean'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'document_url' => ['nullable', 'string', 'url', 'max:500'],

            // Auditoría (opcional, usado por el Service)
            'changed_by_user_id' => ['nullable', 'integer', 'exists:users,id'],
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
            'supplier_id.required' => 'Debe seleccionar un proveedor.',
            'supplier_id.exists' => 'El proveedor seleccionado no existe.',
            'product_variant_id.required' => 'Debe seleccionar una variante de producto.',
            'product_variant_id.exists' => 'La variante de producto seleccionada no existe.',
            'cost.required' => 'El costo es obligatorio.',
            'cost.numeric' => 'El costo debe ser un número.',
            'cost.min' => 'El costo no puede ser negativo.',
            'cost.regex' => 'El costo puede tener máximo 4 decimales.',
            'purchase_unit_id.required' => 'Debe seleccionar una unidad de medida.',
            'purchase_unit_id.exists' => 'La unidad de medida seleccionada no existe.',
            'document_url.url' => 'El enlace del documento debe ser una URL válida.',
            'document_url.max' => 'El enlace del documento no puede exceder 500 caracteres.',
        ];
    }
}
