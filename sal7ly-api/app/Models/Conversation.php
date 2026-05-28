<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Conversation extends Model
{
    public $timestamps = false;
    const CREATED_AT = 'created_at';
    const UPDATED_AT = null;

    public function casts(): array {
        return [
            'created_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo {
        return $this->belongsTo(User::class);
    }

    public function craftsman(): BelongsTo {
        return $this->belongsTo(Craftsman::class);
    }

    public function project(): BelongsTo {
        return $this->belongsTo(Project::class);
    }

    public function messages(): HasMany {
        return $this->hasMany(Message::class);
    }
}
