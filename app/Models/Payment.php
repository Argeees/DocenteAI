<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'user_id',
        'plan_type',
        'amount',
        'currency',
        'status',
        'payment_provider',
        'external_reference',
        'mercadopago_preference_id',
        'mercadopago_payment_id',
        'raw_response',
        'paid_at',
    ];

    protected $casts = [
        'raw_response' => 'array',
        'paid_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function subscription()
    {
        return $this->hasOne(Subscription::class);
    }
}
