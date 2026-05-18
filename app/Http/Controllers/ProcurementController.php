<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\View\View;

class ProcurementController extends Controller
{
    public function dashboard(): View|RedirectResponse
    {
        if ($redirect = $this->requireAuth()) {
            return $redirect;
        }

        $orders = $this->visibleOrders();
        $invoicePaid = $orders->sum(fn (array $order): int => collect($order['invoices'] ?? [])->where('status', 'PAID')->sum('total_amount'));
        $invoiceUnpaid = $orders->sum(fn (array $order): int => collect($order['invoices'] ?? [])->where('status', 'UNPAID')->sum('total_amount'));
        $estimatedUnbilled = $orders->sum(function (array $order): int {
            return collect($order['items'])->where('invoiced', false)->sum(fn (array $item): int => $item['qty'] * $item['price']);
        });

        return view('dashboard.index', [
            'currentUser' => $this->currentUser(),
            'orders' => $orders,
            'stats' => [
                'total_po' => $orders->count(),
                'total_value' => $orders->sum(fn (array $order): int => $this->orderTotal($order)),
                'valid' => $orders->where('status', 'VALID')->count(),
                'processing' => $orders->where('status', 'PROCESSING')->count(),
                'completed' => $orders->where('status', 'COMPLETED')->count(),
                'invoiced' => $orders->where('status', 'INVOICED')->count(),
                'estimated_unbilled' => $estimatedUnbilled,
                'invoice_unpaid' => $invoiceUnpaid,
                'invoice_paid' => $invoicePaid,
                'debt_unpaid' => 0,
                'debt_paid' => 0,
                'unpaid' => $invoiceUnpaid,
                'paid' => $invoicePaid,
            ],
        ]);
    }

    public function purchaseOrders(Request $request): View|RedirectResponse
    {
        if ($redirect = $this->requireAuth()) {
            return $redirect;
        }

        $orders = $this->visibleOrders();
        $search = strtolower($request->string('search')->toString());
        $status = $request->string('status')->toString();

        if ($search !== '') {
            $orders = $orders->filter(function (array $order) use ($search): bool {
                $items = collect($order['items'])->pluck('name')->implode(' ');

                return str_contains(strtolower($order['number'].' '.$order['sppg'].' '.$order['created_by'].' '.$items), $search);
            });
        }

        if ($status !== '' && $status !== 'ALL') {
            $orders = $orders->where('status', $status);
        }

        return view('purchase-orders.index', [
            'currentUser' => $this->currentUser(),
            'orders' => $orders->values(),
            'stats' => $this->poStats($this->visibleOrders()),
            'filters' => ['search' => $request->string('search')->toString(), 'status' => $status ?: 'ALL'],
        ]);
    }

    public function createPurchaseOrder(): View|RedirectResponse
    {
        if ($redirect = $this->requireAuth()) {
            return $redirect;
        }

        return view('purchase-orders.create', [
            'currentUser' => $this->currentUser(),
            'stockItems' => $this->stockItems(),
            'suppliers' => $this->suppliers(),
        ]);
    }

    public function showPurchaseOrder(string $id): View|RedirectResponse
    {
        if ($redirect = $this->requireAuth()) {
            return $redirect;
        }

        return view('purchase-orders.show', [
            'currentUser' => $this->currentUser(),
            'order' => $this->findOrder($id),
            'suppliers' => $this->suppliers(),
        ]);
    }

    public function editPurchaseOrder(string $id): View|RedirectResponse
    {
        if ($redirect = $this->requireAuth()) {
            return $redirect;
        }

        $this->authorizeAdmin();

        return view('purchase-orders.edit', [
            'currentUser' => $this->currentUser(),
            'order' => $this->findOrder($id),
            'stockItems' => $this->stockItems(),
            'suppliers' => $this->suppliers(),
        ]);
    }

    public function updatePurchaseOrderStatus(Request $request, string $id): RedirectResponse
    {
        if ($redirect = $this->requireAuth()) {
            return $redirect;
        }

        $this->authorizeAdmin();

        $validated = $request->validate([
            'status' => ['required', 'in:VALID,PROCESSING,COMPLETED,INVOICED,CANCELLED'],
        ]);

        $statuses = session('po_statuses', []);
        $statuses[$id] = $validated['status'];
        $request->session()->put('po_statuses', $statuses);

        return back()->with('success', 'Status PO berhasil diperbarui.');
    }

    public function updatePurchaseOrderSuppliers(Request $request, string $id): RedirectResponse
    {
        if ($redirect = $this->requireAuth()) {
            return $redirect;
        }

        $this->authorizeAdmin();

        $validated = $request->validate([
            'suppliers' => ['required', 'array'],
            'suppliers.*' => ['required', 'in:'.implode(',', $this->suppliers())],
        ]);

        $supplierAssignments = session('po_supplier_assignments', []);
        $supplierAssignments[$id] = array_values($validated['suppliers']);
        $request->session()->put('po_supplier_assignments', $supplierAssignments);

        return back()->with('success', 'Penugasan supplier berhasil disimpan.');
    }

    public function deletePurchaseOrder(Request $request, string $id): RedirectResponse
    {
        if ($redirect = $this->requireAuth()) {
            return $redirect;
        }

        $this->authorizeAdmin();

        $deleted = collect(session('po_deleted_ids', []))->push($id)->unique()->values()->all();
        $request->session()->put('po_deleted_ids', $deleted);

        return redirect()->route('purchase-orders.index')->with('success', 'PO dihapus dari tampilan sementara.');
    }

    public function previewPurchaseOrder(string $id): View|RedirectResponse
    {
        if ($redirect = $this->requireAuth()) {
            return $redirect;
        }

        return view('purchase-orders.preview', [
            'currentUser' => $this->currentUser(),
            'order' => $this->findOrder($id),
            'suppliers' => $this->suppliers(),
        ]);
    }

    public function suratJalan(Request $request): View|RedirectResponse
    {
        if ($redirect = $this->requireAuth()) {
            return $redirect;
        }

        $orders = $this->visibleOrders()->whereIn('status', ['PROCESSING', 'COMPLETED', 'INVOICED'])->values();
        $search = strtolower($request->string('search')->toString());

        if ($search !== '') {
            $orders = $orders->filter(function (array $order) use ($search): bool {
                $deliveryNumber = $order['delivery']['number'] ?? '';
                $items = collect($order['items'])->pluck('name')->implode(' ');

                return str_contains(strtolower($order['number'].' '.$deliveryNumber.' '.$order['sppg'].' '.$items), $search);
            })->values();
        }

        return view('surat-jalan.index', [
            'currentUser' => $this->currentUser(),
            'orders' => $orders,
            'filters' => ['search' => $request->string('search')->toString()],
        ]);
    }

    public function showSuratJalan(string $id): View|RedirectResponse
    {
        if ($redirect = $this->requireAuth()) {
            return $redirect;
        }

        return view('surat-jalan.show', [
            'currentUser' => $this->currentUser(),
            'order' => $this->findOrder($id),
            'suppliers' => $this->suppliers(),
        ]);
    }

    public function updateSuratJalan(Request $request, string $id): RedirectResponse
    {
        if ($redirect = $this->requireAuth()) {
            return $redirect;
        }

        $this->authorizeAdmin();

        $validated = $request->validate([
            'kepada' => ['required', 'string', 'max:120'],
            'kd_sppg' => ['nullable', 'string', 'max:40'],
            'nama_sppg' => ['required', 'string', 'max:120'],
            'pj_sppg' => ['nullable', 'string', 'max:120'],
            'whatsapp' => ['nullable', 'string', 'max:40'],
            'surat_jalan_no' => ['required', 'string', 'max:80'],
            'delivery_date' => ['required', 'date'],
            'driver' => ['nullable', 'string', 'max:120'],
            'notes' => ['nullable', 'string', 'max:500'],
            'qty_actual' => ['required', 'array'],
            'qty_actual.*' => ['required', 'numeric', 'min:0'],
            'prices' => ['required', 'array'],
            'prices.*' => ['required', 'numeric', 'min:0'],
            'suppliers' => ['required', 'array'],
            'suppliers.*' => ['required', 'in:'.implode(',', $this->suppliers())],
        ]);

        $deliveries = session('surat_jalan_overrides', []);
        $deliveries[$id] = [
            'number' => $validated['surat_jalan_no'],
            'date' => $validated['delivery_date'],
            'driver' => $validated['driver'] ?: 'Nama Pengirim',
            'notes' => $validated['notes'] ?: '-',
            'kepada' => $validated['kepada'],
            'kd_sppg' => $validated['kd_sppg'] ?: 'M1111',
            'nama_sppg' => $validated['nama_sppg'],
            'pj_sppg' => $validated['pj_sppg'] ?: '-',
            'whatsapp' => $validated['whatsapp'] ?: '-',
            'qty_actual' => array_values($validated['qty_actual']),
            'prices' => array_values($validated['prices']),
            'suppliers' => array_values($validated['suppliers']),
            'has_photo' => true,
        ];
        $request->session()->put('surat_jalan_overrides', $deliveries);

        $statuses = session('po_statuses', []);
        $statuses[$id] = 'COMPLETED';
        $request->session()->put('po_statuses', $statuses);

        return redirect()->route('surat-jalan.show', $id)->with('success', 'Surat Jalan berhasil disimpan.');
    }

    public function previewSuratJalan(string $id): View|RedirectResponse
    {
        if ($redirect = $this->requireAuth()) {
            return $redirect;
        }

        return view('surat-jalan.preview', [
            'currentUser' => $this->currentUser(),
            'order' => $this->findOrder($id),
        ]);
    }

    public function invoices(Request $request): View|RedirectResponse
    {
        if ($redirect = $this->requireAuth()) {
            return $redirect;
        }

        $orders = $this->visibleOrders();
        $publishedInvoices = collect(session('published_invoices', []))
            ->map(function (array $invoice) use ($orders): array {
                return [
                    'order' => $orders->firstWhere('id', $invoice['order_id']) ?? $orders->first(),
                    'invoice' => $invoice,
                ];
            })
            ->filter(fn (array $entry): bool => ! empty($entry['order']))
            ->values();

        $historyInvoices = $orders
            ->flatMap(function (array $order): array {
                return collect($order['invoices'] ?? [])->map(fn (array $invoice): array => [
                    'order' => $order,
                    'invoice' => $invoice,
                ])->all();
            })
            ->concat($publishedInvoices)
            ->values();

        $publishedKeys = $publishedInvoices
            ->map(fn (array $entry): string => $entry['order']['id'].'|'.$entry['invoice']['supplier'])
            ->all();

        $pendingInvoices = $orders
            ->filter(fn (array $order): bool => in_array($order['status'], ['COMPLETED', 'INVOICED'], true))
            ->flatMap(function (array $order) use ($publishedKeys): array {
                return collect($order['items'])
                    ->filter(fn (array $item): bool => ! ($item['invoiced'] ?? false))
                    ->groupBy('supplier')
                    ->reject(fn (Collection $items, string $supplier): bool => in_array($order['id'].'|'.$supplier, $publishedKeys, true))
                    ->map(function (Collection $items, string $supplier) use ($order): array {
                        return [
                            'order' => $order,
                            'supplier' => $supplier,
                            'items' => $items->values(),
                            'total' => $items->sum(fn (array $item): int|float => $item['qty'] * $item['price']),
                        ];
                    })
                    ->values()
                    ->all();
            })
            ->values();

        $totalPaid = $historyInvoices->sum(fn (array $entry): int|float => $entry['invoice']['status'] === 'PAID' ? $entry['invoice']['total_amount'] : 0);
        $totalUnpaid = $historyInvoices->sum(fn (array $entry): int|float => $entry['invoice']['status'] === 'UNPAID' ? $entry['invoice']['total_amount'] : 0);

        return view('invoices.index', [
            'currentUser' => $this->currentUser(),
            'pendingInvoices' => $pendingInvoices,
            'historyInvoices' => $historyInvoices,
            'activeTab' => $request->string('tab')->toString() === 'history' ? 'history' : 'pending',
            'stats' => [
                'total' => $historyInvoices->sum(fn (array $entry): int|float => $entry['invoice']['total_amount']),
                'paid' => $totalPaid,
                'unpaid' => $totalUnpaid,
                'count' => $historyInvoices->count(),
            ],
        ]);
    }

    public function createInvoice(Request $request, string $id): View|RedirectResponse
    {
        if ($redirect = $this->requireAuth()) {
            return $redirect;
        }

        $this->authorizeAdmin();

        $order = $this->findOrder($id);
        $supplierName = $request->string('supplier')->toString() ?: collect($order['items'])->first()['supplier'];
        $items = collect($order['items'])
            ->filter(fn (array $item): bool => $item['supplier'] === $supplierName && ! ($item['invoiced'] ?? false))
            ->values();

        return view('invoices.create', [
            'currentUser' => $this->currentUser(),
            'order' => $order,
            'items' => $items,
            'invoiceNumber' => $this->invoiceNumberFor($supplierName, $order['number']),
            'supplier' => $this->supplierDetails($supplierName),
        ]);
    }

    public function storeInvoice(Request $request, string $id): RedirectResponse
    {
        if ($redirect = $this->requireAuth()) {
            return $redirect;
        }

        $this->authorizeAdmin();

        $order = $this->findOrder($id);
        $validated = $request->validate([
            'supplier' => ['required', 'in:'.implode(',', $this->suppliers())],
            'invoice_no' => ['required', 'string', 'max:80'],
            'invoice_date' => ['required', 'date'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.name' => ['required', 'string', 'max:120'],
            'items.*.unit' => ['required', 'string', 'max:20'],
            'items.*.qty' => ['required', 'numeric', 'min:0.01'],
            'items.*.price' => ['required', 'numeric', 'min:1'],
        ]);

        $items = collect($validated['items'])
            ->map(fn (array $item): array => [
                'name' => $item['name'],
                'qty' => (float) $item['qty'],
                'unit' => $item['unit'],
                'grade' => 'A',
                'price' => (int) $item['price'],
                'supplier' => $validated['supplier'],
                'invoiced' => true,
                'request' => null,
            ])
            ->values();

        $publishedInvoices = session('published_invoices', []);
        $publishedInvoices[] = [
            'order_id' => $order['id'],
            'number' => $validated['invoice_no'],
            'date' => $validated['invoice_date'],
            'supplier' => $validated['supplier'],
            'status' => 'UNPAID',
            'total_amount' => $items->sum(fn (array $item): int|float => $item['qty'] * $item['price']),
            'items' => $items->all(),
        ];
        $request->session()->put('published_invoices', $publishedInvoices);

        $statuses = session('po_statuses', []);
        $statuses[$id] = 'INVOICED';
        $request->session()->put('po_statuses', $statuses);

        return redirect()->route('invoices.index', ['tab' => 'history'])->with('success', 'Invoice berhasil diterbitkan.');
    }

    public function showInvoice(string $id): View|RedirectResponse
    {
        if ($redirect = $this->requireAuth()) {
            return $redirect;
        }

        return view('invoices.show', [
            'currentUser' => $this->currentUser(),
            'order' => $this->findOrder($id),
        ]);
    }

    public function updateInvoiceStatus(Request $request, string $id): RedirectResponse
    {
        if ($redirect = $this->requireAuth()) {
            return $redirect;
        }

        $this->authorizeAdmin();

        $validated = $request->validate([
            'invoice_no' => ['required', 'string'],
            'status' => ['required', 'in:PAID,UNPAID'],
        ]);

        $statuses = session('invoice_statuses', []);
        $statuses[$id][$validated['invoice_no']] = $validated['status'];
        $request->session()->put('invoice_statuses', $statuses);

        $publishedInvoices = collect(session('published_invoices', []))
            ->map(function (array $invoice) use ($id, $validated): array {
                if (($invoice['order_id'] ?? null) === $id && $invoice['number'] === $validated['invoice_no']) {
                    $invoice['status'] = $validated['status'];
                }

                return $invoice;
            })
            ->values()
            ->all();
        $request->session()->put('published_invoices', $publishedInvoices);

        return back()->with('success', 'Status invoice berhasil diperbarui.');
    }

    public function previewInvoice(Request $request, string $id): View|RedirectResponse
    {
        if ($redirect = $this->requireAuth()) {
            return $redirect;
        }

        $order = $this->findOrder($id);
        $invoiceNo = $request->string('invoice')->toString();
        $invoice = collect($order['invoices'] ?? [])
            ->concat(collect(session('published_invoices', []))->where('order_id', $order['id']))
            ->firstWhere('number', $invoiceNo);
        $supplier = $request->string('supplier')->toString() ?: ($invoice['supplier'] ?? collect($order['items'])->first()['supplier']);
        $items = isset($invoice['items']) ? collect($invoice['items']) : collect($order['items'])->where('supplier', $supplier)->values();
        $invoice ??= [
            'number' => $this->invoiceNumberFor($supplier, $order['number']),
            'date' => now()->format('Y-m-d'),
            'supplier' => $supplier,
            'status' => 'UNPAID',
            'total_amount' => $items->sum(fn (array $item): int|float => $item['qty'] * $item['price']),
        ];

        return view('invoices.preview', [
            'currentUser' => $this->currentUser(),
            'order' => $order,
            'invoice' => $invoice,
            'items' => $items,
            'supplier' => $this->supplierDetails($invoice['supplier']),
        ]);
    }

    public function masterStock(Request $request): View|RedirectResponse
    {
        if ($redirect = $this->requireAuth()) {
            return $redirect;
        }

        $items = collect($this->stockItems());
        $search = strtolower($request->string('search')->toString());

        if ($search !== '') {
            $items = $items
                ->filter(fn (array $item): bool => str_contains(strtolower($item['name'].' '.$item['unit']), $search))
                ->values();
        }

        return view('master-stok.index', [
            'currentUser' => $this->currentUser(),
            'items' => $items,
            'filters' => ['search' => $request->string('search')->toString()],
            'editItem' => $request->filled('edit') ? collect($this->stockItems())->firstWhere('id', $request->string('edit')->toString()) : null,
            'isCreating' => $request->string('mode')->toString() === 'create',
        ]);
    }

    public function createStock(): View|RedirectResponse
    {
        if ($redirect = $this->requireAuth()) {
            return $redirect;
        }

        $this->authorizeAdmin();

        return redirect()->route('master-stok.index', ['mode' => 'create']);
    }

    public function storeStock(Request $request): RedirectResponse
    {
        if ($redirect = $this->requireAuth()) {
            return $redirect;
        }

        $this->authorizeAdmin();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'unit' => ['required', 'string', 'max:20'],
        ]);

        $createdItems = session('stock_created_items', []);
        $createdItems[] = [
            'id' => 'stock-'.strtolower(str_replace('.', '', uniqid('', true))),
            'name' => strtoupper($validated['name']),
            'unit' => strtoupper($validated['unit']),
            'category' => 'Operasional',
            'status' => 'Aktif',
        ];
        $request->session()->put('stock_created_items', $createdItems);

        return redirect()->route('master-stok.index')->with('success', 'Barang berhasil ditambahkan.');
    }

    public function showStock(string $id): View|RedirectResponse
    {
        if ($redirect = $this->requireAuth()) {
            return $redirect;
        }

        return view('master-stok.show', [
            'currentUser' => $this->currentUser(),
            'item' => collect($this->stockItems())->firstWhere('id', $id) ?? $this->stockItems()[0],
        ]);
    }

    public function editStock(string $id): View|RedirectResponse
    {
        if ($redirect = $this->requireAuth()) {
            return $redirect;
        }

        $this->authorizeAdmin();

        return redirect()->route('master-stok.index', ['edit' => $id]);
    }

    public function updateStock(Request $request, string $id): RedirectResponse
    {
        if ($redirect = $this->requireAuth()) {
            return $redirect;
        }

        $this->authorizeAdmin();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'unit' => ['required', 'string', 'max:20'],
        ]);

        $stockUpdates = session('stock_updates', []);
        $stockUpdates[$id] = [
            'name' => strtoupper($validated['name']),
            'unit' => strtoupper($validated['unit']),
        ];
        $request->session()->put('stock_updates', $stockUpdates);

        return redirect()->route('master-stok.index')->with('success', 'Barang berhasil diperbarui.');
    }

    public function deleteStock(Request $request, string $id): RedirectResponse
    {
        if ($redirect = $this->requireAuth()) {
            return $redirect;
        }

        $this->authorizeAdmin();

        $deletedItems = collect(session('stock_deleted_ids', []))->push($id)->unique()->values()->all();
        $request->session()->put('stock_deleted_ids', $deletedItems);

        return redirect()->route('master-stok.index')->with('success', 'Barang berhasil dihapus.');
    }

    private function requireAuth(): ?RedirectResponse
    {
        if (! session()->has('auth_user')) {
            return redirect()->route('login');
        }

        return null;
    }

    private function authorizeAdmin(): void
    {
        abort_unless(($this->currentUser()['role'] ?? null) === 'ADMIN', 403);
    }

    /**
     * @return array{id:string, role:string, name:string, location?:string}
     */
    private function currentUser(): array
    {
        return session('auth_user', []);
    }

    private function visibleOrders(): Collection
    {
        $user = $this->currentUser();
        $orders = collect($this->orders());

        if (($user['role'] ?? null) === 'SPPG') {
            return $orders->where('sppg_code', $user['id'])->values();
        }

        return $orders;
    }

    private function findOrder(string $id): array
    {
        return $this->visibleOrders()->firstWhere('id', $id) ?? $this->visibleOrders()->first();
    }

    private function orderTotal(array $order): int
    {
        return collect($order['items'])->sum(fn (array $item): int => $item['qty'] * $item['price']);
    }

    private function poStats(Collection $orders): array
    {
        return [
            'total_value' => $orders->sum(fn (array $order): int => $this->orderTotal($order)),
            'active' => $orders->where('status', 'PROCESSING')->count(),
            'valid' => $orders->where('status', 'VALID')->count(),
            'completed' => $orders->where('status', 'COMPLETED')->count(),
        ];
    }

    private function suppliers(): array
    {
        return ['DUNIA BUMBU MOJOKERTO', 'NUTRIVA FOODS', 'VIALA PANGAN'];
    }

    private function invoiceNumberFor(string $supplier, string $poNumber): string
    {
        $prefix = match ($supplier) {
            'NUTRIVA FOODS' => 'NUTRIVA',
            'VIALA PANGAN' => 'VIALA',
            default => 'DUNIA',
        };

        return 'INV/'.$prefix.'/'.substr(preg_replace('/\D+/', '', $poNumber), -6);
    }

    private function supplierDetails(string $supplier): array
    {
        return match ($supplier) {
            'NUTRIVA FOODS' => [
                'name' => 'NUTRIVA FOODS',
                'address' => '01/01 Pesanan Bicak Trowulan',
                'logo' => 'logo-nutrifa.jpeg',
                'stamp' => 'stamp-nutriva.jpeg',
                'color' => 'orange',
                'theme' => '#ea580c',
            ],
            'VIALA PANGAN' => [
                'name' => 'VIALA PANGAN',
                'address' => 'Perum Graha Majapahit Jl Village Ave 89',
                'logo' => 'logo-viala.jpeg',
                'stamp' => 'stamp-viala.jpeg',
                'color' => 'blue',
                'theme' => '#2563eb',
            ],
            default => [
                'name' => 'DUNIA BUMBU MOJOKERTO',
                'address' => 'GPM Bypass B1 No 4 Kota Mojokerto',
                'logo' => 'logo-duniabumbu.jpeg',
                'stamp' => 'stamp-duniabumbu.jpeg',
                'color' => 'green',
                'theme' => '#16a34a',
            ],
        };
    }

    private function stockItems(): array
    {
        $items = [
            ['id' => '1', 'name' => 'AYAM FILET', 'unit' => 'KG', 'category' => 'Protein', 'status' => 'Aktif'],
            ['id' => '2', 'name' => 'AYAM FILET', 'unit' => 'KG', 'category' => 'Protein', 'status' => 'Aktif'],
            ['id' => '3', 'name' => 'telur ayam', 'unit' => 'BUTIR', 'category' => 'Protein', 'status' => 'Aktif'],
            ['id' => '4', 'name' => 'daging', 'unit' => 'KG', 'category' => 'Protein', 'status' => 'Aktif'],
            ['id' => '5', 'name' => 'roti burger', 'unit' => 'PCS', 'category' => 'Roti', 'status' => 'Aktif'],
        ];

        $createdItems = session('stock_created_items', []);
        $updates = session('stock_updates', []);
        $deletedIds = session('stock_deleted_ids', []);

        return collect($items)
            ->concat($createdItems)
            ->reject(fn (array $item): bool => in_array($item['id'], $deletedIds, true))
            ->map(function (array $item) use ($updates): array {
                if (isset($updates[$item['id']])) {
                    $item['name'] = $updates[$item['id']]['name'];
                    $item['unit'] = $updates[$item['id']]['unit'];
                }

                return $item;
            })
            ->values()
            ->all();
    }

    private function orders(): array
    {
        $orders = [
            [
                'id' => 'po-007',
                'number' => '7/PO/17052026/DBM/2026',
                'date' => '2026-05-17',
                'created_by' => 'System Manager',
                'sppg' => 'SPPG-Balongsari',
                'sppg_code' => 'M1101',
                'droping_date' => null,
                'droping_time' => null,
                'status' => 'INVOICED',
                'items' => [
                    ['name' => 'AYAM FILET', 'qty' => 40, 'unit' => 'kg', 'grade' => 'A', 'price' => 10000, 'supplier' => 'DUNIA BUMBU MOJOKERTO', 'invoiced' => true, 'request' => 'Dada'],
                    ['name' => 'BAWANG MERAH', 'qty' => 2, 'unit' => 'kg', 'grade' => 'A', 'price' => 0, 'supplier' => 'DUNIA BUMBU MOJOKERTO', 'invoiced' => true, 'request' => null],
                ],
                'delivery' => [
                    'number' => 'SJ/DBM/170526/007',
                    'date' => '2026-05-17',
                    'driver' => 'Rudi Hartono',
                    'notes' => 'Diterima lengkap oleh PIC SPPG.',
                ],
                'invoices' => [
                    ['number' => 'INV/DBM/721557', 'date' => '2026-05-18', 'supplier' => 'DUNIA BUMBU MOJOKERTO', 'status' => 'UNPAID', 'total_amount' => 400000],
                ],
            ],
            [
                'id' => 'po-006',
                'number' => '6/PO/17052026/DBM/2026',
                'date' => '2026-05-17',
                'created_by' => 'System Manager',
                'sppg' => 'SPPG-Balongsari',
                'sppg_code' => 'M1101',
                'droping_date' => null,
                'droping_time' => null,
                'status' => 'INVOICED',
                'items' => [
                    ['name' => 'AYAM FILET', 'qty' => 20, 'unit' => 'kg', 'grade' => 'A', 'price' => 15000, 'supplier' => 'DUNIA BUMBU MOJOKERTO', 'invoiced' => true, 'request' => null],
                ],
                'delivery' => [
                    'number' => 'SJ/DBM/170526/006',
                    'date' => '2026-05-17',
                    'driver' => 'Slamet Riyadi',
                    'notes' => 'Dalam proses pengiriman.',
                ],
                'invoices' => [
                    ['number' => 'INV/DBM/721556', 'date' => '2026-05-18', 'supplier' => 'DUNIA BUMBU MOJOKERTO', 'status' => 'UNPAID', 'total_amount' => 300000],
                ],
            ],
            [
                'id' => 'po-005',
                'number' => '5/PO/17052026/NF/2026',
                'date' => '2026-05-17',
                'created_by' => 'System Manager',
                'sppg' => 'SPPG-Balongsari',
                'sppg_code' => 'M1101',
                'droping_date' => '2026-05-17',
                'droping_time' => '18:35',
                'status' => 'COMPLETED',
                'items' => [
                    ['name' => 'TELUR AYAM', 'qty' => 50, 'unit' => 'butir', 'grade' => 'A', 'price' => 0, 'supplier' => 'NUTRIVA FOODS', 'invoiced' => false, 'request' => 'Yang bagus'],
                ],
                'delivery' => [
                    'number' => 'SJ/NF/170526/005',
                    'date' => '2026-05-17',
                    'driver' => 'Slamet Riyadi',
                    'notes' => 'Barang diterima lengkap.',
                ],
                'invoices' => [],
            ],
            [
                'id' => 'po-004',
                'number' => '4/PO/17052026/DBM/2026',
                'date' => '2026-05-17',
                'created_by' => 'System Manager',
                'sppg' => 'M1122',
                'sppg_code' => 'M1101',
                'droping_date' => '2026-05-17',
                'droping_time' => '10:00',
                'status' => 'INVOICED',
                'items' => [
                    ['name' => 'AYAM FILET', 'qty' => 100, 'unit' => 'kg', 'grade' => 'A', 'price' => 50000, 'supplier' => 'DUNIA BUMBU MOJOKERTO', 'invoiced' => true, 'request' => null],
                ],
                'delivery' => [
                    'number' => 'SJ/DBM/170526/004',
                    'date' => '2026-05-17',
                    'driver' => 'Rudi Hartono',
                    'notes' => 'Diterima.',
                ],
                'invoices' => [
                    ['number' => 'INV/DBM/721554', 'date' => '2026-05-18', 'supplier' => 'DUNIA BUMBU MOJOKERTO', 'status' => 'UNPAID', 'total_amount' => 5000000],
                ],
            ],
            [
                'id' => 'po-003',
                'number' => '3/PO/15052026/DBM/2026',
                'date' => '2026-05-15',
                'created_by' => 'System Manager',
                'sppg' => 'M1122',
                'sppg_code' => 'M1101',
                'droping_date' => '2026-05-16',
                'droping_time' => '08:00',
                'status' => 'INVOICED',
                'items' => [
                    ['name' => 'AYAM FILET', 'qty' => 60, 'unit' => 'kg', 'grade' => 'A', 'price' => 86650, 'supplier' => 'DUNIA BUMBU MOJOKERTO', 'invoiced' => true, 'request' => null],
                ],
                'delivery' => [
                    'number' => 'SJ/DBM/150526/003',
                    'date' => '2026-05-16',
                    'driver' => 'Rudi Hartono',
                    'notes' => 'Diterima.',
                ],
                'invoices' => [
                    ['number' => 'INV/DBM/721553', 'date' => '2026-05-16', 'supplier' => 'DUNIA BUMBU MOJOKERTO', 'status' => 'PAID', 'total_amount' => 5199000],
                ],
            ],
            [
                'id' => 'po-002',
                'number' => '2/PO/12052026/DBM/2026',
                'date' => '2026-05-12',
                'created_by' => 'Ahmad Lutfi',
                'sppg' => 'SPPG-Balongsari',
                'sppg_code' => 'M1101',
                'droping_date' => '2026-05-13',
                'droping_time' => '06:30',
                'status' => 'PROCESSING',
                'items' => [
                    ['name' => 'BAWANG MERAH', 'qty' => 2, 'unit' => 'kg', 'grade' => 'A', 'price' => 32000, 'supplier' => 'DUNIA BUMBU MOJOKERTO', 'invoiced' => false, 'request' => null],
                ],
                'delivery' => null,
                'invoices' => [],
            ],
            [
                'id' => 'po-001',
                'number' => '1/PO/10052026/VPA/2026',
                'date' => '2026-05-10',
                'created_by' => 'Ahmad Lutfi',
                'sppg' => 'SPPG-Balongsari',
                'sppg_code' => 'M1101',
                'droping_date' => '2026-05-11',
                'droping_time' => '07:00',
                'status' => 'COMPLETED',
                'items' => [
                    ['name' => 'AYAM FILET', 'qty' => 10, 'unit' => 'kg', 'grade' => 'A', 'price' => 45000, 'supplier' => 'VIALA PANGAN', 'invoiced' => false, 'request' => null],
                    ['name' => 'TELUR AYAM', 'qty' => 120, 'unit' => 'butir', 'grade' => 'A', 'price' => 2300, 'supplier' => 'NUTRIVA FOODS', 'invoiced' => false, 'request' => null],
                ],
                'delivery' => [
                    'number' => 'SJ/VPA/100526/001',
                    'date' => '2026-05-11',
                    'driver' => 'Rudi Hartono',
                    'notes' => 'Diterima lengkap oleh PIC SPPG.',
                ],
                'invoices' => [],
            ],
        ];

        return $this->applySessionOrderChanges($orders);
    }

    private function applySessionOrderChanges(array $orders): array
    {
        $deletedIds = session('po_deleted_ids', []);
        $statusOverrides = session('po_statuses', []);
        $supplierAssignments = session('po_supplier_assignments', []);
        $deliveryOverrides = session('surat_jalan_overrides', []);
        $invoiceStatuses = session('invoice_statuses', []);

        return collect($orders)
            ->reject(fn (array $order): bool => in_array($order['id'], $deletedIds, true))
            ->map(function (array $order) use ($statusOverrides, $supplierAssignments, $deliveryOverrides): array {
                if (isset($statusOverrides[$order['id']])) {
                    $order['status'] = $statusOverrides[$order['id']];
                }

                if (isset($supplierAssignments[$order['id']])) {
                    foreach ($order['items'] as $index => $item) {
                        if (isset($supplierAssignments[$order['id']][$index])) {
                            $order['items'][$index]['supplier'] = $supplierAssignments[$order['id']][$index];
                        }
                    }
                }

                if (isset($deliveryOverrides[$order['id']])) {
                    $override = $deliveryOverrides[$order['id']];
                    $order['delivery'] = [
                        'number' => $override['number'],
                        'date' => $override['date'],
                        'driver' => $override['driver'],
                        'notes' => $override['notes'],
                        'kepada' => $override['kepada'],
                        'kd_sppg' => $override['kd_sppg'],
                        'nama_sppg' => $override['nama_sppg'],
                        'pj_sppg' => $override['pj_sppg'],
                        'whatsapp' => $override['whatsapp'],
                        'has_photo' => $override['has_photo'] ?? true,
                    ];

                    foreach ($order['items'] as $index => $item) {
                        if (isset($override['qty_actual'][$index])) {
                            $order['items'][$index]['qty'] = (float) $override['qty_actual'][$index];
                        }

                        if (isset($override['prices'][$index])) {
                            $order['items'][$index]['price'] = (int) $override['prices'][$index];
                        }

                        if (isset($override['suppliers'][$index])) {
                            $order['items'][$index]['supplier'] = $override['suppliers'][$index];
                        }
                    }
                }

                if (isset($invoiceStatuses[$order['id']])) {
                    foreach ($order['invoices'] as $index => $invoice) {
                        if (isset($invoiceStatuses[$order['id']][$invoice['number']])) {
                            $order['invoices'][$index]['status'] = $invoiceStatuses[$order['id']][$invoice['number']];
                        }
                    }
                }

                return $order;
            })
            ->values()
            ->all();
    }
}
