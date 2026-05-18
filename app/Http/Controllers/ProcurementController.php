<?php

namespace App\Http\Controllers;

use App\Models\DeliveryNote;
use App\Models\Invoice;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\Sppg;
use App\Models\StockItem;
use App\Models\Supplier;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\View\View;

class ProcurementController extends Controller
{
    public function dashboard(): View|RedirectResponse
    {
        if ($redirect = $this->requireAuth()) {
            return $redirect;
        }

        $orders = $this->visibleOrders();
        $invoicePaid = Invoice::query()->where('status', 'PAID')->sum('total_amount');
        $invoiceUnpaid = Invoice::query()->where('status', 'UNPAID')->sum('total_amount');
        $estimatedUnbilled = PurchaseOrderItem::query()->where('is_invoiced', false)->get()->sum(fn (PurchaseOrderItem $item): float|int => $item->qty * $item->price);

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

        $query = $this->visibleOrdersQuery();
        $search = strtolower($request->string('search')->toString());
        $status = $request->string('status')->toString();

        if ($search !== '') {
            $query->where(function (Builder $builder) use ($search): void {
                $builder
                    ->whereRaw('LOWER(number) LIKE ?', ["%{$search}%"])
                    ->orWhereRaw('LOWER(created_by) LIKE ?', ["%{$search}%"])
                    ->orWhereHas('sppg', fn (Builder $sppg): Builder => $sppg->whereRaw('LOWER(name) LIKE ?', ["%{$search}%"]))
                    ->orWhereHas('items', fn (Builder $item): Builder => $item->whereRaw('LOWER(name) LIKE ?', ["%{$search}%"]));
            });
        }

        if ($status !== '' && $status !== 'ALL') {
            $query->where('status', $status);
        }

        $orders = $query->latest('id')->get()->map(fn (PurchaseOrder $order): array => $this->orderToArray($order));

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
            'sppgs' => Sppg::query()->orderBy('name')->get(),
        ]);
    }

    public function storePurchaseOrder(Request $request): RedirectResponse
    {
        if ($redirect = $this->requireAuth()) {
            return $redirect;
        }

        $validated = $this->validatePurchaseOrder($request);

        $order = DB::transaction(function () use ($validated): PurchaseOrder {
            $sppg = $this->sppgForRequest($validated['sppg_code'] ?? null);
            $order = PurchaseOrder::query()->create([
                'number' => $this->nextPurchaseOrderNumber($validated['supplier_prefix'] ?? 'DBM'),
                'date' => $validated['date'],
                'created_by' => $validated['created_by'],
                'sppg_id' => $sppg->id,
                'droping_date' => $validated['droping_date'] ?? null,
                'droping_time' => $validated['droping_time'] ?? null,
                'status' => 'PROCESSING',
            ]);

            $this->syncPurchaseOrderItems($order, $validated['items']);

            return $order;
        });

        return redirect()->route('purchase-orders.show', $order->id)->with('success', 'PO berhasil dibuat.');
    }

    public function showPurchaseOrder(string $id): View|RedirectResponse
    {
        if ($redirect = $this->requireAuth()) {
            return $redirect;
        }

        return view('purchase-orders.show', [
            'currentUser' => $this->currentUser(),
            'order' => $this->findOrderArray($id),
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
            'order' => $this->findOrderArray($id),
            'stockItems' => $this->stockItems(),
            'suppliers' => $this->suppliers(),
            'sppgs' => Sppg::query()->orderBy('name')->get(),
        ]);
    }

    public function updatePurchaseOrder(Request $request, string $id): RedirectResponse
    {
        if ($redirect = $this->requireAuth()) {
            return $redirect;
        }

        $this->authorizeAdmin();
        $validated = $this->validatePurchaseOrder($request);
        $order = $this->findOrderModel($id);

        DB::transaction(function () use ($order, $validated): void {
            $sppg = $this->sppgForRequest($validated['sppg_code'] ?? null);
            $order->update([
                'date' => $validated['date'],
                'created_by' => $validated['created_by'],
                'sppg_id' => $sppg->id,
                'droping_date' => $validated['droping_date'] ?? null,
                'droping_time' => $validated['droping_time'] ?? null,
            ]);
            $order->items()->delete();
            $this->syncPurchaseOrderItems($order, $validated['items']);
        });

        return redirect()->route('purchase-orders.show', $order->id)->with('success', 'PO berhasil diperbarui.');
    }

    public function updatePurchaseOrderStatus(Request $request, string $id): RedirectResponse
    {
        if ($redirect = $this->requireAuth()) {
            return $redirect;
        }

        $this->authorizeAdmin();
        $validated = $request->validate(['status' => ['required', 'in:VALID,PROCESSING,COMPLETED,INVOICED,CANCELLED']]);
        $this->findOrderModel($id)->update(['status' => $validated['status']]);

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
            'suppliers.*' => ['required', 'exists:suppliers,name'],
        ]);
        $order = $this->findOrderModel($id);

        foreach (array_values($validated['suppliers']) as $index => $supplierName) {
            $supplier = Supplier::query()->where('name', $supplierName)->first();
            $order->items()->skip($index)->first()?->update(['supplier_id' => $supplier?->id]);
        }

        return back()->with('success', 'Penugasan supplier berhasil disimpan.');
    }

    public function deletePurchaseOrder(string $id): RedirectResponse
    {
        if ($redirect = $this->requireAuth()) {
            return $redirect;
        }

        $this->authorizeAdmin();
        $this->findOrderModel($id)->delete();

        return redirect()->route('purchase-orders.index')->with('success', 'PO berhasil dihapus.');
    }

    public function previewPurchaseOrder(string $id): View|RedirectResponse
    {
        if ($redirect = $this->requireAuth()) {
            return $redirect;
        }

        return view('purchase-orders.preview', [
            'currentUser' => $this->currentUser(),
            'order' => $this->findOrderArray($id),
            'suppliers' => $this->suppliers(),
        ]);
    }

    public function suratJalan(Request $request): View|RedirectResponse
    {
        if ($redirect = $this->requireAuth()) {
            return $redirect;
        }

        $query = $this->visibleOrdersQuery()->whereIn('status', ['PROCESSING', 'COMPLETED', 'INVOICED']);
        $search = strtolower($request->string('search')->toString());

        if ($search !== '') {
            $query->where(function (Builder $builder) use ($search): void {
                $builder
                    ->whereRaw('LOWER(number) LIKE ?', ["%{$search}%"])
                    ->orWhereHas('deliveryNote', fn (Builder $delivery): Builder => $delivery->whereRaw('LOWER(number) LIKE ?', ["%{$search}%"]))
                    ->orWhereHas('items', fn (Builder $item): Builder => $item->whereRaw('LOWER(name) LIKE ?', ["%{$search}%"]));
            });
        }

        return view('surat-jalan.index', [
            'currentUser' => $this->currentUser(),
            'orders' => $query->latest('id')->get()->map(fn (PurchaseOrder $order): array => $this->orderToArray($order)),
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
            'order' => $this->findOrderArray($id),
            'suppliers' => $this->suppliers(),
        ]);
    }

    public function updateSuratJalan(Request $request, string $id): RedirectResponse
    {
        if ($redirect = $this->requireAuth()) {
            return $redirect;
        }

        $this->authorizeAdmin();
        $order = $this->findOrderModel($id);
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
            'suppliers.*' => ['required', 'exists:suppliers,name'],
        ]);

        DB::transaction(function () use ($order, $validated): void {
            $order->deliveryNote()->updateOrCreate(
                ['purchase_order_id' => $order->id],
                [
                    'number' => $validated['surat_jalan_no'],
                    'date' => $validated['delivery_date'],
                    'driver' => $validated['driver'] ?: 'Nama Pengirim',
                    'notes' => $validated['notes'] ?: '-',
                    'kepada' => $validated['kepada'],
                    'kd_sppg' => $validated['kd_sppg'] ?: $order->sppg->code,
                    'nama_sppg' => $validated['nama_sppg'],
                    'pj_sppg' => $validated['pj_sppg'] ?: '-',
                    'whatsapp' => $validated['whatsapp'] ?: '-',
                    'has_photo' => true,
                ],
            );

            foreach ($order->items as $index => $item) {
                $supplier = Supplier::query()->where('name', $validated['suppliers'][$index] ?? null)->first();
                $item->update([
                    'qty' => $validated['qty_actual'][$index] ?? $item->qty,
                    'price' => $validated['prices'][$index] ?? $item->price,
                    'supplier_id' => $supplier?->id ?? $item->supplier_id,
                ]);
            }

            $order->update(['status' => 'COMPLETED']);
        });

        return redirect()->route('surat-jalan.show', $order->id)->with('success', 'Surat Jalan berhasil disimpan.');
    }

    public function previewSuratJalan(string $id): View|RedirectResponse
    {
        if ($redirect = $this->requireAuth()) {
            return $redirect;
        }

        return view('surat-jalan.preview', [
            'currentUser' => $this->currentUser(),
            'order' => $this->findOrderArray($id),
        ]);
    }

    public function invoices(Request $request): View|RedirectResponse
    {
        if ($redirect = $this->requireAuth()) {
            return $redirect;
        }

        $orders = $this->visibleOrdersQuery()->latest('id')->get();
        $historyInvoices = Invoice::query()
            ->with(['purchaseOrder.sppg', 'items', 'supplier'])
            ->latest('id')
            ->get()
            ->map(fn (Invoice $invoice): array => [
                'order' => $this->orderToArray($invoice->purchaseOrder),
                'invoice' => $this->invoiceToArray($invoice),
            ]);

        $publishedKeys = $historyInvoices
            ->map(fn (array $entry): string => $entry['order']['id'].'|'.$entry['invoice']['supplier'])
            ->all();

        $pendingInvoices = $orders
            ->filter(fn (PurchaseOrder $order): bool => in_array($order->status, ['COMPLETED', 'INVOICED'], true))
            ->flatMap(function (PurchaseOrder $order) use ($publishedKeys): array {
                return $order->items
                    ->filter(fn (PurchaseOrderItem $item): bool => ! $item->is_invoiced)
                    ->groupBy(fn (PurchaseOrderItem $item): string => $item->supplier?->name ?? '-')
                    ->reject(fn (Collection $items, string $supplier): bool => in_array($order->id.'|'.$supplier, $publishedKeys, true))
                    ->map(fn (Collection $items, string $supplier): array => [
                        'order' => $this->orderToArray($order),
                        'supplier' => $supplier,
                        'items' => $items->map(fn (PurchaseOrderItem $item): array => $this->itemToArray($item))->values(),
                        'total' => $items->sum(fn (PurchaseOrderItem $item): float|int => $item->qty * $item->price),
                    ])
                    ->values()
                    ->all();
            })
            ->values();

        return view('invoices.index', [
            'currentUser' => $this->currentUser(),
            'pendingInvoices' => $pendingInvoices,
            'historyInvoices' => $historyInvoices,
            'activeTab' => $request->string('tab')->toString() === 'history' ? 'history' : 'pending',
            'stats' => [
                'total' => $historyInvoices->sum(fn (array $entry): int|float => $entry['invoice']['total_amount']),
                'paid' => $historyInvoices->sum(fn (array $entry): int|float => $entry['invoice']['status'] === 'PAID' ? $entry['invoice']['total_amount'] : 0),
                'unpaid' => $historyInvoices->sum(fn (array $entry): int|float => $entry['invoice']['status'] === 'UNPAID' ? $entry['invoice']['total_amount'] : 0),
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
        $order = $this->findOrderModel($id);
        $supplierName = $request->string('supplier')->toString() ?: $order->items->first()?->supplier?->name;
        $items = $order->items
            ->filter(fn (PurchaseOrderItem $item): bool => ($item->supplier?->name === $supplierName) && ! $item->is_invoiced)
            ->map(fn (PurchaseOrderItem $item): array => $this->itemToArray($item))
            ->values();

        return view('invoices.create', [
            'currentUser' => $this->currentUser(),
            'order' => $this->orderToArray($order),
            'items' => $items,
            'invoiceNumber' => $this->invoiceNumberFor($supplierName, $order->number),
            'supplier' => $this->supplierDetails($supplierName),
        ]);
    }

    public function storeInvoice(Request $request, string $id): RedirectResponse
    {
        if ($redirect = $this->requireAuth()) {
            return $redirect;
        }

        $this->authorizeAdmin();
        $order = $this->findOrderModel($id);
        $validated = $request->validate([
            'supplier' => ['required', 'exists:suppliers,name'],
            'invoice_no' => ['required', 'string', 'max:80', 'unique:invoices,number'],
            'invoice_date' => ['required', 'date'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.id' => ['nullable', 'exists:purchase_order_items,id'],
            'items.*.name' => ['required', 'string', 'max:120'],
            'items.*.unit' => ['required', 'string', 'max:20'],
            'items.*.qty' => ['required', 'numeric', 'min:0.01'],
            'items.*.price' => ['required', 'numeric', 'min:1'],
        ]);

        DB::transaction(function () use ($order, $validated): void {
            $supplier = Supplier::query()->where('name', $validated['supplier'])->firstOrFail();
            $invoice = Invoice::query()->create([
                'purchase_order_id' => $order->id,
                'supplier_id' => $supplier->id,
                'number' => $validated['invoice_no'],
                'date' => $validated['invoice_date'],
                'supplier_name' => $supplier->name,
                'status' => 'UNPAID',
                'total_amount' => 0,
            ]);

            $total = 0;
            foreach ($validated['items'] as $itemData) {
                $subtotal = (int) ($itemData['qty'] * $itemData['price']);
                $total += $subtotal;
                $invoice->items()->create([
                    'purchase_order_item_id' => $itemData['id'] ?? null,
                    'name' => $itemData['name'],
                    'qty' => $itemData['qty'],
                    'unit' => $itemData['unit'],
                    'price' => $itemData['price'],
                    'subtotal' => $subtotal,
                ]);

                if (! empty($itemData['id'])) {
                    PurchaseOrderItem::query()->whereKey($itemData['id'])->update([
                        'price' => $itemData['price'],
                        'is_invoiced' => true,
                    ]);
                }
            }

            $invoice->update(['total_amount' => $total]);

            if ($order->items()->where('is_invoiced', false)->doesntExist()) {
                $order->update(['status' => 'INVOICED']);
            }
        });

        return redirect()->route('invoices.index', ['tab' => 'history'])->with('success', 'Invoice berhasil diterbitkan.');
    }

    public function showInvoice(string $id): View|RedirectResponse
    {
        if ($redirect = $this->requireAuth()) {
            return $redirect;
        }

        return view('invoices.show', [
            'currentUser' => $this->currentUser(),
            'order' => $this->findOrderArray($id),
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
        Invoice::query()->where('purchase_order_id', $id)->where('number', $validated['invoice_no'])->update(['status' => $validated['status']]);

        return back()->with('success', 'Status invoice berhasil diperbarui.');
    }

    public function previewInvoice(Request $request, string $id): View|RedirectResponse
    {
        if ($redirect = $this->requireAuth()) {
            return $redirect;
        }

        $order = $this->findOrderModel($id);
        $invoice = Invoice::query()
            ->with(['items', 'supplier'])
            ->where('purchase_order_id', $order->id)
            ->where('number', $request->string('invoice')->toString())
            ->first();
        $supplierName = $request->string('supplier')->toString() ?: ($invoice?->supplier_name ?? $order->items->first()?->supplier?->name);
        $items = $invoice
            ? $invoice->items->map(fn ($item): array => [
                'name' => $item->name,
                'qty' => (float) $item->qty,
                'unit' => $item->unit,
                'price' => $item->price,
            ])
            : $order->items->where('supplier.name', $supplierName)->map(fn (PurchaseOrderItem $item): array => $this->itemToArray($item))->values();
        $invoiceArray = $invoice ? $this->invoiceToArray($invoice) : [
            'number' => $this->invoiceNumberFor($supplierName, $order->number),
            'date' => now()->format('Y-m-d'),
            'supplier' => $supplierName,
            'status' => 'UNPAID',
            'total_amount' => $items->sum(fn (array $item): int|float => $item['qty'] * $item['price']),
        ];

        return view('invoices.preview', [
            'currentUser' => $this->currentUser(),
            'order' => $this->orderToArray($order),
            'invoice' => $invoiceArray,
            'items' => $items,
            'supplier' => $this->supplierDetails($supplierName),
        ]);
    }

    public function masterStock(Request $request): View|RedirectResponse
    {
        if ($redirect = $this->requireAuth()) {
            return $redirect;
        }

        $items = StockItem::query()
            ->when($request->filled('search'), fn (Builder $query): Builder => $query->whereRaw('LOWER(name) LIKE ?', ['%'.strtolower($request->string('search')->toString()).'%']))
            ->latest('id')
            ->get()
            ->map(fn (StockItem $item): array => $this->stockItemToArray($item));

        return view('master-stok.index', [
            'currentUser' => $this->currentUser(),
            'items' => $items,
            'filters' => ['search' => $request->string('search')->toString()],
            'editItem' => $request->filled('edit') ? $this->stockItemToArray(StockItem::query()->find($request->string('edit')->toString())) : null,
            'isCreating' => $request->string('mode')->toString() === 'create',
        ]);
    }

    public function createStock(): RedirectResponse
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
        StockItem::query()->create([
            'name' => strtoupper($validated['name']),
            'unit' => strtoupper($validated['unit']),
            'category' => 'Operasional',
            'status' => 'Aktif',
        ]);

        return redirect()->route('master-stok.index')->with('success', 'Barang berhasil ditambahkan.');
    }

    public function showStock(string $id): View|RedirectResponse
    {
        if ($redirect = $this->requireAuth()) {
            return $redirect;
        }

        return view('master-stok.show', [
            'currentUser' => $this->currentUser(),
            'item' => $this->stockItemToArray(StockItem::query()->findOrFail($id)),
        ]);
    }

    public function editStock(string $id): RedirectResponse
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
        StockItem::query()->findOrFail($id)->update([
            'name' => strtoupper($validated['name']),
            'unit' => strtoupper($validated['unit']),
        ]);

        return redirect()->route('master-stok.index')->with('success', 'Barang berhasil diperbarui.');
    }

    public function deleteStock(string $id): RedirectResponse
    {
        if ($redirect = $this->requireAuth()) {
            return $redirect;
        }

        $this->authorizeAdmin();
        StockItem::query()->findOrFail($id)->delete();

        return redirect()->route('master-stok.index')->with('success', 'Barang berhasil dihapus.');
    }

    private function validatePurchaseOrder(Request $request): array
    {
        return $request->validate([
            'date' => ['required', 'date'],
            'created_by' => ['required', 'string', 'max:120'],
            'sppg_code' => ['required', 'exists:sppgs,code'],
            'droping_date' => ['nullable', 'date'],
            'droping_time' => ['nullable', 'date_format:H:i'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.stock_item_id' => ['nullable', 'exists:stock_items,id'],
            'items.*.name' => ['nullable', 'string', 'max:120'],
            'items.*.grade' => ['required', 'string', 'max:30'],
            'items.*.qty' => ['required', 'numeric', 'min:0.01'],
            'items.*.unit' => ['nullable', 'string', 'max:30'],
            'items.*.price' => ['required', 'numeric', 'min:0'],
            'items.*.supplier' => ['nullable', 'exists:suppliers,name'],
            'items.*.request' => ['nullable', 'string', 'max:255'],
        ]);
    }

    private function syncPurchaseOrderItems(PurchaseOrder $order, array $items): void
    {
        foreach ($items as $itemData) {
            if (($itemData['name'] ?? '') === '' && empty($itemData['stock_item_id'])) {
                continue;
            }

            $stockItem = ! empty($itemData['stock_item_id']) ? StockItem::query()->find($itemData['stock_item_id']) : null;
            $supplier = ! empty($itemData['supplier']) ? Supplier::query()->where('name', $itemData['supplier'])->first() : null;
            $order->items()->create([
                'stock_item_id' => $stockItem?->id,
                'supplier_id' => $supplier?->id,
                'name' => $stockItem?->name ?? $itemData['name'],
                'grade' => $itemData['grade'],
                'qty' => $itemData['qty'],
                'unit' => strtoupper($stockItem?->unit ?? $itemData['unit']),
                'price' => $itemData['price'],
                'request_note' => $itemData['request'] ?? null,
                'is_invoiced' => false,
            ]);
        }
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

    private function currentUser(): array
    {
        return session('auth_user', []);
    }

    private function visibleOrdersQuery(): Builder
    {
        $query = PurchaseOrder::query()->with(['sppg', 'items.supplier', 'deliveryNote', 'invoices.items', 'invoices.supplier']);

        if (($this->currentUser()['role'] ?? null) === 'SPPG') {
            $query->whereHas('sppg', fn (Builder $sppg): Builder => $sppg->where('code', $this->currentUser()['id']));
        }

        return $query;
    }

    private function visibleOrders(): Collection
    {
        return $this->visibleOrdersQuery()->latest('id')->get()->map(fn (PurchaseOrder $order): array => $this->orderToArray($order));
    }

    private function findOrderModel(string $id): PurchaseOrder
    {
        return $this->visibleOrdersQuery()->whereKey($id)->firstOrFail();
    }

    private function findOrderArray(string $id): array
    {
        return $this->orderToArray($this->findOrderModel($id));
    }

    private function orderToArray(PurchaseOrder $order): array
    {
        $order->loadMissing(['sppg', 'items.supplier', 'deliveryNote', 'invoices.items', 'invoices.supplier']);

        return [
            'id' => (string) $order->id,
            'number' => $order->number,
            'date' => $order->date->format('Y-m-d'),
            'created_by' => $order->created_by,
            'sppg' => $order->sppg->name,
            'sppg_code' => $order->sppg->code,
            'droping_date' => $order->droping_date?->format('Y-m-d'),
            'droping_time' => $order->droping_time ? substr((string) $order->droping_time, 0, 5) : null,
            'status' => $order->status,
            'items' => $order->items->map(fn (PurchaseOrderItem $item): array => $this->itemToArray($item))->values()->all(),
            'delivery' => $order->deliveryNote ? $this->deliveryToArray($order->deliveryNote) : null,
            'invoices' => $order->invoices->map(fn (Invoice $invoice): array => $this->invoiceToArray($invoice))->values()->all(),
        ];
    }

    private function itemToArray(PurchaseOrderItem $item): array
    {
        return [
            'id' => (string) $item->id,
            'stock_item_id' => $item->stock_item_id,
            'name' => $item->name,
            'qty' => (float) $item->qty,
            'unit' => $item->unit,
            'grade' => $item->grade,
            'price' => $item->price,
            'supplier' => $item->supplier?->name ?? '-',
            'invoiced' => $item->is_invoiced,
            'request' => $item->request_note,
        ];
    }

    private function deliveryToArray(DeliveryNote $delivery): array
    {
        return [
            'number' => $delivery->number,
            'date' => $delivery->date->format('Y-m-d'),
            'driver' => $delivery->driver,
            'notes' => $delivery->notes,
            'kepada' => $delivery->kepada,
            'kd_sppg' => $delivery->kd_sppg,
            'nama_sppg' => $delivery->nama_sppg,
            'pj_sppg' => $delivery->pj_sppg,
            'whatsapp' => $delivery->whatsapp,
            'has_photo' => $delivery->has_photo,
        ];
    }

    private function invoiceToArray(Invoice $invoice): array
    {
        return [
            'number' => $invoice->number,
            'date' => $invoice->date->format('Y-m-d'),
            'supplier' => $invoice->supplier_name,
            'status' => $invoice->status,
            'total_amount' => $invoice->total_amount,
            'items' => $invoice->items->map(fn ($item): array => [
                'name' => $item->name,
                'qty' => (float) $item->qty,
                'unit' => $item->unit,
                'price' => $item->price,
            ])->all(),
        ];
    }

    private function stockItems(): array
    {
        return StockItem::query()->orderBy('id')->get()->map(fn (StockItem $item): array => $this->stockItemToArray($item))->all();
    }

    private function stockItemToArray(?StockItem $item): ?array
    {
        if ($item === null) {
            return null;
        }

        return [
            'id' => (string) $item->id,
            'name' => $item->name,
            'unit' => $item->unit,
            'category' => $item->category,
            'status' => $item->status,
        ];
    }

    private function orderTotal(array $order): int
    {
        return (int) collect($order['items'])->sum(fn (array $item): float|int => $item['qty'] * $item['price']);
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
        return Supplier::query()->orderBy('name')->pluck('name')->all();
    }

    private function supplierDetails(?string $supplier): array
    {
        $record = Supplier::query()->where('name', $supplier)->first() ?? Supplier::query()->first();

        return [
            'name' => $record?->name ?? 'SUPPLIER',
            'address' => $record?->address ?? '-',
            'logo' => $record?->logo_path ?? 'logo-duniabumbu.jpeg',
            'stamp' => $record?->stamp_path ?? 'stamp-duniabumbu.jpeg',
            'theme' => $record?->theme_color ?? '#2563eb',
            'bank_name' => $record?->bank_name ?? 'Mandiri',
            'bank_account_name' => $record?->bank_account_name ?? 'ARIF RAKHMAN HADI',
            'bank_account_number' => $record?->bank_account_number ?? '1420015180150',
        ];
    }

    private function invoiceNumberFor(?string $supplier, string $poNumber): string
    {
        $prefix = match ($supplier) {
            'NUTRIVA FOODS' => 'NUTRIVA',
            'VIALA PANGAN' => 'VIALA',
            default => 'DUNIA',
        };

        return 'INV/'.$prefix.'/'.substr(preg_replace('/\D+/', '', $poNumber), -6).random_int(10, 99);
    }

    private function nextPurchaseOrderNumber(string $prefix): string
    {
        $count = PurchaseOrder::query()->count() + 1;

        return $count.'/PO/'.now()->format('dmY').'/'.$prefix.'/'.now()->format('Y');
    }

    private function sppgForRequest(?string $code): Sppg
    {
        if (($this->currentUser()['role'] ?? null) === 'SPPG') {
            return Sppg::query()->where('code', $this->currentUser()['id'])->firstOrFail();
        }

        return Sppg::query()->where('code', $code)->firstOrFail();
    }
}
