import React, { useState, useMemo } from 'react';
import { Search, FileText, Download, Filter, ChevronRight, CheckCircle2, Clock, AlertCircle, Calendar, CreditCard, Banknote, User, Building2, Printer } from 'lucide-react';
import { PurchaseOrder, POStatus, SUPPLIERS, SUPPLIER_DETAILS, SupplierType, POItem, InvoiceInfo } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import CreateInvoiceModal from './CreateInvoiceModal';
import InvoicePreviewModal from './InvoicePreviewModal';

interface InvoiceListProps {
  orders: PurchaseOrder[];
  userRole: 'ADMIN' | 'SPPG';
  onUpdateOrder: (updatedOrder: PurchaseOrder) => void;
}

export default function InvoiceList({ orders, userRole, onUpdateOrder }: InvoiceListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'PENDING' | 'HISTORY'>('PENDING');
  const [selectedSupplierKey, setSelectedSupplierKey] = useState<string | null>(null);
  const [printingOrder, setPrintingOrder] = useState<PurchaseOrder | null>(null);
  const [printingInvoice, setPrintingInvoice] = useState<InvoiceInfo | null>(null);

  // Completed items grouped by PO + supplier that don't have an invoice yet
  const pendingInvoicesBySupplier = useMemo(() => {
    const map: Record<string, { 
      supplier: string,
      orderId: string,
      orderNo: string,
      items: (POItem & { orderId: string, orderNo: string })[], 
      totalEstimasi: number, 
      poSet: Set<string> 
    }> = {};
    
    orders.forEach(order => {
      // Items are ready for invoice if PO is COMPLETED or already partially INVOICED
      if (order.status === POStatus.COMPLETED || order.status === POStatus.INVOICED) {
        (order.items || []).forEach(item => {
          if (item.supplier && !item.invoiced) {
            const groupKey = `${order.id}:::${item.supplier}`;
            if (!map[groupKey]) {
              map[groupKey] = { supplier: item.supplier, orderId: order.id, orderNo: order.no_po, items: [], totalEstimasi: 0, poSet: new Set([order.no_po]) };
            }
            map[groupKey].items.push({ ...item, orderId: order.id, orderNo: order.no_po });
            map[groupKey].totalEstimasi += ((item.qty || 0) * (item.harga || 0));
          }
        });
      }
    });

    return map;
  }, [orders]);

  const historyInvoices = useMemo(() => {
    const list: { po: PurchaseOrder, inv: InvoiceInfo }[] = [];
    orders.forEach(po => {
      if (po.invoices && po.invoices.length > 0) {
        po.invoices.forEach(inv => {
          list.push({ po, inv });
        });
      } else if (po.invoice) {
        // Fallback for older data
        list.push({ po, inv: po.invoice as InvoiceInfo });
      }
    });
    return list.sort((a, b) => new Date(b.inv.invoiceDate).getTime() - new Date(a.inv.invoiceDate).getTime());
  }, [orders]);

  const historyStats = useMemo(() => {
    let totalNominal = 0;
    let totalLunas = 0;
    let totalBelumBayar = 0;

    historyInvoices.forEach(({ inv }) => {
      totalNominal += inv.totalAmount;
      if (inv.status === 'PAID') totalLunas += inv.totalAmount;
      else totalBelumBayar += inv.totalAmount;
    });

    return { totalNominal, totalLunas, totalBelumBayar, countInvoices: historyInvoices.length };
  }, [historyInvoices]);

  const handleDownloadHistory = async (order: PurchaseOrder, invoice: InvoiceInfo) => {
    setPrintingOrder(order);
    setPrintingInvoice(invoice);
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('PENDING')}
          className={cn(
            "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
            activeTab === 'PENDING' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Siap Rekap Tagihan
        </button>
        <button
          onClick={() => setActiveTab('HISTORY')}
          className={cn(
            "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
            activeTab === 'HISTORY' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Riwayat Invoice
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'PENDING' ? (
          <motion.div 
            key="pending"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-sm"
          >
            {Object.keys(pendingInvoicesBySupplier).length === 0 ? (
              <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed border-slate-300">
                <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8" />
                </div>
                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                  Belum ada Surat Jalan yang siap direkap menjadi Invoice.
                </p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200">
                    <th className="w-12 px-2 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-center">No</th>
                    <th className="px-4 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-left">Supplier & Referensi</th>
                    <th className="px-4 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-center">Info Item</th>
                    <th className="px-4 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-left min-w-[250px]">Rincian Barang</th>
                    <th className="px-4 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Object.entries(pendingInvoicesBySupplier).map(([groupKey, data], index) => {
                    const supplierData = data as typeof pendingInvoicesBySupplier[string];
                    return (
                      <tr key={groupKey} className="group hover:bg-slate-50/50 transition-all">
                        <td className="px-2 py-4 text-center align-top pt-5">
                          <span className="text-[10px] font-bold text-slate-400">{index + 1}</span>
                        </td>
                        <td className="px-4 py-4 text-left whitespace-nowrap align-top pt-5">
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-slate-900 leading-tight mb-1" title={supplierData.supplier}>
                              {supplierData.supplier}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500">
                              Ref PO: <span className="text-slate-800">{supplierData.orderNo}</span>
                            </span>
                            <span className="text-[9px] font-black text-blue-700 uppercase tracking-widest bg-blue-100/50 px-2.5 py-0.5 rounded border border-blue-200/50 w-fit mt-2">
                              Siap Tagih
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center align-top pt-5">
                          <div className="flex flex-col items-center gap-1.5">
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                              {supplierData.poSet.size} PO / {supplierData.items.length} Item
                            </span>
                            <span className="text-[10px] font-black text-emerald-600">
                              Estimasi: {formatCurrency(supplierData.totalEstimasi)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 align-top pt-4">
                          <div className="flex flex-col gap-2 max-h-[140px] overflow-y-auto pr-2 custom-scrollbar">
                            {supplierData.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-start text-xs bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                                <div className="flex-1 pr-3">
                                  <span className="font-bold text-slate-700 block mb-0.5 line-clamp-1" title={item.nama_barang}>{item.nama_barang}</span>
                                  <span className="font-bold text-[9px] text-slate-400 uppercase tracking-tighter bg-slate-50 px-1 py-0.5 rounded inline-block">Ref: {item.orderNo}</span>
                                </div>
                                <div className="text-right whitespace-nowrap">
                                  <span className="font-black text-xs text-slate-800 block mb-0.5">{item.qty} <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.satuan}</span></span>
                                  <span className="font-bold text-[9px] text-emerald-600 block">{formatCurrency(item.harga || 0)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right whitespace-nowrap align-top pt-5">
                          {userRole === 'ADMIN' ? (
                            <button 
                              onClick={() => setSelectedSupplierKey(groupKey)}
                              className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-blue-700 shadow-sm transition-all text-right ml-auto"
                            >
                              Buat Invoice
                              <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                            </button>
                          ) : (
                            <div className="py-1.5 px-3 bg-slate-50 rounded-lg border border-dashed border-slate-200 inline-block">
                              <p className="text-[9px] font-bold text-slate-400 italic">Menunggu Admin</p>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="history"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {historyInvoices.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Tagihan Beredar</p>
                    <p className="text-xl font-black text-slate-900">{formatCurrency(historyStats.totalNominal)}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                    <Banknote className="w-6 h-6" />
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Lunas</p>
                    <p className="text-xl font-black text-emerald-600">{formatCurrency(historyStats.totalLunas)}</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Belum Dibayar</p>
                    <p className="text-xl font-black text-rose-600">{formatCurrency(historyStats.totalBelumBayar)}</p>
                  </div>
                  <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center shrink-0">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Dokumen</p>
                    <p className="text-xl font-black text-slate-900">{historyStats.countInvoices} <span className="text-sm text-slate-500 font-bold">Invoice</span></p>
                  </div>
                  <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {historyInvoices.length === 0 ? (
              <div className="py-20 text-center">
                <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-8 h-8" />
                </div>
                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                  Belum ada riwayat invoice.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-200">
                      <th className="w-12 px-2 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-center">No</th>
                      <th className="px-4 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-left whitespace-nowrap">No Invoice</th>
                      <th className="px-4 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-left whitespace-nowrap">Supplier</th>
                      <th className="px-4 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-left whitespace-nowrap">Kepada</th>
                      <th className="px-4 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-right whitespace-nowrap">Total</th>
                      <th className="px-4 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-center whitespace-nowrap">Status</th>
                      <th className="px-4 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-right whitespace-nowrap">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {historyInvoices.map(({ po, inv }, index) => (
                      <tr key={`${po.id}-${inv.invoiceNo}`} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="px-2 py-4 text-center">
                          <span className="text-[10px] font-bold text-slate-400">{index + 1}</span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                           <div className="flex flex-col">
                             <span className="text-xs font-black text-slate-900">{inv.invoiceNo}</span>
                             <span className="text-[10px] font-bold text-slate-500 mt-0.5">Tgl: {new Date(inv.invoiceDate).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                             <span className="text-[9px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-1 py-0.5 rounded border border-blue-100 w-fit mt-1">Ref PO: {po.no_po}</span>
                           </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-left">
                          <span className="text-xs font-black text-slate-700 uppercase">{inv.supplier}</span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-left text-xs font-bold text-slate-500 truncate max-w-[150px]">{inv.kepada || '-'}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-xs font-black text-slate-900 text-right">{formatCurrency(inv.totalAmount)}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          <InvoiceStatusBadge 
                            status={inv.status} 
                            isAdmin={userRole === 'ADMIN'}
                            onStatusChange={(newStatus) => {
                              const updatedInvoices = po.invoices?.map(i => 
                                i.invoiceNo === inv.invoiceNo ? { ...i, status: newStatus } : i
                              );
                              onUpdateOrder({ ...po, invoices: updatedInvoices });
                            }}
                          />
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right">
                          <button 
                            onClick={() => handleDownloadHistory(po, inv)}
                            className="bg-white text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm ml-auto opacity-100 sm:opacity-0 group-hover:opacity-100 flex items-center justify-end gap-1.5"
                            title="Preview Invoice"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            Cetak
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedSupplierKey && pendingInvoicesBySupplier[selectedSupplierKey] && (
        <CreateInvoiceModal 
          supplier={pendingInvoicesBySupplier[selectedSupplierKey].supplier as SupplierType}
          items={pendingInvoicesBySupplier[selectedSupplierKey].items}
          orders={orders}
          onClose={() => setSelectedSupplierKey(null)}
          onSave={(updatedOrders) => {
            updatedOrders.forEach(o => onUpdateOrder(o));
            setSelectedSupplierKey(null);
          }}
        />
      )}

      {/* Preview Modal for History Download */}
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

function InvoiceStatusBadge({ 
  status, 
  isAdmin = false, 
  onStatusChange 
}: { 
  status: InvoiceInfo['status']; 
  isAdmin?: boolean;
  onStatusChange?: (status: InvoiceInfo['status']) => void;
}) {
  const styles = {
    PAID: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    UNPAID: 'bg-blue-50 text-blue-600 border-blue-100 font-black',
  };

  const labels = {
    PAID: 'LUNAS',
    UNPAID: 'BELUM BAYAR',
  };

  if (isAdmin && onStatusChange) {
    return (
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value as InvoiceInfo['status'])}
        className={cn(
          "text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider border outline-none cursor-pointer hover:shadow-sm transition-all appearance-none",
          styles[status]
        )}
      >
        <option value="UNPAID">{labels.UNPAID}</option>
        <option value="PAID">{labels.PAID}</option>
      </select>
    );
  }

  return (
    <span className={cn(
      "text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider border",
      styles[status]
    )}>
      {labels[status]}
    </span>
  );
}
