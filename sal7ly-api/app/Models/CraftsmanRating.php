<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['craftsman_id', 'reviews_count', 'average_rating', 'bayesian_score'])]
class CraftsmanRating extends Model
{
    public $timestamps = false;
    const UPDATED_AT = 'updated_at';
    const CREATED_AT = null;

    public function casts(): array {
        return [
            'average_rating' => 'decimal:2',
            'bayesian_score' => 'decimal:4',
            'updated_at' => 'datetime',
        ];
    }

    public function craftsman(): BelongsTo {
        return $this->belongsTo(Craftsman::class);
    }
}
