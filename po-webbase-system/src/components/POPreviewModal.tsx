import React, { useEffect } from 'react';
import { PurchaseOrder } from '../types';
import { Printer, Download, X } from 'lucide-react';
import { exportToPDF } from '../lib/pdf';
import { formatCurrency } from '../lib/utils';

interface POPreviewModalProps {
  po: PurchaseOrder;
  onClose: () => void;
}

export default function POPreviewModal({ po, onClose }: POPreviewModalProps) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    exportToPDF('po-print-canvas', `PO-${po.no_po || 'UNVALIDATED'}.pdf`, { hideImages: true });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-100/95 backdrop-blur-sm overflow-y-auto print:bg-white">
      {/* Top App Bar - No Print */}
      <header className="bg-white flex justify-between items-center px-8 py-4 w-full shadow-sm sticky top-0 z-10 print:hidden border-b border-slate-200">
        <div className="flex items-center gap-4">
           <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
             <X className="w-5 h-5" />
           </button>
           <div className="text-xl font-bold text-slate-800 tracking-tight">Preview Purchase Order</div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 rounded-lg text-slate-700 font-medium transition-colors border border-slate-200">
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>
          <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors shadow-sm">
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
        </div>
      </header>

      {/* Invoice Canvas */}
      <div className="py-8 print:py-0 w-full flex justify-center min-h-screen">
        <div id="po-print-canvas" className="bg-white shadow-xl print:shadow-none w-[210mm] min-h-[297mm] h-max shrink-0 relative overflow-hidden print:w-full font-sans text-black p-10">
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tighter text-slate-900">Purchase Order</h1>
              <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-widest">{po.no_po || 'Menunggu Validasi'}</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-black text-blue-600">CV. SPPG</div>
              <p className="text-xs font-bold text-slate-400 mt-0.5 uppercase tracking-widest">Tgl PO: {new Date(po.tanggal_po).toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 mb-10">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Dibuat Oleh</label>
                  <div className="font-bold text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">{po.po_by || '-'}</div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Kode SPPG</label>
                  <div className="font-bold text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">{po.sppg || '-'}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">No. PO</label>
                  <div className="font-bold text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">{po.no_po || '-'}</div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Status</label>
                  <div className="font-bold text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">{po.status}</div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Tgl Drop</label>
                  <div className="font-bold text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">{po.droping_date || '-'}</div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Jam Drop</label>
                  <div className="font-bold text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">{po.droping_time || '-'}</div>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Daftar Supplier</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {Array.from(new Set((po.items || []).map(i => i.supplier).filter(Boolean))).map(s => (
                    <span key={s} className="px-3 py-1 bg-blue-50 border border-blue-100 rounded text-[10px] font-black text-blue-600 uppercase">
                      {s}
                    </span>
                  ))}
                  {Array.from(new Set((po.items || []).map(i => i.supplier).filter(Boolean))).length === 0 && (
                    <span className="text-xs text-slate-500 italic block mt-2">Belum ditugaskan</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mb-10">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
                  <th className="p-3 text-center border border-slate-900 w-[5%]">No</th>
                  <th className="p-3 text-left border border-slate-900 w-[35%]">Nama Barang</th>
                  <th className="p-3 text-center border border-slate-900 w-[10%]">Qty</th>
                  <th className="p-3 text-center border border-slate-900 w-[10%]">Satuan</th>
                  <th className="p-3 text-left border border-slate-900 w-[20%]">Supplier</th>
                  <th className="p-3 text-right border border-slate-900 w-[20%]">Request / Grade</th>
                </tr>
              </thead>
              <tbody>
                {(po.items || []).map((item, idx) => (
                  <tr key={item.id} className="text-xs">
                    <td className="p-3 border border-slate-200 text-center">{idx + 1}</td>
                    <td className="p-3 border border-slate-200 font-bold">{item.nama_barang}</td>
                    <td className="p-3 border border-slate-200 text-center font-black">{item.qty}</td>
                    <td className="p-3 border border-slate-200 text-center uppercase">{item.satuan}</td>
                    <td className="p-3 border border-slate-200 uppercase font-black text-[9px] text-blue-600">{item.supplier || '-'}</td>
                    <td className="p-3 border border-slate-200 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-slate-500 italic">{item.request || '-'}</span>
                        <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-100 uppercase">Grade: {item.grade || '-'}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-2 gap-8 mt-20">
            <div className="text-center">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-16">Dibuat Oleh,</p>
              <div className="border-t border-slate-900 pt-2 font-bold text-sm">SPPG (ADMIN)</div>
            </div>
            <div className="text-center">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-16">Menyetujui,</p>
              <div className="border-t border-slate-900 pt-2 font-bold text-sm">(....................)</div>
            </div>
          </div>
          
          <div className="mt-20 text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest border-t border-slate-100 pt-4">
            Dokumen ini dihasilkan secara otomatis melalui Sistem Manajemen PO CV. SPPG
          </div>
        </div>
      </div>
      
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #po-print-canvas, #po-print-canvas * {
            visibility: visible;
          }
          #po-print-canvas {
            position: absolute;
            left: 0;
            top: 0;
            margin: 0;
            padding: 0;
            box-shadow: none;
            width: 210mm;
            min-height: 297mm;
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
}
