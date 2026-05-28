<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    public $timestamps = false;
    const CREATED_AT = 'created_at';
    const UPDATED_AT = null;

    public function casts(): array {
        return [
            'created_at' => 'datetime',
            'read_at' => 'datetime',
            'data' => 'array',
        ];
    }
}
