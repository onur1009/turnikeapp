import React from 'react';
import { useGameStore } from '../store/gameStore';
import { useTranslation } from '../utils/i18n';
import ScreenHeader from './ScreenHeader';
import { formatKurus } from '../utils/format';
import { getStationForLevel } from '../utils/transitNetwork';

const StatsScreen = ({ onBack }) => {
  const totalGamesPlayed = useGameStore(state => state.totalGamesPlayed) || 0;
  const totalWordsFound = useGameStore(state => state.totalWordsFound) || 0;
  const totalBalanceEarned = useGameStore(state => state.totalBalanceEarned) || 0;
  const maxCombo = useGameStore(state => state.maxCombo) || 0;
  const streak = useGameStore(state => state.streak) || 0;
  const levelsCompleted = useGameStore(state => state.levelsCompleted) || 0;
  const learnedTerms = useGameStore(state => state.learnedWords.length);
  const station = getStationForLevel(useGameStore(state => state.maxUnlockedLevel));
  const { t } = useTranslation();

  return (
    <main className="flex-1 w-full flex flex-col p-6 pb-20 relative z-10 fade-in items-center">
      <div className="w-full max-w-sm">
        <ScreenHeader title={t('stats')} onBack={onBack} className="px-0 pt-0 mb-5" />

        {/* Yolculuk özeti */}
        <div className="rounded-2xl p-4 mb-4 flex items-center gap-3" style={{ background: 'var(--surface)', border: `1px solid ${station.color}55` }}>
          <span className="line-badge" style={{ background: station.color }}>{station.id}</span>
          <div className="flex-1 min-w-0">
            <p className="text-white/50 text-[11px] font-bold uppercase tracking-wider">{t('next_stop')}</p>
            <p className="text-white font-extrabold text-[16px] truncate">{station.displayName}</p>
          </div>
          <div className="text-right">
            <p className="text-white font-black text-[18px] tabular-nums">{levelsCompleted}</p>
            <p className="text-white/50 text-[10px] font-bold uppercase">seviye</p>
          </div>
          <div className="text-right">
            <p className="text-white font-black text-[18px] tabular-nums">{learnedTerms}</p>
            <p className="text-white/50 text-[10px] font-bold uppercase">terim</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10 flex flex-col items-center justify-center text-center">
            <span aria-hidden="true" className="material-symbols-outlined text-blue-400 text-3xl mb-2">sports_esports</span>
            <span className="text-3xl font-black text-white">{totalGamesPlayed}</span>
            <span className="text-white/50 text-xs uppercase font-bold tracking-wider mt-1">{t('games_played')}</span>
          </div>
          
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10 flex flex-col items-center justify-center text-center">
            <span aria-hidden="true" className="material-symbols-outlined text-green-400 text-3xl mb-2">spellcheck</span>
            <span className="text-3xl font-black text-white">{totalWordsFound}</span>
            <span className="text-white/50 text-xs uppercase font-bold tracking-wider mt-1">{t('words_found')}</span>
          </div>

          <div className="bg-white/5 rounded-2xl p-4 border border-white/10 flex flex-col items-center justify-center text-center">
            <span aria-hidden="true" className="material-symbols-outlined text-yellow-400 text-3xl mb-2">bolt</span>
            <span className="text-3xl font-black text-white">{maxCombo}</span>
            <span className="text-white/50 text-xs uppercase font-bold tracking-wider mt-1">{t('max_combo')}</span>
          </div>

          <div className="bg-white/5 rounded-2xl p-4 border border-white/10 flex flex-col items-center justify-center text-center">
            <span aria-hidden="true" className="material-symbols-outlined text-red-400 text-3xl mb-2">local_fire_department</span>
            <span className="text-3xl font-black text-white">{streak}</span>
            <span className="text-white/50 text-xs uppercase font-bold tracking-wider mt-1">{t('daily_streak')}</span>
          </div>

          <div className="col-span-2 bg-white/5 rounded-2xl p-4 border border-white/10 flex flex-col items-center justify-center text-center">
            <span aria-hidden="true" className="material-symbols-outlined text-purple-400 text-3xl mb-2">account_balance_wallet</span>
            <span className="text-4xl font-black text-white">{formatKurus(totalBalanceEarned)}</span>
            <span className="text-white/50 text-xs uppercase font-bold tracking-wider mt-1">{t('total_earned')}</span>
          </div>
        </div>
      </div>
    </main>
  );
};

export default StatsScreen;
