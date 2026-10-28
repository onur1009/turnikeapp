import React from 'react';
import { useGameStore } from '../store/gameStore';
import { formatKurus } from '../utils/format';
import { track } from '../utils/analytics';
import { EVENT_TIERS, timeLeft } from '../utils/events';

// Hafta sonu etkinliği ayrıntısı: kalan süre, bölüm ilerlemesi ve basamak ödülleri.
export default function EventSheet({ event, onClose, onPlay }) {
  const progress = useGameStore(s => s.eventProgress);
  const claimEventTier = useGameStore(s => s.claimEventTier);
  const levels = progress.id === event.id ? progress.levels : 0;
  const claimed = progress.id === event.id ? progress.claimed : [];
  const max = EVENT_TIERS[EVENT_TIERS.length - 1][0];

  return (
    <div className="fixed inset-0 z-[150] bg-black/60 flex items-end fade-in" onClick={onClose}>
      <div role="dialog" aria-labelledby="event-title" className="w-full rounded-t-3xl p-5 pb-8 flex flex-col gap-4"
        style={{ background: `linear-gradient(180deg, ${event.color} 0%, #10263f 55%)`, borderTop: '1px solid var(--border)' }} onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 rounded-full bg-white/30 mx-auto" />
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="material-symbols-outlined text-white text-[40px]" style={{ fontVariationSettings: "'FILL' 1" }}>{event.icon}</span>
          <div className="flex-1 min-w-0">
            <h2 id="event-title" className="text-white font-black text-[22px] leading-tight">{event.name}</h2>
            <p className="text-white/80 text-[13px] font-semibold">{event.tagline} · {timeLeft(event.endsAt)} kaldı</p>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-white/80 text-[12px] font-bold mb-1.5"><span>Bu hafta sonu bitirdiğin bölüm</span><span className="tabular-nums">{levels}</span></div>
          <div className="relative h-3 rounded-full bg-white/15">
            <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${Math.min(100, (levels / max) * 100)}%` }} />
            {EVENT_TIERS.map(([tier]) => (
              <span key={tier} className="absolute -top-1 w-1 h-5 rounded-full bg-white/60" style={{ left: `calc(${(tier / max) * 100}% - 2px)` }} />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {EVENT_TIERS.map(([tier, reward]) => {
            const reached = levels >= tier;
            const got = claimed.includes(tier);
            return (
              <button key={tier} disabled={!reached || got}
                onClick={() => { claimEventTier(event.id, tier, reward); track('event_claim', { event: event.key, tier }); }}
                className={`rounded-2xl py-3 flex flex-col items-center gap-1 border ${reached && !got ? 'bg-amber-400 text-[#422006] border-amber-300 pulse-soft' : 'bg-white/5 text-white border-white/10'}`}>
                <span aria-hidden="true" className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: "'FILL' 1" }}>{got ? 'check_circle' : reached ? 'redeem' : 'lock'}</span>
                <span className="font-black text-[13px]">{tier} bölüm</span>
                <span className="text-[12px] font-bold opacity-80">{formatKurus(reward)}</span>
              </button>
            );
          })}
        </div>

        <p className="text-white/70 text-[13px] font-semibold">Etkinlik boyunca her bölümün kelime puanı 2 katına çıkar. İlerleme pazartesi sıfırlanır.</p>
        <button onClick={onPlay} className="play-btn w-full flex items-center justify-center gap-2">
          <span aria-hidden="true" className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>OYNA
        </button>
      </div>
    </div>
  );
}
