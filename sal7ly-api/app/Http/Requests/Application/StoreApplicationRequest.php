<?php

namespace App\Http\Requests\Application;

use App\Models\Craftsman;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreApplicationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() instanceof Craftsman && $this->user()->is_verified;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'request_id' => ['required', 'exists:requests,id', Rule::unique('applications')->where(function($query) {
                return $query->where('craftsman_id', $this->user()->id)->whereNotIn('status', ['rejected']);
            })],
            'cover_letter' => ['required', 'string'],
            'proposed_price' => ['nullable', 'numeric', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'request_id.unique' => 'You have already applied to this job.',
        ];
    }
}
