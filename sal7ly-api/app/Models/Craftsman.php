<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Table('craftspeople')]
#[Fillable(['name', 'email', 'mobile', 'password', 'category_id', 'city', 'bio', 'years_experience', 'availability'])]
#[Hidden(['password'])]
class Craftsman extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    protected function casts(): array
    {
        return [
            'availability' => 'boolean',
            'is_verified' => 'boolean',
            'is_featured' => 'boolean',
            'is_badge_verified' => 'boolean',
            'password' => 'hashed',
        ];
    }

    public function category(): BelongsTo {
        return $this->belongsTo(Category::class);
    }

    public function applications(): HasMany {
        return $this->hasMany(Application::class);
    }

    public function projects(): HasMany {
        return $this->hasMany(Project::class);
    }

    public function conversations(): HasMany {
        return $this->hasMany(Conversation::class);
    }

    public function worksamples(): HasMany {
        return $this->hasMany(Worksample::class);
    }

    public function rating(): HasOne {
        return $this->hasOne(CraftsmanRating::class);
    }
}
