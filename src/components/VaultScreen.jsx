import React from 'react';
import { useGameStore, VAULT_REWARD } from '../store/gameStore';
import { formatKurus } from '../utils/format';
import ScreenHeader from './ScreenHeader';

const VaultScreen = ({ onBack }) => {
  const vaultWords = useGameStore(state => state.vaultWords);
  const maxCapacity = 10;
  const currentCount = vaultWords.length;
  const progressPercent = (currentCount / maxCapacity) * 100;

  return (
    <div className="flex-1 w-full flex flex-col items-center relative z-20 fade-in pb-6 px-4">
      <ScreenHeader title="Kasa" onBack={onBack} className="px-0 pt-6 mb-6 max-w-sm" />

      {/* Kasa Görseli */}
      <div className="relative mb-8 mt-4">
        {/* Işıma */}
        <div className="absolute inset-0 bg-green-500/20 rounded-full blur-[60px]"></div>
        
        <div 
          className="relative w-48 h-48 rounded-full flex flex-col items-center justify-center border-4"
          style={{
            background: 'radial-gradient(circle at 30% 30%, #153315, #081108)',
            borderColor: currentCount === maxCapacity ? '#4ade80' : '#22c55e',
            boxShadow: 'inset 0 0 40px rgba(0,0,0,0.8), 0 0 30px rgba(34,197,94,0.3)',
          }}
        >
          <span aria-hidden="true" className="material-symbols-outlined text-[80px] mb-2" style={{ color: '#4ade80', fontVariationSettings: "'FILL' 1" }}>
            account_balance_wallet
          </span>
          <div className="text-2xl font-black text-white" style={{ fontFamily: "'Orbitron', monospace" }}>
            {currentCount} / {maxCapacity}
          </div>
        </div>
      </div>

      {/* Kasa İlerleme Barı */}
      <div className="w-full max-w-xs mb-8">
        <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden relative" style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)' }}>
          <div 
            className="h-full bg-green-500 transition-all duration-1000 ease-out relative"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white/40"></div>
          </div>
        </div>
        <p className="text-center text-white/50 text-xs font-bold mt-3 uppercase tracking-wider">
          Kasanın kırılmasına <span className="text-green-400">{maxCapacity - currentCount}</span> kelime kaldı!
        </p>
      </div>

      {/* Kelimeler Listesi */}
      <div className="w-full max-w-sm flex-1 bg-black/40 rounded-3xl border border-white/5 p-5 overflow-y-auto">
        <h3 className="text-white/60 text-[11px] font-black tracking-[3px] mb-4 uppercase">
          Biriken Kelimeler
        </h3>
        
        {currentCount === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 opacity-50">
            <span aria-hidden="true" className="material-symbols-outlined text-4xl mb-2 text-white/40">search_off</span>
            <p className="text-white/60 text-sm font-bold text-center">Henüz ekstra kelime bulmadın.</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {vaultWords.map((word, i) => (
              <div 
                key={i}
                className="px-4 py-2 rounded-xl border font-bold text-sm tracking-widest fade-in"
                style={{
                  background: 'rgba(34,197,94,0.1)',
                  borderColor: 'rgba(34,197,94,0.3)',
                  color: '#4ade80',
                  animationDelay: `${i * 0.05}s`
                }}
              >
                {word}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Kural Uyarısı */}
      <div className="w-full max-w-sm mt-6 p-4 rounded-2xl bg-white/5 border border-white/5 flex items-start gap-3">
        <span aria-hidden="true" className="material-symbols-outlined text-yellow-500 text-[20px]">info</span>
        <p className="text-white/60 text-[12px] leading-relaxed font-bold">
          Bulmacada yer almayan ama sözlükte bulunan (geçerli) her kelime Kasaya eklenir. Kasa dolduğunda anında <span className="text-green-400">{formatKurus(VAULT_REWARD)} bakiye</span> kazanırsınız!
        </p>
      </div>

    </div>
  );
};

export default VaultScreen;
