import React, { useEffect } from 'react';
import { PurchaseOrder, InvoiceInfo, SupplierType, SUPPLIER_DETAILS } from '../types';
import { formatCurrency } from '../lib/utils';
import { Printer, Download, User, CreditCard, X, Banknote } from 'lucide-react';
import { exportToPDF } from '../lib/pdf';

interface InvoicePreviewModalProps {
  order: PurchaseOrder;
  invoice: InvoiceInfo;
  onClose: () => void;
}

export default function InvoicePreviewModal({ order, invoice, onClose }: InvoicePreviewModalProps) {
  const supplierName = invoice.supplier as SupplierType;
  const supplierInfo = SUPPLIER_DETAILS[supplierName];
  
  // Prevent background scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (!supplierInfo) return null;

  const supplierItems = invoice.items || (order.items || []).filter(item => item.supplier === supplierName);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    exportToPDF('invoice-preview-canvas', `INV-${invoice.invoiceNo.replace(/\//g, '-')}`);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-100/95 backdrop-blur-sm overflow-y-auto print:bg-white">
      {/* Top App Bar - No Print */}
      <header className="bg-white flex justify-between items-center px-8 py-4 w-full shadow-sm sticky top-0 z-10 print:hidden border-b border-slate-200">
        <div className="flex items-center gap-4">
           <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
             <X className="w-5 h-5" />
           </button>
           <div className="text-xl font-bold text-slate-800 tracking-tight">Invoice Preview</div>
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
        <div 
          id="invoice-preview-canvas" 
          className="w-[210mm] min-h-[297mm] bg-white shadow-xl print:shadow-none p-12 print:p-0 mx-auto box-border text-slate-800 flex flex-col"
        >
          {/* Header Zone */}
          <div className="flex justify-between items-start mb-8">
            <div className="w-[60%]">
              {supplierInfo.logoUrl ? (
                <img src={supplierInfo.logoUrl} alt={`${supplierName} Logo`} className="h-16 mb-4 object-contain object-left" />
              ) : (
                <div className="h-16 mb-4 flex items-center">
                  <h1 className="text-3xl font-black">{supplierName}</h1>
                </div>
              )}
              <div className="space-y-1 mt-2">
                <p className="text-xl font-bold text-slate-900 uppercase">{supplierName}</p>
                <p className="text-xs text-slate-500 font-medium tracking-wide">DISTRIBUSI TEPAT. PANGAN BERKUALITAS.</p>
                <p className="text-sm text-slate-500 leading-relaxed max-w-[250px] mt-1">{supplierInfo.address}</p>
              </div>
            </div>
            <div className="w-[40%] text-right flex flex-col items-end">
              <h1 className="text-5xl font-serif font-black italic text-slate-900 uppercase tracking-tighter" style={{ fontFamily: '"Georgia", serif' }}>INVOICE</h1>
              <div className="mt-5 flex flex-col items-end gap-2">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-white shadow-sm`} style={{ backgroundColor: invoice.status === 'PAID' ? '#10b981' : supplierInfo.themeColor }}>
                  {invoice.status === 'PAID' ? 'LUNAS' : 'BELUM BAYAR'}
                </span>
                <p className="font-mono text-sm font-bold text-slate-900 tracking-tight mt-1">{invoice.invoiceNo}</p>
              </div>
            </div>
          </div>

          <div className="border-b-2 border-slate-200 mb-8" style={{ borderColor: supplierInfo.themeColor }}></div>

          {/* Client & Invoice Info Zone */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="bg-slate-50/50 p-6 rounded-lg border border-slate-200 object-contain shadow-[inset_0_0_20px_rgba(0,0,0,0.01)]" style={{ borderLeft: `4px solid ${supplierInfo.themeColor}` }}>
              <div className="flex items-center gap-2 mb-4" style={{ color: supplierInfo.themeColor }}>
                <User className="w-5 h-5" />
                <h2 className="text-xs font-bold uppercase tracking-wider">Invoice To</h2>
              </div>
              <p className="text-lg font-bold mb-1 uppercase text-slate-900">
                {invoice.kepada || 'CV. SELERA PANGAN PERSADA GEMILANG (SPPG)'}
              </p>
              <p className="text-sm text-slate-500">Surabaya</p>
              {invoice.no_wa && (
                <p className="text-sm text-slate-500 mt-1">{invoice.no_wa}</p>
              )}
            </div>
            <div className="space-y-4 pt-2 px-2">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-sm text-slate-500">Invoice No</span>
                <span className="font-mono text-sm text-slate-900 font-bold uppercase tracking-tight">{invoice.invoiceNo}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-sm text-slate-500">Transaction</span>
                <span className="text-sm text-right max-w-[200px] font-bold" style={{ color: supplierInfo.themeColor }}>Tagihan Pengadaan Barang<br/><span className="text-xs font-medium text-slate-500">(PO: {order.no_po})</span></span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-sm text-slate-500">Date</span>
                <span className="text-sm text-slate-900 font-medium">{invoice.invoiceDate}</span>
              </div>
            </div>
          </div>

          {/* Line-Item Table */}
          <div className="mb-8 overflow-hidden rounded-lg border border-slate-200 shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-white" style={{ backgroundColor: supplierInfo.themeColor }}>
                  <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider w-[5%] text-center">No</th>
                  <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider w-[45%]">Description</th>
                  <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider w-[10%] text-center">Unit</th>
                  <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider w-[10%] text-center">Qty</th>
                  <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider w-[15%] text-right">Price</th>
                  <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider w-[15%] text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {supplierItems.map((item, idx) => (
                  <tr key={idx} className={`${idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'} hover:bg-slate-100/50 transition-colors`}>
                    <td className="py-4 px-4 text-[13px] font-mono text-center text-slate-500">{idx + 1}</td>
                    <td className="py-4 px-4">
                      <p className="text-sm font-bold text-slate-900">{item.nama_barang}</p>
                      {item.orderNo && <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight mt-1">PO Ref: {item.orderNo}</p>}
                    </td>
                    <td className="py-4 px-4 text-sm text-center text-slate-600">{item.satuan}</td>
                    <td className="py-4 px-4 text-[13px] font-mono text-center font-semibold text-slate-800">{item.qty}</td>
                    <td className="py-4 px-4 text-[13px] font-mono text-right text-slate-600">{formatCurrency(item.harga || 0)}</td>
                    <td className="py-4 px-4 text-[13px] font-mono text-right font-semibold text-slate-800">{formatCurrency(item.qty * (item.harga || 0))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Block */}
          <div className="flex flex-col items-end mb-10">
            <div className="w-1/2 space-y-3">
              <div className="flex justify-between px-4 pb-2">
                <span className="text-lg font-medium text-slate-700">Sub Total</span>
                <span className="font-mono text-lg font-bold text-slate-900">{formatCurrency(invoice.totalAmount)}</span>
              </div>
              <div className="flex justify-between items-center p-4 rounded-lg shadow-sm text-white" style={{ backgroundColor: supplierInfo.themeColor }}>
                <span className="text-xs font-bold uppercase tracking-widest text-white/90">Total Amount</span>
                <span className="text-2xl font-bold font-mono tracking-tight">{formatCurrency(invoice.totalAmount)}</span>
              </div>
              <div className="text-right px-2 mt-2">
                <p className="italic text-xs font-medium" style={{ color: supplierInfo.themeColor }}>* Harga tidak menggunakan PPN</p>
              </div>
            </div>
          </div>

          {/* Payment Information Block */}
          <div className="border border-slate-200 rounded-xl p-6 bg-slate-50/50 shadow-sm mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Banknote className="w-5 h-5 text-slate-700" />
              <h3 className="text-lg font-bold text-slate-800">Payment Information</h3>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {supplierInfo.banks.map((bank, idx) => (
                <div key={idx} className="bg-white border border-slate-200 overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Account Holder</p>
                      <p className="text-sm font-bold text-slate-900 uppercase truncate max-w-[200px]" title={bank.owner}>{bank.owner}</p>
                    </div>
                    <CreditCard className="w-6 h-6 text-slate-300" />
                  </div>
                  <div className="p-4">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1">{bank.bank}</p>
                    <p className="text-lg font-bold font-mono tracking-widest" style={{ color: supplierInfo.themeColor }}>{bank.account}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Signature Zone */}
          <div className="flex justify-end pt-4 pb-12 text-center mt-auto">
            <div className="w-64 relative flex flex-col items-center">
              <p className="text-sm text-slate-500 mb-14 font-medium italic">Managing Director</p>
              
              <div className="absolute top-10 h-24 w-full flex justify-center items-center pointer-events-none">
                 {supplierInfo.stampUrl && (
                   <img src={supplierInfo.stampUrl} alt="Stempel" className="absolute object-contain max-h-[160%] opacity-70 mix-blend-multiply" style={{ transform: 'rotate(-5deg) translate(-10px, 0)' }} />
                 )}
                 <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Signature_of_John_Hancock.svg" alt="Signature" className="absolute object-contain max-h-16 w-32 opacity-80 mix-blend-multiply" style={{ transform: 'rotate(-10deg) translate(10px, 5px)' }} />
              </div>

              <div className="border-b-2 border-slate-800 w-full mb-2 relative z-10"></div>
              <p className="text-sm font-bold text-slate-900 relative z-10">{supplierInfo.banks[0]?.owner || supplierName}</p>
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-8 pt-6 border-t border-slate-200 text-center">
             <p className="text-xs text-slate-500 mb-2">{supplierInfo.address}</p>
             <p className="text-[11px] uppercase font-bold tracking-widest mt-1" style={{ color: supplierInfo.themeColor }}>{supplierName}</p>
          </footer>
        </div>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #invoice-preview-canvas, #invoice-preview-canvas * {
            visibility: visible;
          }
          #invoice-preview-canvas {
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
