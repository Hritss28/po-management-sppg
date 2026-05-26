@extends('layouts.app', ['title' => 'Rekap PO'])

@section('content')
    <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/45 p-3 backdrop-blur-sm sm:p-6">
        <form method="POST" action="{{ route('rekap-po.update', $date) }}" class="mx-auto my-0 max-w-[1300px] overflow-hidden rounded-xl bg-slate-50 shadow-2xl sm:rounded-2xl">
            @csrf
            @method('PATCH')
            <header class="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
                <div class="flex min-w-0 items-center gap-3">
                    @include('partials.app-logo', ['class' => 'h-9 w-9'])
                    <div class="min-w-0">
                        <h1 class="min-w-0 text-base font-black tracking-tight text-slate-950 sm:text-lg">Edit Rekap PO</h1>
                        <p class="text-[10px] font-bold text-slate-400">Tanggal Drop: {{ date('d F Y', strtotime($date)) }} · {{ count($orders) }} PO</p>
                    </div>
                </div>
                <div class="flex items-center gap-4">
                    <a href="{{ route('rekap-po.index') }}" class="text-sm font-bold text-slate-500 hover:text-slate-700">Batal</a>
                    <button type="submit" class="rounded-lg bg-blue-600 px-5 py-2 text-sm font-bold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700">Simpan</button>
                </div>
            </header>

            @include('rekap-po.partials.form-fields', ['orders' => $orders, 'date' => $date])

            <footer class="flex flex-col items-center justify-between gap-1 border-t border-slate-200 bg-white px-4 py-2.5 text-center text-[10px] font-bold uppercase tracking-wide text-slate-400 sm:flex-row sm:px-6">
                <span>Operator: {{ $currentUser['name'] }} / {{ now()->format('Y-m-d') }}</span>
                @include('partials.copyright')
                <span>{{ collect($orders)->sum(fn ($o) => count($o['items'])) }} Item dari {{ count($orders) }} PO</span>
            </footer>
        </form>
    </div>
@endsection
