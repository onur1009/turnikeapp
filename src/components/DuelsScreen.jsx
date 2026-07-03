import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';

const DuelsScreen = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'new'
  const username = useGameStore(state => state.username);

  return (
    <div className="flex-1 w-full flex flex-col items-center bg-[#0f172a] relative z-20 fade-in pt-8 pb-6 px-4 min-h-screen">
      {/* Üst Kısım */}
      <div className="w-full flex items-center justify-between mb-6 max-w-sm px-2">
        <button onClick={onBack} className="p-3 bg-white/5 rounded-full border border-white/10 active:scale-95 transition-all text-white">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-xl font-black text-white tracking-widest font-orbitron text-center flex-1">
          DÜELLOLAR
        </h2>
        <div className="w-[50px]"></div>
      </div>

      {/* Profil Bilgisi */}
      <div className="w-full max-w-sm mb-6 p-4 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-green-500/20 border border-green-400 flex items-center justify-center">
            <span className="material-symbols-outlined text-green-400">person</span>
          </div>
          <div>
            <div className="text-white font-bold">{username || 'Oyuncu'}</div>
            <div className="text-white/50 text-[11px] uppercase tracking-wider font-bold">12 Galibiyet</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-yellow-400 font-black text-lg">1450</div>
          <div className="text-yellow-400/50 text-[10px] tracking-widest font-bold">PUAN</div>
        </div>
      </div>

      {/* Tablar */}
      <div className="flex w-full max-w-sm bg-white/5 p-1 rounded-full mb-6">
        <button 
          onClick={() => setActiveTab('active')}
          className={`flex-1 py-2 rounded-full font-bold text-sm transition-all ${activeTab === 'active' ? 'bg-green-600 text-white shadow-[0_0_10px_rgba(22,163,74,0.5)]' : 'text-white/50 hover:text-white/80'}`}
        >
          Aktif Düellolar
        </button>
        <button 
          onClick={() => setActiveTab('new')}
          className={`flex-1 py-2 rounded-full font-bold text-sm transition-all ${activeTab === 'new' ? 'bg-green-600 text-white shadow-[0_0_10px_rgba(22,163,74,0.5)]' : 'text-white/50 hover:text-white/80'}`}
        >
          Yeni Başlat
        </button>
      </div>

      {/* İçerik */}
      <div className="flex-1 w-full max-w-sm overflow-y-auto">
        {activeTab === 'active' ? (
          <div className="flex flex-col gap-3">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between opacity-50 grayscale">
              <div>
                <h3 className="text-white font-bold">Ahmet (Sıra Bekleniyor)</h3>
                <p className="text-white/50 text-[11px] mt-1">Son hamle: 2 saat önce</p>
              </div>
              <span className="material-symbols-outlined text-white/30 text-3xl">hourglass_empty</span>
            </div>

            <div className="p-4 rounded-2xl bg-green-900/20 border border-green-500/30 flex items-center justify-between animate-pulse-soft relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
              <div>
                <h3 className="text-white font-bold">Zeynep <span className="text-green-400 text-xs ml-2">SIRA SENDE!</span></h3>
                <p className="text-white/50 text-[11px] mt-1">Kalan Süre: 14s 23dk</p>
              </div>
              <button className="px-4 py-2 bg-green-600 rounded-full font-bold text-xs text-white shadow-lg shadow-green-500/30 active:scale-95">
                OYNA
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center h-48 opacity-70">
            <span className="material-symbols-outlined text-5xl text-white/30 mb-4">search</span>
            <p className="text-white font-bold mb-2">Rastgele Rakip Bul</p>
            <p className="text-white/50 text-xs mb-4">Seviyene uygun bir oyuncu aranacak.</p>
            <button className="px-6 py-3 bg-green-600 rounded-full font-bold text-white shadow-[0_0_15px_rgba(22,163,74,0.4)] active:scale-95 flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined">rocket_launch</span>
              HEMEN EŞLEŞ
            </button>
            <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-full font-bold text-sm text-white/70 active:scale-95 transition-all hover:bg-white/10">
              ARKADAŞINI DAVET ET
            </button>
          </div>
        )}
      </div>

      {/* Phase 4 Bilgi Notu */}
      <div className="w-full max-w-sm mt-4 p-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-center">
        <p className="text-green-400 text-xs font-bold leading-relaxed">
          Ulaşım Düelloları sistemi V1.4 güncellemesiyle tam kapasite devreye girecektir.
        </p>
      </div>

    </div>
  );
};

export default DuelsScreen;
