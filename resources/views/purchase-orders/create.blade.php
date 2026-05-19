@extends('layouts.app', ['title' => 'Pesanan Pembelian'])

@section('content')
    <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/45 p-3 backdrop-blur-sm sm:p-6">
        <form method="POST" action="{{ route('purchase-orders.store') }}" class="mx-auto my-0 max-w-[1280px] overflow-hidden rounded-xl bg-slate-50 shadow-2xl sm:rounded-2xl">
            @csrf
            <header class="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
                <div class="flex min-w-0 items-center gap-3">
                    <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-black text-white">P</span>
                    <h1 class="min-w-0 text-base font-black tracking-tight text-slate-950 sm:text-lg">Input PO Baru</h1>
                </div>
                <div class="flex items-center gap-4">
                    <a href="{{ route('purchase-orders.index') }}" class="text-sm font-bold text-slate-500 hover:text-slate-700">Batal</a>
                    <button type="submit" class="rounded-lg bg-blue-600 px-5 py-2 text-sm font-bold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700">Simpan PO</button>
                </div>
            </header>

            @include('purchase-orders.partials.form-fields')

            <footer class="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-2.5 text-[10px] font-bold uppercase tracking-wide text-slate-400 sm:px-6">
                <span>Operator: {{ $currentUser['name'] }} / {{ now()->format('Y-m-d') }}</span>
                <span>Items: <span id="footer-items-count">2</span></span>
            </footer>
        </form>
    </div>
@endsection
