<form class="space-y-4">
    <label class="block">
        <span class="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">Nama Barang</span>
        <input value="{{ $item['name'] }}" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" placeholder="Nama barang">
    </label>
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label class="block">
            <span class="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">Satuan</span>
            <input value="{{ $item['unit'] }}" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" placeholder="kg, pcs, butir">
        </label>
        <label class="block">
            <span class="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">Kategori</span>
            <input value="{{ $item['category'] }}" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" placeholder="Kategori">
        </label>
    </div>
    <label class="block">
        <span class="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">Status</span>
        <select class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10">
            <option @selected($item['status'] === 'Aktif')>Aktif</option>
            <option @selected($item['status'] === 'Nonaktif')>Nonaktif</option>
        </select>
    </label>
    <div class="flex justify-end gap-3 pt-2">
        <a href="{{ route('master-stok.index') }}" class="rounded-lg border border-slate-200 bg-white px-5 py-3 text-xs font-black uppercase tracking-wider text-slate-600">Batal</a>
        <button type="button" class="rounded-lg bg-blue-600 px-5 py-3 text-xs font-black uppercase tracking-wider text-white">Simpan UI</button>
    </div>
</form>
