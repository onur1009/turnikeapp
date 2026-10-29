import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { formatKurus } from '../utils/format';
import { playSpin, playPrize } from '../utils/soundManager';
import { track } from '../utils/analytics';

// Günlük Turnike Çarkı: hat renklerinde 8 dilim, ibre turnike kapısı. Günde bir kez.
// Ödüller oyun ekonomisine göre (kuruş): ipucu ₺0,25 olduğu için çark ₺0,25–2,00 arası verir.
// Çark SVG ile çizilir; yazılar dilim ekseni boyunca, sol yarıda ters dönmesin diye çevrilir.
const PRIZES = [
  { label: '₺0,25', type: 'money', value: 25, color: '#16a34a', line: 'M2', weight: 22 },
  { label: '1 İpucu', type: 'hint', value: 1, color: '#2563eb', line: 'BV', weight: 18 },
  { label: '₺0,50', type: 'money', value: 50, color: '#eab308', line: '34', weight: 18 },
  { label: '2 İpucu', type: 'hint', value: 2, color: '#dc2626', line: 'M1A', weight: 9 },
  { label: '₺1,00', type: 'money', value: 100, color: '#7e22ce', line: 'M5', weight: 12 },
  { label: '1 İpucu', type: 'hint', value: 1, color: '#0d9488', line: 'TF1', weight: 12 },
  { label: '₺2,00', type: 'money', value: 200, color: '#f59e0b', line: 'BÜYÜK', weight: 3, jackpot: true },
  { label: '₺0,50', type: 'money', value: 50, color: '#64748b', line: 'MR', weight: 6 },
];
const SEG = 360 / PRIZES.length;
const R = 150; // SVG yarıçapı (viewBox 0..300)

const arcPath = (i) => {
  const a0 = ((i * SEG) - 90) * Math.PI / 180;
  const a1 = (((i + 1) * SEG) - 90) * Math.PI / 180;
  const x0 = R + R * Math.cos(a0), y0 = R + R * Math.sin(a0);
  const x1 = R + R * Math.cos(a1), y1 = R + R * Math.sin(a1);
  return `M${R} ${R} L${x0.toFixed(2)} ${y0.toFixed(2)} A${R} ${R} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`;
};

const pickIndex = () => {
  const total = PRIZES.reduce((s, p) => s + p.weight, 0);
  let r = Math.random() * total;
  for (let i = 0; i < PRIZES.length; i++) { r -= PRIZES[i].weight; if (r <= 0) return i; }
  return 0;
};

const DailySpinScreen = ({ onComplete }) => {
  const [phase, setPhase] = useState('ready'); // ready | spinning | won
  const [rotation, setRotation] = useState(0);
  const [prize, setPrize] = useState(null);
  const addBalance = useGameStore(s => s.addBalance);
  const addHints = useGameStore(s => s.addHints);
  const setLastSpinDate = useGameStore(s => s.setLastSpinDate);

  const spin = () => {
    if (phase !== 'ready') return;
    const idx = pickIndex();
    // İbre tepede: kazanan dilimin ortası tepeye gelsin (+ 6 tam tur, dilim içinde küçük sapma)
    const center = idx * SEG + SEG / 2;
    const jitter = (Math.random() - 0.5) * SEG * 0.5;
    setRotation(360 * 6 - center + jitter);
    setPhase('spinning');
    playSpin();
    Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {});
    setTimeout(() => {
      const won = PRIZES[idx];
      setPrize(won);
      setPhase('won');
      if (won.type === 'money') addBalance(won.value);
      if (won.type === 'hint') addHints(won.value);
      setLastSpinDate(new Date().toLocaleDateString());
      playPrize(!!won.jackpot);
      Haptics.notification({ type: NotificationType.Success }).catch(() => {});
      track('daily_spin', { prize: won.label });
    }, 4600);
  };

  return (
    <div className="spin-root absolute inset-0 z-[100] flex flex-col items-center justify-center px-6 fade-in overflow-hidden" role="dialog" aria-labelledby="spin-title">
      <div className="spin-rays" aria-hidden="true" />

      <div className="relative z-10 flex flex-col items-center text-center mb-6">
        <span className="spin-eyebrow">Günde bir kez</span>
        <h1 id="spin-title" className="text-white font-black text-[34px] leading-none mt-1">Turnike Çarkı</h1>
        <p className="text-white/70 text-[14px] font-semibold mt-2">Kapıdan geç, günün ödülünü kap</p>
      </div>

      <div className="relative z-10" style={{ width: 'min(84vw, 330px)', aspectRatio: '1 / 1' }}>
        {/* İbre: turnike kapısı */}
        <svg className="absolute left-1/2 -translate-x-1/2 -top-7 z-20" width="56" height="64" viewBox="0 0 56 64" aria-hidden="true">
          <rect x="4" y="2" width="48" height="34" rx="9" fill="#10263f" stroke="#fde68a" strokeWidth="3" />
          <rect x="12" y="10" width="32" height="8" rx="3" fill={phase === 'won' ? '#22c55e' : '#dc2626'} />
          <path d="M18 36 L28 60 L38 36 Z" fill="#fde68a" />
        </svg>

        {/* Dış halka ve ampuller */}
        <div className="spin-ring absolute inset-0 rounded-full" aria-hidden="true">
          {Array.from({ length: 16 }, (_, i) => (
            <span key={i} className={`spin-bulb ${phase === 'spinning' ? 'is-chasing' : ''}`} style={{ '--a': `${i * 22.5}deg`, '--d': `${(i % 2) * 0.25}s` }} />
          ))}
        </div>

        {/* Çark */}
        <svg className="absolute inset-[7%]" viewBox="0 0 300 300" style={{
          transform: `rotate(${rotation}deg)`,
          transition: phase === 'spinning' ? 'transform 4.4s cubic-bezier(0.12, 0.6, 0.1, 1)' : 'none',
        }} aria-hidden="true">
          {PRIZES.map((p, i) => {
            const mid = i * SEG + SEG / 2;
            // Çark durduğunda sağ yarıda kalan yazılar ters okunmasın: dışa doğru okunacak şekilde çevir
            const abs = ((mid + rotation) % 360 + 360) % 360;
            const textTurn = abs > 5 && abs < 175 ? -90 : 90;
            return (
              <g key={i}>
                <path d={arcPath(i)} fill={p.color} stroke="#0b1a33" strokeWidth="2" />
                <g transform={`rotate(${mid} ${R} ${R})`}>
                  <rect x={R - 17} y="22" width="34" height="16" rx="4" fill="rgba(0,0,0,0.35)" />
                  <text x={R} y="34" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="900" letterSpacing="0.5">{p.line}</text>
                  <text x={R} y="66" textAnchor="middle" fill="#fff" fontSize={p.jackpot ? 19 : 17} fontWeight="900"
                    transform={`rotate(${textTurn} ${R} 66)`} style={{ paintOrder: 'stroke', stroke: 'rgba(0,0,0,0.35)', strokeWidth: 3 }}>
                    {p.label}
                  </text>
                </g>
              </g>
            );
          })}
          <circle cx={R} cy={R} r="34" fill="#10263f" stroke="#fde68a" strokeWidth="4" />
        </svg>

        {/* Göbek: dokunarak çevir */}
        <button onClick={spin} disabled={phase !== 'ready'} aria-label="Çarkı çevir"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-[22%] aspect-square rounded-full flex items-center justify-center text-[#fde68a] font-black text-[13px] tracking-wider disabled:opacity-90">
          {phase === 'ready' ? 'ÇEVİR' : <span aria-hidden="true" className="material-symbols-outlined text-[26px]">toll</span>}
        </button>
      </div>

      <div className="relative z-10 w-full max-w-xs mt-8 min-h-[120px] flex flex-col items-center justify-start">
        {phase === 'won' && prize ? (
          <div className="spin-prize scale-in w-full">
            <p className="text-[#422006]/70 text-[12px] font-black tracking-[2px] uppercase">{prize.jackpot ? 'Büyük ödül!' : 'Günün ödülü'}</p>
            <p className="text-[#422006] font-black text-[36px] leading-tight">{prize.label}</p>
            <p className="text-[#422006]/75 text-[13px] font-semibold mb-3">{prize.type === 'money' ? `${formatKurus(prize.value)} kartına yüklendi` : 'İpuçlarına eklendi'}</p>
            <button onClick={onComplete} className="w-full py-3 rounded-full bg-[#10263f] text-white font-black text-[15px] active:scale-95 transition-transform">Topla</button>
          </div>
        ) : (
          <>
            <button onClick={spin} disabled={phase !== 'ready'} className="play-btn w-full disabled:opacity-60">
              {phase === 'spinning' ? 'Dönüyor…' : 'Çarkı çevir'}
            </button>
            {phase === 'ready' && <button onClick={onComplete} className="mt-3 text-white/60 font-bold text-[13px] underline underline-offset-4">Sonra</button>}
          </>
        )}
      </div>
    </div>
  );
};

export default DailySpinScreen;
