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
        ];
    }
}
