@extends('layouts.app', ['title' => 'Detail Master Stok'])

@section('content')
    <section class="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="mb-6 flex items-start justify-between gap-4">
            <div>
                <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Barang</p>
                <h2 class="mt-1 text-xl font-black text-slate-900">{{ $item['name'] }}</h2>
            </div>
            <span class="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-600">{{ $item['status'] }}</span>
        </div>
        <dl class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div class="rounded-xl bg-slate-50 p-4"><dt class="text-[10px] font-black uppercase tracking-widest text-slate-400">Satuan</dt><dd class="mt-1 text-sm font-black text-slate-900">{{ $item['unit'] }}</dd></div>
            <div class="rounded-xl bg-slate-50 p-4"><dt class="text-[10px] font-black uppercase tracking-widest text-slate-400">Kategori</dt><dd class="mt-1 text-sm font-black text-slate-900">{{ $item['category'] }}</dd></div>
        </dl>
        @if ($currentUser['role'] === 'ADMIN')
            <a href="{{ route('master-stok.edit', $item['id']) }}" class="mt-6 inline-flex rounded-lg bg-slate-900 px-4 py-3 text-xs font-black uppercase tracking-wider text-white">Edit Barang</a>
        @endif
    </section>
@endsection
