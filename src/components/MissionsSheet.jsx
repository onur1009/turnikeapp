import React from 'react';
import { useGameStore } from '../store/gameStore';
import { formatKurus } from '../utils/format';
import { track } from '../utils/analytics';
import { todayKey, missionsFor, STREAK_MILESTONES } from '../utils/daily';

// Günlük görevler (3 tane, gece yarısı yenilenir) ve giriş serisi ödülleri, tek alt sayfada.
export const useMissionProgress = () => {
  const stats = useGameStore(s => s.dailyStats);
  const claimed = useGameStore(s => s.missionsClaimed);
  const today = todayKey();
  const counts = stats.date === today ? stats : {};
  const ids = claimed.date === today ? claimed.ids : [];
  const missions = missionsFor(today).map(m => {
    const value = Math.min(m.goal, counts[m.stat] || 0);
    return { ...m, value, done: value >= m.goal, claimed: ids.includes(m.id) };
  });
  return { missions, ready: missions.filter(m => m.done && !m.claimed).length, doneCount: missions.filter(m => m.done).length };
};

export default function MissionsSheet({ onClose }) {
  const { missions } = useMissionProgress();
  const claimMission = useGameStore(s => s.claimMission);
  const streak = useGameStore(s => s.streak);
  const streakClaimed = useGameStore(s => s.streakRewardsClaimed);
  const claimStreakReward = useGameStore(s => s.claimStreakReward);
  const nextMilestone = STREAK_MILESTONES.find(([day]) => day > streak);

  return (
    <div className="fixed inset-0 z-[150] bg-black/60 flex items-end fade-in" onClick={onClose}>
      <div role="dialog" aria-labelledby="missions-title" className="w-full rounded-t-3xl p-5 pb-8 flex flex-col gap-3 max-h-[85dvh] overflow-y-auto"
        style={{ background: '#10263f', borderTop: '1px solid var(--border)' }} onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 rounded-full bg-white/25 mx-auto" />
        <div className="flex items-center justify-between">
          <h2 id="missions-title" className="text-white font-black text-[20px]">Bugünün görevleri</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Kapat">
            <span aria-hidden="true" className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {missions.map(m => (
          <div key={m.id} className="card-panel !rounded-2xl p-3.5 flex items-center gap-3">
            <span aria-hidden="true" className="material-symbols-outlined text-[24px] shrink-0" style={{ color: m.done ? '#4ade80' : '#fbbf24', fontVariationSettings: "'FILL' 1" }}>{m.done ? 'check_circle' : m.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-[14px] leading-tight">{m.title}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="h-1.5 flex-1 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${(m.value / m.goal) * 100}%` }} />
                </div>
                <span className="text-white/60 text-[11px] font-bold tabular-nums">{m.value}/{m.goal}</span>
              </div>
            </div>
            <button
              disabled={!m.done || m.claimed}
              onClick={() => { claimMission(m.id, m.reward); track('mission_claim', { id: m.id }); }}
              className="shrink-0 px-3.5 py-2 rounded-full font-black text-[12px] text-white bg-green-600 disabled:bg-white/10 disabled:text-white/50"
            >
              {m.claimed ? 'Alındı' : `+${formatKurus(m.reward)}`}
            </button>
          </div>
        ))}

        <h3 className="text-white font-black text-[16px] mt-2">Giriş serisi: {streak} gün 🔥</h3>
        <div className="grid grid-cols-5 gap-1.5">
          {STREAK_MILESTONES.map(([day, reward]) => {
            const reached = streak >= day;
            const got = streakClaimed.includes(day);
            return (
              <button key={day} disabled={!reached || got}
                onClick={() => { claimStreakReward(day, reward); track('streak_claim', { day }); }}
                className={`rounded-xl py-2 flex flex-col items-center gap-0.5 border ${reached && !got ? 'bg-amber-400 text-[#422006] border-amber-300 pulse-soft' : 'bg-white/5 text-white/70 border-white/10'}`}>
                <span className="font-black text-[15px]">{day}</span>
                <span className="text-[10px] font-bold">{got ? '✓' : formatKurus(reward)}</span>
              </button>
            );
          })}
        </div>
        <p className="text-white/55 text-[12px] font-semibold">
          {nextMilestone ? `${nextMilestone[0] - streak} gün sonra ${formatKurus(nextMilestone[1])} seri ödülü.` : 'Tüm seri ödüllerini açtın!'} Görevler gece yarısı yenilenir.
        </p>
      </div>
    </div>
  );
}
