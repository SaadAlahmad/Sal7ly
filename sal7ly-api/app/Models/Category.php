<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Table('categories')]
#[Fillable(['name', 'slug', 'icon', 'description'])]
class Category extends Model
{
    public $timestamps = false;

    public function requests(): HasMany {
        return $this->hasMany(JobRequest::class);
    }

    public function craftspeople(): HasMany {
        return $this->hasMany(Craftsman::class);
    }
}

