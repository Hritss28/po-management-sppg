@php
    $menu = [
        ['label' => 'Dashboard', 'route' => 'dashboard', 'icon' => 'dashboard'],
        ['label' => 'Pesanan Pembelian (PO)', 'route' => 'purchase-orders.index', 'icon' => 'file-text'],
        ['label' => 'Rekap PO', 'route' => 'rekap-po.index', 'icon' => 'trending-up'],
        ['label' => 'Surat Jalan', 'route' => 'surat-jalan.index', 'icon' => 'box'],
        ['label' => 'Invoice', 'route' => 'invoices.index', 'icon' => 'users'],
        ['label' => 'Master Stok', 'route' => 'master-stok.index', 'icon' => 'database'],
    ];

    if (($currentUser['role'] ?? null) === 'ADMIN') {
        $menu[] = ['label' => 'Master SPPG', 'route' => 'master-sppg.index', 'icon' => 'building'];
        $menu[] = ['label' => 'Profile', 'route' => 'profile.edit', 'icon' => 'user'];
    }
@endphp

<div id="mobile-sidebar-backdrop" class="fixed inset-0 z-40 hidden bg-slate-950/45 backdrop-blur-[2px] lg:hidden" data-mobile-sidebar-close></div>

<aside id="mobile-sidebar" class="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[86vw] -translate-x-full flex-col border-r border-slate-200 bg-white shadow-2xl shadow-slate-950/20 transition-transform duration-200 lg:hidden" aria-label="Menu mobile">
    @include('partials.sidebar-menu', ['menu' => $menu, 'currentUser' => $currentUser])
</aside>

<aside class="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
    @include('partials.sidebar-menu', ['menu' => $menu, 'currentUser' => $currentUser])
</aside>
