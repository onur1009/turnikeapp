import React, { useState, useEffect } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useTranslation } from '../utils/i18n';
import { formatKurus } from '../utils/format';

const CountUp = ({ end, duration = 1200, format = (v) => v }) => {
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

  return <span>{format(count)}</span>;
};

// Durak varış ekranı: hangi durağa gelindi, ne kazanıldı, ne öğrenildi, sıradaki durak
const LevelComplete = ({ level, station, summary, mistakes, meanings, onNextLevel, onRetry, onHome }) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const words = summary?.words || [];
  const accuracy = words.length ? Math.round((words.length / (words.length + mistakes)) * 100) : 0;
  const stars = accuracy >= 95 ? 3 : accuracy >= 70 ? 2 : 1;
  const earnings = [
    { label: t('word_points'), value: summary?.wordPoints || 0 },
    { label: t('express_bonus'), value: summary?.expressBonus || 0 },
    { label: t('perfect_bonus'), value: summary?.perfectBonus || 0 },
    ...(summary?.setBonus ? [{ label: t('set_bonus'), value: summary.setBonus }] : []),
  ];
  const total = earnings.reduce((sum, e) => sum + e.value, 0);
  const learned = words.filter(w => meanings[w]);
  const nextName = station.isLastLeg ? station.next.displayName : station.displayName;

  const handleShare = async () => {
    Haptics.impact({ style: ImpactStyle.Light }).catch(()=>{});
    const shareText = `🚇 Turnike: Sözcük Seferi\n📍 ${station.id} · ${station.displayName} (${level})\n⏱️ ${summary?.timeSpent || 0}s · 🎯 %${accuracy}\n${'⭐'.repeat(stars)}\n\nSen de İstanbul'u keşfet!`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Turnike: Sözcük Seferi', text: shareText, url: window.location.origin });
      } catch {
        // Kullanıcı paylaşımı iptal etti
      }
    } else {
      navigator.clipboard?.writeText(`${shareText} ${window.location.origin}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <main className="game-bg h-screen flex flex-col relative z-10 fade-in overflow-y-auto">
      <div className="flex-1 flex flex-col items-center px-5 pt-6 pb-5 w-full max-w-md mx-auto">
        {/* Durak tabelası */}
        <div className="w-full rounded-2xl overflow-hidden mb-4" style={{ border: `1.5px solid ${station.color}`, boxShadow: `0 0 30px ${station.color}33` }}>
          <div className="flex items-center gap-2 px-4 py-2" style={{ background: station.color }}>
            <span className="text-white font-black text-[13px] tracking-wide">{station.id}</span>
            <span className="text-white/85 text-[12px] font-semibold truncate">{station.name}</span>
          </div>
          <div className="px-4 py-3 text-center" style={{ background: 'var(--surface-strong)' }}>
            <div className="flex justify-center gap-1.5 mb-2">
              {[1, 2, 3].map(s => (
                <span key={s} className="material-symbols-outlined scale-in" style={{
                  fontSize: 32,
                  color: s <= stars ? '#fbbf24' : 'rgba(255,255,255,0.12)',
                  fontVariationSettings: s <= stars ? "'FILL' 1" : "'FILL' 0",
                  animationDelay: `${s * 0.12}s`
                }}>star</span>
              ))}
            </div>
            <h1 className="text-white text-[24px] font-black leading-tight">{station.displayName}</h1>
            <p className="text-white/60 text-[13px] font-semibold mt-0.5">{t('arrived_at')} · {t('leg')} {station.leg}/{station.legsPerStation}</p>
            <p className="text-white/70 text-[13px] leading-relaxed mt-3">{station.stationInfo}</p>
          </div>
        </div>

        {/* Kazanç dökümü */}
        <div className="w-full card-panel p-4 mb-4">
          {earnings.map(e => (
            <div key={e.label} className={`flex justify-between text-[14px] py-1 ${e.value ? 'text-white/85' : 'text-white/35'}`}>
              <span className="font-semibold">{e.label}</span>
              <span className="font-bold tabular-nums">+{formatKurus(e.value)}</span>
            </div>
          ))}
          <div className="flex justify-between items-center border-t border-white/10 mt-2 pt-2">
            <span className="text-white font-black text-[15px]">İstanbulkart</span>
            <span className="font-black text-[18px] tabular-nums" style={{ color: 'var(--coin)' }}>
              +<CountUp end={total} format={formatKurus} />
            </span>
          </div>
        </div>

        {/* Öğrenilen terimler */}
        {learned.length > 0 && (
          <div className="w-full card-panel p-4 mb-4">
            <p className="text-[11px] font-black tracking-[2px] text-white/50 uppercase mb-2">{t('learned_terms')}</p>
            {learned.slice(0, 3).map(w => (
              <div key={w} className="py-1.5">
                <span className="text-white font-black text-[14px] tracking-wide">{w}</span>
                <p className="text-white/65 text-[13px] leading-snug">{meanings[w]}</p>
              </div>
            ))}
          </div>
        )}

        {/* Sıradaki durak */}
        <div className="w-full flex items-center gap-3 rounded-2xl px-4 py-3 mb-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <span className="material-symbols-outlined text-[22px]" style={{ color: station.isLineChange && station.isLastLeg ? station.next.color : station.color }}>
            {station.isLastLeg ? 'east' : 'more_horiz'}
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-white/50 uppercase tracking-wider">
              {station.isLastLeg && station.isLineChange ? t('line_change') : t('next_station')}
            </p>
            <p className="text-white font-extrabold text-[15px] truncate">
              {station.isLastLeg ? nextName : `${nextName} · ${t('leg')} ${station.leg + 1}/${station.legsPerStation}`}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full mt-auto">
          <button onClick={onNextLevel} className="play-btn w-full flex items-center justify-center gap-2 whitespace-nowrap" style={{ fontSize: 16, letterSpacing: 2, padding: '15px 20px' }}>
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>directions_railway</span>
            {t('next_station').toLocaleUpperCase('tr-TR')}
          </button>
          <div className="flex gap-3">
            <button onClick={onHome} className="flex-1 py-3.5 rounded-full font-bold text-white/70 text-[13px] tracking-wider uppercase active:scale-95 transition-transform flex items-center justify-center gap-1.5" style={{ border: '1px solid var(--border)' }}>
              <span className="material-symbols-outlined text-[18px]">home</span>{t('main_menu')}
            </button>
            <button onClick={onRetry} className="w-14 rounded-full text-white/70 active:scale-95 transition-transform flex items-center justify-center" style={{ border: '1px solid var(--border)' }} aria-label="Tekrar oyna">
              <span className="material-symbols-outlined text-[20px]">replay</span>
            </button>
            <button onClick={handleShare} className="w-14 rounded-full text-blue-400 active:scale-95 transition-transform flex items-center justify-center" style={{ border: '1px solid rgba(59,130,246,0.35)' }} aria-label="Paylaş">
              <span className="material-symbols-outlined text-[20px]">{copied ? 'check' : 'share'}</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default LevelComplete;
