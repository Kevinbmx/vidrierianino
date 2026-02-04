<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLeadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20', // Basic length check, regex can be added
            'email' => 'required|email|max:255',
            'location' => 'required|string|in:Montero,Santa Cruz de la Sierra,Otra ciudad en Santa Cruz,Otra ciudad/departamento',
            'project_type' => 'required|string|max:255',
        ];
    }
}
