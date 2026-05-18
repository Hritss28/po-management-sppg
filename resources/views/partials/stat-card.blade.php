<div class="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <div class="absolute right-0 top-0 h-full w-1.5 {{ $accent ?? 'bg-blue-500' }} opacity-20"></div>
    <div class="flex items-start justify-between gap-4">
        <div class="min-w-0">
            <p class="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">{{ $label }}</p>
            <p class="truncate text-xl font-black tracking-tight text-slate-900">{{ $value }}</p>
        </div>
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-xs font-black {{ $text ?? 'text-blue-600' }}">
            {{ $initial ?? 'PO' }}
        </div>
    </div>
</div>
