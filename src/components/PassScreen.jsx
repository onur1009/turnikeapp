import React from 'react';
import { useGameStore } from '../store/gameStore';
import ScreenHeader from './ScreenHeader';
import { formatKurus } from '../utils/format';
import { track } from '../utils/analytics';
import { PASS_REWARDS, PASS_XP, XP_PER_TIER, passProgress, claimPassTier, seasonName, seasonEndsIn } from '../utils/pass';

const rewardText = (r) => (r.type === 'coin' ? formatKurus(r.value) : r.type === 'hint' ? `${r.value} ipucu` : r.label);
const rewardIcon = (r) => ({ coin: 'toll', hint: 'lightbulb', pattern: 'style', color: 'palette' }[r.type]);

// Aylık Hat Pasosu: dikey bir hat; her durak bir basamak ödülü.
export default function PassScreen({ onBack }) {
  useGameStore(s => s.passState); // ilerleme değişince yeniden çiz
  const p = passProgress();

  return (
    <main className="flex-1 w-full flex flex-col overflow-hidden">
      <div className="shrink-0 px-4">
        <ScreenHeader title={seasonName(p.season)} onBack={onBack} className="px-0" />
        <div className="card-panel !rounded-2xl p-4 mb-3">
          <div className="flex items-end justify-between mb-2">
            <span className="text-white font-black text-[26px] leading-none">Basamak {p.tier}<span className="text-white/50 text-[15px]">/{PASS_REWARDS.length}</span></span>
            <span className="text-white/60 text-[12px] font-bold">{seasonEndsIn()} kaldı</span>
          </div>
          <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${p.tier >= PASS_REWARDS.length ? 100 : (p.intoTier / XP_PER_TIER) * 100}%` }} />
          </div>
          <p className="text-white/60 text-[12px] font-semibold mt-2">
            {p.tier >= PASS_REWARDS.length ? 'Pasoyu tamamladın!' : `Sonraki basamağa ${XP_PER_TIER - p.intoTier} XP`} · Bölüm +{PASS_XP.level}, Günün Seferi +{PASS_XP.daily}, görev +{PASS_XP.mission}, düello galibiyeti +{PASS_XP.duelWin} XP
          </p>
        </div>
      </div>

      <ol className="flex-1 min-h-0 overflow-y-auto px-4 pb-8 pass-track" style={{ overscrollBehavior: 'contain' }}>
        {PASS_REWARDS.map((r, i) => {
          const tierNo = i + 1;
          const reached = p.tier >= tierNo;
          const got = p.claimed.includes(tierNo);
          return (
            <li key={tierNo} className={`pass-stop ${reached ? 'is-reached' : ''}`}>
              <span className="pass-dot" aria-hidden="true">{tierNo}</span>
              <div className="flex-1 min-w-0 flex items-center gap-3 rounded-2xl px-3 py-2.5" style={{ background: reached ? 'rgba(251,191,36,0.14)' : 'rgba(255,255,255,0.05)' }}>
                <span aria-hidden="true" className="material-symbols-outlined text-[24px]" style={{ color: reached ? '#fbbf24' : 'rgba(255,255,255,0.4)', fontVariationSettings: "'FILL' 1" }}>{rewardIcon(r)}</span>
                <span className="flex-1 min-w-0 text-white font-bold text-[14px] truncate">{rewardText(r)}</span>
                <button
                  disabled={!reached || got}
                  onClick={() => { if (claimPassTier(tierNo)) track('pass_claim', { tier: tierNo, type: r.type }); }}
                  className="shrink-0 px-3.5 py-1.5 rounded-full font-black text-[12px] text-white bg-green-600 disabled:bg-white/10 disabled:text-white/45">
                  {got ? 'Alındı' : reached ? 'Al' : <span aria-label="Kilitli" className="material-symbols-outlined text-[16px] align-middle">lock</span>}
                </button>
              </div>
            </li>
          );
        })}
      </ol>
    </main>
  );
}
