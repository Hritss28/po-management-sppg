<!DOCTYPE html>
<html lang="id">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Preview Purchase Order - {{ $order['number'] }}</title>
        @vite(['resources/css/app.css', 'resources/js/app.js'])
        <style>
            @page {
                size: A4;
                margin: 14mm;
            }
        </style>
    </head>
    <body class="bg-slate-100 font-sans text-slate-900 antialiased print:bg-white">
        @php
            $suppliers = collect($order['items'])->pluck('supplier')->unique()->values();
            $dropDate = $order['droping_date'] ?: '-';
            $dropTime = $order['droping_time'] ?: '-';
        @endphp

        <header class="print:hidden sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-8 py-4 shadow-sm">
            <div class="flex items-center gap-5">
                <a href="{{ route('purchase-orders.show', $order['id']) }}" class="text-3xl leading-none text-slate-500 hover:text-slate-900">&times;</a>
                <h1 class="text-xl font-black tracking-tight text-slate-900">Preview Purchase Order</h1>
            </div>
            <div class="flex items-center gap-3">
                <button type="button" onclick="window.print()" class="rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm">Print</button>
                <button type="button" onclick="window.print()" class="rounded-lg bg-red-600 px-5 py-3 text-sm font-black text-white shadow-sm shadow-red-600/20">Download PDF</button>
            </div>
        </header>

        <main class="mx-auto max-w-[920px] px-4 py-10 print:max-w-none print:p-0">
            <article class="min-h-[1120px] bg-white p-12 shadow-2xl shadow-slate-300/60 print:min-h-0 print:p-0 print:shadow-none">
                <section class="flex items-start justify-between gap-8">
                    <div>
                        <p class="text-3xl font-black tracking-tight text-slate-950">PURCHASE ORDER</p>
                        <p class="mt-2 text-lg font-black uppercase tracking-[0.2em] text-slate-500">{{ $order['number'] }}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-2xl font-black text-blue-600">CV. SPPG</p>
                        <p class="mt-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400">Tgl PO: {{ date('d M Y', strtotime($order['date'])) }}</p>
                    </div>
                </section>

                <div class="mt-8 border-t-2 border-slate-950"></div>

                <section class="mt-9 grid grid-cols-4 gap-4">
                    <div>
                        <p class="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Dibuat Oleh</p>
                        <div class="min-h-14 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-black">{{ $order['created_by'] }}</div>
                    </div>
                    <div>
                        <p class="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Kode SPPG</p>
                        <div class="min-h-14 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-black">{{ $order['sppg_code'] }} ({{ $order['sppg'] }})</div>
                    </div>
                    <div>
                        <p class="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Tgl Drop</p>
                        <div class="min-h-14 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-black">{{ $dropDate }}</div>
                    </div>
                    <div>
                        <p class="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Jam Drop</p>
                        <div class="min-h-14 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-black">{{ $dropTime }}</div>
                    </div>
                    <div class="col-span-2">
                        <p class="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">No. PO</p>
                        <div class="min-h-14 truncate rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-black">{{ $order['number'] }}</div>
                    </div>
                    <div>
                        <p class="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</p>
                        <div class="min-h-14 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-black">{{ $order['status'] }}</div>
                    </div>
                    <div>
                        <p class="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Daftar Supplier</p>
                        <div class="flex min-h-14 flex-wrap gap-1 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-[10px] font-black uppercase text-blue-600">
                            @foreach ($suppliers as $supplier)
                                <span class="rounded border border-blue-100 bg-white px-2 py-1">{{ $supplier }}</span>
                            @endforeach
                        </div>
                    </div>
                </section>

                <section class="mt-10 overflow-hidden border border-slate-200">
                    <table class="w-full table-fixed">
                        <thead class="bg-slate-950 text-white">
                            <tr>
                                <th class="w-12 px-3 py-4 text-left text-[10px] font-black uppercase tracking-[0.18em]">No</th>
                                <th class="px-3 py-4 text-left text-[10px] font-black uppercase tracking-[0.18em]">Nama Barang</th>
                                <th class="w-20 px-3 py-4 text-center text-[10px] font-black uppercase tracking-[0.18em]">Qty</th>
                                <th class="w-24 px-3 py-4 text-center text-[10px] font-black uppercase tracking-[0.18em]">Satuan</th>
                                <th class="w-40 px-3 py-4 text-left text-[10px] font-black uppercase tracking-[0.18em]">Supplier</th>
                                <th class="w-36 px-3 py-4 text-right text-[10px] font-black uppercase tracking-[0.18em]">Request / Grade</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-200">
                            @foreach ($order['items'] as $item)
                                <tr>
                                    <td class="px-3 py-5 text-center text-sm">{{ $loop->iteration }}</td>
                                    <td class="px-3 py-5 text-sm font-black uppercase">
                                        {{ $item['name'] }}
                                        @if (! empty($item['request']))
                                            <p class="mt-1 text-xs font-medium italic text-slate-500">{{ $item['request'] }}</p>
                                        @endif
                                    </td>
                                    <td class="px-3 py-5 text-center text-sm font-black">{{ $item['qty'] }}</td>
                                    <td class="px-3 py-5 text-center text-sm uppercase">{{ $item['unit'] }}</td>
                                    <td class="px-3 py-5 text-xs font-black uppercase text-blue-600">{{ $item['supplier'] }}</td>
                                    <td class="px-3 py-5 text-right">
                                        <span class="rounded bg-emerald-50 px-2 py-1 text-[10px] font-black uppercase text-emerald-600">Grade: {{ $item['grade'] }}</span>
                                    </td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </section>

                <section class="mt-16 grid grid-cols-2 gap-10 text-center">
                    <div>
                        <p class="mb-16 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Dibuat Oleh,</p>
                        <div class="border-t border-slate-900 pt-4 text-sm font-black">SPPG (ADMIN)</div>
                    </div>
                    <div>
                        <p class="mb-16 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Menyetujui,</p>
                        <div class="border-t border-slate-900 pt-4 text-sm font-black">(....................)</div>
                    </div>
                </section>

                <footer class="mt-24 border-t border-slate-200 pt-6 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Dokumen ini dihasilkan secara otomatis melalui sistem manajemen PO CV. SPPG
                </footer>
            </article>
        </main>
    </body>
</html>
