import React, { useState } from 'react';
import { X, CreditCard, Building2, Calculator, Save, FileText } from 'lucide-react';
import { PurchaseOrder, POStatus, POItem, SupplierType, SUPPLIER_DETAILS, InvoiceInfo, DeliveryInfo } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { exportToPDF } from '../lib/pdf';
import InvoicePreviewModal from './InvoicePreviewModal';

interface CreateInvoiceModalProps {
  supplier: SupplierType;
  items: (POItem & { orderId: string, orderNo: string })[];
  orders: PurchaseOrder[];
  onClose: () => void;
  onSave: (updatedOrders: PurchaseOrder[]) => void;
}

export default function CreateInvoiceModal({ supplier, items, orders, onClose, onSave }: CreateInvoiceModalProps) {
  const [itemPrices, setItemPrices] = useState<Record<string, number>>(
    items.reduce((acc, item) => ({ ...acc, [item.id]: item.harga || 0 }), {})
  );
  const [billedQtys, setBilledQtys] = useState<Record<string, number>>(
    items.reduce((acc, item) => ({ ...acc, [item.id]: item.qty }), {})
  );
  const safeSupplier = supplier || 'SUPPLIER';
  const [invoiceNo, setInvoiceNo] = useState(`INV/${safeSupplier.split(' ')[0]}/${Date.now().toString().slice(-6)}`);
  
  const supplierInfo = SUPPLIER_DETAILS[supplier];
  
  const handlePriceChange = (itemId: string, value: string) => {
    const price = parseFloat(value) || 0;
    setItemPrices(prev => ({ ...prev, [itemId]: price }));
  };

  const handleQtyChange = (itemId: string, value: string, maxQty: number) => {
    const qty = Math.min(maxQty, Math.max(0, parseFloat(value) || 0));
    setBilledQtys(prev => ({ ...prev, [itemId]: qty }));
  };

  const totalAmount = items.reduce((sum, item) => sum + ((billedQtys[item.id] || 0) * (itemPrices[item.id] || 0)), 0);

  const handleCreateInvoice = () => {
    // Group affected orders
    const orderIds = Array.from(new Set(items.map(i => i.orderId)));
    
    const updatedOrders = orders.map(order => {
      if (orderIds.includes(order.id)) {
        const orderPiutang: any[] = [...(order.piutang || [])];
        
        // Update prices and mark items as invoiced for this supplier
        const updatedItems = (order.items || []).map(item => {
          if (item.supplier === supplier && itemPrices[item.id] !== undefined) {
            const billedQty = billedQtys[item.id] || 0;
            const remainingQty = (item.qty || 0) - billedQty;

            if (remainingQty > 0) {
              const piutangCount = orderPiutang.filter(p => p.originalInvoiceNo === invoiceNo).length;
              // Create Piutang for remaining
              orderPiutang.push({
                id: crypto.randomUUID(),
                kd_piutang: `${invoiceNo}-${piutangCount + 1}`,
                originalInvoiceNo: invoiceNo,
                no_po: order.no_po,
                nama_barang: item.nama_barang,
                qty: remainingQty,
                harga: itemPrices[item.id],
                satuan: item.satuan,
                totalAmount: remainingQty * itemPrices[item.id],
                supplier: supplier,
                status: 'PENDING',
                createdAt: new Date().toISOString(),
                bankDetails: supplierInfo.banks[0]
              });
            }

            return { 
              ...item, 
              harga: itemPrices[item.id],
              invoiced: true // Mark as invoiced since remaining qty is converted to piutang
            };
          }
          return item;
        });

        // Determine if everything is invoiced
        const allInvoiced = updatedItems.every(i => !i.supplier || i.invoiced);

        const orderDelivery = (order.delivery || {}) as DeliveryInfo;
        
        const invoiceItems = updatedItems
          .filter(item => item.supplier === supplier && (billedQtys[item.id] || 0) > 0)
          .map(item => ({
            nama_barang: item.nama_barang,
            qty: billedQtys[item.id] || 0,
            harga: itemPrices[item.id] || 0,
            satuan: item.satuan,
            grade: item.grade,
            total: (billedQtys[item.id] || 0) * (itemPrices[item.id] || 0)
          }));

        const newInvoice: InvoiceInfo = {
          invoiceNo,
          invoiceDate: new Date().toLocaleDateString(),
          totalAmount,
          status: 'UNPAID' as const,
          supplier,
          kepada: orderDelivery.kepada || 'CV. SELERA PANGAN PERSADA GEMILANG (SPPG)',
          kd_sppg: orderDelivery.kd_sppg,
          nama_sppg: orderDelivery.nama_sppg || order.sppg,
          pj_sppg: orderDelivery.pj_sppg,
          no_wa: orderDelivery.no_wa,
          no_rek: supplierInfo.banks[0].account,
          rek: supplierInfo.banks[0].bank,
          stamp_ttd: 'Verified',
          items: invoiceItems
        };

        return {
          ...order,
          items: updatedItems,
          status: allInvoiced ? POStatus.INVOICED : POStatus.COMPLETED, 
          invoices: [...(order.invoices || []), newInvoice],
          piutang: orderPiutang,
          invoice: newInvoice 
        };
      }
      return order;
    });

    onSave(updatedOrders as PurchaseOrder[]);
  };

  const [showPreview, setShowPreview] = useState(false);

  const handlePrint = () => {
    setShowPreview(true);
  };

  const generatePreviewInvoice = (): InvoiceInfo => {
    const previewItems = items
      .filter(item => (billedQtys[item.id] || 0) > 0)
      .map(item => ({
        nama_barang: item.nama_barang,
        qty: billedQtys[item.id] || 0,
        harga: itemPrices[item.id] || 0,
        satuan: item.satuan,
        grade: item.grade,
        total: (billedQtys[item.id] || 0) * (itemPrices[item.id] || 0),
        orderNo: item.orderNo
      }));

    return {
      invoiceNo,
      invoiceDate: new Date().toLocaleDateString(),
      totalAmount,
      status: 'UNPAID',
      supplier,
      kepada: 'CV. SELERA PANGAN PERSADA GEMILANG (SPPG)',
      kd_sppg: '',
      nama_sppg: '',
      pj_sppg: '',
      no_wa: '',
      no_rek: supplierInfo?.banks[0]?.account || '',
      rek: supplierInfo?.banks[0]?.bank || '',
      stamp_ttd: 'Verified',
      items: previewItems
    };
  };

  const previewOrder = {
    ...orders[0],
    no_po: Array.from(new Set(items.map(i => i.orderNo))).join(', ')
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {showPreview && (
        <InvoicePreviewModal
          order={previewOrder as PurchaseOrder}
          invoice={generatePreviewInvoice()}
          onClose={() => setShowPreview(false)}
        />
      )}
      <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        <header className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Rekap Tagihan (Invoice)</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{supplier}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-all">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Section */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Input Harga Per Barang</h3>
                </div>

                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex flex-col md:flex-row md:items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex-1">
                        <p className="text-sm font-black text-slate-900">{item.nama_barang}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                          Ref: {item.orderNo} • {item.qty} {item.satuan} Total
                        </p>
                      </div>
                      <div className="w-full md:w-32 relative">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter block mb-1">Qty Tagihan</label>
                        <input 
                          type="number"
                          value={billedQtys[item.id] || ''}
                          onChange={(e) => handleQtyChange(item.id, e.target.value, item.qty)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-black focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                        />
                      </div>
                      <div className="w-full md:w-40 relative">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter block mb-1">Harga Satuan</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">Rp.</span>
                          <input 
                            type="number"
                            placeholder="Input Harga..."
                            value={itemPrices[item.id] || ''}
                            onChange={(e) => handlePriceChange(item.id, e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-black focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                          />
                        </div>
                      </div>
                      <div className="w-full md:w-28 text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Subtotal</p>
                        <p className="text-xs font-black text-slate-900">{formatCurrency((billedQtys[item.id] || 0) * (itemPrices[item.id] || 0))}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview & Payment Section */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Ringkasan Pembayaran
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                    <span className="text-xs font-bold text-slate-500">Total Item</span>
                    <span className="text-xs font-black text-slate-900">{items.length} Barang</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs font-bold text-slate-500">Total Tagihan</span>
                    <span className="text-lg font-black text-blue-600">{formatCurrency(totalAmount)}</span>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 space-y-3">
                  <div className="flex items-center gap-2 text-blue-600">
                    <Building2 className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Informasi Rekening</span>
                  </div>
                  <div className="space-y-2">
                    {supplierInfo.banks.map((bank, idx) => (
                      <div key={idx} className="text-[10px]">
                        <p className="font-black text-blue-700">{bank.bank}: {bank.account}</p>
                        <p className="text-blue-500 font-bold uppercase tracking-tighter">a.n {bank.owner}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                   <button 
                    onClick={handleCreateInvoice}
                    disabled={totalAmount === 0}
                    className="w-full py-4 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     <Save className="w-4 h-4" />
                     Simpan & Terbitkan Invoice
                   </button>
                   <button 
                    onClick={handlePrint}
                    className="w-full py-4 border-2 border-slate-200 bg-white text-slate-600 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all"
                   >
                     Preview PDF
                   </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
