@extends('layouts.app', ['title' => 'Surat Jalan (Delivery)'])

@section('content')
    <section class="mx-auto max-w-[1440px] space-y-4">
        {{-- Header + Search --}}
        <form method="GET" class="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h2 class="text-lg font-black tracking-tight text-slate-950">Manajemen Surat Jalan</h2>
                <p class="mt-0.5 text-xs font-medium text-slate-500">Kelola pengiriman barang dan bukti drop barang.</p>
            </div>
            <div class="relative w-full sm:w-80">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-base text-slate-400">⌕</span>
                <input name="search" value="{{ $filters['search'] ?? '' }}" type="search" placeholder="Cari No PO / No SJ..." class="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm font-semibold text-slate-600 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10">
            </div>
        </form>

        {{-- Tabel --}}
        <section class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div class="overflow-x-auto">
                <table class="w-full min-w-[820px] text-sm">
                    <thead class="bg-slate-50/80">
                        <tr>
                            <th class="w-12 px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wide text-slate-400">No</th>
                            <th class="w-64 px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wide text-slate-400">Identitas PO</th>
                            <th class="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wide text-slate-400">Barang</th>
                            <th class="w-48 px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wide text-slate-400">Info Pengiriman</th>
                            <th class="w-32 px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wide text-slate-400">Bukti Drop</th>
                            <th class="w-36 px-3 py-2.5 text-right text-[10px] font-bold uppercase tracking-wide text-slate-400">{{ $currentUser['role'] === 'ADMIN' ? 'Opsi' : 'Detail' }}</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        @forelse ($orders as $order)
                            @php
                                $sequence      = ($orders->firstItem() ?? 1) + $loop->index;
                                $hasDelivery   = ! empty($order['delivery']);
                                $supplierCount = collect($order['items'])->pluck('supplier')->unique()->count();
                            @endphp
                            <tr class="align-top hover:bg-slate-50/50">
                                <td class="px-3 py-3 text-xs font-bold text-slate-400">{{ $sequence }}</td>

                                {{-- Identitas PO --}}
                                <td class="px-3 py-3">
                                    <p class="max-w-[220px] truncate text-xs font-black text-slate-950">{{ $order['number'] }}</p>
                                    <div class="mt-1.5 flex flex-wrap items-center gap-1.5">
                                        <span class="rounded bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-blue-600">{{ $order['created_by'] }}</span>
                                        <span class="text-[10px] font-bold text-slate-400">{{ date('d/m/Y', strtotime($order['date'])) }}</span>
                                    </div>
                                    <span class="mt-1.5 inline-flex rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[9px] font-bold uppercase text-slate-600">{{ $order['sppg'] }}</span>
                                </td>

                                {{-- Barang & Qty --}}
                                <td class="px-3 py-3">
                                    @php
                                        $itemCount = count($order['items']);
                                        $firstItems = collect($order['items'])->take(2);
                                        $remaining = max(0, $itemCount - 2);
                                        $totalQty = collect($order['items'])->sum('qty');
                                    @endphp
                                    <div class="flex flex-wrap items-center gap-1.5">
                                        <span class="rounded bg-slate-900 px-2 py-0.5 text-[10px] font-bold text-white">{{ $itemCount }} item</span>
                                        @foreach ($firstItems as $item)
                                            <span class="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700">{{ $item['name'] }}</span>
                                        @endforeach
                                        @if ($remaining > 0)
                                            <span class="text-[10px] font-bold text-slate-400">+{{ $remaining }} lagi</span>
                                        @endif
                                    </div>
                                    <p class="mt-1 text-[10px] font-semibold text-slate-500">
                                        Supplier: <span class="font-bold text-blue-600">{{ collect($order['items'])->pluck('supplier')->unique()->implode(', ') }}</span>
                                    </p>
                                </td>

                                {{-- Info Pengiriman --}}
                                <td class="px-3 py-3">
                                    @if ($hasDelivery)
                                        <p class="max-w-[180px] truncate text-xs font-black text-slate-950">{{ $order['delivery']['number'] }}</p>
                                        <p class="mt-1 text-[10px] font-bold text-emerald-600">
                                            {{ date('d/m/Y', strtotime($order['delivery']['date'])) }}
                                            @php
                                                $jamKirim = $order['delivery']['time'] ?? $order['droping_time'] ?? null;
                                            @endphp
                                            @if (! empty($jamKirim))
                                                · {{ $jamKirim }}
                                            @endif
                                        </p>
                                        @if (! empty($order['delivery']['driver']))
                                            <p class="mt-0.5 text-[10px] font-semibold text-slate-500">Driver: {{ $order['delivery']['driver'] }}</p>
                                        @endif
                                    @else
                                        <p class="text-xs font-bold italic text-slate-400">Menunggu SJ</p>
                                        @if (! empty($order['droping_date']))
                                            <p class="mt-1 text-[10px] font-semibold text-slate-500">
                                                Jadwal: {{ date('d/m/Y', strtotime($order['droping_date'])) }}
                                                @if (! empty($order['droping_time']))
                                                    · {{ $order['droping_time'] }}
                                                @endif
                                            </p>
                                        @endif
                                    @endif
                                </td>

                                {{-- Bukti Drop --}}
                                <td class="px-3 py-3">
                                    @if ($hasDelivery)
                                        <span class="inline-flex items-center gap-1 rounded border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                                            <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                            Ada Bukti
                                        </span>
                                        <p class="mt-1 text-[10px] font-semibold text-slate-400">{{ max(1, $supplierCount) }} foto</p>
                                    @else
                                        <span class="text-xs font-bold text-slate-300">—</span>
                                    @endif
                                </td>

                                {{-- Aksi --}}
                                <td class="px-3 py-3 text-right">
                                    @if ($hasDelivery)
                                        <a href="{{ route('surat-jalan.show', $order['id']) }}" class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600">
                                            {{ $currentUser['role'] === 'ADMIN' ? 'Lihat / Edit' : 'Lihat' }}
                                            <span>›</span>
                                        </a>
                                    @elseif ($currentUser['role'] === 'ADMIN')
                                        <a href="{{ route('surat-jalan.show', $order['id']) }}" class="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700">
                                            Proses Kirim
                                            <span>›</span>
                                        </a>
                                    @else
                                        <span class="text-[10px] font-bold uppercase tracking-wide text-slate-300">Belum Terbit</span>
                                    @endif
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="6" class="px-3 py-10 text-center text-sm font-bold text-slate-400">Belum ada surat jalan.</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
            @if ($orders->hasPages())
                <div class="border-t border-slate-100 px-4 py-3">
                    {{ $orders->links() }}
                </div>
            @endif
        </section>
    </section>
@endsection
