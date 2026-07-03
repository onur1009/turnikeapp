import React from 'react';
import { useGameStore } from '../store/gameStore';
import { useTranslation } from '../utils/i18n';

const StatsScreen = ({ onBack }) => {
  const totalGamesPlayed = useGameStore(state => state.totalGamesPlayed) || 0;
  const totalWordsFound = useGameStore(state => state.totalWordsFound) || 0;
  const totalBalanceEarned = useGameStore(state => state.totalBalanceEarned) || 0;
  const maxCombo = useGameStore(state => state.maxCombo) || 0;
  const streak = useGameStore(state => state.streak) || 0;
  const { t } = useTranslation();

  return (
    <main className="flex-1 w-full flex flex-col p-6 pb-20 relative z-10 fade-in items-center">
      <div className="w-full max-w-sm">
        <div className="flex items-center mb-8">
          <button onClick={onBack} className="capsule mr-4">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          </button>
          <h2 className="text-white text-xl font-black tracking-widest uppercase">
            {t('stats')}
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10 flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-blue-400 text-3xl mb-2">sports_esports</span>
            <span className="text-3xl font-black text-white">{totalGamesPlayed}</span>
            <span className="text-white/50 text-xs uppercase font-bold tracking-wider mt-1">{t('games_played')}</span>
          </div>
          
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10 flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-green-400 text-3xl mb-2">spellcheck</span>
            <span className="text-3xl font-black text-white">{totalWordsFound}</span>
            <span className="text-white/50 text-xs uppercase font-bold tracking-wider mt-1">{t('words_found')}</span>
          </div>

          <div className="bg-white/5 rounded-2xl p-4 border border-white/10 flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-yellow-400 text-3xl mb-2">bolt</span>
            <span className="text-3xl font-black text-white">{maxCombo}</span>
            <span className="text-white/50 text-xs uppercase font-bold tracking-wider mt-1">{t('max_combo')}</span>
          </div>

          <div className="bg-white/5 rounded-2xl p-4 border border-white/10 flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-red-400 text-3xl mb-2">local_fire_department</span>
            <span className="text-3xl font-black text-white">{streak}</span>
            <span className="text-white/50 text-xs uppercase font-bold tracking-wider mt-1">{t('daily_streak')}</span>
          </div>

          <div className="col-span-2 bg-white/5 rounded-2xl p-4 border border-white/10 flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-purple-400 text-3xl mb-2">account_balance_wallet</span>
            <span className="text-4xl font-black text-white">₺{(totalBalanceEarned / 100).toFixed(2)}</span>
            <span className="text-white/50 text-xs uppercase font-bold tracking-wider mt-1">{t('total_earned')}</span>
          </div>
        </div>
      </div>
    </main>
  );
};

export default StatsScreen;
