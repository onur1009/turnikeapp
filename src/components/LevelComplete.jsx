import React, { useState, useEffect } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const CountUp = ({ end, duration = 1500, suffix = '', prefix = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;
    let animationFrame;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      const easePercentage = percentage === 1 ? 1 : 1 - Math.pow(2, -10 * percentage);
      
      setCount(Math.floor(end * easePercentage));

      if (progress < duration) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return <span>{prefix}{count}{suffix}</span>;
};

const LevelComplete = ({ level, wordsFoundCount, totalWords, timeSpent, accuracy, onNextLevel, onRetry, onHome }) => {
  const stars = accuracy >= 95 ? 3 : accuracy >= 70 ? 2 : 1;

  const handleShare = async () => {
    Haptics.impact({ style: ImpactStyle.Light }).catch(()=>{});
    const shareText = `🚇 Turnike: Sözcük Seferi'nde ${level} durağını %${accuracy} isabet ve ${timeSpent} saniyede tamamladım!\nSende İstanbul'u dolaşarak kelimeleri bul:`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Turnike: Sözcük Seferi',
          text: shareText,
          url: window.location.origin
        });
      } catch (err) {
        console.log('Paylaşım iptal edildi veya desteklenmiyor', err);
      }
    } else {
      navigator.clipboard.writeText(`${shareText} ${window.location.origin}`);
      alert('Sonucun panoya kopyalandı! İstediğin yere yapıştırabilirsin.');
    }
  };

  return (
    <main className="flex-grow flex flex-col items-center justify-center p-6 relative z-10">
      
      {/* İstasyon varış animasyonu */}
      <div className="relative mb-8">
        {/* Dış ışıma halkası */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-36 h-36 rounded-full pulse-soft" style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.15) 0%, transparent 70%)' }} />
        </div>

        {/* Ana rozet */}
        <div className="relative w-24 h-24 rounded-full flex items-center justify-center float-slow"
          style={{
            background: 'linear-gradient(135deg, #1a3a1a, #0d2010)',
            border: '2px solid rgba(34,197,94,0.6)',
            boxShadow: '0 0 40px rgba(34,197,94,0.35), 0 0 80px rgba(34,197,94,0.12)',
          }}
        >
          <span className="material-symbols-outlined text-[52px]" style={{ color: '#4ade80', fontVariationSettings: "'FILL' 1" }}>
            emoji_events
          </span>
        </div>
      </div>

      {/* LED Tabela: İstasyona Ulaştınız */}
      <div className="px-5 py-2 rounded-sm mb-3 neon-blink"
        style={{
          background: 'linear-gradient(135deg, #0d1f0d, #091509)',
          border: '1px solid rgba(34,197,94,0.5)',
          boxShadow: '0 0 20px rgba(34,197,94,0.2)',
        }}
      >
        <p className="text-[11px] font-black tracking-[4px] uppercase" style={{ fontFamily: "'Orbitron', monospace", color: '#4ade80', textShadow: '0 0 8px rgba(74,222,128,0.7)' }}>
          DURAĞA ULAŞILDI
        </p>
      </div>

      {/* Yıldızlar */}
      <div className="flex items-center gap-3 mb-2">
        {[1, 2, 3].map(s => (
          <span
            key={s}
            className="material-symbols-outlined scale-in"
            style={{
              fontSize: 38,
              color: s <= stars ? '#fbbf24' : 'rgba(255,255,255,0.1)',
              fontVariationSettings: s <= stars ? "'FILL' 1" : "'FILL' 0",
              filter: s <= stars ? 'drop-shadow(0 0 8px rgba(251,191,36,0.6))' : 'none',
              animationDelay: `${s * 0.15}s`
            }}
          >
            star
          </span>
        ))}
      </div>

      <h1 className="text-white text-3xl font-black mb-1 tracking-tight">TEBRİKLER!</h1>
      <p className="text-white/40 text-sm font-bold mb-8 tracking-wide">{level} tamamlandı</p>

      {/* İstatistik Kartları — Metro bilet paneli gibi */}
      <div className="grid grid-cols-3 gap-2.5 w-full max-w-sm mb-6">
        <div className="card-panel p-3.5 text-center flex flex-col items-center">
          <span className="material-symbols-outlined text-[20px] mb-1.5 block" style={{ color: '#22c55e', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          <p className="text-white text-xl font-black"><CountUp end={wordsFoundCount} />/{totalWords}</p>
          <p className="text-[9px] font-black tracking-[2px] mt-0.5 text-white/30">KELİME</p>
        </div>
        <div className="card-panel p-3.5 text-center flex flex-col items-center">
          <span className="material-symbols-outlined text-[20px] mb-1.5 block" style={{ color: '#fbbf24', fontVariationSettings: "'FILL' 1" }}>timer</span>
          <p className="text-white text-xl font-black"><CountUp end={timeSpent} suffix="s" /></p>
          <p className="text-[9px] font-black tracking-[2px] mt-0.5 text-white/30">SÜRE</p>
        </div>
        <div className="card-panel p-3.5 text-center flex flex-col items-center">
          <span className="material-symbols-outlined text-[20px] mb-1.5 block" style={{ color: '#60a5fa', fontVariationSettings: "'FILL' 1" }}>target</span>
          <p className="text-white text-xl font-black"><CountUp end={accuracy} prefix="%" /></p>
          <p className="text-[9px] font-black tracking-[2px] mt-0.5 text-white/30">İSABET</p>
        </div>
      </div>

      {/* Aksiyon Butonları */}
      <div className="flex flex-col gap-3 w-full max-w-sm mt-4">
        <button onClick={onNextLevel} className="play-btn w-full flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>directions_railway</span>
          SONRAKİ DURAK
        </button>
        
        <div className="flex gap-3">
          <button
            onClick={handleShare}
            className="flex-1 py-4 rounded-full font-bold text-white text-[13px] tracking-widest uppercase transition-all active:scale-95 menu-btn flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(37,99,235,0.05))', border: '1px solid rgba(59,130,246,0.3)' }}
          >
            <span className="material-symbols-outlined text-blue-400 text-[18px]">share</span>
            Paylaş
          </button>
          
          <button
            onClick={onRetry}
            className="flex-1 py-4 rounded-full font-bold text-white/50 text-[13px] tracking-widest uppercase transition-all active:scale-95 menu-btn"
          >
            Tekrar Oyna
          </button>
        </div>
        
        <button
          onClick={onHome}
          className="w-full py-4 rounded-full font-bold text-white/50 text-[13px] tracking-widest uppercase transition-all active:scale-95 flex items-center justify-center gap-2 mt-2"
          style={{ border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <span className="material-symbols-outlined text-[18px]">home</span>
          ANA MENÜ
        </button>
      </div>
    </main>
  );
};

export default LevelComplete;
