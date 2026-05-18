import React, { useState, useRef } from 'react';
import { X, Camera, Package, Truck, Calendar, User, Info, CheckCircle2, Printer } from 'lucide-react';
import { PurchaseOrder, DeliveryInfo, SUPPLIERS } from '../types';
import { cn, compressImage } from '../lib/utils';
import SuratJalanPreviewModal from './SuratJalanPreviewModal';

interface SuratJalanFormProps {
  po: PurchaseOrder;
  onClose: () => void;
  onSave: (delivery: DeliveryInfo, updatedItems?: any[]) => void;
  userRole: 'ADMIN' | 'SPPG';
}

export default function SuratJalanForm({ po, onClose, onSave, userRole }: SuratJalanFormProps) {
  const [items, setItems] = useState(po.items || []);
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState<DeliveryInfo>(po.delivery || {
    suratJalanNo: `SJ/${new Date().getFullYear()}/${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
    photoUrl: '',
    notes: '',
    deliveryDate: new Date().toISOString().split('T')[0],
    deliveredBy: '',
    itemPhotos: {},
    kepada: po.delivery?.kepada || po.sppg || '',
    kd_sppg: po.delivery?.kd_sppg || '',
    nama_sppg: po.delivery?.nama_sppg || po.sppg || '',
    pj_sppg: po.delivery?.pj_sppg || '',
    no_wa: po.delivery?.no_wa || '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const itemFileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file);
        setFormData(prev => ({ ...prev, photoUrl: compressed }));
      } catch (err) {
        console.error("Compression failed", err);
      }
    }
  };

  const handleItemPhotoUpload = async (itemId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 400); // smaller size for items
        setFormData(prev => ({
          ...prev,
          itemPhotos: {
            ...prev.itemPhotos,
            [itemId]: compressed
          }
        }));
      } catch (err) {
        console.error("Compression failed", err);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mandatory photo check for couriers (Admin role used by couriers)
    if (!formData.photoUrl && userRole === 'ADMIN') {
      alert('WAJIB: Kurir harus mengambil/upload foto bukti pengiriman sebelum menyimpan!');
      return;
    }

    onSave(formData, items);
  };

  const updateItemSupplier = (itemId: string, supplier: string) => {
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, supplier } : item
    ));
  };

  const updateItemDetail = (itemId: string, field: 'qty' | 'harga', value: number) => {
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, [field]: value } : item
    ));
  };

  const handlePrint = () => {
    setShowPreview(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/40 backdrop-blur-sm p-4 md:p-8">
      {showPreview && (
        <SuratJalanPreviewModal
          po={po}
          formData={formData}
          items={items}
          onClose={() => setShowPreview(false)}
        />
      )}

      <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto bg-[#F1F5F9] shadow-2xl overflow-hidden rounded-2xl border border-slate-200">
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Truck className="w-6 h-6 text-blue-600" />
            <h1 className="text-lg font-bold text-slate-900">
              {po.delivery ? `Detail Surat Jalan: ${po.delivery.suratJalanNo}` : `Buat Surat Jalan: ${po.no_po}`}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-200 transition-all border border-slate-200"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak PDF
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div id="sj-print-content" className="flex-1 overflow-y-auto p-8">
          <form id="sj-form" onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Delivery Details */}
              <div className="space-y-6">
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                      <Info className="w-3.5 h-3.5" />
                      Detail Pengiriman & Rekap Supplier
                    </h3>

                    {/* Summary of assigned suppliers */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {Array.from(new Set((po.items || []).map(i => i.supplier).filter(Boolean))).map(s => (
                        <div key={s} className="px-2 py-1 bg-blue-50 border border-blue-100 rounded text-[9px] font-black text-blue-600 uppercase tracking-tighter">
                          Unit Pelaksana: {s}
                        </div>
                      ))}
                      {(po.items || []).some(i => !i.supplier) && (
                        <div className="px-2 py-1 bg-rose-50 border border-rose-100 rounded text-[9px] font-black text-rose-600 uppercase tracking-tighter">
                          Ada Item Tanpa Supplier
                        </div>
                      )}
                    </div>
                  
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Kepada</label>
                      <input 
                        required
                        readOnly={userRole !== 'ADMIN'}
                        type="text"
                        placeholder="Nama Instansi / Penerima"
                        value={formData.kepada}
                        onChange={(e) => setFormData(prev => ({ ...prev, kepada: e.target.value }))}
                        className={cn(
                          "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none",
                          userRole !== 'ADMIN' && "bg-slate-100 text-slate-500"
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">KD SPPG</label>
                        <input 
                          readOnly={userRole !== 'ADMIN'}
                          type="text"
                          placeholder="Kode SPPG"
                          value={formData.kd_sppg}
                          onChange={(e) => setFormData(prev => ({ ...prev, kd_sppg: e.target.value }))}
                          className={cn(
                            "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none",
                            userRole !== 'ADMIN' && "bg-slate-100 text-slate-500"
                          )}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Nama SPPG</label>
                        <input 
                          readOnly={userRole !== 'ADMIN'}
                          type="text"
                          placeholder="Nama SPPG"
                          value={formData.nama_sppg}
                          onChange={(e) => setFormData(prev => ({ ...prev, nama_sppg: e.target.value }))}
                          className={cn(
                            "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none",
                            userRole !== 'ADMIN' && "bg-slate-100 text-slate-500"
                          )}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">PJ SPPG</label>
                        <input 
                          readOnly={userRole !== 'ADMIN'}
                          type="text"
                          placeholder="Penanggung Jawab"
                          value={formData.pj_sppg}
                          onChange={(e) => setFormData(prev => ({ ...prev, pj_sppg: e.target.value }))}
                          className={cn(
                            "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none",
                            userRole !== 'ADMIN' && "bg-slate-100 text-slate-500"
                          )}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">No. WhatsApp</label>
                        <input 
                          readOnly={userRole !== 'ADMIN'}
                          type="text"
                          placeholder="0812..."
                          value={formData.no_wa}
                          onChange={(e) => setFormData(prev => ({ ...prev, no_wa: e.target.value }))}
                          className={cn(
                            "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none",
                            userRole !== 'ADMIN' && "bg-slate-100 text-slate-500"
                          )}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">No Surat Jalan</label>
                      <input 
                        required
                        readOnly={userRole !== 'ADMIN'}
                        type="text"
                        value={formData.suratJalanNo}
                        onChange={(e) => setFormData(prev => ({ ...prev, suratJalanNo: e.target.value }))}
                        className={cn(
                          "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none",
                          userRole !== 'ADMIN' && "bg-slate-100 text-slate-500"
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Tanggal Kirim</label>
                        <input 
                          required
                          readOnly={userRole !== 'ADMIN'}
                          type="date"
                          value={formData.deliveryDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, deliveryDate: e.target.value }))}
                          className={cn(
                            "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none",
                            userRole !== 'ADMIN' && "bg-slate-100 text-slate-500"
                          )}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Nama Driver/Kurir</label>
                        <input 
                          required
                          readOnly={userRole !== 'ADMIN'}
                          type="text"
                          placeholder="Nama Pengirim"
                          value={formData.deliveredBy}
                          onChange={(e) => setFormData(prev => ({ ...prev, deliveredBy: e.target.value }))}
                          className={cn(
                            "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none",
                            userRole !== 'ADMIN' && "bg-slate-100 text-slate-500"
                          )}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Keterangan Barang Terkirim</label>
                      <textarea 
                        rows={3}
                        readOnly={userRole !== 'ADMIN'}
                        value={formData.notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Contoh: Barang telah diterima lengkap sesuai PO..."
                        className={cn(
                          "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-4 focus:ring-blue-500/10 outline-none min-h-[80px]",
                          userRole !== 'ADMIN' && "bg-slate-100 text-slate-500"
                        )}
                      />
                    </div>
                </div>
              </div>

              {/* Photo Proof */}
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center min-h-[250px] relative">
                  <h3 className="absolute top-4 left-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Camera className="w-3.5 h-3.5" />
                    Upload Foto Bukti/Drop Barang
                  </h3>
                  
                  {formData.photoUrl ? (
                    <div className="w-full h-full p-2">
                      <img src={formData.photoUrl} alt="Bukti Drop" className="w-full max-h-[300px] object-contain rounded-lg border border-slate-100" />
                      {userRole === 'ADMIN' && (
                        <button 
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, photoUrl: '' }))}
                          className="mt-3 w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-rose-100"
                        >
                          Hapus & Ganti Foto
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center space-y-4">
                      <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 border border-slate-100 mx-auto">
                        <Camera className="w-10 h-10" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">Belum ada foto bukti</p>
                        <p className="text-[10px] text-slate-500 font-medium mt-1">
                          {userRole === 'ADMIN' ? 'Gunakan foto dokumen fisik SJ atau foto barang saat di drop.' : 'Menunggu update foto dari pengirim.'}
                        </p>
                      </div>
                      {userRole === 'ADMIN' && (
                        <button 
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-6 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-blue-700 transition-all"
                        >
                          Ambil / Pilih Foto
                        </button>
                      )}
                    </div>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    hidden 
                    accept="image/*" 
                    onChange={handlePhotoUpload} 
                  />
                </div>

                <div className="bg-emerald-600 rounded-xl p-5 text-white flex items-center gap-4 shadow-lg shadow-emerald-100">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-tight">Siap Kirim</h4>
                    <p className="text-[10px] font-bold text-white/80">Status PO akan berubah menjadi dikirim otomatis.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Items List (Read Only) */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                <Package className="w-4 h-4 text-slate-400" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Daftar Barang dalam Surat Jalan</h3>
              </div>
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                    <th className="px-6 py-3">Nama Barang</th>
                    <th className="px-6 py-3 text-center">Qty Aktual</th>
                    <th className="px-6 py-3">Satuan</th>
                    {userRole === 'ADMIN' && <th className="px-6 py-3 text-right">Harga Satuan</th>}
                    <th className="px-6 py-3">Supplier</th>
                    <th className="px-6 py-3">Catatan / Request</th>
                    <th className="px-6 py-3 text-right">Foto Bukti Barang</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {(items || []).map((item) => (
                    <tr key={item.id} className="text-sm">
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-900">{item.nama_barang}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {userRole === 'ADMIN' ? (
                          <input 
                            type="number"
                            value={item.qty}
                            onChange={(e) => updateItemDetail(item.id, 'qty', Number(e.target.value))}
                            className="w-16 px-2 py-1 text-xs font-black text-center bg-white border border-slate-200 rounded-md outline-none focus:border-blue-500"
                          />
                        ) : (
                          <span className="text-xs font-black text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">{item.qty}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">{item.satuan}</span>
                      </td>
                      {userRole === 'ADMIN' && (
                        <td className="px-6 py-4 text-right">
                          <div className="relative inline-block">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400">Rp</span>
                            <input 
                              type="number"
                              value={item.harga}
                              onChange={(e) => updateItemDetail(item.id, 'harga', Number(e.target.value))}
                              className="w-24 pl-6 pr-2 py-1 text-xs font-black text-right bg-white border border-slate-200 rounded-md outline-none focus:border-blue-500"
                            />
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4">
                        {userRole === 'ADMIN' ? (
                          <select
                            value={item.supplier || ''}
                            onChange={(e) => updateItemSupplier(item.id, e.target.value)}
                            className="text-[10px] font-black uppercase tracking-tight px-2 py-1.5 rounded bg-slate-50 border border-slate-200 outline-none focus:border-blue-500"
                          >
                            <option value="">Pilih Supplier</option>
                            {SUPPLIERS.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        ) : (
                          <span className={cn(
                            "text-[10px] font-black uppercase tracking-tight px-2 py-0.5 rounded",
                            item.supplier ? "bg-blue-50 text-blue-600 border border-blue-100" : "bg-slate-100 text-slate-400"
                          )}>
                            {item.supplier || 'BELUM DITUGASKAN'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] text-slate-500 font-medium">{item.request || '-'}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          {formData.itemPhotos?.[item.id] ? (
                            <div className="relative group">
                              <img 
                                src={formData.itemPhotos[item.id]} 
                                alt="Item Proof" 
                                className="w-10 h-10 object-cover rounded border border-slate-200"
                              />
                              {userRole === 'ADMIN' && (
                                <button 
                                  type="button"
                                  onClick={() => setFormData(prev => {
                                    const newPhotos = { ...prev.itemPhotos };
                                    delete newPhotos[item.id];
                                    return { ...prev, itemPhotos: newPhotos };
                                  })}
                                  className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-500 text-white rounded-full flex items-center justify-center scale-0 group-hover:scale-100 transition-transform"
                                >
                                  <X className="w-2 h-2" />
                                </button>
                              )}
                            </div>
                          ) : (
                            userRole === 'ADMIN' ? (
                              <button 
                                type="button"
                                onClick={() => itemFileInputRefs.current[item.id]?.click()}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold hover:bg-slate-200 transition-colors"
                              >
                                <Camera className="w-3 h-3" />
                                Ambil Foto
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">Tidak ada foto</span>
                            )
                          )}
                          <input 
                            type="file" 
                            accept="image/*"
                            ref={el => itemFileInputRefs.current[item.id] = el}
                            className="hidden"
                            onChange={(e) => handleItemPhotoUpload(item.id, e)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </form>
        </div>

        <footer className="h-20 bg-white border-t border-slate-200 px-8 flex items-center justify-between shrink-0">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {userRole === 'ADMIN' ? 'Pastikan data barang sudah benar sebelum disimpan.' : 'Mode Lihat Saja: Anda hanya dapat memantau status pengiriman.'}
          </p>
          <div className="flex gap-4">
            <button onClick={onClose} className="px-6 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
              {userRole === 'ADMIN' ? 'Batal' : 'Tutup'}
            </button>
            {userRole === 'ADMIN' && (
              <button 
                form="sj-form"
                className="px-8 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
              >
                Simpan & Update Status Pengiriman
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}
