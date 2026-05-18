@php
    $styles = [
        'VALID' => 'border-orange-100 bg-orange-50 text-orange-600',
        'PROCESSING' => 'border-blue-100 bg-blue-50 text-blue-600',
        'COMPLETED' => 'border-emerald-100 bg-emerald-50 text-emerald-600',
        'INVOICED' => 'border-indigo-100 bg-indigo-50 text-indigo-600',
        'CANCELLED' => 'border-slate-200 bg-slate-50 text-slate-400',
        'PAID' => 'border-emerald-100 bg-emerald-50 text-emerald-600',
        'UNPAID' => 'border-rose-100 bg-rose-50 text-rose-600',
    ];
@endphp

<span class="{{ $styles[$status] ?? 'border-slate-200 bg-slate-50 text-slate-500' }} inline-flex rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-widest">
    {{ $status }}
</span>
