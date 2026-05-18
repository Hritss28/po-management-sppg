<form method="GET" class="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center">
    <div class="min-w-0 flex-1">
        <label for="search" class="sr-only">Cari data</label>
        <input id="search" name="search" value="{{ $filters['search'] ?? '' }}" type="search" placeholder="Cari berdasarkan nomor, SPPG, barang, atau pembuat..." class="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10">
    </div>
    <div class="w-full md:w-48">
        <label for="status" class="sr-only">Status</label>
        <select id="status" name="status" class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-black uppercase tracking-wider text-slate-600 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10">
            @foreach (['ALL' => 'Semua Status', 'VALID' => 'Valid', 'PROCESSING' => 'Proses', 'COMPLETED' => 'Selesai', 'INVOICED' => 'Tertagih', 'CANCELLED' => 'Dibatalkan'] as $value => $label)
                <option value="{{ $value }}" @selected(($filters['status'] ?? 'ALL') === $value)>{{ $label }}</option>
            @endforeach
        </select>
    </div>
    <button type="submit" class="rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white">
        Filter
    </button>
</form>
