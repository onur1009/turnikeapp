import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Haptics, NotificationType } from '@capacitor/haptics';

const PRIZES = [
  { label: '100₺', type: 'money', value: 10000, color: '#22c55e', icon: 'payments', line: 'M2' },     // Yeşil
  { label: '1 Can', type: 'life', value: 1, color: '#ef4444', icon: 'favorite', line: 'M1' },        // Kırmızı
  { label: '50₺', type: 'money', value: 5000, color: '#eab308', icon: 'toll', line: 'METROBÜS' },    // Sarı
  { label: 'İpucu', type: 'hint', value: 1, color: '#3b82f6', icon: 'lightbulb', line: 'VAPUR' },    // Mavi
  { label: '150₺', type: 'money', value: 15000, color: '#1d4ed8', icon: 'diamond', line: 'T1' },      // Lacivert
  { label: 'Pas', type: 'none', value: 0, color: '#64748b', icon: 'block', line: 'MARMARAY' },       // Gri
];

const DailySpinScreen = ({ onComplete }) => {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [prize, setPrize] = useState(null);
  
  const { addBalance, addLives, addHints, setLastSpinDate } = useGameStore();

  const handleSpin = () => {
    if (spinning) return;
    setSpinning(true);
    Haptics.notification({ type: NotificationType.Warning }).catch(() => {});

    // Rastgele bir ödül seç (pas gelme ihtimali düşük)
    const weights = [0.15, 0.15, 0.3, 0.2, 0.1, 0.1];
    let rand = Math.random();
    let selectedIndex = 0;
    let sum = 0;
    for (let i = 0; i < weights.length; i++) {
      sum += weights[i];
      if (rand <= sum) {
        selectedIndex = i;
        break;
      }
    }

    const segments = PRIZES.length;
    const degreesPerSegment = 360 / segments;
    // Çarkın ibresi tepede. Seçilen dilimin merkeze gelmesi için hesaplama
    const targetRotation = (360 * 6) + (360 - (selectedIndex * degreesPerSegment));
    
    setRotation(targetRotation);

    setTimeout(() => {
      setSpinning(false);
      const wonPrize = PRIZES[selectedIndex];
      setPrize(wonPrize);
      Haptics.notification({ type: NotificationType.Success }).catch(() => {});
      
      // Ödülü ver
      if (wonPrize.type === 'money') {
        addBalance(wonPrize.value);
      } else if (wonPrize.type === 'life') {
        addLives(wonPrize.value);
      } else if (wonPrize.type === 'hint') {
        addHints(wonPrize.value);
      }
      
      // Bugünün tarihini kaydet
      setLastSpinDate(new Date().toLocaleDateString());

      setTimeout(() => {
        onComplete();
      }, 3500);
    }, 4000); // 4 saniye animasyon süresi
  };

  return (
    <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center p-6 bg-black/95 backdrop-blur-xl fade-in overflow-hidden">
      {/* Arka plan ray dekorasyonları */}
      <div className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundSize: '40px 40px',
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)'
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center mb-10">
        <span className="material-symbols-outlined text-[48px] text-green-400 mb-2 drop-shadow-[0_0_15px_rgba(74,222,128,0.8)]" style={{ fontVariationSettings: "'FILL' 1" }}>change_circle</span>
        <h1 className="text-white text-4xl font-black tracking-[8px] uppercase mb-1" style={{ fontFamily: "'Orbitron', monospace", textShadow: '0 0 20px rgba(255,255,255,0.5)' }}>
          TURNİKE ÇARKI
        </h1>
        <p className="text-white/70 font-medium tracking-widest text-sm uppercase">Günün Şanslı Seferini Çek</p>
      </div>

      <div className="relative w-80 h-80 mb-14 drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
        {/* İbre (Metro Ön Yüzü) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-6 z-30 flex flex-col items-center">
          <div className="w-12 h-14 bg-white rounded-t-xl rounded-b-md flex flex-col items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.6)] border-b-4 border-gray-300">
            <div className="w-8 h-4 bg-black rounded-sm mb-1 opacity-80" />
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-yellow-400" />
              <div className="w-2 h-2 rounded-full bg-yellow-400" />
            </div>
          </div>
          <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[14px] border-t-white mt-1 drop-shadow-lg" />
        </div>

        {/* Çark Dış Çerçevesi */}
        <div className="absolute inset-0 rounded-full border-[12px] border-[#0f172a] shadow-[0_0_0_2px_rgba(255,255,255,0.1)_inset,0_0_40px_rgba(0,0,0,1)] z-20 pointer-events-none" />

        {/* Çark Gövdesi */}
        <div 
          className="w-full h-full rounded-full overflow-hidden transition-transform ease-out relative z-10"
          style={{
            transform: `rotate(${rotation}deg)`,
            transitionDuration: spinning ? '4s' : '0s',
            // Daha sert çizgiler için conic-gradient
            background: `conic-gradient(${PRIZES.map((p, i) => {
              const start = i * (360/PRIZES.length);
              const end = (i+1) * (360/PRIZES.length);
              return `${p.color} ${start}deg ${end}deg`;
            }).join(', ')})`
          }}
        >
          {PRIZES.map((p, i) => {
            const rot = (i * (360/PRIZES.length)) + (360/PRIZES.length)/2;
            return (
              <div 
                key={i}
                className="absolute top-0 left-1/2 origin-bottom"
                style={{ 
                  height: '50%', 
                  width: '0px', 
                  transform: `translateX(-50%) rotate(${rot}deg)` 
                }}
              >
                {/* Tek bir yatay konteyner oluşturup onu 90 derece döndürüyoruz */}
                <div 
                  className="absolute flex items-center justify-start gap-2"
                  style={{
                    top: '100%', 
                    left: '50%',
                    transformOrigin: 'center center',
                    transform: 'translate(-50%, -50%) rotate(-90deg) translateX(70px)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {/* Etiket (Siyah stroke ile her renkte okunur) */}
                  <span 
                    className="text-white font-black text-[24px] tracking-wide"
                    style={{ 
                      textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0 4px 8px rgba(0,0,0,0.8)' 
                    }}
                  >
                    {p.label}
                  </span>
                  
                  {/* Hat Kodu */}
                  <div className="px-2 py-1 bg-black/75 rounded-md text-white/90 text-[10px] font-black tracking-widest border border-white/20 shadow-lg">
                    {p.line}
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Çark Merkez Göbeği */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-[#0f172a] rounded-full z-20 border-[4px] border-[#1e293b] flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.8)]">
            <span className="material-symbols-outlined text-white/50 text-[28px] animate-spin-slow">toll</span>
          </div>
        </div>
      </div>

      {!prize ? (
        <button
          onClick={handleSpin}
          disabled={spinning}
          className={`relative group overflow-hidden w-full max-w-xs py-5 rounded-2xl font-black text-xl tracking-[4px] transition-all ${spinning ? 'opacity-50 scale-95' : 'hover:scale-105 active:scale-95'}`}
          style={{
            background: 'linear-gradient(135deg, #16a34a, #15803d)',
            boxShadow: '0 10px 30px rgba(22,163,74,0.4), inset 0 2px 0 rgba(255,255,255,0.2)',
            textShadow: '0 2px 4px rgba(0,0,0,0.5)'
          }}
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-20"></div>
          <span className="relative z-10 text-white">{spinning ? 'ÇEVRİLİYOR...' : 'ÇARKI ÇEVİR'}</span>
        </button>
      ) : (
        <div className="text-center fade-in bg-white/10 border border-white/20 p-6 rounded-3xl backdrop-blur-md w-full max-w-xs shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
          <p className="text-white/60 text-xs font-bold tracking-widest uppercase mb-1">KAZANDIĞIN ÖDÜL</p>
          <div className="text-green-400 font-black text-4xl mb-3 drop-shadow-md">{prize.label}</div>
          <div className="w-12 h-1 bg-green-500/50 mx-auto rounded-full mb-3" />
          <p className="text-white/80 text-sm font-medium">Bakiye İstanbulkart'a aktarılıyor...</p>
        </div>
      )}
    </div>
  );
};

export default DailySpinScreen;
