import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { formatKurus } from '../utils/format';
import { isCloudConfigured } from '../utils/supabaseClient';
import { TIERS, GROUP_SIZE, PROMOTE, DEMOTE, LEAGUE_POINTS, RANK_REWARDS, standings, ensureLeagueWeek, syncLeague, weekEndsIn } from '../utils/league';

// Haftalık Hat Ligi: 30 kişilik grup sıralaması, terfi/düşme bölgeleri, geçen haftanın sonucu.
export default function LeagueScreen({ onBack, onGlobal }) {
  const league = useGameStore(s => s.leagueState);
  const username = useGameStore(s => s.username);
  const cardName = useGameStore(s => s.cardName);
  const [syncing, setSyncing] = useState(isCloudConfigured);
  const myName = (username || cardName || 'Sen').slice(0, 16);

  useEffect(() => {
    ensureLeagueWeek();
    if (isCloudConfigured) syncLeague().finally(() => setSyncing(false));
  }, []);

  const tier = TIERS[league.tier - 1] || TIERS[0];
  const table = standings(league, myName);
  const me = table.find(p => p.me);
  const last = league.lastResult && !league.seenResult ? league.lastResult : null;

  const zone = (rank) => (rank <= PROMOTE && league.tier < 5 ? 'up' : rank > GROUP_SIZE - DEMOTE && league.tier > 1 ? 'down' : null);

  return (
    <main className="flex-1 w-full flex flex-col overflow-hidden">
      <header className="shrink-0 px-4 pt-4 pb-4" style={{ background: `linear-gradient(180deg, ${tier.color} 0%, transparent 100%)` }}>
        <div className="flex items-center gap-3">
          <button className="icon-btn" onClick={onBack} aria-label="Geri">
            <span aria-hidden="true" className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-white font-black text-[20px] leading-tight">{tier.name}</p>
            <p className="text-white/80 text-[12px] font-semibold">Hafta {weekEndsIn()} sonra biter{syncing ? ' · eşitleniyor…' : ''}</p>
          </div>
          <span aria-hidden="true" className="material-symbols-outlined text-white text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>{tier.icon}</span>
        </div>
        {/* Lig basamakları */}
        <div className="flex gap-1.5 mt-3" aria-label="Ligler">
          {TIERS.map(t => (
            <span key={t.id} className="flex-1 h-1.5 rounded-full" style={{ background: t.id <= league.tier ? t.color : 'rgba(255,255,255,0.18)', outline: t.id === league.tier ? '2px solid #fff' : 'none' }} title={t.name} />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3">
          <div className="map-stat"><span className="map-stat-value">#{me.rank}</span><span className="map-stat-label">Sıran</span></div>
          <div className="map-stat"><span className="map-stat-value">{league.points}</span><span className="map-stat-label">Puan</span></div>
          <div className="map-stat"><span className="map-stat-value">{(RANK_REWARDS.find(([n]) => me.rank <= n) || [0, 0])[1] ? formatKurus((RANK_REWARDS.find(([n]) => me.rank <= n))[1]) : '—'}</span><span className="map-stat-label">Ödül</span></div>
        </div>
      </header>

      {last && (
        <div className="mx-4 mb-3 rounded-2xl p-3 flex items-center gap-3 fade-in" style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.45)' }}>
          <span className="text-[26px]" aria-hidden="true">{last.toTier > last.fromTier ? '🚀' : last.toTier < last.fromTier ? '📉' : '🏁'}</span>
          <p className="flex-1 text-white text-[13px] font-semibold">
            Geçen hafta <b>{last.rank}.</b> oldun. {last.toTier > last.fromTier ? `${TIERS[last.toTier - 1].name}'ne yükseldin!` : last.toTier < last.fromTier ? `${TIERS[last.toTier - 1].name}'ne düştün.` : 'Liginde kaldın.'}
            {last.reward ? ` +${formatKurus(last.reward)} kazandın.` : ''}
          </p>
          <button className="text-white/70 text-[12px] font-bold" onClick={() => useGameStore.setState(s => ({ leagueState: { ...s.leagueState, seenResult: true } }))}>Tamam</button>
        </div>
      )}

      <ol className="flex-1 min-h-0 overflow-y-auto px-4 pb-4 flex flex-col gap-1" style={{ overscrollBehavior: 'contain' }}>
        {table.map(p => {
          const z = zone(p.rank);
          return (
            <li key={p.id} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${p.me ? 'ring-2 ring-white' : ''}`}
              style={{ background: p.me ? `${tier.color}55` : z === 'up' ? 'rgba(34,197,94,0.12)' : z === 'down' ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.05)' }}>
              <span className="w-7 text-center text-white font-black text-[14px] tabular-nums">{p.rank}</span>
              <span className="flex-1 min-w-0 text-white font-bold text-[14px] truncate">{p.name}{p.me ? ' (sen)' : ''}</span>
              {z === 'up' && <span aria-label="Yükselme bölgesi" className="text-green-300 text-[12px]">▲</span>}
              {z === 'down' && <span aria-label="Düşme bölgesi" className="text-red-300 text-[12px]">▼</span>}
              <span className="text-white/85 font-black text-[14px] tabular-nums w-12 text-right">{p.points}</span>
            </li>
          );
        })}
      </ol>

      <footer className="shrink-0 px-4 pb-5 pt-2 flex flex-col gap-2" style={{ borderTop: '1px solid var(--border)' }}>
        <p className="text-white/60 text-[12px] font-semibold">
          Puan: bölüm +{LEAGUE_POINTS.level}, Günün Seferi +{LEAGUE_POINTS.daily}, kazanılan düello +{LEAGUE_POINTS.duelWin}. İlk {PROMOTE} yükselir, son {DEMOTE} düşer.
          {!isCloudConfigured && ' Çevrimdışı modasın: grup şimdilik bot oyunculardan oluşuyor.'}
        </p>
        {isCloudConfigured && (
          <button onClick={onGlobal} className="text-white/75 font-bold text-[13px] underline underline-offset-4 self-start">Genel sıralamayı gör</button>
        )}
      </footer>
    </main>
  );
}
