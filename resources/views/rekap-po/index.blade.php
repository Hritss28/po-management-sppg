@extends('layouts.app', ['title' => 'Rekap PO'])

@section('content')
    <section class="mx-auto max-w-[1440px] space-y-7">
        {{-- Stats --}}
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <article class="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-md shadow-slate-200/70 sm:p-7">
                <div class="absolute right-0 top-0 h-full w-2 bg-emerald-400/10"></div>
                <div class="flex items-start justify-between gap-4">
                    <div>
                        <p class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Total Nilai PO</p>
                        <p class="mt-3 text-2xl font-black tracking-tight text-slate-950">Rp {{ number_format($stats['total_value'], 0, ',', '.') }}</p>
                    </div>
                    <span class="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        @include('partials.icon', ['name' => 'trending-up', 'class' => 'h-5 w-5'])
                    </span>
                </div>
            </article>
            <article class="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-md shadow-slate-200/70 sm:p-7">
                <div class="absolute right-0 top-0 h-full w-2 bg-blue-400/10"></div>
                <div class="flex items-start justify-between gap-4">
                    <div>
                        <p class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">PO Aktif</p>
                        <p class="mt-3 text-2xl font-black tracking-tight text-slate-950">{{ $stats['active'] }}</p>
                    </div>
                    <span class="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        @include('partials.icon', ['name' => 'clock', 'class' => 'h-5 w-5'])
                    </span>
                </div>
            </article>
            <article class="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-md shadow-slate-200/70 sm:p-7">
                <div class="absolute right-0 top-0 h-full w-2 bg-orange-400/10"></div>
                <div class="flex items-start justify-between gap-4">
                    <div>
                        <p class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Valid</p>
                        <p class="mt-3 text-2xl font-black tracking-tight text-slate-950">{{ $stats['valid'] }}</p>
                    </div>
                    <span class="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                        @include('partials.icon', ['name' => 'box', 'class' => 'h-5 w-5'])
                    </span>
                </div>
            </article>
            <article class="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-md shadow-slate-200/70 sm:p-7">
                <div class="absolute right-0 top-0 h-full w-2 bg-indigo-400/10"></div>
                <div class="flex items-start justify-between gap-4">
                    <div>
                        <p class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Selesai</p>
                        <p class="mt-3 text-2xl font-black tracking-tight text-slate-950">{{ $stats['completed'] }}</p>
                    </div>
                    <span class="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                        @include('partials.icon', ['name' => 'check-circle', 'class' => 'h-5 w-5'])
                    </span>
                </div>
            </article>
        </div>

        {{-- Filter --}}
        <form method="GET" class="rounded-xl border border-slate-200 bg-white p-3.5 shadow-md shadow-slate-200/70">
            <div class="flex flex-col gap-3 lg:flex-row lg:items-end">
                <div class="relative min-w-0 flex-1 w-full">
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400">⌕</span>
                    <input name="search" value="{{ $filters['search'] ?? '' }}" type="search" placeholder="Cari berdasarkan No PO, barang, atau nama pembuat..." class="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-11 pr-4 text-xs font-semibold text-slate-600 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10">
                </div>
                <div class="relative w-full lg:w-44">
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">▽</span>
                    <select name="status" class="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 pl-11 pr-4 text-[10px] font-black uppercase tracking-wider text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10" onchange="this.form.submit()">
                        @foreach (['ALL' => 'Semua Status', 'VALID' => 'Valid', 'PROCESSING' => 'Proses', 'INVOICED' => 'Tertagih', 'COMPLETED' => 'Selesai', 'CANCELLED' => 'Dibatalkan'] as $value => $label)
                            <option value="{{ $value }}" @selected(($filters['status'] ?? 'ALL') === $value)>{{ $label }}</option>
                        @endforeach
                    </select>
                </div>
                <div class="w-full lg:w-44">
                    <span class="mb-1 block text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">Tanggal PO</span>
                    <input type="date" name="po_date" value="{{ $filters['po_date'] ?? '' }}" class="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-600 outline-none transition focus:border-blue-500 focus:bg-white" onchange="this.form.submit()">
                </div>
                <div class="w-full lg:w-44">
                    <span class="mb-1 block text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">Tanggal Dropping</span>
                    <input type="date" name="drop_date" value="{{ $filters['drop_date'] ?? '' }}" class="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-600 outline-none transition focus:border-blue-500 focus:bg-white" onchange="this.form.submit()">
                </div>
                <div class="flex w-full lg:w-auto gap-2">
                    <button type="submit" class="h-10 flex-1 lg:flex-none rounded-lg bg-blue-600 px-5 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 transition">Filter</button>
                    @if(!empty($filters['search']) || ($filters['status'] !== 'ALL') || !empty($filters['po_date']) || !empty($filters['drop_date']))
                        <a href="{{ route('rekap-po.index', ['clear' => 1]) }}" class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-xs font-black uppercase tracking-wide text-slate-500 transition hover:bg-slate-50" title="Reset">✕</a>
                    @endif
                </div>
            </div>
        </form>

        {{-- Table per Tanggal --}}
        <section class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md shadow-slate-200/70">
            <div class="overflow-x-auto">
                <table class="min-w-[1100px] divide-y divide-slate-100">
                    <thead class="bg-slate-50">
                        <tr>
                            <th class="w-12 px-3 py-2.5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">No</th>
                            <th class="px-3 py-2.5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Tanggal Drop</th>
                            <th class="px-3 py-2.5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Supplier</th>
                            <th class="px-3 py-2.5 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Jml PO</th>
                            <th class="px-3 py-2.5 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Jml Item</th>
                            <th class="px-3 py-2.5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Total Harga Jual</th>
                            <th class="px-3 py-2.5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Total Harga Beli</th>
                            <th class="px-3 py-2.5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Profit</th>
                            <th class="px-3 py-2.5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Opsi</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        @forelse ($groups as $index => $group)
                            @php
                                $seq      = ($groups->firstItem() ?? 1) + $index;
                                $profit   = $group['profit'];
                                $hasBeli  = $group['total_beli'] > 0;
                            @endphp
                            <tr class="hover:bg-slate-50/70">
                                <td class="px-3 py-3 text-center text-xs font-black text-slate-400">{{ $seq }}</td>

                                {{-- Tanggal Drop --}}
                                <td class="px-3 py-3">
                                    <p class="text-sm font-black text-slate-950">{{ date('d F Y', strtotime($group['date'])) }}</p>
                                    @if ($group['droping_time'])
                                        <p class="mt-0.5 text-[10px] font-bold text-slate-400">Jam {{ $group['droping_time'] }}</p>
                                    @endif
                                </td>

                                {{-- Supplier list --}}
                                <td class="px-3 py-3">
                                    @if (count($group['suppliers']) > 0)
                                        <div class="flex flex-wrap gap-1.5">
                                            @foreach ($group['suppliers'] as $supplier)
                                                <span class="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-600">{{ $supplier }}</span>
                                            @endforeach
                                        </div>
                                    @else
                                        <span class="text-[10px] italic text-rose-400">Belum ada supplier</span>
                                    @endif
                                </td>

                                {{-- Jumlah PO --}}
                                <td class="px-3 py-3 text-center">
                                    <span class="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-black text-blue-700">{{ $group['order_count'] }}</span>
                                </td>

                                {{-- Jumlah Item --}}
                                <td class="px-3 py-3 text-center text-sm font-black text-slate-700">{{ $group['item_count'] }}</td>

                                {{-- Total Harga Jual --}}
                                <td class="px-3 py-3 text-right text-sm font-black text-slate-950">Rp {{ number_format($group['total_jual'], 0, ',', '.') }}</td>

                                {{-- Total Harga Beli --}}
                                <td class="px-3 py-3 text-right text-sm font-black text-indigo-700">
                                    @if ($hasBeli)
                                        Rp {{ number_format($group['total_beli'], 0, ',', '.') }}
                                    @else
                                        <span class="text-[10px] font-semibold italic text-slate-400">Belum diisi</span>
                                    @endif
                                </td>

                                {{-- Profit --}}
                                <td class="px-3 py-3 text-right text-sm font-black">
                                    @if ($hasBeli)
                                        <span class="{{ $profit >= 0 ? 'text-emerald-600' : 'text-rose-600' }}">
                                            {{ $profit >= 0 ? '' : '-' }}Rp {{ number_format(abs($profit), 0, ',', '.') }}
                                        </span>
                                    @else
                                        <span class="text-slate-300 font-normal text-xs">—</span>
                                    @endif
                                </td>

                                {{-- Opsi --}}
                                <td class="px-3 py-3">
                                    <div class="flex justify-end gap-1.5">
                                        @if ($currentUser['role'] === 'ADMIN')
                                            <a href="{{ route('rekap-po.edit', $group['date']) }}" title="Edit" class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.651-1.651a2.121 2.121 0 013 3L7.5 19.849 3 21l1.151-4.5L16.862 4.487z"/></svg>
                                            </a>
                                            <form method="POST" action="{{ route('rekap-po.destroy', $group['date']) }}">
                                                @csrf
                                                @method('DELETE')
                                                <button type="submit" title="Hapus Semua PO Tanggal Ini" onclick="return confirm('Hapus semua {{ $group['order_count'] }} PO untuk tanggal {{ date('d/m/Y', strtotime($group['date'])) }}?')" class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 shadow-sm transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600">
                                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 7h12M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-7 4v6m4-6v6M8 7l1 13h6l1-13"/></svg>
                                                </button>
                                            </form>
                                        @endif
                                        <a href="{{ route('rekap-po.preview', $group['date']) }}" title="Cetak" class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M7 3h7l5 5v13H7V3z"/><path stroke-linecap="round" stroke-linejoin="round" d="M14 3v5h5M9 13h6M9 17h6"/></svg>
                                        </a>
                                        <a href="{{ route('rekap-po.show', $group['date']) }}" title="Detail" class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
                                        </a>
                                    </div>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="9" class="px-5 py-12 text-center text-sm font-bold text-slate-400">Tidak ada data Rekap PO.</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
            @if ($groups->hasPages())
                <div class="border-t border-slate-100 px-5 py-4">
                    {{ $groups->links() }}
                </div>
            @endif
        </section>
    </section>
@endsection
