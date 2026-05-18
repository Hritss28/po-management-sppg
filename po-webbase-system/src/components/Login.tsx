import React, { useState } from 'react';
import { LogIn, Shield, User as UserIcon, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginProps {
  onLogin: (role: 'ADMIN' | 'SPPG', id: string, name: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [sppgId, setSppgId] = useState('');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const handleSppgLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (sppgId.trim()) {
      onLogin('SPPG', sppgId.trim().toUpperCase(), sppgId.trim());
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminUsername.trim() && adminPassword.trim()) {
      onLogin('ADMIN', 'admin', 'System Manager');
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col items-center justify-center p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
      >
        <div className="p-10">
          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-blue-500/20">P</div>
            <span className="text-3xl font-black tracking-tighter text-slate-900 italic">ProcureX</span>
          </div>

          <div className="text-center mb-10">
            <h1 className="text-2xl font-black text-slate-900 mb-2 leading-tight">Selamat Datang</h1>
            <p className="text-slate-500 text-sm font-medium">Silakan masuk untuk mengakses sistem <br/>Manajemen Purchase Order</p>
          </div>

          <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-10">
            <button
              onClick={() => setIsAdminMode(false)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black transition-all ${
                !isAdminMode ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5" />
              PORTAL SPPG
            </button>
            <button
              onClick={() => setIsAdminMode(true)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black transition-all ${
                isAdminMode ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              ADMIN / MANAGER
            </button>
          </div>

          {!isAdminMode ? (
            <form onSubmit={handleSppgLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">ID Unit / Lokasi SPPG</label>
                <div className="relative group">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    required
                    autoFocus
                    type="text"
                    placeholder="Contoh: Balongsari"
                    value={sppgId}
                    onChange={(e) => setSppgId(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm font-bold transition-all placeholder:text-slate-300"
                  />
                </div>
              </div>
              
              <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl text-[10px] text-blue-600/80 font-bold leading-relaxed">
                <p>💡 Masukkan nama lokasi SPPG anda untuk memulai pengajuan purchase order baru.</p>
              </div>

              <button
                type="submit"
                className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group"
              >
                MULAI PENGADAAN
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleAdminLogin} className="space-y-6">
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl mb-2">
                <p className="text-[10px] text-slate-400 font-black uppercase mb-2 tracking-widest">Informasi Akses</p>
                <p className="text-[11px] text-slate-100/70 leading-relaxed font-medium mb-3">Akses khusus manajemen untuk verifikasi harga, pembuatan invoice, dan pemantauan real-time.</p>
                <div className="flex gap-4 border-t border-slate-800 pt-3">
                  <div>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Username</p>
                    <p className="text-xs text-white font-black">admin</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Password</p>
                    <p className="text-xs text-white font-black">admin123</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Nama Pengguna</label>
                  <div className="relative group">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                    <input
                      required
                      type="text"
                      placeholder="Username Admin"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 text-sm font-bold transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Kata Sandi</label>
                  <div className="relative group">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                    <input
                      required
                      type="password"
                      placeholder="••••••••"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 text-sm font-bold transition-all"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group"
              >
                AUTENTIKASI MANAGER
                <LogIn className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          )}
        </div>
        
        <div className="bg-slate-50 border-t border-slate-100 p-8 flex items-center justify-center">
          <div className="flex items-center gap-6 text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">
            <span>SecID: #882-SYS</span>
            <span className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
            <span>Ver: 2.1.0</span>
          </div>
        </div>
      </motion.div>
      
      <p className="mt-10 text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">
        Sistem Terintegrasi v2.1 • Enterprise Grade
      </p>
    </div>
  );
}
