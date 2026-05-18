import React, { useState } from 'react';
import { Package, Truck, Camera, CheckCircle2, ChevronRight, Search, FileText } from 'lucide-react';
import { PurchaseOrder, POStatus } from '../types';
import { cn } from '../lib/utils';
import SuratJalanForm from './SuratJalanForm';

interface SuratJalanListProps {
  orders: PurchaseOrder[];
  onUpdateOrder: (order: PurchaseOrder) => void;
  userRole: 'ADMIN' | 'SPPG';
}

export default function SuratJalanList({ orders, onUpdateOrder, userRole }: SuratJalanListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);

  const filteredOrders = [...orders].filter(po => {
    const q = (searchQuery || '').toLowerCase();
    return (
      (po.no_po || '').toLowerCase().includes(q) ||
      (po.po_by || '').toLowerCase().includes(q) ||
      (po.delivery?.suratJalanNo || '').toLowerCase().includes(q) ||
      (po.items || []).some(item => 
        (item.nama_barang || '').toLowerCase().includes(q) || 
        (item.supplier || '').toLowerCase().includes(q)
      )
    );
  }).reverse();

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Manajemen Surat Jalan</h2>
          <p className="text-xs text-slate-500 font-medium tracking-tight">Kelola pengiriman barang dan bukti drop barang.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari No PO / No SJ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-200">
              <th className="w-12 px-2 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-center">No</th>
              <th className="px-4 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-left">Identitas PO</th>
              <th className="px-4 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-left">Barang & QTY</th>
              <th className="px-4 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-left">Info Pengiriman</th>
              <th className="px-4 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-center">Bukti Drop</th>
              <th className="px-4 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-right">Opsi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <Package className="w-12 h-12 text-slate-200 mb-4" />
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Tidak ada data Surat Jalan / PO</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredOrders.map((po, index) => {
                const totalItems = (po.items || []).length;
                const totalQty = (po.items || []).reduce((sum, item) => sum + (item.qty || 0), 0);
                const firstItem = po.items && po.items.length > 0 ? po.items[0] : null;
                const unit = firstItem?.satuan || 'Unit';

                return (
                  <tr key={po.id} className="group hover:bg-slate-50/50 transition-all">
                    <td className="px-2 py-4 text-center align-top pt-5">
                      <span className="text-[10px] font-bold text-slate-400">{po.no || index + 1}</span>
                    </td>
                    <td className="px-4 py-4 text-left whitespace-nowrap align-top pt-5">
                      <div className="flex flex-col">
                        <span className={cn("text-xs font-black tracking-tight", po.no_po ? "text-slate-900" : "text-slate-500 italic")}>
                          {po.no_po || 'Menunggu Validasi'}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-1 py-0.5 rounded border border-blue-100">
                            {po.po_by}
                          </span>
                          <span className="text-[9px] font-bold text-slate-400">
                            {new Date(po.tanggal_po).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' })}
                          </span>
                        </div>
                        <span className="text-[10px] font-black text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 w-fit mt-1">
                          {po.sppg}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-left align-top">
                      <div className="bg-slate-50 rounded border border-slate-100 overflow-hidden w-full max-w-[300px] xl:max-w-[400px]">
                        <table className="w-full text-left border-collapse">
                          <thead className="bg-slate-100/50">
                            <tr>
                              <th className="px-2 py-1.5 text-[9px] font-extrabold text-slate-500 uppercase tracking-widest">Nama Barang</th>
                              <th className="px-2 py-1.5 text-[9px] font-extrabold text-slate-500 uppercase tracking-widest">Supplier</th>
                              <th className="px-2 py-1.5 text-[9px] font-extrabold text-slate-500 uppercase tracking-widest text-right">Qty</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {(po.items || []).map((item, i) => (
                              <tr key={i} className="hover:bg-slate-100/50 transition-colors">
                                <td className="px-2 py-1.5 text-[10px] font-bold text-slate-700">{item.nama_barang}</td>
                                <td className="px-2 py-1.5 text-[9px] font-bold text-blue-600 uppercase">
                                  <span className="bg-blue-50 px-1 py-0.5 rounded border border-blue-100">{item.supplier || '-'}</span>
                                </td>
                                <td className="px-2 py-1.5 text-[10px] font-black text-slate-900 text-right whitespace-nowrap">
                                  {item.qty} <span className="text-[9px] font-bold text-slate-500 uppercase">{item.satuan}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-left whitespace-nowrap align-top pt-5">
                      {po.delivery ? (
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-slate-900 uppercase">{po.delivery.suratJalanNo}</span>
                          <span className="text-[10px] font-bold text-emerald-600 mt-0.5">Tgl: {new Date(po.delivery.deliveryDate).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col text-slate-400 italic">
                          <span className="text-[10px] font-bold flex items-center gap-1.5"><Truck className="w-3 h-3" /> Menunggu SJ</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center whitespace-nowrap align-top pt-5">
                      {po.delivery ? (
                        <div className="flex flex-col items-center gap-1">
                          <div className={cn(
                            "flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold border cursor-default",
                            po.delivery.photoUrl ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-orange-50 text-orange-600 border-orange-100"
                          )}>
                            <Camera className="w-3 h-3" />
                            {po.delivery.photoUrl ? 'Ada Bukti' : 'Tanpa Bukti'}
                          </div>
                          {po.delivery.itemPhotos && Object.keys(po.delivery.itemPhotos).length > 0 && (
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-0.5">
                              +{Object.keys(po.delivery.itemPhotos).length} Item Foto
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-300">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right whitespace-nowrap align-top pt-4">
                      {(!po.delivery && userRole !== 'ADMIN') ? (
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                          Tunggu SJ
                        </span>
                      ) : (
                        <button 
                          onClick={() => setSelectedPO(po)}
                          className={cn(
                            "flex items-center justify-end gap-1 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ml-auto",
                            po.delivery 
                              ? "bg-white text-slate-600 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200" 
                              : "bg-blue-600 text-white hover:bg-blue-700"
                          )}
                        >
                          {po.delivery ? 'Lihat / Edit' : 'Proses Kirim'}
                          <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {selectedPO && (
        <SuratJalanForm 
          po={selectedPO} 
          onClose={() => setSelectedPO(null)}
          onSave={(delivery, updatedItems) => {
            onUpdateOrder({
              ...selectedPO,
              delivery,
              items: updatedItems || selectedPO.items,
              status: POStatus.COMPLETED // Marking as completed so it can be invoiced
            });
            setSelectedPO(null);
          }}
          userRole={userRole}
        />
      )}
    </div>
  );
}
