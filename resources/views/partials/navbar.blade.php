<header class="flex min-h-16 shrink-0 flex-col gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6 lg:h-16 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-0">
    <div class="flex min-w-0 items-center gap-4">
        <h1 class="truncate text-lg font-black tracking-tight text-slate-900">{{ $title }}</h1>
        <span class="hidden h-4 w-px bg-slate-200 sm:block"></span>
        <span class="w-fit rounded border border-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-blue-600">Live View</span>
    </div>

    <div class="flex items-center gap-2">
        @unless (request()->routeIs('dashboard'))
            <a href="{{ route('purchase-orders.create') }}" class="rounded-lg bg-blue-600 px-4 py-2 text-xs font-black text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700">
                PO Baru
            </a>
        @endunless

        @if (($currentUser['role'] ?? null) === 'ADMIN' && ! request()->routeIs('dashboard'))
            <button type="button" class="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50">
                Ekspor
            </button>
        @endif
    </div>
</header>
