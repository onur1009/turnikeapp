import { SITE_URL } from '../utils/legal';
import { useState, useEffect } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useTranslation, L } from '../utils/i18n';
import { formatKurus } from '../utils/format';
import { STATION_NAMES } from '../utils/transitNetwork';

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
const LevelComplete = ({ level, station, summary, mistakes, meanings, onNextLevel, onRetry, onHome, onDoubleReward }) => {
  const [doubleState, setDoubleState] = useState('idle'); // idle | loading | done | failed
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
    ...(summary?.stationBonus ? [{ label: t('station_bonus'), value: summary.stationBonus }] : []),
    ...(summary?.eventBonus ? [{ label: `${summary.eventName} (2x)`, value: summary.eventBonus }] : []),
    ...(summary?.lostBonus ? [{ label: 'Günün aranan eşyası', value: summary.lostBonus }] : []),
  ];
  const total = earnings.reduce((sum, e) => sum + e.value, 0);
  const learned = words.filter(w => meanings[w]);
  const nextName = station.isLastLeg ? station.next.displayName : station.displayName;

  const handleShare = async () => {
    Haptics.impact({ style: ImpactStyle.Light }).catch(()=>{});
    const shareText = L("🚇 Turnike: Sözcük Seferi\n📍 {0} · {1} ({2})\n⏱️ {3}s · 🎯 %{4}\n{5}\n\nSen de İstanbul'u keşfet!", station.id, station.displayName, level, summary?.timeSpent || 0, accuracy, '⭐'.repeat(stars));
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Turnike: Sözcük Seferi', text: shareText, url: SITE_URL });
      } catch {
        // Kullanıcı paylaşımı iptal etti
      }
    } else {
      navigator.clipboard?.writeText(`${shareText} ${SITE_URL}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <main className="game-bg h-full flex flex-col relative z-10 fade-in overflow-y-auto">
      <div className="flex-1 flex flex-col items-center px-5 pt-6 pb-5 w-full max-w-md mx-auto">
        {/* Durak tabelası */}
        <div className="w-full rounded-2xl overflow-hidden mb-4" style={{ border: `1.5px solid ${station.color}`, boxShadow: `0 0 30px ${station.color}33` }}>
          <div className="flex items-center gap-2 px-4 py-2" style={{ background: station.color }}>
            <span className="text-white font-black text-[13px] tracking-wide">{station.code}</span>
            <span className="text-white/85 text-[12px] font-semibold truncate">{L(station.name)}</span>
          </div>
          <div className="px-4 py-3 text-center" style={{ background: 'var(--surface-strong)' }}>
            <div className="flex justify-center gap-1.5 mb-2">
              {[1, 2, 3].map(s => (
                <span key={s} aria-hidden="true" className="material-symbols-outlined scale-in" style={{
                  fontSize: 32,
                  color: s <= stars ? '#fbbf24' : 'rgba(255,255,255,0.12)',
                  fontVariationSettings: s <= stars ? "'FILL' 1" : "'FILL' 0",
                  animationDelay: `${s * 0.12}s`
                }}>star</span>
              ))}
            </div>
            <h1 className="text-white text-[24px] font-black leading-tight">{station.displayName}</h1>
            <p className="text-white/60 text-[13px] font-semibold mt-0.5">{station.isLastLeg ? `${t('arrived_at')} · ${t('leg')} ${station.leg}/${station.legsPerStation}` : `${t('leg')} ${station.leg}/${station.legsPerStation} ${t('leg_done')}`}</p>
            {station.isLastLeg && <p className="text-white/70 text-[13px] leading-relaxed mt-3">{L(station.stationInfo)}</p>}
          </div>
        </div>

        {/* Kazanç dökümü */}
        {/* Hat bitirme: bir hattın son durağı geçildiğinde (sonraki durak başka hatta) */}
        {station.isLastLeg && station.isLineChange && (
          <div className="w-full rounded-2xl px-4 py-3 mb-4 flex items-center gap-3 scale-in" style={{ background: station.color }} role="status">
            <span aria-hidden="true" className="material-symbols-outlined text-[34px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
            <span className="min-w-0">
              <span className="block text-white font-black text-[16px] tracking-wide">{station.code}{L(" HATTI TAMAMLANDI")}</span>
              <span className="block text-white/85 text-[12px] font-semibold truncate">{L(station.name)} · {(STATION_NAMES[station.id] || []).length} durak</span>
            </span>
          </div>
        )}

        {/* Toplam her zaman görünür; döküm dokununca açılır (devam düğmesi kaydırmadan görünsün) */}
        <details className="w-full card-panel px-4 py-3 mb-4 group">
          <summary className="flex justify-between items-center cursor-pointer list-none">
            <span className="text-white font-black text-[15px] flex items-center gap-1">{L("Turnike Kart")}<span aria-hidden="true" className="material-symbols-outlined text-[18px] text-white/50 transition-transform group-open:rotate-180">expand_more</span>
            </span>
            <span className="font-black text-[18px] tabular-nums" style={{ color: 'var(--coin)' }}>
              +<CountUp end={total} format={formatKurus} />
            </span>
          </summary>
          <div className="border-t border-white/10 mt-2 pt-1">
            {earnings.map(e => (
              <div key={L(e.label)} className={`flex justify-between text-[14px] py-1 ${e.value ? 'text-white/85' : 'text-white/35'}`}>
                <span className="font-semibold">{L(e.label)}</span>
                <span className="font-bold tabular-nums">+{formatKurus(e.value)}</span>
              </div>
            ))}
          </div>
        </details>

        {/* Öğrenilen terimler */}
        {summary?.lostItem && (
          <div className="w-full rounded-2xl p-3 mb-3 flex items-center gap-3 fade-in" style={{ background: 'rgba(96,165,250,0.15)', border: '1px solid rgba(96,165,250,0.45)' }}>
            <span aria-hidden="true" className="material-symbols-outlined text-[28px] text-sky-300" style={{ fontVariationSettings: "'FILL' 1" }}>{summary.lostItem.icon}</span>
            <span className="text-white text-[13px] font-semibold">
              <b>{L("Kayıp eşya bulundu: ")}{L(summary.lostItem.name)}</b>{summary.lostItem.isDaily ? L(" · Günün aranan eşyası!") : ''}<br />
              <span className="text-white/65">{L("Kayıp Eşya Ofisi'ndeki rafına kondu.")}</span>
            </span>
          </div>
        )}
        {summary?.postcard && (
          <div className="w-full rounded-2xl p-3 mb-4 flex items-center gap-3 fade-in" style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.45)' }}>
            <span aria-hidden="true" className="material-symbols-outlined text-[28px] text-amber-300" style={{ fontVariationSettings: "'FILL' 1" }}>mail</span>
            <span className="text-white text-[13px] font-semibold"><b>{L("Yeni kartpostal!")}</b> {station.displayName}{L(" kartpostalı koleksiyonuna eklendi.")}</span>
          </div>
        )}
        {learned.length > 0 && (
          <details className="w-full card-panel px-4 py-3 mb-4 group">
            <summary className="flex justify-between items-center cursor-pointer list-none text-[11px] font-black tracking-[2px] text-white/60 uppercase">
              {t('learned_terms')} ({learned.length})
              <span aria-hidden="true" className="material-symbols-outlined text-[18px] transition-transform group-open:rotate-180">expand_more</span>
            </summary>
            {learned.slice(0, 3).map(w => (
              <div key={w} className="py-1.5">
                <span className="text-white font-black text-[14px] tracking-wide">{w}</span>
                <p className="text-white/65 text-[13px] leading-snug">{meanings[w]}</p>
              </div>
            ))}
          </details>
        )}

        {/* Sıradaki durak */}
        <div className="w-full flex items-center gap-3 rounded-2xl px-4 py-3 mb-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <span aria-hidden="true" className="material-symbols-outlined text-[22px]" style={{ color: station.isLineChange && station.isLastLeg ? station.next.color : station.color }}>
            {station.isLastLeg ? 'east' : 'more_horiz'}
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-white/50 uppercase tracking-wider">
              {!station.isLastLeg ? t('next_leg') : station.isLineChange ? t('line_change') : t('next_station')}
            </p>
            <p className="text-white font-extrabold text-[15px] truncate">
              {station.isLastLeg ? nextName : `${nextName} · ${t('leg')} ${station.leg + 1}/${station.legsPerStation}`}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full mt-auto">
          {onDoubleReward && total > 0 && doubleState !== 'done' && (
            <button
              disabled={doubleState === 'loading'}
              onClick={async () => { setDoubleState('loading'); setDoubleState((await onDoubleReward(total)) ? 'done' : 'failed'); }}
              className="w-full mb-2.5 py-3 rounded-full font-black text-[14px] text-white bg-blue-600 active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-60">
              <span aria-hidden="true" className="material-symbols-outlined text-[20px]">smart_display</span>
              {doubleState === 'loading' ? L("Reklam yükleniyor…") : doubleState === 'failed' ? L("Reklam yüklenemedi, tekrar dene") : L("Reklam izle, kazancı 2 katına çıkar (+{0})", formatKurus(total))}
            </button>
          )}
          {doubleState === 'done' && <p className="text-center text-green-300 font-bold text-[13px] mb-2.5">+{formatKurus(total)}{L(" eklendi, kazancın 2 katına çıktı!")}</p>}
          <button onClick={onNextLevel} className="play-btn w-full flex items-center justify-center gap-2 whitespace-nowrap" style={{ fontSize: 16, letterSpacing: 2, padding: '15px 20px' }}>
            <span aria-hidden="true" className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>directions_railway</span>
            {station.isLastLeg ? t('next_station').toLocaleUpperCase('tr-TR') : t('continue_journey')}
          </button>
          <div className="flex gap-3">
            <button onClick={onHome} className="flex-1 py-3.5 rounded-full font-bold text-white/70 text-[13px] tracking-wider uppercase active:scale-95 transition-transform flex items-center justify-center gap-1.5" style={{ border: '1px solid var(--border)' }}>
              <span aria-hidden="true" className="material-symbols-outlined text-[18px]">home</span>{t('main_menu')}
            </button>
            <button onClick={onRetry} className="w-14 rounded-full text-white/70 active:scale-95 transition-transform flex items-center justify-center" style={{ border: '1px solid var(--border)' }} aria-label={L("Tekrar oyna")}>
              <span aria-hidden="true" className="material-symbols-outlined text-[20px]">replay</span>
            </button>
            <button onClick={handleShare} className="w-14 rounded-full text-blue-400 active:scale-95 transition-transform flex items-center justify-center" style={{ border: '1px solid rgba(59,130,246,0.35)' }} aria-label={L("Paylaş")}>
              <span aria-hidden="true" className="material-symbols-outlined text-[20px]">{copied ? 'check' : 'share'}</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default LevelComplete;
