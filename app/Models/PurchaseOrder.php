<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class PurchaseOrder extends Model
{
    protected $fillable = [
        'number',
        'date',
        'created_by',
        'sppg_id',
        'droping_date',
        'droping_time',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'droping_date' => 'date',
        ];
    }

    public function sppg(): BelongsTo
    {
        return $this->belongsTo(Sppg::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(PurchaseOrderItem::class);
    }

    public function deliveryNote(): HasOne
    {
        return $this->hasOne(DeliveryNote::class);
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    protected function totalAmount(): Attribute
    {
        return Attribute::get(fn (): int => (int) $this->items->sum(fn (PurchaseOrderItem $item): float|int => $item->qty * $item->price));
    }
}
