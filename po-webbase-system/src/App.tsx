/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, FileText, Download, Filter, TrendingUp, Package, CheckCircle2, Clock, Box, Users, LayoutDashboard, LogOut, Database, Banknote } from 'lucide-react';
import { PurchaseOrder, POStatus } from './types';
import POForm from './components/POForm';
import POTable from './components/POTable';
import POView from './components/POView';
import SuratJalanList from './components/SuratJalanList';
import InvoiceList from './components/InvoiceList';
import PiutangList from './components/PiutangList';
import Dashboard from './components/Dashboard';
import MasterStock from './components/MasterStock';
import Login from './components/Login';
import { formatCurrency, cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';

type User = {
  id: string;
  name: string;
  role: 'ADMIN' | 'SPPG';
}

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [orders, setOrders] = useState<PurchaseOrder[]>(() => {
    const saved = localStorage.getItem('purchase_orders');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        // ignore
      }
    }
    
    // Seed data if empty
    return [
      {
        id: 'seed-1',
        no: 1,
        no_po: 'PO/2026/001',
        tanggal_po: '2026-05-10',
        po_by: 'Ahmad Lutfi',
        sppg: 'BALONGSARI',
        status: POStatus.INVOICED,
        createdAt: '2026-05-10T10:00:00Z',
        items: [
          {
            id: 'item-1',
            nama_barang: 'Ayam Dada Fillet',
            qty: 10,
            satuan: 'KG',
            grade: 'A',
            harga: 45000,
            supplier: 'VIALA PANGAN',
            invoiced: true
          },
          {
            id: 'item-2',
            nama_barang: 'Tepung Roti',
            qty: 5,
            satuan: 'KG',
            grade: 'B',
            harga: 15000,
            supplier: 'NUTRIVA FOODS',
            invoiced: true
          }
        ],
        invoice: {
          invoiceNo: 'INV/VPA/721551',
          invoiceDate: '2026-05-10',
          totalAmount: 525000,
          status: 'PAID'
        }
      },
      {
        id: 'seed-2',
        no: 2,
        no_po: 'PO/2026/002',
        tanggal_po: '2026-05-12',
        po_by: 'Ahmad Lutfi',
        sppg: 'BALONGSARI',
        status: POStatus.PROCESSING,
        createdAt: '2026-05-12T08:30:00Z',
        items: [
          {
            id: 'item-3',
            nama_barang: 'Bawang Merah',
            qty: 2,
            satuan: 'KG',
            grade: 'A',
            harga: 32000,
            supplier: 'Dunia Bumbu Mojokerto'
          }
        ]
      }
    ];
  });
  const [activeTab, setActiveTab] = useState<'PO' | 'SJ' | 'INV' | 'DASH' | 'STOCK' | 'PIUTANG'>('DASH');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPO, setEditingPO] = useState<PurchaseOrder | null>(null);
  const [viewedPO, setViewedPO] = useState<PurchaseOrder | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<POStatus | 'ALL'>('ALL');

  useEffect(() => {
    localStorage.setItem('purchase_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('auth_user');
    }
  }, [user]);

  const handleLogin = (role: 'ADMIN' | 'SPPG', id: string, name: string) => {
    setUser({ role, id, name });
  };

  const handleLogout = () => {
    setUser(null);
  };

  // Filter orders based on user role
  const visibleOrders = useMemo(() => {
    if (!user) return [];
    if (user.role === 'ADMIN') return orders;
    return orders.filter(po => po.sppg === user.id);
  }, [orders, user]);

  const stats = useMemo(() => {
    const totalValue = visibleOrders.reduce((sum, po) => {
      const poTotal = (po.items || []).reduce((pSum, item) => pSum + ((item.qty || 0) * (item.harga || 0)), 0);
      return sum + poTotal;
    }, 0);
    const activeOrders = visibleOrders.filter(po => po.status === POStatus.PROCESSING).length;
    const completedOrders = visibleOrders.filter(po => po.status === POStatus.COMPLETED).length;
    const pendingOrders = visibleOrders.filter(po => po.status === POStatus.VALID).length;

    return { totalValue, activeOrders, completedOrders, pendingOrders };
  }, [visibleOrders]);

  const filteredOrders = visibleOrders
    .filter(po => {
      const searchStr = (searchQuery || '').toLowerCase();
      const matchesSearch = 
        (po.no_po || '').toLowerCase().includes(searchStr) ||
        (po.po_by || '').toLowerCase().includes(searchStr) ||
        (po.items || []).some(item => (item.nama_barang || '').toLowerCase().includes(searchStr));
      
      const matchesFilter = filterStatus === 'ALL' || po.status === filterStatus;
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleAddPO = (newPO: Omit<PurchaseOrder, 'id' | 'createdAt'>) => {
    const po: PurchaseOrder = {
      ...newPO,
      sppg: newPO.sppg.trim().toUpperCase(),
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      no: orders.length + 1
    };

    if (user?.role === 'ADMIN' && shouldSplitPO(po)) {
      const splitPOs = splitPO(po);
      setOrders(prev => [...splitPOs, ...prev]);
    } else {
      setOrders(prev => [po, ...prev]);
    }
  };

  const handleDeletePO = (id: string) => {
    if (user?.role !== 'ADMIN') return;
    setOrders(prev => prev.filter(po => po.id !== id));
  };

  const handleUpdateStatus = (id: string, status: POStatus) => {
    if (user?.role !== 'ADMIN') return;
    setOrders(prev => prev.map(po => po.id === id ? { ...po, status } : po));
  };

  const shouldSplitPO = (po: PurchaseOrder) => {
    const suppliers = new Set((po.items || []).map(item => item.supplier || 'UNASSIGNED'));
    suppliers.delete('UNASSIGNED');
    // Split if there's at least one supplier assigned, or if multiple are assigned
    // Actually, according to user logic: split if suppliers are assigned.
    return suppliers.size > 0;
  };

  const getSupplierAbbr = (name: string) => {
    if (!name || name === 'UNASSIGNED') return 'NA';
    // Special case for the example in prompt
    if (name.toLowerCase().includes('dunia bumbu mojokerto')) return 'DBM';
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return name.substring(0, 3).toUpperCase();
    return words.map(w => w[0]).join('').toUpperCase().substring(0, 5);
  };

  const formatDateCompact = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      return `${dd}${mm}${yyyy}`;
    } catch {
      return '00000000';
    }
  };

  const splitPO = (po: PurchaseOrder): PurchaseOrder[] => {
    const itemsBySupplier: Record<string, typeof po.items> = {};
    (po.items || []).forEach(item => {
      const supplier = item.supplier || 'UNASSIGNED';
      if (!itemsBySupplier[supplier]) itemsBySupplier[supplier] = [];
      itemsBySupplier[supplier].push(item);
    });

    const unassignedItems = itemsBySupplier['UNASSIGNED'] || [];
    const supplierEntries = Object.entries(itemsBySupplier).filter(([s]) => s !== 'UNASSIGNED');

    const result: PurchaseOrder[] = [];
    const poYear = new Date(po.tanggal_po).getFullYear();
    const compactDate = formatDateCompact(po.tanggal_po);
    
    // Base format without supplier: {NO}/PO/{DDMMYYYY}/{YEAR}
    const baseNoPO = po.no_po || `${po.no}/PO/${compactDate}/${poYear}`;

    // If there are unassigned items, they stay in a VALID PO
    if (unassignedItems.length > 0) {
      result.push({
        ...po,
        id: crypto.randomUUID(),
        items: unassignedItems,
        no_po: baseNoPO,
        status: POStatus.VALID
      });
    }

    // Create split POs for each supplier
    supplierEntries.forEach(([supplier, items]) => {
      const abbr = getSupplierAbbr(supplier);
      // Format: {NO}/PO/{DDMMYYYY}/{SUPPLIER_ABBR}/{YEAR}
      const supplierSpecificNoPO = `${po.no}/PO/${compactDate}/${abbr}/${poYear}`;
      
      result.push({
        ...po,
        id: crypto.randomUUID(),
        no_po: supplierSpecificNoPO,
        status: POStatus.PROCESSING,
        items: items,
        createdAt: new Date().toISOString()
      });
    });

    return result;
  };

  const handleUpdateOrder = (updatedPO: PurchaseOrder) => {
    if (user?.role !== 'ADMIN') return;
    if (updatedPO.status === POStatus.VALID && shouldSplitPO(updatedPO)) {
      const splitPOs = splitPO(updatedPO);
      setOrders(prev => {
        const filtered = prev.filter(po => po.id !== updatedPO.id);
        return [...splitPOs, ...filtered];
      });
      setViewedPO(null);
      return;
    }

    setOrders(prev => prev.map(po => po.id === updatedPO.id ? updatedPO : po));
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-[#F1F5F9] font-sans text-slate-800 overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">P</div>
            <span className="text-xl font-bold tracking-tight text-slate-900">ProcureX</span>
          </div>
          <nav className="space-y-1">
            <NavItem 
              icon={<LayoutDashboard className="w-5 h-5" />} 
              label="Dashboard" 
              active={activeTab === 'DASH'} 
              onClick={() => setActiveTab('DASH')}
            />
            <NavItem 
              icon={<FileText className="w-5 h-5" />} 
              label="Pesanan Pembelian (PO)" 
              active={activeTab === 'PO'} 
              onClick={() => setActiveTab('PO')}
            />
            <NavItem 
              icon={<Box className="w-5 h-5" />} 
              label="Surat Jalan" 
              active={activeTab === 'SJ'} 
              onClick={() => setActiveTab('SJ')}
            />
            <NavItem 
              icon={<Users className="w-5 h-5" />} 
              label="Invoice" 
              active={activeTab === 'INV'} 
              onClick={() => setActiveTab('INV')}
            />
            <NavItem 
              icon={<Banknote className="w-5 h-5" />} 
              label="Piutang SPPG" 
              active={activeTab === 'PIUTANG'} 
              onClick={() => setActiveTab('PIUTANG')}
            />
            <NavItem 
              icon={<Database className="w-5 h-5" />} 
              label="Master Stok" 
              active={activeTab === 'STOCK'} 
              onClick={() => setActiveTab('STOCK')}
            />
          </nav>
        </div>
        <div className="mt-auto border-t border-slate-100 p-4 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
              {(user.name || 'U').substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-black text-slate-900 truncate tracking-tight">{user.name}</p>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{user.role === 'ADMIN' ? 'System Manager' : `ID: ${user.id}`}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 text-[10px] font-black text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all rounded-lg uppercase tracking-widest border border-transparent hover:border-rose-100"
          >
            <LogOut className="w-3.5 h-3.5" />
            Keluar Sistem
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-slate-900">
              {activeTab === 'PO' ? 'Pesanan Pembelian' : 
               activeTab === 'SJ' ? 'Surat Jalan (Delivery)' : 
               activeTab === 'INV' ? 'Invoice' : 
               activeTab === 'PIUTANG' ? 'Piutang SPPG' :
               activeTab === 'STOCK' ? 'Master Stok' : 'Dashboard'}
            </h1>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex gap-2">
              <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded uppercase tracking-wider border border-blue-100">Live View</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200 rounded-lg transition-all">
              <Download className="w-4 h-4" />
              Ekspor
            </button>
            {activeTab === 'PO' && (
              <button 
                onClick={() => setIsFormOpen(true)}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-blue-700 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                PO Baru
              </button>
            )}
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {activeTab === 'DASH' ? (
              <Dashboard orders={visibleOrders} userRole={user.role} />
            ) : activeTab === 'SJ' ? (
              <SuratJalanList 
                orders={visibleOrders} 
                onUpdateOrder={handleUpdateOrder} 
                userRole={user.role}
              />
            ) : activeTab === 'INV' ? (
              <InvoiceList 
                orders={visibleOrders} 
                userRole={user.role}
                onUpdateOrder={handleUpdateOrder}
              />
            ) : activeTab === 'PIUTANG' ? (
              <PiutangList 
                orders={visibleOrders} 
                userRole={user.role}
                onUpdateOrder={handleUpdateOrder}
              />
            ) : activeTab === 'STOCK' ? (
              <MasterStock />
            ) : (
              <>
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard 
                    title="Total Nilai PO" 
                    value={formatCurrency(stats.totalValue)} 
                    icon={<TrendingUp className="w-5 h-5" />}
                    color="text-emerald-600"
                    bg="bg-emerald-500"
                  />
                  <StatCard 
                    title="PO Aktif" 
                    value={stats.activeOrders} 
                    icon={<Clock className="w-5 h-5" />}
                    color="text-blue-600"
                    bg="bg-blue-500"
                  />
                  <StatCard 
                    title="Valid" 
                    value={stats.pendingOrders} 
                    icon={<Package className="w-5 h-5" />}
                    color="text-orange-600"
                    bg="bg-orange-500"
                  />
                  <StatCard 
                    title="Selesai" 
                    value={stats.completedOrders} 
                    icon={<CheckCircle2 className="w-5 h-5" />}
                    color="text-indigo-600"
                    bg="bg-indigo-500"
                  />
                </div>

                {/* List Control Box */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col md:flex-row gap-4 items-center">
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Cari berdasarkan No PO, barang, atau nama pembuat..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-medium transition-all"
                    />
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative w-full md:w-44">
                      <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                      <select 
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as POStatus | 'ALL')}
                        className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs font-bold text-slate-600 appearance-none cursor-pointer uppercase"
                      >
                        <option value="ALL">SEMUA STATUS</option>
                        <option value={POStatus.VALID}>VALID</option>
                        <option value={POStatus.PROCESSING}>PROSES</option>
                        <option value={POStatus.COMPLETED}>SELESAI</option>
                        <option value={POStatus.CANCELLED}>DIBATALKAN</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* PO Table */}
                <POTable 
                  orders={filteredOrders} 
                  onDelete={handleDeletePO}
                  onUpdateStatus={handleUpdateStatus}
                  onView={(po) => setViewedPO(po)}
                  onEdit={(po) => {
                    setEditingPO(po);
                    setIsFormOpen(true);
                  }}
                  userRole={user.role}
                />
              </>
            )}
          </div>
        </div>

        {/* System Meta Footer */}
        <footer className="bg-slate-50 border-t border-slate-200 h-10 px-8 flex items-center justify-between shrink-0 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
          <div>Operator: {user.name} • {new Date().toISOString().split('T')[0]}</div>
          <div className="flex gap-6">
            <span>Terminal: #X-882</span>
            <span>Versi: 2.1.0-STABLE</span>
          </div>
        </footer>
      </main>

      {/* Form Dialog */}
      <AnimatePresence>
        {isFormOpen && (
          <POForm 
            user={user}
            isOpen={isFormOpen} 
            onClose={() => {
              setIsFormOpen(false);
              setEditingPO(null);
            }} 
            onAdd={handleAddPO}
            initialData={editingPO}
            onEdit={(updatedPO) => {
              handleUpdateOrder(updatedPO);
              setIsFormOpen(false);
              setEditingPO(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* View Dialog */}
      <AnimatePresence>
        {viewedPO && (
          <POView 
            po={viewedPO} 
            userRole={user.role}
            onUpdateOrder={handleUpdateOrder}
            onClose={() => setViewedPO(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer",
        active 
          ? "bg-blue-50 text-blue-700" 
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function StatCard({ title, value, icon, color, bg }: { title: string; value: string | number; icon: React.ReactNode; color: string; bg: string }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
      <div className={cn("absolute top-0 right-0 w-2 h-full opacity-10", bg)} />
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
          <p className="text-xl font-extrabold text-slate-900 tracking-tight">{value}</p>
        </div>
        <div className={cn("p-2.5 rounded-lg bg-slate-50 group-hover:scale-110 transition-transform", color)}>
          {icon}
        </div>
      </div>
    </div>
  );
}
