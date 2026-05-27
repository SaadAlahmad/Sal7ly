<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Table('requests')]
#[Fillable(['title', 'details', 'city', 'location', 'budget'])]
class JobRequest extends Model
{
    protected function casts(): array
    {
        return [
            'budget' => 'decimal:2',
            'is_featured' => 'boolean',
        ];
    }

    public function user(): BelongsTo {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo {
        return $this->belongsTo(Category::class);
    }

    public function applications(): HasMany {
        return $this->hasMany(Application::class);
    }

    public function project(): HasOne {
        return $this->hasOne(Project::class);
    }
}
