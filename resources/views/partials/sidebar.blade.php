@php
    $menu = [
        ['label' => 'Dashboard', 'route' => 'dashboard', 'initial' => 'D'],
        ['label' => 'Pesanan Pembelian (PO)', 'route' => 'purchase-orders.index', 'initial' => 'PO'],
        ['label' => 'Surat Jalan', 'route' => 'surat-jalan.index', 'initial' => 'SJ'],
        ['label' => 'Invoice', 'route' => 'invoices.index', 'initial' => 'INV'],
        ['label' => 'Master Stok', 'route' => 'master-stok.index', 'initial' => 'MS'],
    ];
@endphp

<aside class="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
    <div class="p-6">
        <a href="{{ route('dashboard') }}" class="mb-8 flex items-center gap-2">
            <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-black text-white">P</span>
            <span class="text-xl font-black tracking-tight text-slate-900">ProcureX</span>
        </a>

        <nav class="space-y-1">
            @foreach ($menu as $item)
                @php($active = request()->routeIs($item['route']) || request()->routeIs(str_replace('.index', '.*', $item['route'])))
                <a href="{{ route($item['route']) }}" class="{{ $active ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800' }} flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-bold transition">
                    <span class="{{ $active ? 'bg-blue-100' : 'bg-slate-100' }} flex shrink-0 h-7 w-8 items-center justify-center rounded-md text-[10px] font-black">{{ $item['initial'] }}</span>
                    <span class="truncate">{{ $item['label'] }}</span>
                </a>
            @endforeach
        </nav>
    </div>

    <div class="mt-auto space-y-3 border-t border-slate-100 p-4">
        <div class="flex items-center gap-3 px-2">
            <div class="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-xs font-black text-blue-700">
                {{ strtoupper(substr($currentUser['name'], 0, 2)) }}
            </div>
            <div class="min-w-0 flex-1">
                <p class="truncate text-[11px] font-black tracking-tight text-slate-900">{{ $currentUser['name'] }}</p>
                <p class="text-[9px] font-bold uppercase tracking-widest text-slate-400">{{ $currentUser['role'] === 'ADMIN' ? 'System Manager' : 'ID: '.$currentUser['id'] }}</p>
            </div>
        </div>

        <form method="POST" action="{{ route('logout') }}">
            @csrf
            <button type="submit" class="w-full rounded-lg border border-transparent px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 transition hover:border-rose-100 hover:bg-rose-50 hover:text-rose-600">
                Keluar Sistem
            </button>
        </form>
    </div>
</aside>
