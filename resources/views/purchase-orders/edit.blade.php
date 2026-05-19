@extends('layouts.app', ['title' => 'Pesanan Pembelian'])

@section('content')
    <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/45 p-2 backdrop-blur-sm sm:p-4">
        <form method="POST" action="{{ route('purchase-orders.update', $order['id']) }}" class="mx-auto min-h-[calc(100vh-1rem)] max-w-[1440px] overflow-hidden rounded-2xl bg-slate-100 shadow-2xl sm:min-h-[calc(100vh-2rem)] sm:rounded-3xl">
            @csrf
            @method('PATCH')
            <header class="flex flex-col gap-4 border-b border-slate-200 bg-white px-4 py-4 sm:px-10 sm:py-5 lg:flex-row lg:items-center lg:justify-between">
                <div class="flex min-w-0 items-center gap-3 sm:gap-4">
                    <span class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-lg font-black text-white">P</span>
                    <h1 class="min-w-0 text-lg font-black tracking-tight text-slate-950 sm:text-2xl">Edit PO</h1>
                </div>
                <div class="flex items-center justify-end gap-4 sm:gap-8">
                    <a href="{{ route('purchase-orders.index') }}" class="text-sm font-black text-slate-700">Batal</a>
                    <button type="submit" class="rounded-lg bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-600/25 sm:px-8 sm:text-base">Simpan PO</button>
                </div>
            </header>

            @include('purchase-orders.partials.form-fields', ['order' => $order])

            <footer class="sticky bottom-0 flex flex-col gap-2 border-t border-slate-200 bg-white px-4 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500 sm:px-10 md:flex-row md:items-center md:justify-between md:text-[11px]">
                <span>Operator: {{ $currentUser['name'] }} / {{ now()->format('Y-m-d') }}</span>
                <span>Terminal: #X-882 &nbsp;&nbsp;&nbsp; Items Loaded: {{ count($order['items']) }}</span>
            </footer>
        </form>
    </div>
@endsection
