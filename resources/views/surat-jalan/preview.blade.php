<!DOCTYPE html>
<html lang="id">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Preview Surat Jalan - {{ $order['delivery']['number'] ?? $order['number'] }}</title>
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
            $delivery = $order['delivery'] ?? [];
            $sjNumber = $delivery['number'] ?? 'SJ/2026/508';
            $deliveryDate = $delivery['date'] ?? now()->format('Y-m-d');
            $driver = $delivery['driver'] ?? 'Nama Pengirim';
            $kepada = $delivery['kepada'] ?? str_replace('SPPG-', '', $order['sppg']);
            $kdSppg = $delivery['kd_sppg'] ?? $order['sppg_code'];
            $namaSppg = $delivery['nama_sppg'] ?? str_replace('SPPG-', '', $order['sppg']);
            $pjSppg = $delivery['pj_sppg'] ?? '-';
            $whatsapp = $delivery['whatsapp'] ?? '-';
            $notes = $delivery['notes'] ?? '-';
            $supplierText = collect($order['items'])->pluck('supplier')->unique()->implode(', ');
        @endphp

        <header class="print:hidden sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-8 py-4 shadow-sm">
            <div class="flex items-center gap-5">
                <a href="{{ route('surat-jalan.show', $order['id']) }}" class="text-3xl leading-none text-slate-500 hover:text-slate-900">&times;</a>
                <h1 class="text-xl font-black tracking-tight text-slate-900">Preview Surat Jalan</h1>
            </div>
            <div class="flex items-center gap-3">
                <button type="button" onclick="window.print()" class="rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm">Print</button>
                <button type="button" onclick="window.print()" class="rounded-lg bg-red-600 px-5 py-3 text-sm font-black text-white shadow-sm shadow-red-600/20">Download PDF</button>
            </div>
        </header>

        <main class="mx-auto max-w-[820px] px-4 py-9 print:max-w-none print:p-0">
            <article class="min-h-[1120px] bg-white p-11 shadow-2xl shadow-slate-300/60 print:min-h-0 print:p-0 print:shadow-none">
                <section class="flex items-start justify-between gap-8">
                    <div>
                        <p class="text-3xl font-black tracking-tight text-slate-950">SURAT JALAN</p>
                        <p class="mt-2 text-lg font-black uppercase tracking-[0.2em] text-slate-500">{{ $sjNumber }}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-2xl font-black text-blue-600">REKAP PENGIRIMAN</p>
                        <p class="mt-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400">Tgl: {{ $deliveryDate }}</p>
                    </div>
                </section>

                <div class="mt-8 border-t-2 border-slate-950"></div>

                <section class="mt-8 grid grid-cols-2 gap-x-12 gap-y-3 text-sm font-black">
                    <div class="grid grid-cols-[130px_1fr] gap-2">
                        <span class="text-xs uppercase tracking-[0.18em] text-slate-500">Kepada</span>
                        <span>: {{ $kepada }}</span>
                    </div>
                    <div class="grid grid-cols-[130px_1fr] gap-2">
                        <span class="text-xs uppercase tracking-[0.18em] text-slate-500">Input PO</span>
                        <span>: {{ $order['number'] }}</span>
                    </div>
                    <div class="grid grid-cols-[130px_1fr] gap-2">
                        <span class="text-xs uppercase tracking-[0.18em] text-slate-500">Data SPPG</span>
                        <span>: {{ $kdSppg }} - {{ $namaSppg }}</span>
                    </div>
                    <div class="grid grid-cols-[130px_1fr] gap-2">
                        <span class="text-xs uppercase tracking-[0.18em] text-slate-500">Kurir</span>
                        <span>: {{ $driver }}</span>
                    </div>
                    <div class="grid grid-cols-[130px_1fr] gap-2">
                        <span class="text-xs uppercase tracking-[0.18em] text-slate-500">P. Jawab</span>
                        <span>: {{ $pjSppg }}</span>
                    </div>
                    <div class="grid grid-cols-[130px_1fr] gap-2">
                        <span class="text-xs uppercase tracking-[0.18em] text-slate-500">Supplier</span>
                        <span>: {{ $supplierText }}</span>
                    </div>
                    <div class="grid grid-cols-[130px_1fr] gap-2">
                        <span class="text-xs uppercase tracking-[0.18em] text-slate-500">No. Tlp / WA</span>
                        <span>: {{ $whatsapp }}</span>
                    </div>
                    <div class="grid grid-cols-[130px_1fr] gap-2">
                        <span class="text-xs uppercase tracking-[0.18em] text-slate-500">Catatan</span>
                        <span>: {{ $notes }}</span>
                    </div>
                </section>

                <section class="mt-9 overflow-hidden border border-slate-200">
                    <table class="w-full table-fixed">
                        <thead class="bg-slate-950 text-white">
                            <tr>
                                <th class="px-3 py-4 text-left text-[10px] font-black uppercase tracking-[0.18em]">Nama Barang</th>
                                <th class="w-24 px-3 py-4 text-center text-[10px] font-black uppercase tracking-[0.18em]">Volume</th>
                                <th class="w-40 px-3 py-4 text-left text-[10px] font-black uppercase tracking-[0.18em]">Supplier</th>
                                <th class="w-36 px-3 py-4 text-left text-[10px] font-black uppercase tracking-[0.18em]">Keterangan</th>
                                <th class="w-36 px-3 py-4 text-center text-[10px] font-black uppercase tracking-[0.18em]">Foto</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-200">
                            @foreach ($order['items'] as $item)
                                <tr>
                                    <td class="px-3 py-5 text-sm font-black uppercase">{{ $item['name'] }}</td>
                                    <td class="px-3 py-5 text-center text-sm font-black">{{ $item['qty'] }} {{ strtoupper($item['unit']) }}</td>
                                    <td class="px-3 py-5 text-xs font-black uppercase text-blue-600">{{ $item['supplier'] }}</td>
                                    <td class="px-3 py-5 text-sm text-slate-600">{{ $item['request'] ?? '-' }}</td>
                                    <td class="px-3 py-5 text-center text-[10px] font-black uppercase text-slate-400">Foto Terlampir</td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </section>

                <section class="mt-16 grid grid-cols-3 gap-8 text-center">
                    <div>
                        <p class="mb-16 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Dibuat Oleh,</p>
                        <div class="border-t border-slate-900 pt-4 text-sm font-black">SPPG (ADMIN)</div>
                    </div>
                    <div>
                        <p class="mb-16 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Dikirim Oleh,</p>
                        <div class="border-t border-slate-900 pt-4 text-sm font-black">{{ $driver }}</div>
                    </div>
                    <div>
                        <p class="mb-16 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Diterima Oleh,</p>
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
