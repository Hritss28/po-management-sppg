<?php

namespace Database\Seeders;

use App\Models\DeliveryNote;
use App\Models\Invoice;
use App\Models\PurchaseOrder;
use App\Models\Sppg;
use App\Models\StockItem;
use App\Models\Supplier;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $sppg = Sppg::query()->updateOrCreate(
            ['code' => 'M1101'],
            [
                'name' => 'SPPG-Balongsari',
                'location' => 'Surabaya',
                'pic_name' => 'Datok',
                'whatsapp' => '0894334444',
            ],
        );

        $suppliers = collect([
            [
                'name' => 'DUNIA BUMBU MOJOKERTO',
                'address' => 'GPM Bypass B1 No 4 Kota Mojokerto',
                'logo_path' => 'logo-duniabumbu.jpeg',
                'stamp_path' => 'stamp-duniabumbu.jpeg',
                'theme_color' => '#16a34a',
            ],
            [
                'name' => 'NUTRIVA FOODS',
                'address' => '01/01 Pesanan Bicak Trowulan',
                'logo_path' => 'logo-nutrifa.jpeg',
                'stamp_path' => 'stamp-nutriva.jpeg',
                'theme_color' => '#ea580c',
            ],
            [
                'name' => 'VIALA PANGAN',
                'address' => 'Perum Graha Majapahit Jl Village Ave 89',
                'logo_path' => 'logo-viala.jpeg',
                'stamp_path' => 'stamp-viala.jpeg',
                'theme_color' => '#2563eb',
            ],
        ])->mapWithKeys(fn (array $supplier): array => [
            $supplier['name'] => Supplier::query()->updateOrCreate(['name' => $supplier['name']], $supplier),
        ]);

        $stockItems = collect([
            ['name' => 'AYAM FILET', 'unit' => 'KG', 'category' => 'Protein'],
            ['name' => 'AYAM FILET', 'unit' => 'KG', 'category' => 'Protein'],
            ['name' => 'telur ayam', 'unit' => 'BUTIR', 'category' => 'Protein'],
            ['name' => 'daging', 'unit' => 'KG', 'category' => 'Protein'],
            ['name' => 'roti burger', 'unit' => 'PCS', 'category' => 'Roti'],
            ['name' => 'BAWANG MERAH', 'unit' => 'KG', 'category' => 'Bumbu'],
        ])->map(fn (array $item): StockItem => StockItem::query()->firstOrCreate($item, ['status' => 'Aktif']));

        $this->seedPurchaseOrders($sppg, $suppliers, $stockItems);
    }

    private function seedPurchaseOrders(Sppg $sppg, mixed $suppliers, mixed $stockItems): void
    {
        $orders = [
            [
                'number' => '7/PO/17052026/DBM/2026',
                'date' => '2026-05-17',
                'created_by' => 'System Manager',
                'status' => 'INVOICED',
                'items' => [
                    ['name' => 'AYAM FILET', 'qty' => 40, 'unit' => 'KG', 'price' => 10000, 'supplier' => 'DUNIA BUMBU MOJOKERTO', 'invoiced' => true, 'request' => 'Dada'],
                ],
                'invoice' => ['number' => 'INV/DBM/721557', 'supplier' => 'DUNIA BUMBU MOJOKERTO', 'status' => 'UNPAID', 'date' => '2026-05-18'],
            ],
            [
                'number' => '5/PO/17052026/NF/2026',
                'date' => '2026-05-17',
                'created_by' => 'System Manager',
                'status' => 'COMPLETED',
                'droping_date' => '2026-05-17',
                'droping_time' => '18:35',
                'items' => [
                    ['name' => 'telur ayam', 'qty' => 50, 'unit' => 'BUTIR', 'price' => 0, 'supplier' => 'NUTRIVA FOODS', 'invoiced' => false, 'request' => 'Yang bagus'],
                ],
                'delivery' => ['number' => 'SJ/NF/170526/005', 'date' => '2026-05-17', 'driver' => 'Slamet Riyadi', 'notes' => 'Barang diterima lengkap.'],
            ],
            [
                'number' => '2/PO/12052026/DBM/2026',
                'date' => '2026-05-12',
                'created_by' => 'Ahmad Lutfi',
                'status' => 'PROCESSING',
                'droping_date' => '2026-05-13',
                'droping_time' => '06:30',
                'items' => [
                    ['name' => 'BAWANG MERAH', 'qty' => 2, 'unit' => 'KG', 'price' => 32000, 'supplier' => 'DUNIA BUMBU MOJOKERTO', 'invoiced' => false, 'request' => null],
                ],
            ],
            [
                'number' => '1/PO/10052026/VPA/2026',
                'date' => '2026-05-10',
                'created_by' => 'Ahmad Lutfi',
                'status' => 'COMPLETED',
                'droping_date' => '2026-05-11',
                'droping_time' => '07:00',
                'items' => [
                    ['name' => 'AYAM FILET', 'qty' => 10, 'unit' => 'KG', 'price' => 45000, 'supplier' => 'VIALA PANGAN', 'invoiced' => false, 'request' => null],
                    ['name' => 'telur ayam', 'qty' => 120, 'unit' => 'BUTIR', 'price' => 2300, 'supplier' => 'NUTRIVA FOODS', 'invoiced' => false, 'request' => null],
                ],
                'delivery' => ['number' => 'SJ/VPA/100526/001', 'date' => '2026-05-11', 'driver' => 'Rudi Hartono', 'notes' => 'Diterima lengkap oleh PIC SPPG.'],
            ],
        ];

        foreach ($orders as $orderData) {
            $order = PurchaseOrder::query()->updateOrCreate(
                ['number' => $orderData['number']],
                [
                    'date' => $orderData['date'],
                    'created_by' => $orderData['created_by'],
                    'sppg_id' => $sppg->id,
                    'droping_date' => $orderData['droping_date'] ?? null,
                    'droping_time' => $orderData['droping_time'] ?? null,
                    'status' => $orderData['status'],
                ],
            );

            foreach ($orderData['items'] as $itemData) {
                $stockItem = $stockItems->firstWhere('name', $itemData['name']);
                $supplier = $suppliers[$itemData['supplier']];
                $item = $order->items()->updateOrCreate(
                    ['name' => $itemData['name'], 'supplier_id' => $supplier->id],
                    [
                        'stock_item_id' => $stockItem?->id,
                        'qty' => $itemData['qty'],
                        'unit' => $itemData['unit'],
                        'grade' => 'A',
                        'price' => $itemData['price'],
                        'request_note' => $itemData['request'],
                        'is_invoiced' => $itemData['invoiced'],
                    ],
                );

                if (isset($orderData['invoice']) && $itemData['invoiced']) {
                    $invoiceData = $orderData['invoice'];
                    $invoice = Invoice::query()->updateOrCreate(
                        ['number' => $invoiceData['number']],
                        [
                            'purchase_order_id' => $order->id,
                            'supplier_id' => $supplier->id,
                            'supplier_name' => $supplier->name,
                            'date' => $invoiceData['date'],
                            'status' => $invoiceData['status'],
                            'total_amount' => (int) ($item->qty * $item->price),
                        ],
                    );

                    $invoice->items()->updateOrCreate(
                        ['purchase_order_item_id' => $item->id],
                        [
                            'name' => $item->name,
                            'qty' => $item->qty,
                            'unit' => $item->unit,
                            'price' => $item->price,
                            'subtotal' => (int) ($item->qty * $item->price),
                        ],
                    );
                }
            }

            if (isset($orderData['delivery'])) {
                $delivery = $orderData['delivery'];
                DeliveryNote::query()->updateOrCreate(
                    ['purchase_order_id' => $order->id],
                    [
                        'number' => $delivery['number'],
                        'date' => $delivery['date'],
                        'driver' => $delivery['driver'],
                        'kepada' => str_replace('SPPG-', '', $sppg->name),
                        'kd_sppg' => $sppg->code,
                        'nama_sppg' => str_replace('SPPG-', '', $sppg->name),
                        'pj_sppg' => $sppg->pic_name,
                        'whatsapp' => $sppg->whatsapp,
                        'notes' => $delivery['notes'],
                        'has_photo' => true,
                    ],
                );
            }
        }
    }
}
