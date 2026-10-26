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
import { useGameStore, MAX_LIVES } from '../store/gameStore';
import UsernameModal from './UsernameModal';

export default function NavigationContainer({ 
  screen, setScreen, 
   
}) {
  const { t } = useTranslation();
  const maxUnlockedLevel = useGameStore(state => state.maxUnlockedLevel);
  const learnedWords = useGameStore(state => state.learnedWords);
  const username = useGameStore(state => state.username);

  if (screen === 'akbil') {
    return (
      <div className="game-bg h-screen flex flex-col relative z-10 fade-in">
        <AkbilScreen onBack={() => setScreen('home')} />
      </div>
    );
  }

  if (screen === 'vault') {
    return (
      <div className="game-bg h-screen flex flex-col relative z-10 fade-in overflow-hidden">
        <VaultScreen onBack={() => setScreen('home')} />
      </div>
    );
  }

  if (screen === 'leaderboard') {
    return (
      <div className="game-bg h-screen flex flex-col relative z-10 fade-in overflow-hidden">
        <LeaderboardScreen onBack={() => setScreen('home')} />
        {/* Kullanıcı adı ilk açılışta değil, liderlik tablosuna girerken sorulur */}
        {!username && <UsernameModal onCancel={() => setScreen('home')} />}
      </div>
    );
  }

  if (screen === 'lostitems') {
    return (
      <div className="game-bg h-screen flex flex-col relative z-10 fade-in overflow-hidden">
        <LostItemsScreen onBack={() => setScreen('home')} />
      </div>
    );
  }

  if (screen === 'duels') {
    return (
      <div className="game-bg h-screen flex flex-col relative z-10 fade-in overflow-hidden">
        <DuelsScreen onBack={() => setScreen('home')} />
      </div>
    );
  }

  if (screen === 'settings') {
    return (
      <div className="game-bg h-screen flex flex-col relative z-10 fade-in">
        <SettingsScreen onBack={() => setScreen('home')} />
      </div>
    );
  }

  if (screen === 'stats') {
    return (
      <div className="game-bg h-screen flex flex-col relative z-10 fade-in">
        <StatsScreen onBack={() => setScreen('home')} />
      </div>
    );
  }

  if (screen === 'levels') {
    return (
      <div className="game-bg h-screen flex flex-col relative z-10 fade-in">
        <header className="flex items-center justify-between px-4 pt-10 pb-3">
          <button onClick={() => setScreen('home')} className="capsule">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          </button>
          <div className="metro-board">{t('istanbul_line')}</div>
          <div className="w-10" />
        </header>
        <MapScreen 
          currentLevel={maxUnlockedLevel + 1} 
          onLevelSelect={(lvl) => { 
            useGameStore.setState({ levelIndex: lvl - 1, lives: MAX_LIVES }); 
            setScreen('game'); 
          }} 
        />
      </div>
    );
  }

  if (screen === 'dictionary') {
    return (
      <div className="game-bg h-screen flex flex-col relative z-10 fade-in">
        <header className="flex items-center justify-between px-4 pt-10 pb-3">
          <button onClick={() => setScreen('home')} className="capsule">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          </button>
          <div className="metro-board">{t('dictionary')}</div>
          <div className="w-10" />
        </header>
        <DictionaryScreen learnedWords={learnedWords} />
      </div>
    );
  }

  if (screen === 'badges') {
    return (
      <div className="game-bg h-screen flex flex-col relative z-10 fade-in">
        <BadgesScreen onBack={() => setScreen('home')} />
      </div>
    );
  }

  return null;
}
