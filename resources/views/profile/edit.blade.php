@extends('layouts.app', ['title' => 'Profile Admin'])

@section('content')
    <section class="mx-auto max-w-3xl bg-slate-50 p-8">
        @if (session('success'))
            <div class="mb-6 rounded-xl border border-emerald-100 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-600">
                {{ session('success') }}
            </div>
        @endif

        @if ($errors->any())
            <div class="mb-6 rounded-xl border border-rose-100 bg-rose-50 px-5 py-4 text-sm font-bold text-rose-600">
                {{ $errors->first() }}
            </div>
        @endif

        <form method="POST" action="{{ route('profile.update') }}" class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md shadow-slate-200/70">
            @csrf
            @method('PATCH')

            <header class="border-b border-slate-100 px-8 py-6">
                <p class="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Pengaturan Akun</p>
                <h1 class="mt-2 text-2xl font-black tracking-tight text-slate-950">Profile Admin</h1>
            </header>

            <div class="space-y-6 p-8">
                <label class="block">
                    <span class="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-500">Username</span>
                    <input name="name" value="{{ old('name', $user->name) }}" class="h-12 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-black text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10">
                </label>

                <div class="rounded-xl border border-slate-200 bg-slate-50 p-5">
                    <p class="mb-5 text-xs font-black uppercase tracking-[0.18em] text-slate-500">Ubah Password</p>
                    <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <label class="block md:col-span-2">
                            <span class="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-500">Password Saat Ini</span>
                            <input name="password_current" type="password" autocomplete="current-password" class="h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10">
                        </label>
                        <label class="block">
                            <span class="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-500">Password Baru</span>
                            <input name="password" type="password" autocomplete="new-password" class="h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10">
                        </label>
                        <label class="block">
                            <span class="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-500">Konfirmasi Password Baru</span>
                            <input name="password_confirmation" type="password" autocomplete="new-password" class="h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10">
                        </label>
                    </div>
                </div>
            </div>

            <footer class="flex items-center justify-end gap-4 border-t border-slate-100 bg-slate-50 px-8 py-5">
                <a href="{{ route('dashboard') }}" class="text-sm font-black text-slate-600">Batal</a>
                <button type="submit" class="rounded-lg bg-blue-600 px-8 py-3 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">
                    Simpan Profile
                </button>
            </footer>
        </form>
    </section>
@endsection
