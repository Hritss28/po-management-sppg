@extends('layouts.app', ['title' => 'Invoice'])

@section('content')
    <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <h2 class="text-lg font-black text-slate-900">Pilih invoice dari daftar untuk membuka preview.</h2>
        <a href="{{ route('invoices.index') }}" class="mt-5 inline-flex rounded-lg bg-blue-600 px-5 py-3 text-sm font-black text-white">Kembali ke Invoice</a>
    </section>
@endsection
