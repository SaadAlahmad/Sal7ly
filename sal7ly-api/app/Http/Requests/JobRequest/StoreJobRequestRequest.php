<?php

namespace App\Http\Requests\JobRequest;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreJobRequestRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() instanceof User;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'category_id' => ['required', 'exists:categories,id'],
            'title' => ['required', 'string', 'max:255'],
            'details' => ['required', 'string'],
            'city' => ['required', 'string', 'max:100'],
            'location' => ['required', 'string', 'max:255'],
            'budget' => ['nullable', 'numeric', 'min:0']
        ];
    }
}
