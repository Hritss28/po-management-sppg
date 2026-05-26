<?php

namespace App\Http\Controllers;

use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\Sppg;
use App\Traits\ProcurementHelpers;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\View\View;

class RekapPoController extends Controller
{
    use ProcurementHelpers;

    public function index(Request $request): View|RedirectResponse
    {
        if ($redirect = $this->requireAuth()) {
            return $redirect;
        }

        if ($request->has('clear')) {
            $request->session()->forget('rekap_po_filters');

            return redirect()->route('rekap-po.index');
        }

        $hasQueryParams = $request->has('search') || $request->has('status') || $request->has('po_date') || $request->has('drop_date') || $request->has('page');

        if ($hasQueryParams) {
            $filters = [
                'search' => $request->string('search')->toString(),
                'status' => $request->string('status')->toString() ?: 'ALL',
                'po_date' => $request->string('po_date')->toString(),
                'drop_date' => $request->string('drop_date')->toString(),
                'page' => $request->string('page')->toString(),
            ];
            $request->session()->put('rekap_po_filters', $filters);
        } else {
            if ($request->session()->has('rekap_po_filters')) {
                return redirect()->route('rekap-po.index', $request->session()->get('rekap_po_filters'));
            }
        }

        $query = $this->visibleOrdersQuery();
        $search = strtolower($request->string('search')->toString());
        $status = $request->string('status')->toString();
        $poDate = $request->string('po_date')->toString();
        $dropDate = $request->string('drop_date')->toString();

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

        if ($poDate !== '') {
            $query->whereDate('date', $poDate);
        }

        if ($dropDate !== '') {
            $query->whereDate('droping_date', $dropDate);
        }

        // Ambil semua PO, urutkan tanggal drop terbaru dulu
        $allOrders = $query
            ->orderByRaw('COALESCE(droping_date, date) DESC')
            ->orderBy('id', 'desc')
            ->get();

        // Kelompokkan berdasarkan tanggal drop
        $grouped = $allOrders->groupBy(function (PurchaseOrder $order): string {
            return $order->droping_date?->format('Y-m-d') ?? $order->date->format('Y-m-d');
        });

        // Bangun data per tanggal
        $groupedData = $grouped->map(function ($dayOrders, string $date): array {
            $ordersArray = $dayOrders->map(fn (PurchaseOrder $order): array => $this->orderToArray($order));
            $allItems = $ordersArray->flatMap(fn (array $o): array => $o['items']);
            $totalJual = (int) $allItems->sum(fn (array $i): float => $i['qty'] * $i['price']);
            $totalBeli = (int) $allItems->sum(fn (array $i): float => $i['qty'] * $i['buy_price']);
            $suppliers = $ordersArray
                ->flatMap(fn (array $o): array => array_column($o['items'], 'supplier'))
                ->filter(fn ($s): bool => $s !== '-' && $s !== null && $s !== '')
                ->unique()
                ->values()
                ->all();

            return [
                'date' => $date,
                'orders' => $ordersArray->values()->all(),
                'order_count' => $dayOrders->count(),
                'item_count' => $allItems->count(),
                'total_qty' => (float) $allItems->sum('qty'),
                'total_jual' => $totalJual,
                'total_beli' => $totalBeli,
                'profit' => $totalJual - $totalBeli,
                'suppliers' => $suppliers,
                'statuses' => $ordersArray->pluck('status')->unique()->values()->all(),
                'droping_time' => $dayOrders->first()->droping_time
                    ? substr((string) $dayOrders->first()->droping_time, 0, 5)
                    : null,
            ];
        })->values();

        $groups = $this->paginateCollection($groupedData, $request, 15);

        return view('rekap-po.index', [
            'currentUser' => $this->currentUser(),
            'groups' => $groups,
            'stats' => $this->poStats($this->visibleOrders()),
            'filters' => [
                'search' => $request->string('search')->toString(),
                'status' => $status ?: 'ALL',
                'po_date' => $poDate,
                'drop_date' => $dropDate,
            ],
        ]);
    }

    public function show(string $date): View|RedirectResponse
    {
        if ($redirect = $this->requireAuth()) {
            return $redirect;
        }

        $orders = $this->ordersForDate($date);

        return view('rekap-po.show', [
            'currentUser' => $this->currentUser(),
            'date' => $date,
            'orders' => $orders,
        ]);
    }

    public function edit(string $date): View|RedirectResponse
    {
        if ($redirect = $this->requireAuth()) {
            return $redirect;
        }

        $this->authorizeAdmin();

        $orders = $this->ordersForDate($date);

        return view('rekap-po.edit', [
            'currentUser' => $this->currentUser(),
            'date' => $date,
            'orders' => $orders,
            'sppgs' => Sppg::query()->orderBy('name')->get(),
        ]);
    }

    public function update(Request $request, string $date): RedirectResponse
    {
        if ($redirect = $this->requireAuth()) {
            return $redirect;
        }

        $this->authorizeAdmin();

        $validated = $request->validate([
            'droping_date' => ['nullable', 'date'],
            'droping_time' => ['nullable', 'date_format:H:i'],
            'items' => ['required', 'array'],
            'items.*.price' => ['required', 'numeric', 'min:0'],
            'items.*.buy_price' => ['nullable', 'numeric', 'min:0'],
            'items.*.qty' => ['required', 'numeric', 'min:0.01'],
            'items.*.grade' => ['required', 'string', 'max:30'],
            'items.*.request' => ['nullable', 'string', 'max:255'],
        ]);

        DB::transaction(function () use ($date, $validated): void {
            $orders = $this->visibleOrdersQuery()->whereDate('droping_date', $date)->get();

            // Update droping_date & time jika diubah
            if (! empty($validated['droping_date'])) {
                foreach ($orders as $order) {
                    $order->update([
                        'droping_date' => $validated['droping_date'],
                        'droping_time' => $validated['droping_time'] ?? $order->droping_time,
                    ]);
                }
            }

            // Update setiap item berdasarkan ID
            foreach ($validated['items'] as $itemId => $data) {
                $item = PurchaseOrderItem::find((int) $itemId);
                if (! $item) {
                    continue;
                }

                $item->update([
                    'qty' => $data['qty'],
                    'grade' => $data['grade'],
                    'price' => (int) preg_replace('/[^\d]/', '', (string) ($data['price'] ?? 0)),
                    'buy_price' => (int) preg_replace('/[^\d]/', '', (string) ($data['buy_price'] ?? 0)),
                    'request_note' => $data['request'] ?? null,
                ]);
            }
        });

        session()->forget('rekap_po_filters');

        return redirect()->route('rekap-po.index')->with('success', 'Rekap PO tanggal '.$date.' berhasil diperbarui.');
    }

    public function destroy(string $date): RedirectResponse
    {
        if ($redirect = $this->requireAuth()) {
            return $redirect;
        }

        $this->authorizeAdmin();

        $orders = $this->visibleOrdersQuery()->whereDate('droping_date', $date)->get();
        foreach ($orders as $order) {
            $order->delete();
        }

        session()->forget('rekap_po_filters');

        return redirect()->route('rekap-po.index')->with('success', 'Semua PO tanggal '.$date.' berhasil dihapus.');
    }

    public function preview(string $date): View|RedirectResponse
    {
        if ($redirect = $this->requireAuth()) {
            return $redirect;
        }

        $orders = $this->ordersForDate($date);

        return view('rekap-po.preview', [
            'currentUser' => $this->currentUser(),
            'date' => $date,
            'orders' => $orders,
        ]);
    }

    /** @return array<int, array> */
    private function ordersForDate(string $date): array
    {
        return $this->visibleOrdersQuery()
            ->whereDate('droping_date', $date)
            ->orderBy('id')
            ->get()
            ->map(fn (PurchaseOrder $order): array => $this->orderToArray($order))
            ->values()
            ->all();
    }
}
