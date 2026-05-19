<?php

use App\Models\PurchaseOrder;
use App\Models\Sppg;
use App\Models\StockItem;
use App\Models\Supplier;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->withSession([
        'auth_user' => [
            'role' => 'ADMIN',
            'id' => 'admin',
            'name' => 'Admin Supplier',
        ],
    ]);
});

test('surat jalan number is suggested from purchase order number', function (): void {
    $order = deliveryNoteNumberPurchaseOrder();

    $this->get(route('surat-jalan.show', $order->id))
        ->assertOk()
        ->assertSee('value="2/SJ/18052026/VP/2026"', false)
        ->assertDontSee('formtarget="_blank"', false);
});

test('surat jalan preview fallback uses purchase order number format', function (): void {
    $order = deliveryNoteNumberPurchaseOrder();

    $this->get(route('surat-jalan.preview', $order->id))
        ->assertOk()
        ->assertSee('2/SJ/18052026/VP/2026');
});

test('surat jalan preview from form uses unsaved driver and notes', function (): void {
    $order = deliveryNoteNumberPurchaseOrder();

    $this->patch(route('surat-jalan.preview.form', $order->id), [
        'kepada' => 'SPPG Balongsari',
        'kd_sppg' => 'M1101',
        'nama_sppg' => 'SPPG Balongsari',
        'pj_sppg' => 'Datok',
        'whatsapp' => '0894334444',
        'surat_jalan_no' => '2/SJ/18052026/VP/2026',
        'delivery_date' => '2026-05-20',
        'driver' => 'Udin',
        'notes' => 'Aman',
        'qty_actual' => [7],
        'prices' => [2500],
        'suppliers' => ['VIALA PANGAN'],
    ])
        ->assertOk()
        ->assertSee('Udin')
        ->assertSee('Aman')
        ->assertSee('Datok SPPG')
        ->assertSeeTextInOrder(['AYAM FILET', '7', 'KG', 'A'])
        ->assertDontSee('&nbsp;', false);

    $this->assertDatabaseCount('delivery_notes', 0);
    expect($order->refresh()->status)->toBe('PROCESSING');
});

test('saved surat jalan detail shows driver notes and proof photo', function (): void {
    Storage::fake('public');
    $order = deliveryNoteNumberPurchaseOrder();

    $this->patch(route('surat-jalan.update', $order->id), [
        'kepada' => 'SPPG Balongsari',
        'kd_sppg' => 'M1101',
        'nama_sppg' => 'SPPG Balongsari',
        'pj_sppg' => 'Datok',
        'whatsapp' => '0894334444',
        'surat_jalan_no' => '2/SJ/18052026/VP/2026',
        'delivery_date' => '2026-05-20',
        'driver' => 'Udin',
        'notes' => 'Aman',
        'qty_actual' => [7],
        'prices' => [2500],
        'suppliers' => ['VIALA PANGAN'],
        'proof_photo' => UploadedFile::fake()->image('bukti.png'),
    ])->assertRedirect(route('surat-jalan.show', $order->id));

    $deliveryNote = $order->refresh()->deliveryNote;

    expect($deliveryNote->driver)->toBe('Udin')
        ->and($deliveryNote->notes)->toBe('Aman')
        ->and($deliveryNote->proof_photo)->not->toBeNull()
        ->and($deliveryNote->has_photo)->toBeTrue()
        ->and($order->status)->toBe('INVOICED');

    Storage::disk('public')->assertExists($deliveryNote->proof_photo);

    $this->get(route('surat-jalan.show', $order->id))
        ->assertOk()
        ->assertSee('value="Udin"', false)
        ->assertSee('Aman')
        ->assertSee('Foto Bukti');
});

test('surat jalan preview prepared by uses supplier account holder name', function (): void {
    $order = deliveryNoteNumberPurchaseOrder(
        supplierName: 'NUTRIVA FOODS',
        poNumber: '5/PO/19052026/NF/2026',
    );

    $this->get(route('surat-jalan.preview', $order->id))
        ->assertOk()
        ->assertSeeText('Dessy Istuning Tiyas')
        ->assertDontSeeText('Supplier (Admin)');
});

function deliveryNoteNumberPurchaseOrder(string $supplierName = 'VIALA PANGAN', string $poNumber = '2/PO/18052026/VP/2026'): PurchaseOrder
{
    $sppg = Sppg::query()->create([
        'code' => 'M1101',
        'name' => 'SPPG Balongsari',
        'location' => 'Mojokerto',
        'pic_name' => 'Datok SPPG',
    ]);

    $supplier = Supplier::query()->create(['name' => $supplierName]);
    $stock = StockItem::query()->create(['name' => 'AYAM FILET', 'unit' => 'KG']);

    $order = PurchaseOrder::query()->create([
        'number' => $poNumber,
        'date' => '2026-05-18',
        'created_by' => 'Admin Supplier',
        'sppg_id' => $sppg->id,
        'status' => 'PROCESSING',
    ]);

    $order->items()->create([
        'stock_item_id' => $stock->id,
        'supplier_id' => $supplier->id,
        'name' => $stock->name,
        'grade' => 'A',
        'qty' => 1,
        'unit' => $stock->unit,
        'price' => 1000,
    ]);

    return $order;
}
