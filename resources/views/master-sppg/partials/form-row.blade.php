<td class="px-6 py-4">
    <input name="code" value="{{ old('code', $sppg['code'] ?? '') }}" placeholder="M1101" class="h-11 w-28 rounded border border-blue-300 bg-white px-3 text-sm font-black uppercase text-slate-800 outline-none focus:ring-4 focus:ring-blue-500/10">
</td>
<td class="px-6 py-4">
    <input name="name" value="{{ old('name', $sppg['name'] ?? '') }}" placeholder="Nama SPPG..." class="h-11 w-full rounded border border-blue-300 bg-white px-4 text-sm font-semibold text-slate-800 outline-none focus:ring-4 focus:ring-blue-500/10">
</td>
<td class="px-6 py-4">
    <input name="location" value="{{ old('location', $sppg['location'] ?? '') }}" placeholder="Lokasi" class="h-11 w-full rounded border border-blue-300 bg-white px-4 text-sm font-semibold text-slate-800 outline-none focus:ring-4 focus:ring-blue-500/10">
</td>
<td class="px-6 py-4">
    <input name="pic_name" value="{{ old('pic_name', $sppg['pic_name'] ?? '') }}" placeholder="Nama PIC" class="h-11 w-full rounded border border-blue-300 bg-white px-4 text-sm font-semibold text-slate-800 outline-none focus:ring-4 focus:ring-blue-500/10">
</td>
<td class="px-6 py-4">
    <input name="whatsapp" value="{{ old('whatsapp', $sppg['whatsapp'] ?? '') }}" placeholder="08..." class="h-11 w-full rounded border border-blue-300 bg-white px-4 text-sm font-semibold text-slate-800 outline-none focus:ring-4 focus:ring-blue-500/10">
</td>
<td class="px-6 py-4">
    <div class="flex items-center justify-center gap-3">
        <button type="submit" class="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600 transition hover:bg-blue-600 hover:text-white" title="Simpan">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 5h11l3 3v11H5zM8 5v6h8M8 19v-5h8v5" />
            </svg>
        </button>
        <a href="{{ route('master-sppg.index') }}" class="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-200 text-slate-600 transition hover:bg-slate-300" title="Batal">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
        </a>
    </div>
</td>
