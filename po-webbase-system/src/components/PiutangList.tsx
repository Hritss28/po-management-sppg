import React, { useState, useMemo } from 'react';
import { PurchaseOrder, PiutangInfo, SupplierType, InvoiceInfo } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { AlertCircle, CheckCircle2, History, Printer } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import CairkanPiutangModal from './CairkanPiutangModal';
import InvoicePreviewModal from './InvoicePreviewModal';
import { X, Save } from 'lucide-react';

interface PiutangListProps {
  orders: PurchaseOrder[];
  userRole: 'ADMIN' | 'SPPG';
  onUpdateOrder: (updatedOrder: PurchaseOrder) => void;
}

export default function PiutangList({ orders, userRole, onUpdateOrder }: PiutangListProps) {
  const [activeTab, setActiveTab] = useState<'PENDING' | 'HISTORY'>('PENDING');
  const [editingPiutang, setEditingPiutang] = useState<{ po: PurchaseOrder, p: PiutangInfo } | null>(null);
  const [cairkanPiutang, setCairkanPiutang] = useState<{ po: PurchaseOrder, p: PiutangInfo } | null>(null);
  const [printingOrder, setPrintingOrder] = useState<PurchaseOrder | null>(null);
  const [printingInvoice, setPrintingInvoice] = useState<InvoiceInfo | null>(null);

  const piutangList = useMemo(() => orders.flatMap(po => (po.piutang || []).map(p => ({ po, p }))), [orders]);
  
  const pendingPiutang = piutangList.filter(({ p }) => p.status === 'PENDING').sort((a, b) => new Date(b.p.createdAt).getTime() - new Date(a.p.createdAt).getTime());
  const historyPiutang = piutangList.filter(({ p }) => p.status === 'PAID').sort((a, b) => new Date(b.p.createdAt).getTime() - new Date(a.p.createdAt).getTime());

  const piutangStats = useMemo(() => {
    let totalPending = 0;
    let totalPaid = 0;
    piutangList.forEach(({ p }) => {
      if (p.status === 'PENDING') totalPending += p.totalAmount;
      else if (p.status === 'PAID') totalPaid += p.totalAmount;
    });
    return { totalPending, totalPaid, count: pendingPiutang.length, historyCount: historyPiutang.length };
  }, [piutangList, pendingPiutang, historyPiutang]);

  const renderPiutangItems = (list: {po: PurchaseOrder, p: PiutangInfo}[]) => {
    if (list.length === 0) {
      return (
         <div className="py-20 text-center bg-white m-4 border-dashed border-2 border-slate-200 rounded-2xl">
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">
              Tidak ada data piutang.
            </p>
         </div>
      );
    }
    
    return (
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/50 border-b border-slate-200">
            <th className="w-12 px-2 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-center">No</th>
            <th className="px-4 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-left">Info Barang</th>
            <th className="px-4 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-left">Referensi</th>
            <th className="px-4 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-right">Nilai Piutang</th>
            <th className="px-4 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-center">Status</th>
            <th className="px-4 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {list.map(({ po, p }, index) => (
            <tr key={p.id} className="group hover:bg-slate-50/50 transition-all">
              <td className="px-2 py-4 text-center align-top pt-5">
                <span className="text-[10px] font-bold text-slate-400">{index + 1}</span>
              </td>
              <td className="px-4 py-4 text-left whitespace-nowrap align-top pt-5">
                <div className="flex flex-col">
                  <span className="text-xs font-black text-slate-900">{p.nama_barang}</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] font-bold text-slate-500">{p.qty} {p.satuan}</span>
                    <span className="w-1 h-1 bg-slate-200 rounded-full" />
                    <span className="text-[10px] font-bold text-slate-500">{formatCurrency(p.harga)} / {p.satuan}</span>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 text-left whitespace-nowrap align-top pt-4">
                <div className="flex flex-col gap-1">
                  <span className={cn(
                    "w-fit text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-widest",
                    p.status === 'PAID' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-orange-50 text-orange-600 border-orange-100"
                  )}>
                    {p.kd_piutang}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Ref PO: <span className="text-slate-600">{po.no_po}</span></span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Inv Asli: <span className="text-slate-600">{p.originalInvoiceNo}</span></span>
                </div>
              </td>
              <td className="px-4 py-4 text-right whitespace-nowrap align-top pt-5 text-xs font-black text-slate-900">
                {formatCurrency(p.totalAmount)}
              </td>
              <td className="px-4 py-4 text-center whitespace-nowrap align-top pt-5">
                <div className="flex flex-col items-center gap-1">
                  <div className={cn(
                    "text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-widest",
                    p.status === 'PAID' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-orange-50 text-orange-600 border-orange-100"
                  )}>
                    {p.status === 'PAID' ? 'LUNAS' : 'PIUTANG SPPG'}
                  </div>
                  <span className="text-[8px] font-bold text-slate-400 italic">Sejak: {new Date(p.createdAt).toLocaleDateString()}</span>
                </div>
              </td>
              <td className="px-4 py-4 text-right whitespace-nowrap align-top pt-4">
                <div className="flex items-center justify-end gap-1.5 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => {
                      const syntheticOrder: PurchaseOrder = {
                        ...po,
                        no_po: p.no_po || po.no_po,
                        items: [
                          {
                            id: p.id,
                            nama_barang: p.nama_barang,
                            qty: p.qty,
                            grade: 'A',
                            harga: p.harga,
                            satuan: p.satuan,
                            supplier: p.supplier
                          }
                        ]
                      };
                      
                      const syntheticInvoice: InvoiceInfo = {
                        invoiceNo: p.kd_piutang,
                        invoiceDate: new Date(p.createdAt).toLocaleDateString('id-ID'),
                        totalAmount: p.totalAmount,
                        status: p.status === 'PAID' ? 'PAID' : 'UNPAID',
                        supplier: p.supplier,
                        kepada: po.delivery?.kepada || po.sppg,
                        no_wa: po.delivery?.no_wa
                      };
                      
                      setPrintingOrder(syntheticOrder);
                      setPrintingInvoice(syntheticInvoice);
                    }}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                    title="Preview Piutang"
                  >
                    <Printer className="w-4 h-4" />
                  </button>

                  {userRole === 'ADMIN' && p.status === 'PENDING' && (
                    <>
                      <button 
                        onClick={() => setCairkanPiutang({ po, p })}
                        className="bg-emerald-50 text-emerald-600 text-[9px] font-black px-2.5 py-1.5 rounded-lg hover:bg-emerald-100 transition-all uppercase tracking-widest border border-emerald-200"
                      >
                        Cairkan
                      </button>
                      <button 
                        onClick={() => setEditingPiutang({ po, p })}
                        className="bg-blue-50 text-blue-600 text-[9px] font-black px-2.5 py-1.5 rounded-lg hover:bg-blue-100 transition-all uppercase tracking-widest border border-blue-200"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => {
                          if (window.confirm("Yakin ingin menghapus piutang ini?")) {
                            const updatedPiutang = po.piutang?.filter(piu => piu.id !== p.id);
                            onUpdateOrder({ ...po, piutang: updatedPiutang });
                          }
                        }}
                        className="bg-rose-50 text-rose-600 p-1.5 rounded-lg hover:bg-rose-100 transition-all border border-rose-200"
                        title="Hapus Piutang"
                      >
                         <X className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('PENDING')}
          className={cn(
            "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
            activeTab === 'PENDING' ? "bg-white text-orange-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Piutang Berjalan
        </button>
        <button
          onClick={() => setActiveTab('HISTORY')}
          className={cn(
            "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
            activeTab === 'HISTORY' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Riwayat Piutang
        </button>
      </div>

      <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100 flex items-center gap-4">
        <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center shrink-0">
          {activeTab === 'PENDING' ? <AlertCircle className="w-6 h-6" /> : <History className="w-6 h-6" />}
        </div>
        <div>
          <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">
            {activeTab === 'PENDING' ? 'Daftar Piutang Berjalan' : 'Riwayat Pencairan Piutang'}
          </h4>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            {activeTab === 'PENDING' 
              ? 'Daftar barang yang belum tertagih sepenuhnya. kd_piutang otomatis dibuat sebagai turunan dari invoice asli.'
              : 'Daftar piutang yang sudah diselesaikan (dicairkan).'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Piutang Berjalan</p>
          <p className="text-xl font-black text-orange-600">{formatCurrency(piutangStats.totalPending)}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Piutang Cair</p>
          <p className="text-xl font-black text-emerald-600">{formatCurrency(piutangStats.totalPaid)}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
            {activeTab === 'PENDING' ? 'Total Entri Berjalan' : 'Total Entri Selesai'}
          </p>
          <p className="text-xl font-black text-slate-900">
            {activeTab === 'PENDING' ? piutangStats.count : piutangStats.historyCount} 
            <span className="text-sm text-slate-500 font-bold"> Item</span>
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-sm"
        >
          {renderPiutangItems(activeTab === 'PENDING' ? pendingPiutang : historyPiutang)}
        </motion.div>
      </AnimatePresence>

      {editingPiutang && (
        <EditPiutangModal 
          piutang={editingPiutang.p}
          onClose={() => setEditingPiutang(null)}
          onSave={(updatedP) => {
            const po = editingPiutang.po;
            const updatedPiutang = po.piutang?.map(piu => 
              piu.id === updatedP.id ? updatedP : piu
            );
            onUpdateOrder({ ...po, piutang: updatedPiutang });
            setEditingPiutang(null);
          }}
        />
      )}

      {cairkanPiutang && (
        <CairkanPiutangModal
          po={cairkanPiutang.po}
          piutang={cairkanPiutang.p}
          onClose={() => setCairkanPiutang(null)}
          onSave={(updatedPo) => {
            onUpdateOrder(updatedPo);
            setCairkanPiutang(null);
          }}
        />
      )}

      {printingOrder && printingInvoice && (
        <InvoicePreviewModal
          order={printingOrder}
          invoice={printingInvoice}
          onClose={() => {
            setPrintingOrder(null);
            setPrintingInvoice(null);
          }}
        />
      )}
    </div>
  );
}

function EditPiutangModal({ piutang, onClose, onSave }: { piutang: PiutangInfo; onClose: () => void; onSave: (p: PiutangInfo) => void }) {
  const [formData, setFormData] = useState({ ...piutang });

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        <header className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Edit Data Piutang</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-all">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </header>
        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Nama Barang</label>
            <input 
              type="text"
              value={formData.nama_barang}
              onChange={(e) => setFormData(p => ({ ...p, nama_barang: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Qty Piutang</label>
              <input 
                type="number"
                value={formData.qty}
                onChange={(e) => {
                  const q = parseFloat(e.target.value) || 0;
                  setFormData(p => ({ ...p, qty: q, totalAmount: q * p.harga }));
                }}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Harga Satuan</label>
              <input 
                type="number"
                value={formData.harga}
                onChange={(e) => {
                  const h = parseFloat(e.target.value) || 0;
                  setFormData(p => ({ ...p, harga: h, totalAmount: h * p.qty }));
                }}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold outline-none"
              />
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Tagihan Sisa</span>
            <span className="text-sm font-black text-orange-600">{formatCurrency(formData.totalAmount)}</span>
          </div>
        </div>
        <div className="p-6 pt-0">
          <button 
            onClick={() => onSave(formData)}
            className="w-full py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-3.5 h-3.5" />
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
}
