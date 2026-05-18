@extends('layouts.app', ['title' => 'Pesanan Pembelian'])

@section('content')
    <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/45 p-4 backdrop-blur-sm">
        <form method="POST" action="{{ route('purchase-orders.update', $order['id']) }}" class="mx-auto min-h-[calc(100vh-2rem)] max-w-[1440px] overflow-hidden rounded-3xl bg-slate-100 shadow-2xl">
            @csrf
            @method('PATCH')
            <header class="flex items-center justify-between border-b border-slate-200 bg-white px-10 py-5">
                <div class="flex items-center gap-4">
                    <span class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-lg font-black text-white">P</span>
                    <h1 class="text-2xl font-black tracking-tight text-slate-950">Edit PO</h1>
                </div>
                <div class="flex items-center gap-8">
                    <a href="{{ route('purchase-orders.index') }}" class="text-sm font-black text-slate-700">Batal</a>
                    <button type="submit" class="rounded-lg bg-blue-600 px-8 py-3 text-base font-black text-white shadow-lg shadow-blue-600/25">Simpan PO</button>
                </div>
            </header>

            @include('purchase-orders.partials.form-fields', ['order' => $order])

            <footer class="sticky bottom-0 flex items-center justify-between border-t border-slate-200 bg-white px-10 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                <span>Operator: {{ $currentUser['name'] }} / {{ now()->format('Y-m-d') }}</span>
                <span>Terminal: #X-882 &nbsp;&nbsp;&nbsp; Items Loaded: {{ count($order['items']) }}</span>
            </footer>
        </form>
    </div>
@endsection
