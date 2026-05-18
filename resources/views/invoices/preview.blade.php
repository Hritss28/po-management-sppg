<!DOCTYPE html>
<html lang="id">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Invoice Preview - {{ $invoice['number'] }}</title>
        @vite(['resources/css/app.css', 'resources/js/app.js'])
        <style>
            @page {
                size: A4;
                margin: 12mm;
            }
        </style>
    </head>
    <body class="bg-slate-100 font-sans text-slate-900 antialiased print:bg-white">
        @php
            $total = $items->sum(fn ($item) => $item['qty'] * $item['price']);
            $theme = $supplier['theme'];
            $isPaid = $invoice['status'] === 'PAID';
        @endphp

        <header class="print:hidden sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-8 py-4 shadow-sm">
            <div class="flex items-center gap-5">
                <a href="{{ route('invoices.index', ['tab' => 'history']) }}" class="text-3xl leading-none text-slate-500 hover:text-slate-900">&times;</a>
                <h1 class="text-xl font-black tracking-tight text-slate-900">Invoice Preview</h1>
            </div>
            <div class="flex items-center gap-3">
                <button type="button" onclick="window.print()" class="rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm">Print</button>
                <button type="button" onclick="window.print()" class="rounded-lg bg-red-600 px-5 py-3 text-sm font-black text-white shadow-sm shadow-red-600/20">Download PDF</button>
            </div>
        </header>

        <main class="mx-auto max-w-[800px] px-4 py-9 print:max-w-none print:p-0">
            <article class="bg-white p-12 shadow-2xl shadow-slate-300/60 print:p-0 print:shadow-none">
                <section class="flex items-start justify-between gap-8">
                    <div>
                        <img src="{{ asset($supplier['logo']) }}" alt="{{ $supplier['name'] }}" class="mb-6 h-16 w-16 object-contain">
                        <h2 class="text-2xl font-black uppercase tracking-tight text-slate-950">{{ $supplier['name'] }}</h2>
                        <p class="mt-2 text-xs font-black uppercase tracking-[0.16em] text-slate-400">Distribusi tepat. Pangan berkualitas.</p>
                        <p class="mt-2 text-sm font-medium text-slate-500">{{ $supplier['address'] }}</p>
                    </div>
                    <div class="text-right">
                        <p class="font-serif text-5xl font-black italic tracking-tight text-slate-950">INVOICE</p>
                        <span class="mt-6 inline-flex rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-wider text-white" style="background-color: {{ $isPaid ? '#10b981' : $theme }}">
                            {{ $isPaid ? 'Lunas' : 'Belum Bayar' }}
                        </span>
                        <p class="mt-4 text-sm font-black uppercase tracking-wider text-slate-950">{{ $invoice['number'] }}</p>
                    </div>
                </section>

                <div class="mt-9 border-t-2" style="border-color: {{ $theme }}"></div>

                <section class="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
                    <div class="rounded-lg border border-slate-200 bg-slate-50 p-6" style="border-left: 4px solid {{ $theme }}">
                        <p class="mb-5 text-xs font-black uppercase tracking-[0.18em]" style="color: {{ $theme }}">Invoice To</p>
                        <p class="text-lg font-black uppercase text-slate-900">{{ $order['sppg'] }}</p>
                        <p class="mt-2 text-sm font-medium text-slate-500">Surabaya</p>
                        <p class="mt-1 text-sm font-medium text-slate-500">08922222</p>
                    </div>
                    <div class="space-y-4 text-sm">
                        <div class="flex justify-between border-b border-slate-200 pb-3">
                            <span class="text-slate-500">Invoice No</span>
                            <span class="font-black text-slate-950">{{ $invoice['number'] }}</span>
                        </div>
                        <div class="flex justify-between border-b border-slate-200 pb-3">
                            <span class="text-slate-500">Transaction</span>
                            <span class="text-right font-black" style="color: {{ $theme }}">Tagihan Pengadaan Barang<br><span class="text-xs text-slate-500">(PO: {{ $order['number'] }})</span></span>
                        </div>
                        <div class="flex justify-between border-b border-slate-200 pb-3">
                            <span class="text-slate-500">Date</span>
                            <span class="font-black text-slate-950">{{ date('n/j/Y', strtotime($invoice['date'])) }}</span>
                        </div>
                    </div>
                </section>

                <section class="mt-8 overflow-hidden rounded-lg border border-slate-200">
                    <table class="w-full table-fixed">
                        <thead class="text-white" style="background-color: {{ $theme }}">
                            <tr>
                                <th class="w-14 px-4 py-4 text-left text-[10px] font-black uppercase tracking-wider">No</th>
                                <th class="px-4 py-4 text-left text-[10px] font-black uppercase tracking-wider">Description</th>
                                <th class="w-20 px-4 py-4 text-center text-[10px] font-black uppercase tracking-wider">Unit</th>
                                <th class="w-20 px-4 py-4 text-center text-[10px] font-black uppercase tracking-wider">Qty</th>
                                <th class="w-28 px-4 py-4 text-right text-[10px] font-black uppercase tracking-wider">Price</th>
                                <th class="w-32 px-4 py-4 text-right text-[10px] font-black uppercase tracking-wider">Total</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-200 bg-slate-50">
                            @foreach ($items as $item)
                                <tr>
                                    <td class="px-4 py-4 text-center text-sm text-slate-500">{{ $loop->iteration }}</td>
                                    <td class="px-4 py-4 text-sm font-black text-slate-950">
                                        {{ $item['name'] }}
                                        <p class="mt-1 text-[10px] font-black uppercase text-slate-400">PO Ref: {{ $order['number'] }}</p>
                                    </td>
                                    <td class="px-4 py-4 text-center text-sm text-slate-600">{{ $item['unit'] }}</td>
                                    <td class="px-4 py-4 text-center text-sm font-black">{{ $item['qty'] }}</td>
                                    <td class="px-4 py-4 text-right text-sm text-slate-600">Rp {{ number_format($item['price'], 0, ',', '.') }}</td>
                                    <td class="px-4 py-4 text-right text-sm font-black text-slate-950">Rp {{ number_format($item['qty'] * $item['price'], 0, ',', '.') }}</td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </section>

                <section class="ml-auto mt-8 max-w-sm space-y-5">
                    <div class="flex justify-between text-lg">
                        <span class="text-slate-700">Sub Total</span>
                        <span class="font-black">Rp {{ number_format($total, 0, ',', '.') }}</span>
                    </div>
                    <div class="flex items-center justify-between rounded-lg px-5 py-4 text-white" style="background-color: {{ $theme }}">
                        <span class="text-xs font-black uppercase tracking-[0.18em]">Total Amount</span>
                        <span class="text-2xl font-black">Rp {{ number_format($total, 0, ',', '.') }}</span>
                    </div>
                    <p class="text-right text-xs font-bold italic" style="color: {{ $theme }}">* Harga tidak menggunakan PPN</p>
                </section>

                <section class="mt-10 rounded-xl border border-slate-200 bg-slate-50 p-7">
                    <h3 class="text-lg font-black text-slate-900">Payment Information</h3>
                    <div class="mt-6 max-w-xs overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div class="border-b border-slate-200 p-4">
                            <p class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Account Holder</p>
                            <p class="mt-1 text-sm font-black">ARIF RAKHMAN HADI</p>
                        </div>
                        <div class="p-4">
                            <p class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Mandiri</p>
                            <p class="mt-2 text-xl font-black tracking-wider" style="color: {{ $theme }}">1420015180150</p>
                        </div>
                    </div>
                </section>

                <section class="mt-14 flex justify-end">
                    <div class="relative w-72 text-center">
                        <p class="mb-16 italic text-slate-500">Managing Director</p>
                        <img src="{{ asset($supplier['stamp']) }}" alt="Stamp {{ $supplier['name'] }}" class="absolute left-1/2 top-8 h-36 w-36 -translate-x-1/2 object-contain opacity-80">
                        <div class="border-t border-slate-950 pt-3 text-sm font-black">ARIF RAKHMAN HADI</div>
                    </div>
                </section>

                <footer class="mt-16 border-t border-slate-200 pt-6 text-center">
                    <p class="text-sm text-slate-500">{{ $supplier['address'] }}</p>
                    <p class="mt-3 text-xs font-black uppercase tracking-[0.18em]" style="color: {{ $theme }}">{{ $supplier['name'] }}</p>
                </footer>
            </article>
        </main>
    </body>
</html>
