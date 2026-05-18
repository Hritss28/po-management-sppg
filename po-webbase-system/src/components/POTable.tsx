import React from 'react';
import { PurchaseOrder, POStatus } from '../types';
import { cn, formatCurrency } from '../lib/utils';
import { MoreVertical, Trash2, FileText, ChevronRight, Pencil } from 'lucide-react';

interface POTableProps {
  orders: PurchaseOrder[];
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: POStatus) => void;
  onView: (po: PurchaseOrder) => void;
  onEdit?: (po: PurchaseOrder) => void;
  userRole: 'ADMIN' | 'SPPG';
}

const statusStyles = {
  [POStatus.VALID]: 'bg-orange-50 text-orange-600 border-orange-100',
  [POStatus.PROCESSING]: 'bg-blue-50 text-blue-600 border-blue-100',
  [POStatus.COMPLETED]: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  [POStatus.CANCELLED]: 'bg-slate-50 text-slate-400 border-slate-200',
  [POStatus.INVOICED]: 'bg-indigo-50 text-indigo-600 border-indigo-100',
};

export default function POTable({ orders, onDelete, onUpdateStatus, onView, onEdit, userRole }: POTableProps) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-4 bg-slate-50 rounded-2xl mb-4 border border-slate-100">
          <FileText className="w-10 h-10 text-slate-300" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Antrean Kosong</h3>
        <p className="text-slate-500 text-sm font-medium mt-1">Mulai dengan menambahkan pesanan pembelian baru di atas.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-200">
              <th className="w-12 px-2 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-center">No</th>
              <th className="px-4 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-left">Identitas PO</th>
              <th className="px-4 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-left">Barang & Request</th>
              <th className="px-4 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-center">Qty & Satuan</th>
              <th className="px-4 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-center">SPPG</th>
              <th className="px-4 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-left">Droping</th>
              {userRole === 'ADMIN' && <th className="px-4 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-right">Finansial</th>}
              <th className="px-4 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-center">Status</th>
              <th className="px-4 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-right">Opsi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((po, index) => {
              const items = po.items || [];
              const totalItems = items.length;
              const totalValue = items.reduce((sum, item) => sum + ((item.qty || 0) * (item.harga || 0)), 0);
              const firstItem = items[0];

              return (
                <tr key={po.id} className="group hover:bg-slate-50/50 transition-all">
                  <td className="px-2 py-4 text-center">
                    <span className="text-[10px] font-bold text-slate-400">{po.no || index + 1}</span>
                  </td>
                  <td className="px-4 py-4 text-left whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className={cn("text-xs font-black tracking-tight", po.no_po ? "text-slate-900" : "text-slate-500 italic")}>{po.no_po || 'Menunggu Validasi'}</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-1 py-0.5 rounded border border-blue-100">
                          {po.po_by}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400">{new Date(po.tanggal_po).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-left">
                    <div className="flex flex-col max-w-[200px] xl:max-w-[300px]">
                      <span className="text-xs font-black text-slate-700 truncate">
                        {firstItem?.nama_barang || '(Tanpa Nama)'}
                        {totalItems > 1 && <span className="text-blue-600 ml-1">+{totalItems - 1} lainnya</span>}
                      </span>
                      {firstItem?.request && (
                        <span className="text-[9px] text-slate-400 truncate italic mt-0.5" title={firstItem.request}>"{firstItem.request}"</span>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                         {items.every(i => i.supplier) ? (
                           <span className="text-[8px] font-black text-emerald-600 uppercase tracking-tighter">Supplier OK</span>
                         ) : items.some(i => i.supplier) ? (
                           <span className="text-[8px] font-black text-orange-600 uppercase tracking-tighter">Partial</span>
                         ) : (
                           <span className="text-[8px] font-black text-rose-400 uppercase tracking-tighter">No Supplier</span>
                         )}
                         {firstItem?.supplier && (
                           <span className="text-[8px] font-bold text-blue-500 truncate max-w-[80px]" title={firstItem.supplier}>{firstItem.supplier}</span>
                         )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
                      <span className="text-xs font-black text-slate-900">{items.reduce((sum, i) => sum + i.qty, 0)}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{firstItem?.satuan || 'Unit'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center whitespace-nowrap">
                    <span className="text-[10px] font-black text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {po.sppg}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-[10px] text-left whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-700">{po.droping_date || '-'}</span>
                      <span className="text-slate-400 font-extrabold">{po.droping_time || '-'}</span>
                    </div>
                  </td>
                  {userRole === 'ADMIN' && (
                    <td className="px-4 py-4 text-right whitespace-nowrap">
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-black text-slate-900">{formatCurrency(totalValue)}</span>
                      </div>
                    </td>
                  )}
                  <td className="px-4 py-4 text-center whitespace-nowrap">
                    <select
                      disabled={userRole !== 'ADMIN'}
                      value={po.status}
                      onChange={(e) => onUpdateStatus(po.id, e.target.value as POStatus)}
                      className={cn(
                        "text-[9px] font-extrabold px-2 py-0.5 rounded-full border outline-none transition-all appearance-none uppercase tracking-wider shadow-sm",
                        statusStyles[po.status],
                        userRole !== 'ADMIN' && "cursor-default opacity-80"
                      )}
                    >
                      <option value={POStatus.VALID} className="bg-white text-orange-600 font-sans">VALID</option>
                      <option value={POStatus.PROCESSING} className="bg-white text-blue-600 font-sans">PROSES</option>
                      <option value={POStatus.COMPLETED} className="bg-white text-emerald-600 font-sans">SELESAI</option>
                      <option value={POStatus.INVOICED} className="bg-white text-indigo-600 font-sans">TERTAGIH (INV)</option>
                      <option value={POStatus.CANCELLED} className="bg-white text-slate-400 font-sans">DIBATALKAN</option>
                    </select>
                  </td>
                  <td className="px-4 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      {userRole === 'ADMIN' && (
                        <>
                          {onEdit && (
                            <button 
                              onClick={() => onEdit(po)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all shadow-sm active:scale-90"
                              title="Edit PO"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button 
                            onClick={() => onDelete(po.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-all shadow-sm active:scale-90"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => onView(po)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all shadow-sm"
                        title="Detail"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="group-hover:hidden transition-all text-slate-300">
                      <MoreVertical className="w-4 h-4 ml-auto" />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
