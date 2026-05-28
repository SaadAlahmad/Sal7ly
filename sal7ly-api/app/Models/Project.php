<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable([])]
class Project extends Model
{
    protected function casts(): array {
        return [
            'auto_complete_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo {
        return $this->belongsTo(User::class);
    }

    public function craftsman(): BelongsTo {
        return $this->belongsTo(Craftsman::class);
    }

    public function request(): BelongsTo {
        return $this->belongsTo(JobRequest::class, 'request_id');
    }

    public function application(): BelongsTo {
        return $this->belongsTo(Application::class);
    }

    public function conversation(): HasOne {
        return $this->hasOne(Conversation::class);
    }

    public function review(): HasOne {
        return $this->hasOne(Review::class);
    }

    public function dispute(): HasOne {
        return $this->hasOne(Dispute::class);
    }
}
