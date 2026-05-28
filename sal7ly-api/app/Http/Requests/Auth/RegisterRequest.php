<?php

namespace App\Http\Requests\Auth;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
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
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $role = $this->input('role');

        $baseRules = [
            'role' => ['required', 'in:user,craftsman'],
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:150', 'unique:users,email', 'unique:craftspeople,email'],
            'mobile' => ['required', 'string', 'max:20'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ];

        $craftsmanRules = [
            'category_id' => ['required', 'exists:categories,id'],
            'city' => ['required', 'string', 'max:100'],
            'bio' => ['required', 'string'],
            'years_experience' => ['nullable', 'integer', 'min:0', 'max:60'],
        ];

        return $role === 'craftsman' ? array_merge($baseRules, $craftsmanRules) : $baseRules;
    }

    public function messages(): array {
        return [
            'role.in' => 'Role must be either user or craftsman.',
            'email.unique'=> 'This email is already registered.',
            'password.confirmed' => 'Passwords do not match.',
            'category_id.exists' => 'Selected category does not exist.',
        ];
    }
}
