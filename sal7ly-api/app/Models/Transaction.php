<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    public function casts(): array {
        return [
            'amount' => 'decimal:2',
        ];
    }
}
