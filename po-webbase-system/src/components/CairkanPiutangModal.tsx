import React, { useState } from 'react';
import { PurchaseOrder, PiutangInfo } from '../types';
import { X, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

interface CairkanPiutangModalProps {
  po: PurchaseOrder;
  piutang: PiutangInfo;
  onClose: () => void;
  onSave: (po: PurchaseOrder) => void;
}

export default function CairkanPiutangModal({ po, piutang, onClose, onSave }: CairkanPiutangModalProps) {
  const [qtyDicairkan, setQtyDicairkan] = useState<number>(piutang.qty);

  const handleSave = () => {
    let updatedPiutangList = [...(po.piutang || [])];
    
    if (qtyDicairkan >= piutang.qty) {
      // Cair penuh
      updatedPiutangList = updatedPiutangList.map(p => 
        p.id === piutang.id ? { ...p, status: 'PAID' } : p
      );
    } else {
      // Cair sebagian
      // 1. Update existing piutang to the portion that is paid
      const paidPiutang = {
        ...piutang,
        qty: qtyDicairkan,
        totalAmount: qtyDicairkan * piutang.harga,
        status: 'PAID' as const
      };
      
      updatedPiutangList = updatedPiutangList.map(p => 
        p.id === piutang.id ? paidPiutang : p
      );
      
      // 2. Create new pending piutang for the remainder
      const remainingQty = piutang.qty - qtyDicairkan;
      
      // Hitung urutan kd_piutang baru
      // Coba parse base dari kd_piutang yang ada
      let baseString = piutang.kd_piutang;
      let nextNum = 1;
      
      const match = piutang.kd_piutang.match(/-(\d+)$/);
      if (match) {
        nextNum = parseInt(match[1]) + 1;
        baseString = piutang.kd_piutang.replace(/-(\d+)$/, '');
      } else {
        baseString = piutang.originalInvoiceNo;
        nextNum = updatedPiutangList.filter(p => p.originalInvoiceNo === piutang.originalInvoiceNo).length + 1;
      }
      
      const newKdPiutang = `${baseString}-${nextNum}`;
      
      const newPendingPiutang: PiutangInfo = {
        ...piutang,
        id: crypto.randomUUID(),
        kd_piutang: newKdPiutang,
        qty: remainingQty,
        totalAmount: remainingQty * piutang.harga,
        status: 'PENDING',
        createdAt: new Date().toISOString()
      };
      
      updatedPiutangList.push(newPendingPiutang);
    }
    
    onSave({ ...po, piutang: updatedPiutangList });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        <header className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Pencairan Piutang</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-all">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </header>
        <div className="p-6 space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Informasi Piutang</p>
            <div className="font-bold text-sm text-slate-900">{piutang.nama_barang}</div>
            <div className="text-xs font-semibold text-slate-500 mt-1">
              Kode: <span className="font-black text-slate-700">{piutang.kd_piutang}</span>
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">
              Volume: <span className="font-black text-slate-700">{piutang.qty} {piutang.satuan}</span> 
              &nbsp;&times;&nbsp; {formatCurrency(piutang.harga)}
            </div>
            <div className="text-sm font-black text-orange-600 mt-2">
              Total: {formatCurrency(piutang.totalAmount)}
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Volume/Qty Dicairkan</label>
            <input 
              type="number"
              value={qtyDicairkan}
              onChange={(e) => {
                const val = parseFloat(e.target.value) || 0;
                setQtyDicairkan(Math.min(val, piutang.qty));
              }}
              min="0"
              max={piutang.qty}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold outline-none"
            />
            <p className="text-[10px] text-slate-400 font-bold ml-1">
              Jika nilai kurang dari total volume ({piutang.qty}), sisa volume akan otomatis dibuatkan kode piutang baru (Klaim Sebagian).
            </p>
          </div>
          
          <div className="pt-4 border-t border-slate-100">
             <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nominal Cair (Estimasi)</p>
                <div className="text-xl font-black text-emerald-600">
                   {formatCurrency(qtyDicairkan * piutang.harga)}
                </div>
             </div>
          </div>
        </div>
        <footer className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700"
          >
            Batal
          </button>
          <button 
            onClick={handleSave}
            disabled={qtyDicairkan <= 0}
            className="px-6 py-2 bg-emerald-600 text-white text-xs font-black uppercase tracking-widest rounded-lg hover:bg-emerald-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="w-4 h-4" />
            Konfirmasi Cairkan
          </button>
        </footer>
      </div>
    </div>
  );
}
