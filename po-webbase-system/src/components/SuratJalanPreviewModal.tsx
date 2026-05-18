import React, { useEffect } from 'react';
import { PurchaseOrder, DeliveryInfo, POItem } from '../types';
import { Printer, Download, X } from 'lucide-react';
import { exportToPDF } from '../lib/pdf';

interface SuratJalanPreviewModalProps {
  po: PurchaseOrder;
  formData: DeliveryInfo;
  items: POItem[];
  onClose: () => void;
}

export default function SuratJalanPreviewModal({ po, formData, items, onClose }: SuratJalanPreviewModalProps) {
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
    exportToPDF('sj-print-canvas', `SJ-${formData.suratJalanNo.replace(/\//g, '-')}`, { hideImages: true });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-100/95 backdrop-blur-sm overflow-y-auto print:bg-white">
      {/* Top App Bar - No Print */}
      <header className="bg-white flex justify-between items-center px-8 py-4 w-full shadow-sm sticky top-0 z-10 print:hidden border-b border-slate-200">
        <div className="flex items-center gap-4">
           <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
             <X className="w-5 h-5" />
           </button>
           <div className="text-xl font-bold text-slate-800 tracking-tight">Preview Surat Jalan</div>
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
        <div id="sj-print-canvas" className="bg-white shadow-xl print:shadow-none w-[210mm] min-h-[297mm] h-max shrink-0 relative overflow-hidden print:w-full font-sans text-black p-10">
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tighter text-slate-900">Surat Jalan</h1>
              <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-widest">{formData.suratJalanNo}</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-black text-blue-600">REKAP PENGIRIMAN</div>
              <p className="text-xs font-bold text-slate-400 mt-0.5 uppercase tracking-widest">Tgl: {formData.deliveryDate}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 mb-8">
            <div className="space-y-2">
              <div className="flex">
                <span className="w-32 text-xs font-bold text-slate-500 uppercase tracking-widest">Kepada</span>
                <span className="text-xs font-black text-slate-900 uppercase">: {formData.kepada || '-'}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-xs font-bold text-slate-500 uppercase tracking-widest">Data SPPG</span>
                <span className="text-xs font-black text-slate-900 uppercase">: {formData.kd_sppg || '-'} {formData.nama_sppg ? `- ${formData.nama_sppg}` : ''}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-xs font-bold text-slate-500 uppercase tracking-widest">P. Jawab</span>
                <span className="text-xs font-black text-slate-900 uppercase">: {formData.pj_sppg || '-'}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-xs font-bold text-slate-500 uppercase tracking-widest">No. Tlp / WA</span>
                <span className="text-xs font-black text-slate-900 uppercase">: {formData.no_wa || '-'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex">
                <span className="w-32 text-xs font-bold text-slate-500 uppercase tracking-widest">Input PO</span>
                <span className="text-xs font-black text-slate-900 uppercase">: {po.no_po}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-xs font-bold text-slate-500 uppercase tracking-widest">Kurir</span>
                <span className="text-xs font-black text-slate-900 uppercase">: {formData.deliveredBy || '-'}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-xs font-bold text-slate-500 uppercase tracking-widest">Supplier</span>
                <span className="text-xs font-black text-slate-900 uppercase">: {Array.from(new Set((po.items || []).map(i => i.supplier).filter(Boolean))).join(', ') || '-'}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-xs font-bold text-slate-500 uppercase tracking-widest">Catatan</span>
                <span className="text-xs font-black text-slate-900 uppercase">: {formData.notes || '-'}</span>
              </div>
            </div>
          </div>

          <div className="mb-10">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
                  <th className="p-3 text-left border border-slate-900">Nama Barang</th>
                  <th className="p-3 text-center border border-slate-900">Volume</th>
                  <th className="p-3 text-left border border-slate-900">Supplier</th>
                  <th className="p-3 text-left border border-slate-900">Keterangan</th>
                  <th className="p-3 text-center border border-slate-900">Foto</th>
                </tr>
              </thead>
              <tbody>
                    {items.map(item => (
                      <tr key={item.id} className="text-xs">
                        <td className="p-3 border border-slate-200 font-bold">{item.nama_barang}</td>
                        <td className="p-3 border border-slate-200 text-center font-black">{item.qty} {item.satuan}</td>
                        <td className="p-3 border border-slate-200 uppercase font-black text-[9px] text-blue-600">{item.supplier || '-'}</td>
                        <td className="p-3 border border-slate-200 text-slate-500">{item.request || '-'}</td>
                        <td className="p-3 border border-slate-200 text-center text-[9px] font-bold text-slate-400 uppercase">Foto Terlampir</td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-3 gap-8 mt-20">
            <div className="text-center">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-16">Dibuat Oleh,</p>
              <div className="border-t border-slate-900 pt-2 font-bold text-sm">SPPG (ADMIN)</div>
            </div>
            <div className="text-center">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-16">Dikirim Oleh,</p>
              <div className="border-t border-slate-900 pt-2 font-bold text-sm">{formData.deliveredBy || '(....................)'}</div>
            </div>
            <div className="text-center">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-16">Diterima Oleh,</p>
              <div className="border-t border-slate-900 pt-2 font-bold text-sm">(....................)</div>
            </div>
          </div>
          
          <div className="mt-20 text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest border-t border-slate-100 pt-4">
            Dokumen ini dihasilkan secara otomatis melalui Sistem Manajemen PO CV. SPPG
          </div>
        </div>
      </div>
    </div>
  );
}
