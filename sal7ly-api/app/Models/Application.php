<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable(['cover_letter', 'proposed_price'])]
class Application extends Model
{
    protected function casts(): array {
        return [
            'proposed_price' => 'decimal:2',
        ];
    }

    public function jobRequest(): BelongsTo {
        return $this->belongsTo(JobRequest::class, 'request_id');
    }

    public function craftsman(): BelongsTo {
        return $this->belongsTo(Craftsman::class);
    }

    public function project(): HasOne {
        return $this->hasOne(Project::class);
    }
}
