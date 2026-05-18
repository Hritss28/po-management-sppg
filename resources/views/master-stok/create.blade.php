@extends('layouts.app', ['title' => 'Tambah Master Stok'])

@section('content')
    <section class="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="mb-5 text-sm font-black uppercase tracking-widest text-slate-900">Form Barang Baru</h2>
        @include('master-stok.partials.form-fields', ['item' => ['name' => '', 'unit' => 'kg', 'category' => '', 'status' => 'Aktif']])
    </section>
@endsection
