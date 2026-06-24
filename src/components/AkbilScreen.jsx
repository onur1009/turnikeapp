import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';

const AkbilScreen = ({ onBack }) => {
  const { balance, addBalance } = useGameStore();
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const formattedBalance = (balance / 100).toFixed(2);

  return (
    <main className="flex-1 w-full flex flex-col p-6 pb-20 relative z-10 fade-in items-center justify-center">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={onBack} className="capsule">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          </button>
          <h2 className="text-white text-lg font-black tracking-widest uppercase mr-10" style={{ fontFamily: "'Orbitron', monospace" }}>
            İSTANBULKART
          </h2>
        </div>

        {/* Akbil Card */}
        <div 
          className="w-full aspect-[1.586/1] rounded-2xl p-6 flex flex-col justify-between shadow-[0_20px_40px_rgba(0,0,0,0.5)] mb-8 relative overflow-hidden transition-transform hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, #1d4ed8, #1e3a8a)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          {/* Card Decorations */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-white/5" />
          
          <div className="flex justify-between items-start relative z-10">
            <span className="material-symbols-outlined text-white/80 text-[32px]">subway</span>
            <div className="px-2 py-1 bg-white/10 rounded font-black text-white/50 text-[10px] tracking-widest">A.Ş.</div>
          </div>

          <div className="relative z-10">
            <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-1">Kullanılabilir Bakiye</p>
            <div className="flex items-end gap-2">
              <span className="text-white text-5xl font-black tracking-tighter">₺{formattedBalance}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button 
            disabled={isWatchingAd}
            onClick={() => {
              setIsWatchingAd(true);
              setTimeout(() => {
                addBalance(50);
                setIsWatchingAd(false);
              }, 3000);
            }}
            className={`w-full py-4 rounded-xl font-bold text-white text-sm tracking-wide bg-blue-600 hover:bg-blue-500 transition-colors flex items-center justify-center gap-2 ${isWatchingAd ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <span className="material-symbols-outlined text-[20px]">
              {isWatchingAd ? 'hourglass_empty' : 'play_circle'}
            </span>
            {isWatchingAd ? 'Reklam İzleniyor...' : 'Reklam İzle (+₺0.50)'}
          </button>
          
          <button 
            onClick={() => setShowHistory(true)}
            className="w-full py-4 rounded-xl font-bold text-white/80 text-sm tracking-wide bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[20px]">history</span>
            Geçmiş İşlemler
          </button>
        </div>

        {/* History Modal */}
        {showHistory && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm fade-in px-4">
            <div className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative">
              <button 
                onClick={() => setShowHistory(false)}
                className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
              <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-400">history</span>
                Son İşlemler
              </h3>
              <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2">
                {/* Mock Transactions */}
                <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                  <div>
                    <p className="text-white/90 text-sm font-medium">Video İzleme Ödülü</p>
                    <p className="text-white/40 text-xs">Bugün</p>
                  </div>
                  <span className="text-green-400 font-bold">+₺0.50</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                  <div>
                    <p className="text-white/90 text-sm font-medium">Kelime Bulma (Hızlı)</p>
                    <p className="text-white/40 text-xs">Bugün</p>
                  </div>
                  <span className="text-green-400 font-bold">+₺2.00</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                  <div>
                    <p className="text-white/90 text-sm font-medium">Otomatik Bul (Kopya)</p>
                    <p className="text-white/40 text-xs">Bugün</p>
                  </div>
                  <span className="text-red-400 font-bold">-₺0.75</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                  <div>
                    <p className="text-white/90 text-sm font-medium">Kusursuz Sefer</p>
                    <p className="text-white/40 text-xs">Dün</p>
                  </div>
                  <span className="text-green-400 font-bold">+₺0.50</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default AkbilScreen;
