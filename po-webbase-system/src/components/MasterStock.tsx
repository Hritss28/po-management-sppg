import React, { useState, useEffect } from 'react';
import { StockItem, INITIAL_STOCK } from '../types';
import { Search, Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function MasterStock() {
  const [items, setItems] = useState<StockItem[]>(() => {
    const saved = localStorage.getItem('master_stock');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        return INITIAL_STOCK;
      }
    }
    return INITIAL_STOCK;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  const [formData, setFormData] = useState({
    nama_barang: '',
    satuan: ''
  });

  useEffect(() => {
    localStorage.setItem('master_stock', JSON.stringify(items));
  }, [items]);

  const handleSave = () => {
    if (!formData.nama_barang.trim()) return;

    if (editingItem) {
      setItems(items.map(item => 
        item.id === editingItem.id ? { ...item, ...formData } : item
      ));
      setEditingItem(null);
    } else {
      const newItem: StockItem = {
        id: `stock-${Date.now()}`,
        nama_barang: formData.nama_barang,
        satuan: formData.satuan
      };
      setItems([...items, newItem]);
      setIsAdding(false);
    }
    setFormData({ nama_barang: '', satuan: '' });
  };

  const handleEdit = (item: StockItem) => {
    setEditingItem(item);
    setFormData({ nama_barang: item.nama_barang, satuan: item.satuan });
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus item ini dari master stok?')) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const handleCancel = () => {
    setEditingItem(null);
    setIsAdding(false);
    setFormData({ nama_barang: '', satuan: '' });
  };

  const filteredItems = items.filter(item => 
    (item.nama_barang || '').toLowerCase().includes((searchQuery || '').toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-slate-50 p-6 space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col md:flex-row gap-4 items-center justify-between z-10">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari nama barang..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-medium transition-all"
          />
        </div>
        <button 
          onClick={() => {
            setIsAdding(true);
            setEditingItem(null);
            setFormData({ nama_barang: '', satuan: '' });
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-blue-700 transition flex items-center gap-2 uppercase tracking-wide whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Tambah Barang
        </button>
      </div>

      <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1 h-full">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200">
              <tr>
                <th className="py-3 px-6 text-xs font-bold uppercase tracking-widest text-slate-500 w-16">No</th>
                <th className="py-3 px-6 text-xs font-bold uppercase tracking-widest text-slate-500">Nama Barang</th>
                <th className="py-3 px-6 text-xs font-bold uppercase tracking-widest text-slate-500 w-32">Satuan</th>
                <th className="py-3 px-6 text-xs font-bold uppercase tracking-widest text-slate-500 text-right w-32">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence>
                {isAdding && (
                  <motion.tr 
                    initial={{ opacity: 0, backgroundColor: '#f0f9ff' }}
                    animate={{ opacity: 1, backgroundColor: '#f0f9ff' }}
                    exit={{ opacity: 0 }}
                  >
                    <td className="py-3 px-6 text-sm text-slate-400 text-center">-</td>
                    <td className="py-3 px-6">
                      <input 
                        type="text"
                        autoFocus
                        value={formData.nama_barang}
                        onChange={e => setFormData({ ...formData, nama_barang: e.target.value })}
                        className="w-full px-3 py-1.5 border border-blue-200 rounded text-sm focus:outline-none focus:border-blue-400"
                        placeholder="Nama Barang..."
                      />
                    </td>
                    <td className="py-3 px-6">
                      <input 
                        type="text"
                        value={formData.satuan}
                        onChange={e => setFormData({ ...formData, satuan: e.target.value })}
                        className="w-full px-3 py-1.5 border border-blue-200 rounded text-sm uppercase focus:outline-none focus:border-blue-400"
                        placeholder="Satuan"
                      />
                    </td>
                    <td className="py-3 px-6 text-right">
                      <div className="flex gap-2 justify-end">
                        <button onClick={handleSave} className="p-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200" title="Simpan">
                          <Save className="w-4 h-4" />
                        </button>
                        <button onClick={handleCancel} className="p-1.5 bg-slate-200 text-slate-600 rounded hover:bg-slate-300" title="Batal">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                )}
                {filteredItems.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition duration-150">
                    <td className="py-3 px-6 text-sm font-medium text-slate-400 text-center">{idx + 1}</td>
                    <td className="py-3 px-6">
                      {editingItem?.id === item.id ? (
                        <input 
                          type="text"
                          autoFocus
                          value={formData.nama_barang}
                          onChange={e => setFormData({ ...formData, nama_barang: e.target.value })}
                          className="w-full px-3 py-1.5 border border-blue-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      ) : (
                        <span className="text-sm font-bold text-slate-800">{item.nama_barang}</span>
                      )}
                    </td>
                    <td className="py-3 px-6">
                      {editingItem?.id === item.id ? (
                        <input 
                          type="text"
                          value={formData.satuan}
                          onChange={e => setFormData({ ...formData, satuan: e.target.value })}
                          className="w-full px-3 py-1.5 border border-blue-300 rounded text-sm uppercase focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      ) : (
                        <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200 uppercase">{item.satuan}</span>
                      )}
                    </td>
                    <td className="py-3 px-6 text-right">
                      {editingItem?.id === item.id ? (
                        <div className="flex gap-2 justify-end">
                          <button onClick={handleSave} className="p-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200" title="Simpan">
                            <Save className="w-4 h-4" />
                          </button>
                          <button onClick={handleCancel} className="p-1.5 bg-slate-200 text-slate-600 rounded hover:bg-slate-300" title="Batal">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity" style={{ opacity: 1 }}>
                          <button onClick={() => handleEdit(item)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Edit">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Hapus">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          
          {filteredItems.length === 0 && !isAdding && (
             <div className="flex flex-col items-center justify-center p-12 text-slate-400">
               <div className="p-4 bg-slate-50 rounded-full mb-4">
                 <Search className="w-6 h-6 text-slate-300" />
               </div>
               <p className="font-bold text-slate-500 mb-1">Tidak ada item ditemukan</p>
               <p className="text-sm text-center max-w-sm">Barang tidak tersedia di master stok.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
