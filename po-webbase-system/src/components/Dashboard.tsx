import React, { useMemo } from 'react';
import { PurchaseOrder, POStatus } from '../types';
import { TrendingUp, Clock, Package, CheckCircle2, ShoppingCart, Truck, FileText, AlertCircle, Banknote, History, ArrowRight } from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  orders: PurchaseOrder[];
  userRole: 'ADMIN' | 'SPPG';
}

export default function Dashboard({ orders, userRole }: DashboardProps) {
  const stats = useMemo(() => {
    let totalBelanja = 0;
    let estimasiBelumTagih = 0;
    
    let totalInvoiceTerbayar = 0;
    let totalInvoiceBelumBayar = 0;
    
    let totalPiutangCair = 0;
    let totalPiutangBerjalan = 0;

    orders.forEach(po => {
      // Calculate totals
      (po.items || []).forEach(item => {
        const itemTotal = (item.qty || 0) * (item.harga || 0);
        totalBelanja += itemTotal;
        if (!item.invoiced) {
          estimasiBelumTagih += itemTotal;
        }
      });

      // Calculate invoice totals
      (po.invoices || []).forEach(inv => {
        if (inv.status === 'PAID') {
          totalInvoiceTerbayar += inv.totalAmount;
        } else {
          totalInvoiceBelumBayar += inv.totalAmount;
        }
      });
      
      // Calculate piutang
      (po.piutang || []).forEach(p => {
        if (p.status === 'PAID') {
          totalPiutangCair += p.totalAmount;
        } else {
          totalPiutangBerjalan += p.totalAmount;
        }
      });
    });

    return {
      total: orders.length,
      pending: orders.filter(o => o.status === POStatus.VALID).length,
      processing: orders.filter(o => o.status === POStatus.PROCESSING).length,
      completed: orders.filter(o => o.status === POStatus.COMPLETED).length,
      invoiced: orders.filter(o => o.status === POStatus.INVOICED).length,
      cancelled: orders.filter(o => o.status === POStatus.CANCELLED).length,
      totalBelanja,
      estimasiBelumTagih,
      totalInvoiceTerbayar,
      totalInvoiceBelumBayar,
      totalPiutangCair,
      totalPiutangBerjalan,
      totalUnpaid: totalInvoiceBelumBayar + totalPiutangBerjalan,
      totalPaid: totalInvoiceTerbayar + totalPiutangCair
    };
  }, [orders]);

  const chartData = [
    { name: 'Valid', value: stats.pending, color: '#f97316' },
    { name: 'Proses', value: stats.processing, color: '#3b82f6' },
    { name: 'Selesai', value: stats.completed, color: '#10b981' },
    { name: 'Tertagih', value: stats.invoiced, color: '#6366f1' },
  ];

  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  return (
    <div className="space-y-8 pb-10">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Ringkasan Operasional</h2>
          <p className="text-sm text-slate-500 font-medium tracking-tight">
            {orders.length === 0 
              ? `Selamat datang, ${userRole === 'SPPG' ? 'Anda belum memiliki pesanan aktif.' : 'Belum ada data pesanan dalam sistem.'}`
              : 'Pantau status pengadaan dan finansial secara real-time.'}
          </p>
        </div>
        
        {stats.total > 0 && (
          <div className="flex bg-white rounded-2xl border border-slate-200 shadow-sm p-1">
             <div className="px-4 py-2 border-r border-slate-100 flex flex-col justify-center">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total PO</span>
                <span className="text-sm font-black text-slate-900">{stats.total} Dokumen</span>
             </div>
             <div className="px-4 py-2 border-r border-slate-100 flex flex-col justify-center">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Menunggu (Valid)</span>
                <span className="text-sm font-black text-amber-600">{stats.pending} Dokumen</span>
             </div>
             <div className="px-4 py-2 flex flex-col justify-center">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Selesai/Invoice</span>
                <span className="text-sm font-black text-emerald-600">{stats.completed + stats.invoiced} Dokumen</span>
             </div>
          </div>
        )}
      </div>

      {orders.length === 0 && userRole === 'SPPG' && (
        <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-600/20">
           <h3 className="text-xl font-black mb-2">Mulai Pengadaan Pertama Anda</h3>
           <p className="text-blue-100 text-sm font-medium mb-6 max-w-xl">
             Klik tab "Pesanan Pembelian (PO)" di menu samping, kemudian tekan tombol "PO Baru" untuk membuat daftar belanja unit. 
             Admin akan segera memproses dan membagi pesanan ke supplier terkait.
           </p>
           <div className="flex gap-4">
              <div className="px-4 py-2 bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10">Langkah 1: Buat PO</div>
              <div className="px-4 py-2 bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10">Langkah 2: Pantau SJ</div>
              <div className="px-4 py-2 bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10">Langkah 3: Cek Invoice</div>
           </div>
        </div>
      )}

      {/* Financial Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Belanja */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
           <div>
              <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center mb-4">
                 <ShoppingCart className="w-5 h-5" />
              </div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Nilai Pembelanjaan</h3>
           </div>
           <div>
              <p className="text-2xl font-black text-slate-900 tracking-tighter">{formatCurrency(stats.totalBelanja)}</p>
           </div>
        </div>

        {/* Belum Tagih */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
           <div>
              <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center mb-4">
                 <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Estimasi Belum Tagih</h3>
           </div>
           <div>
              <p className="text-2xl font-black text-slate-900 tracking-tighter">{formatCurrency(stats.estimasiBelumTagih)}</p>
           </div>
        </div>

        {/* Belum Dibayar (Invoice + Piutang) */}
        <div className="bg-rose-600 text-white rounded-3xl p-6 shadow-xl shadow-rose-600/20 flex flex-col justify-between relative overflow-hidden">
           <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
           <div className="relative z-10">
              <div className="w-10 h-10 bg-white/20 text-white rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm">
                 <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="text-[10px] font-black text-rose-200 uppercase tracking-widest mb-1">Total Belum Dibayar</h3>
           </div>
           <div className="relative z-10">
              <p className="text-2xl font-black text-white tracking-tighter mb-2">{formatCurrency(stats.totalUnpaid)}</p>
              <div className="flex gap-3 text-[9px] font-bold uppercase tracking-widest text-rose-200">
                <span>Invoice: {formatCurrency(stats.totalInvoiceBelumBayar)}</span>
                <span>•</span>
                <span>Piutang: {formatCurrency(stats.totalPiutangBerjalan)}</span>
              </div>
           </div>
        </div>

        {/* Sudah Cair (Invoice + Piutang) */}
        <div className="bg-emerald-600 text-white rounded-3xl p-6 shadow-xl shadow-emerald-600/20 flex flex-col justify-between relative overflow-hidden">
           <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
           <div className="relative z-10">
              <div className="w-10 h-10 bg-white/20 text-white rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm">
                 <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-[10px] font-black text-emerald-200 uppercase tracking-widest mb-1">Total Cair (Lunas)</h3>
           </div>
           <div className="relative z-10">
              <p className="text-2xl font-black text-white tracking-tighter mb-2">{formatCurrency(stats.totalPaid)}</p>
              <div className="flex gap-3 text-[9px] font-bold uppercase tracking-widest text-emerald-200">
                <span>Invoice: {formatCurrency(stats.totalInvoiceTerbayar)}</span>
                <span>•</span>
                <span>Piutang: {formatCurrency(stats.totalPiutangCair)}</span>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Chart Section */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Status Dokumen PO</h3>
            <div className="flex gap-4">
               {chartData.map(d => (
                 <div key={d.name} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{d.name}</span>
                 </div>
               ))}
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 'bold' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-4 flex flex-col gap-6">
           <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex-1">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Aktivitas Terakhir</h3>
              <div className="space-y-6">
                 {recentOrders.length > 0 ? recentOrders.map((order, idx) => (
                   <div key={order.id} className="flex gap-4 group">
                      <div className="relative">
                        <div className={cn(
                          "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 shadow-sm",
                          order.status === POStatus.VALID ? "bg-orange-50 text-orange-600" :
                          order.status === POStatus.PROCESSING ? "bg-blue-50 text-blue-600" :
                          order.status === POStatus.COMPLETED ? "bg-emerald-50 text-emerald-600" :
                          "bg-indigo-50 text-indigo-600"
                        )}>
                           <FileText className="w-5 h-5" />
                        </div>
                        {idx !== recentOrders.length - 1 && (
                          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-slate-100" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-black text-slate-900 truncate">{order.no_po || 'Menunggu Validasi'}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">{order.sppg} • {new Date(order.createdAt).toLocaleDateString('id-ID')}</p>
                        <div className="mt-2 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full inline-block border border-slate-100 bg-slate-50 text-slate-500">
                          {order.status}
                        </div>
                      </div>
                   </div>
                 )) : (
                   <div className="py-10 text-center">
                     <AlertCircle className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Belum ada pesanan</p>
                   </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

