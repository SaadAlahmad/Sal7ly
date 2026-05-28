<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['reason'])]
class Dispute extends Model
{
    public function project(): BelongsTo {
        return $this->belongsTo(Project::class);
    }
}
