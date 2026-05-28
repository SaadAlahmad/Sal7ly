<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['rating', 'review_text'])]
class Review extends Model
{
    public $timestamps = false;
    const CREATED_AT = 'created_at';
    const UPDATED_AT = null;

    protected function casts(): array {
        return [
            'rating' => 'integer',
            'created_at' => 'datetime',
        ];
    }

    public function project(): BelongsTo {
        return $this->belongsTo(Project::class);
    }

}
