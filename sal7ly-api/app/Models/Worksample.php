<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['file_type', 'title', 'description'])]
class Worksample extends Model
{
    public $timestamps = false;
    const CREATED_AT = 'created_at';
    const UPDATED_AT = null;

    public function casts(): array {
        return [
            'created_at' => 'datetime',
        ];
    }

    public function craftsman(): BelongsTo {
        return $this->belongsTo(Craftsman::class);
    }

}
