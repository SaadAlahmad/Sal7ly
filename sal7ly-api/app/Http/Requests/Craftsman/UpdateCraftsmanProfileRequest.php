<?php

namespace App\Http\Requests\Craftsman;

use App\Models\Craftsman;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCraftsmanProfileRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() instanceof Craftsman;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:100'],
            'email' => ['sometimes', 'email', 'max:150', Rule::unique('craftspeople', 'email')->ignore($this->user()->id)],
            'mobile' => ['sometimes', 'string', 'max:20'],
            'password' => ['sometimes', 'string', 'min:8', 'confirmed'],
            'city' => ['sometimes', 'string', 'max:100'],
            'bio' => ['sometimes', 'string'],
            'years_experience' => ['sometimes', 'integer', 'min:0', 'max:60'],
            'availability' => ['sometimes', 'boolean'],
        ];
    }
}
