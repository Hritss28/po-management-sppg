import React, { useState, useEffect } from 'react';
import { X, Calendar, Package, User, Clock, Info, Truck, Plus, Trash2 } from 'lucide-react';
import { PurchaseOrder, POStatus, POItem, SUPPLIERS, StockItem, INITIAL_STOCK } from '../types';
import { cn } from '../lib/utils';

interface POFormProps {
  onAdd: (po: Omit<PurchaseOrder, 'id' | 'createdAt'>) => void;
  onEdit?: (po: PurchaseOrder) => void;
  isOpen: boolean;
  onClose: () => void;
  user: { role: 'ADMIN' | 'SPPG', id: string, name: string };
  initialData?: PurchaseOrder | null;
}

const emptyItem = (): POItem => ({
  id: crypto.randomUUID(),
  nama_barang: '',
  qty: 0,
  grade: 'A',
  harga: 0,
  satuan: 'KG',
  request: '',
});

export default function POForm({ onAdd, onEdit, isOpen, onClose, user, initialData }: POFormProps) {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('master_stock');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setStockItems(parsed);
        } else {
          setStockItems(INITIAL_STOCK);
        }
      } catch (e) {
        setStockItems(INITIAL_STOCK);
      }
    } else {
      setStockItems(INITIAL_STOCK);
    }
  }, []);
  const [formData, setFormData] = useState<Omit<PurchaseOrder, 'id' | 'createdAt'> | PurchaseOrder>({
    no_po: '',
    tanggal_po: new Date().toISOString().split('T')[0],
    po_by: user.name,
    sppg: user.role === 'SPPG' ? user.id : '',
    droping_time: '',
    droping_date: '',
    status: POStatus.VALID,
    items: [emptyItem()],
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        no_po: '',
        tanggal_po: new Date().toISOString().split('T')[0],
        po_by: user.name,
        sppg: user.role === 'SPPG' ? user.id : '',
        droping_time: '',
        droping_date: '',
        status: POStatus.VALID,
        items: [emptyItem()],
      });
    }
  }, [initialData, user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.items.length === 0) {
      alert("Please add at least one item");
      return;
    }
    
    if (initialData && onEdit) {
      onEdit(formData as PurchaseOrder);
    } else {
      onAdd(formData as Omit<PurchaseOrder, 'id' | 'createdAt'>);
    }
    
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const updateItem = (index: number, field: keyof POItem, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i === index) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'nama_barang') {
            const matchedStock = stockItems.find(s => (s.nama_barang || '').toLowerCase() === String(value || '').toLowerCase());
            if (matchedStock) {
              updatedItem.satuan = matchedStock.satuan;
            }
          }
          return updatedItem;
        }
        return item;
      })
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, emptyItem()]
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const totalAmount = formData.items.reduce((sum, item) => sum + ((item.qty || 0) * (item.harga || 0)), 0);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/40 backdrop-blur-sm">
      <div className="flex-1 flex flex-col max-w-6xl w-full mx-auto bg-[#F1F5F9] shadow-2xl overflow-hidden md:my-6 md:rounded-2xl border border-slate-200">
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">P</div>
            <h1 className="text-lg font-bold text-slate-900">{initialData ? 'Edit PO' : 'Input PO Baru (Multi-Item)'}</h1>
          </div>
          <div className="flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button 
              form="po-form"
              type="submit"
              className="px-6 py-2 text-sm font-bold bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
            >
              Simpan PO
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <form id="po-form" onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: PO Info */}
              <div className="lg:col-span-4 lg:sticky lg:top-0 h-fit space-y-6">
                <Section title="Informasi Dokumen" icon={<Info className="w-3.5 h-3.5" />} color="bg-blue-500">
                  <div className="space-y-4">
                    <InputGroup label="Nomor PO">
                      <input
                        required
                        readOnly
                        type="text"
                        name="no_po"
                        value={formData.no_po || 'Akan Diterbitkan'}
                        className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 cursor-not-allowed"
                      />
                    </InputGroup>
                    <InputGroup label="Tanggal PO">
                      <input
                        required
                        type="date"
                        name="tanggal_po"
                        value={formData.tanggal_po}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none"
                      />
                    </InputGroup>
                    <InputGroup label="Dibuat Oleh">
                      <input
                        required
                        type="text"
                        name="po_by"
                        value={formData.po_by}
                        onChange={handleChange}
                        placeholder="Nama Pembuat"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-medium"
                      />
                    </InputGroup>
                  </div>
                </Section>

                <Section title="Logistik" icon={<Truck className="w-3.5 h-3.5" />} color="bg-orange-500">
                  <div className="space-y-4">
                    <InputGroup label="Nomor SPPG">
                      <input
                        type="text"
                        name="sppg"
                        readOnly={user.role === 'SPPG'}
                        value={formData.sppg}
                        onChange={handleChange}
                        placeholder="SPPG-..."
                        className={cn(
                          "w-full px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none",
                          user.role === 'SPPG' && "bg-slate-100 text-slate-500 cursor-not-allowed font-bold"
                        )}
                      />
                    </InputGroup>
                    <div className="grid grid-cols-2 gap-3">
                      <InputGroup label="Tgl Drop">
                        <input
                          type="date"
                          name="droping_date"
                          value={formData.droping_date}
                          onChange={handleChange}
                          className="w-full px-2 py-2 border border-slate-200 rounded-lg text-xs outline-none"
                        />
                      </InputGroup>
                      <InputGroup label="Jam Drop">
                        <input
                          type="time"
                          name="droping_time"
                          value={formData.droping_time}
                          onChange={handleChange}
                          className="w-full px-2 py-2 border border-slate-200 rounded-lg text-xs outline-none"
                        />
                      </InputGroup>
                    </div>
                  </div>
                </Section>

                {user.role === 'ADMIN' && (
                  <div className="bg-slate-900 rounded-xl p-5 text-white shadow-xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Estimasi Total</p>
                    <p className="text-2xl font-black tracking-tight">Rp {totalAmount.toLocaleString('id-ID')}</p>
                  </div>
                )}
              </div>

              {/* Right Column: Items */}
              <div className="lg:col-span-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-slate-400" />
                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">Daftar Barang ({formData.items.length})</h2>
                  </div>
                  <button 
                    type="button"
                    onClick={addItem}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-blue-600 text-xs font-bold rounded-lg hover:bg-slate-50 transition-all shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Tambah Barang
                  </button>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto overflow-y-auto max-h-[500px]">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                          <th className="px-3 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-10">#</th>
                          <th className="px-3 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-[180px]">Barang</th>
                          <th className="px-3 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest w-24">Grade</th>
                          <th className="px-3 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest w-24">Qty</th>
                          <th className="px-3 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest w-24">Satuan</th>
                          {user.role === 'ADMIN' && (
                            <>
                              <th className="px-3 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest w-32">Harga Satuan</th>
                              <th className="px-3 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest w-36">Supplier</th>
                            </>
                          )}
                          <th className="px-3 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-[150px]">Catatan</th>
                          <th className="px-3 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-12"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {formData.items.map((item, index) => (
                          <tr key={item.id} className="group hover:bg-blue-50/10 transition-all align-top">
                            <td className="px-3 py-3 text-center">
                              <span className="text-[10px] font-bold text-slate-400">{index + 1}</span>
                            </td>
                            <td className="px-2 py-2">
                              <select
                                required
                                value={item.nama_barang}
                                onChange={(e) => updateItem(index, 'nama_barang', e.target.value)}
                                className="w-full px-2 py-1.5 border border-slate-100 bg-slate-50 rounded-md text-xs font-bold focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all appearance-none"
                              >
                                <option value="">Pilih...</option>
                                {stockItems.map(stock => (
                                  <option key={stock.id} value={stock.nama_barang}>
                                    {stock.nama_barang}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-2 py-2">
                              <select
                                value={item.grade}
                                onChange={(e) => updateItem(index, 'grade', e.target.value)}
                                className="w-full px-2 py-1.5 border border-slate-100 bg-slate-50 rounded-md text-xs font-bold focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all outline-none appearance-none"
                              >
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                              </select>
                            </td>
                            <td className="px-2 py-2">
                              <input
                                required
                                type="number"
                                value={item.qty}
                                onChange={(e) => updateItem(index, 'qty', Number(e.target.value))}
                                className="w-full px-2 py-1.5 border border-slate-100 bg-slate-50 rounded-md text-xs font-bold outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/10"
                              />
                            </td>
                            <td className="px-2 py-2">
                              <input
                                required
                                type="text"
                                value={item.satuan}
                                onChange={(e) => updateItem(index, 'satuan', e.target.value)}
                                className="w-full px-2 py-1.5 border border-slate-100 bg-slate-50 rounded-md text-xs font-bold outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/10"
                              />
                            </td>
                            {user.role === 'ADMIN' && (
                              <>
                                <td className="px-2 py-2">
                                  <div className="relative">
                                    <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[8px] font-black text-slate-400">Rp.</span>
                                    <input
                                      required
                                      type="number"
                                      value={item.harga}
                                      onChange={(e) => updateItem(index, 'harga', Number(e.target.value))}
                                      className="w-full pl-6 pr-2 py-1.5 border border-slate-100 bg-slate-50 rounded-md text-xs font-bold outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/10"
                                    />
                                  </div>
                                </td>
                                <td className="px-2 py-2">
                                  <select
                                    value={item.supplier || ''}
                                    onChange={(e) => updateItem(index, 'supplier', e.target.value)}
                                    className="w-full px-2 py-1.5 border border-slate-100 bg-slate-50 rounded-md text-xs font-bold focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all outline-none"
                                  >
                                    <option value="">Supplier...</option>
                                    {SUPPLIERS.map(s => (
                                      <option key={s} value={s}>{s}</option>
                                    ))}
                                  </select>
                                </td>
                              </>
                            )}
                            <td className="px-2 py-2">
                              <textarea
                                value={item.request}
                                onChange={(e) => updateItem(index, 'request', e.target.value)}
                                placeholder="Catatan..."
                                className="w-full px-2 py-1.5 border border-slate-100 bg-slate-50 rounded-md text-[10px] font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all outline-none min-h-[34px] resize-none"
                              />
                            </td>
                            <td className="px-3 py-3 text-center">
                              <button 
                                type="button"
                                onClick={() => removeItem(index)}
                                disabled={formData.items.length === 1}
                                className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-all disabled:opacity-0"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        <footer className="bg-white border-t border-slate-200 h-10 px-8 flex items-center justify-between text-[10px] text-slate-500 uppercase tracking-widest font-bold shrink-0">
          <div>Operator: {user.name} • {new Date().toISOString().split('T')[0]}</div>
          <div className="flex gap-6">
            <span>Terminal: #X-882</span>
            <span>Items Loaded: {formData.items.length}</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

function Section({ title, icon, color, children }: { title: string; icon: React.ReactNode; color: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
      <div className="flex items-center gap-2 mb-5 pb-3 border-b border-slate-50">
        <div className={cn("w-1 h-3 rounded-full", color)} />
        <div className="flex items-center gap-2">
          <span className="p-1 flex items-center justify-center rounded bg-slate-50 text-slate-400">
            {icon}
          </span>
          <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{title}</h2>
        </div>
      </div>
      {children}
    </div>
  );
}

function InputGroup({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">{label}</label>
      {children}
    </div>
  );
}
