import React from 'react';
import MapScreen from './MapScreen';
import DictionaryScreen from './DictionaryScreen';
import BadgesScreen from './BadgesScreen';
import SettingsScreen from './SettingsScreen';
import StatsScreen from './StatsScreen';
import VaultScreen from './VaultScreen';
import LeaderboardScreen from './LeaderboardScreen';
import AkbilScreen from './AkbilScreen';
import LostItemsScreen from './LostItemsScreen';
import DuelsScreen from './DuelsScreen';
import { useTranslation } from '../utils/i18n';
import { useGameStore, getMaxLives } from '../store/gameStore';
import UsernameModal from './UsernameModal';
import ScreenHeader from './ScreenHeader';
import { getStationForLevel } from '../utils/transitNetwork';

export default function NavigationContainer({ 
  screen, setScreen, 
   
}) {
  const { t } = useTranslation();
  const maxUnlockedLevel = useGameStore(state => state.maxUnlockedLevel);
  const learnedWords = useGameStore(state => state.learnedWords);
  const username = useGameStore(state => state.username);

  if (screen === 'akbil') {
    return (
      <div className="game-bg h-full flex flex-col relative z-10 fade-in">
        <AkbilScreen onBack={() => setScreen('home')} />
      </div>
    );
  }

  if (screen === 'vault') {
    return (
      <div className="game-bg h-full flex flex-col relative z-10 fade-in overflow-hidden">
        <VaultScreen onBack={() => setScreen('home')} />
      </div>
    );
  }

  if (screen === 'leaderboard') {
    return (
      <div className="game-bg h-full flex flex-col relative z-10 fade-in overflow-hidden">
        <LeaderboardScreen onBack={() => setScreen('home')} />
        {/* Kullanıcı adı ilk açılışta değil, liderlik tablosuna girerken sorulur */}
        {!username && <UsernameModal onCancel={() => setScreen('home')} />}
      </div>
    );
  }

  if (screen === 'lostitems') {
    return (
      <div className="game-bg h-full flex flex-col relative z-10 fade-in overflow-hidden">
        <LostItemsScreen onBack={() => setScreen('home')} />
      </div>
    );
  }

  if (screen === 'duels') {
    return (
      <div className="game-bg h-full flex flex-col relative z-10 fade-in overflow-hidden">
        <DuelsScreen onBack={() => setScreen('home')} />
      </div>
    );
  }

  if (screen === 'settings') {
    return (
      <div className="game-bg h-full flex flex-col relative z-10 fade-in">
        <SettingsScreen onBack={() => setScreen('home')} />
      </div>
    );
  }

  if (screen === 'stats') {
    return (
      <div className="game-bg h-full flex flex-col relative z-10 fade-in">
        <StatsScreen onBack={() => setScreen('home')} />
      </div>
    );
  }

  if (screen === 'levels') {
    const playLevel = (lvl) => {
      useGameStore.setState({ levelIndex: lvl - 1, lives: getMaxLives(useGameStore.getState().completedSets) });
      setScreen('game');
    };
    const station = getStationForLevel(maxUnlockedLevel);
    return (
      <div className="game-bg h-full flex flex-col relative z-10 fade-in">
        <ScreenHeader title={t('map')} onBack={() => setScreen('home')} />
        <div className="flex-1 min-h-0 flex flex-col">
          <MapScreen currentLevel={maxUnlockedLevel + 1} onLevelSelect={playLevel} />
        </div>
        {/* Bulunduğun durak: haritadan doğrudan yolculuğa dön */}
        <div className="shrink-0 px-4 pt-3 pb-5" style={{ background: 'rgba(5,10,24,0.92)', borderTop: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3">
            <span className="line-badge" style={{ background: station.color }}>{station.id}</span>
            <div className="flex-1 min-w-0">
              <p className="text-white font-extrabold text-[15px] truncate">{station.displayName}</p>
              <p className="text-white/55 text-[12px] font-semibold">{t('leg')} {station.leg}/{station.legsPerStation} · {t('level_short')} {maxUnlockedLevel + 1}</p>
            </div>
            <button onClick={() => playLevel(maxUnlockedLevel + 1)} className="px-5 py-3 rounded-full bg-green-600 text-white font-black text-[13px] tracking-wider active:scale-95 transition-transform flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
              {t('continue_journey')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'dictionary') {
    return (
      <div className="game-bg h-full flex flex-col relative z-10 fade-in">
        <ScreenHeader title={t('dictionary')} onBack={() => setScreen('home')} />
        <DictionaryScreen learnedWords={learnedWords} />
      </div>
    );
  }

  if (screen === 'badges') {
    return (
      <div className="game-bg h-full flex flex-col relative z-10 fade-in">
        <BadgesScreen onBack={() => setScreen('home')} />
      </div>
    );
  }

  return null;
}
