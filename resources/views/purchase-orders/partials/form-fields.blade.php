@php
    $isEdit = isset($order);
    $items = $order['items'] ?? [
        ['name' => '', 'qty' => 0, 'unit' => 'KG', 'grade' => 'A', 'price' => 0, 'supplier' => '', 'request' => null],
        ['name' => '', 'qty' => 0, 'unit' => 'KG', 'grade' => 'A', 'price' => 0, 'supplier' => '', 'request' => null],
    ];
    $total = collect($items)->sum(fn ($item) => ($item['qty'] ?? 0) * ($item['price'] ?? 0));
@endphp

<div class="grid grid-cols-1 gap-10 px-8 py-10 lg:grid-cols-[400px_1fr] xl:px-20">
    <aside class="space-y-8">
        <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-md shadow-slate-200/70">
            <div class="mb-8 flex items-center gap-3 border-b border-slate-100 pb-6">
                <span class="h-4 w-1 rounded-full bg-blue-600"></span>
                <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-50 text-xs font-black text-slate-400">i</span>
                <h2 class="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Informasi Dokumen</h2>
            </div>
            <div class="space-y-7">
                <label class="block">
                    <span class="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-500">Nomor PO</span>
                    <input value="{{ $order['number'] ?? 'Akan Diterbitkan' }}" readonly class="w-full rounded-lg border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-black text-slate-500 outline-none">
                </label>
                <label class="block">
                    <span class="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-500">Tanggal PO</span>
                    <input type="date" value="{{ $order['date'] ?? now()->format('Y-m-d') }}" class="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10">
                </label>
                <label class="block">
                    <span class="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-500">Dibuat Oleh</span>
                    <input value="{{ $order['created_by'] ?? $currentUser['name'] }}" class="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10">
                </label>
            </div>
        </section>

        <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-md shadow-slate-200/70">
            <div class="mb-8 flex items-center gap-3 border-b border-slate-100 pb-6">
                <span class="h-4 w-1 rounded-full bg-orange-500"></span>
                <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-50 text-xs font-black text-slate-400">⛟</span>
                <h2 class="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Logistik</h2>
            </div>
            <div class="space-y-7">
                <label class="block">
                    <span class="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-500">Nomor SPPG</span>
                    <input value="{{ $currentUser['role'] === 'SPPG' ? $currentUser['name'] : ($order['sppg'] ?? '') }}" placeholder="SPPG-..." @readonly($currentUser['role'] === 'SPPG') class="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10">
                </label>
                <div class="grid grid-cols-2 gap-4">
                    <label class="block">
                        <span class="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-500">Tgl Drop</span>
                        <input type="date" value="{{ $order['droping_date'] ?? '' }}" class="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10">
                    </label>
                    <label class="block">
                        <span class="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-500">Jam Drop</span>
                        <input type="time" value="{{ $order['droping_time'] ?? '' }}" class="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10">
                    </label>
                </div>
            </div>
        </section>

        <section class="rounded-2xl bg-slate-950 p-6 text-white shadow-2xl shadow-slate-400/40">
            <p class="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Estimasi Total</p>
            <p class="mt-4 text-3xl font-black tracking-tight">Rp {{ number_format($total, 0, ',', '.') }}</p>
        </section>
    </aside>

    <section class="min-w-0">
        <div class="mb-8 flex items-center justify-between gap-4">
            <h2 class="flex items-center gap-3 text-lg font-black uppercase tracking-tight text-slate-800">
                <span class="text-2xl text-slate-400">◇</span>
                Daftar Barang ({{ count($items) }})
            </h2>
            <button type="button" class="rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-black text-blue-600 shadow-md shadow-slate-200/70">＋ Tambah Barang</button>
        </div>

        <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md shadow-slate-200/70">
            <div class="overflow-x-auto">
                <table class="min-w-[840px] divide-y divide-slate-100">
                    <thead class="bg-slate-50">
                        <tr>
                            <th class="w-14 px-5 py-4 text-left text-xs font-black uppercase tracking-[0.16em] text-slate-400">#</th>
                            <th class="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.16em] text-slate-400">Barang</th>
                            <th class="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.16em] text-slate-400">Grade</th>
                            <th class="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.16em] text-slate-400">Qty</th>
                            <th class="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.16em] text-slate-400">Satuan</th>
                            <th class="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.16em] text-slate-400">Harga Satuan</th>
                            <th class="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.16em] text-slate-400">Supplier</th>
                            <th class="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.16em] text-slate-400">Catatan</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        @foreach ($items as $item)
                            <tr>
                                <td class="px-5 py-4 text-xs font-black text-slate-400">{{ $loop->iteration }}</td>
                                <td class="px-5 py-4">
                                    <select class="w-52 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-black text-slate-800 outline-none focus:border-blue-500">
                                        <option>Pilih...</option>
                                        @foreach ($stockItems as $stock)
                                            <option @selected(($item['name'] ?? '') === $stock['name'])>{{ $stock['name'] }}</option>
                                        @endforeach
                                    </select>
                                </td>
                                <td class="px-5 py-4"><input value="{{ $item['grade'] ?? 'A' }}" class="w-20 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-black text-slate-800 outline-none"></td>
                                <td class="px-5 py-4"><input type="number" value="{{ $item['qty'] ?? 0 }}" class="w-20 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-black text-slate-800 outline-none"></td>
                                <td class="px-5 py-4"><input value="{{ strtoupper($item['unit'] ?? 'KG') }}" class="w-24 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-black text-slate-800 outline-none"></td>
                                <td class="px-5 py-4">
                                    <div class="flex w-32 items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
                                        <span class="mr-2 text-[10px] font-black text-slate-400">Rp.</span>
                                        <input type="text" inputmode="numeric" data-currency-input value="{{ $item['price'] ?? 0 }}" class="min-w-0 flex-1 bg-transparent text-sm font-black text-slate-800 outline-none">
                                    </div>
                                </td>
                                <td class="px-5 py-4">
                                    <select class="w-36 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-black text-slate-800 outline-none focus:border-blue-500">
                                        <option>Supplier...</option>
                                        @foreach ($suppliers as $supplier)
                                            <option @selected(($item['supplier'] ?? '') === $supplier)>{{ $supplier }}</option>
                                        @endforeach
                                    </select>
                                </td>
                                <td class="px-5 py-4"><input value="{{ $item['request'] ?? '' }}" placeholder="Catatan..." class="w-44 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-600 outline-none"></td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    </section>
</div>
