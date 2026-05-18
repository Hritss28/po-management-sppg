import React, { useState } from 'react';
import { X, Package, Calendar, User, Truck, DollarSign, Info, Printer, ShieldCheck } from 'lucide-react';
import { PurchaseOrder, POStatus, SUPPLIERS, POItem } from '../types';
import { cn, formatCurrency } from '../lib/utils';
import { exportToPDF } from '../lib/pdf';

import POPreviewModal from './POPreviewModal';

interface POViewProps {
  po: PurchaseOrder;
  onClose: () => void;
  userRole?: 'ADMIN' | 'SPPG';
  onUpdateOrder?: (updatedPO: PurchaseOrder) => void;
}

const statusStyles = {
  [POStatus.VALID]: 'bg-orange-50 text-orange-600 border-orange-100',
  [POStatus.PROCESSING]: 'bg-blue-50 text-blue-600 border-blue-100',
  [POStatus.COMPLETED]: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  [POStatus.CANCELLED]: 'bg-slate-50 text-slate-400 border-slate-200',
  [POStatus.INVOICED]: 'bg-indigo-50 text-indigo-600 border-indigo-100',
};

export default function POView({ po, onClose, userRole, onUpdateOrder }: POViewProps) {
  const [localItems, setLocalItems] = useState(po.items || []);
  const [hasChanges, setHasChanges] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const totalAmount = (po.items || []).reduce((sum, item) => sum + ((item.qty || 0) * (item.harga || 0)), 0);

  const handlePrint = () => {
    setShowPreview(true);
  };

  const updateSupplier = (itemId: string, supplier: string) => {
    if (userRole !== 'ADMIN') return;
    const newItems = localItems.map(item => 
      item.id === itemId ? { ...item, supplier } : item
    );
    setLocalItems(newItems);
    setHasChanges(true);
  };

  const handleSaveChanges = () => {
    if (onUpdateOrder) {
      onUpdateOrder({
        ...po,
        items: localItems
      });
      setHasChanges(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-[#F1F5F9] w-full max-w-5xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">P</div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Detail Pesanan: {po.no_po || 'Menunggu Validasi'}</h1>
              <span className={cn(
                "text-[10px] font-extrabold px-2 py-0.5 rounded border uppercase tracking-widest",
                statusStyles[po.status]
              )}>
                {po.status}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {userRole !== 'ADMIN' && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-lg border border-slate-200 uppercase tracking-widest">
                <ShieldCheck className="w-3.5 h-3.5" />
                Mode Lihat Saja
              </div>
            )}
            {hasChanges && userRole === 'ADMIN' && (
              <button 
                onClick={handleSaveChanges}
                className="flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-all shadow-md active:scale-95"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Simpan Penugasan Supplier
              </button>
            )}
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-200 transition-all border border-slate-200"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak PDF
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Content */}
        <div id="po-detail-content" className="flex-1 overflow-y-auto p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Info Section */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Info className="w-3.5 h-3.5" />
                  Informasi PO
                </h3>
                <div className="space-y-3">
                  <InfoRow label="Dibuat Oleh" value={po.po_by} icon={<User className="w-3.5 h-3.5" />} />
                  <InfoRow label="Tanggal PO" value={new Date(po.tanggal_po).toLocaleDateString('id-ID', { dateStyle: 'long' })} icon={<Calendar className="w-3.5 h-3.5" />} />
                  <InfoRow label="No. PO" value={po.no_po || 'Akan Diterbitkan'} />
                </div>
              </div>

              {po.delivery ? (
                <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-100 shadow-sm">
                  <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Truck className="w-3.5 h-3.5" />
                    Informasi Surat Jalan (SJ)
                  </h3>
                  <div className="space-y-3">
                    <InfoRow label="No. SJ" value={po.delivery.suratJalanNo} />
                    <InfoRow label="Tanggal Kirim" value={new Date(po.delivery.deliveryDate).toLocaleDateString('id-ID', { dateStyle: 'long' })} />
                    <InfoRow label="Driver/Kurir" value={po.delivery.deliveredBy} />
                    {po.delivery.photoUrl && (
                      <div className="mt-4 pt-4 border-t border-emerald-100">
                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider block mb-2">Foto Bukti Drop</span>
                        <img src={po.delivery.photoUrl} alt="Bukti" className="w-full h-32 object-cover rounded-lg border border-emerald-200" />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Truck className="w-3.5 h-3.5" />
                    Informasi Logistik
                  </h3>
                  <div className="space-y-3">
                    <InfoRow label="No. SPPG" value={po.sppg || '-'} />
                    <InfoRow label="Jadwal Drop" value={`${po.droping_date || '-'} ${po.droping_time || ''}`} />
                  </div>
                </div>
              )}
            </div>

            {/* Summary Section */}
            {userRole === 'ADMIN' ? (
              <div className="bg-slate-900 rounded-xl p-8 text-white flex flex-col justify-center shadow-lg h-fit">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Total Invoice Keseluruhan</span>
                </div>
                <p className="text-3xl font-black tracking-tight">{formatCurrency(totalAmount)}</p>
                <div className="mt-6 pt-6 border-t border-slate-800 flex justify-between text-xs font-bold">
                  <span className="text-slate-400">JUMLAH BARANG</span>
                  <span>{(po.items || []).length} Jenis</span>
                </div>
              </div>
            ) : (
              <div className="bg-blue-600 rounded-xl p-8 text-white flex flex-col justify-center shadow-lg h-fit">
                <div className="flex items-center gap-2 text-blue-100 mb-2">
                  <Package className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Total Pesanan</span>
                </div>
                <p className="text-3xl font-black tracking-tight">{(po.items || []).length} <span className="text-lg font-bold">Jenis Barang</span></p>
                <div className="mt-6 pt-6 border-t border-blue-500 flex justify-between text-xs font-bold font-mono">
                  <span className="text-blue-100 uppercase tracking-widest">Status Validasi</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded italic">{po.status}</span>
                </div>
              </div>
            )}
          </div>

          {/* Items Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/30 flex items-center gap-2 text-blue-600">
              <ShieldCheck className="w-4 h-4" />
              <h3 className="text-xs font-black uppercase tracking-widest">Penugasan Supplier & Daftar Barang</h3>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  <th className="px-6 py-3">Barang & Grade</th>
                  <th className="px-6 py-3">Supplier</th>
                  <th className="px-6 py-3 text-center">Qty</th>
                  {userRole === 'ADMIN' && <th className="px-6 py-3">Harga</th>}
                  {userRole === 'ADMIN' && <th className="px-6 py-3 text-right">Subtotal</th>}
                  {po.delivery?.itemPhotos && <th className="px-6 py-3 text-right">Bukti Barang</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {localItems.map((item) => (
                  <tr key={item.id} className="group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{item.nama_barang}</span>
                        {item.request && (
                          <span className="text-[10px] text-orange-600 font-medium italic mt-0.5">Ket: {item.request}</span>
                        )}
                        <span className={cn(
                          "text-[9px] font-black uppercase mt-1 px-1.5 py-0.5 rounded w-fit",
                          item.grade === 'A' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-50 text-slate-500 border border-slate-200"
                        )}>{item.grade}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {userRole === 'ADMIN' ? (
                        <select 
                          value={item.supplier || ''}
                          onChange={(e) => updateSupplier(item.id, e.target.value)}
                          className={cn(
                            "w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold outline-none appearance-none transition-all",
                            !item.supplier ? "text-rose-500 border-rose-100 bg-rose-50/30" : "text-blue-600 border-blue-100 bg-blue-50/30"
                          )}
                        >
                          <option value="">Pilih Supplier...</option>
                          {SUPPLIERS.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      ) : (
                        <div className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-tight",
                          item.supplier ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-400 font-bold"
                        )}>
                          {item.supplier || 'BELUM DITUGASKAN'}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-bold text-slate-700">{item.qty}</span>
                      <span className="text-[10px] text-slate-400 ml-1 uppercase">{item.satuan}</span>
                    </td>
                    {userRole === 'ADMIN' && (
                      <td className="px-6 py-4 text-xs text-slate-500">{formatCurrency(item.harga)}</td>
                    )}
                    {userRole === 'ADMIN' && (
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-slate-900">{formatCurrency(item.qty * item.harga)}</span>
                      </td>
                    )}
                    {po.delivery?.itemPhotos && (
                      <td className="px-6 py-4 text-right">
                        {po.delivery.itemPhotos[item.id] ? (
                          <img 
                            src={po.delivery.itemPhotos[item.id]} 
                            alt="Bukti Barang" 
                            className="w-10 h-10 object-cover rounded border border-slate-200 ml-auto"
                          />
                        ) : (
                          <span className="text-[10px] text-slate-300 italic font-medium">Tidak ada foto</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {userRole === 'ADMIN' && hasChanges && (
          <div className="h-14 bg-emerald-50 border-t border-emerald-100 px-8 flex items-center justify-between animate-pulse">
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Terdapat perubahan penugasan supplier yang belum disimpan!</span>
            <button 
              onClick={handleSaveChanges}
              className="text-[10px] font-black text-emerald-700 underline uppercase tracking-widest"
            >
              Simpan Sekarang
            </button>
          </div>
        )}
      </div>
      {showPreview && (
        <POPreviewModal po={po} onClose={() => setShowPreview(false)} />
      )}
    </div>
  );
}

function InfoRow({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
        {icon}
        {label}
      </div>
      <div className="font-bold text-slate-700">{value}</div>
    </div>
  );
}
