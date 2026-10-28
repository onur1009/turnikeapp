import React, { useState, useEffect, useCallback, useRef } from 'react';
import { generateLevel, VALID_WORDS_TR, VALID_WORDS_EN, WORD_MEANINGS_TR, WORD_MEANINGS_EN, getTimeForLevel } from './utils/gameLogic';
import { playCorrect, playWrong, playLevelComplete, playTurnike, playCombo, playBadgeUnlock, playBalanceUp, playTick, playTimeUp, playGameOver } from './utils/soundManager';
import { useTranslation } from './utils/i18n';
import DailySpinScreen from './components/DailySpinScreen';
import AnimatedBalance from './components/AnimatedBalance';
import NavigationContainer from './components/NavigationContainer';
import GameContainer from './components/GameContainer';
import HomeScreen from './components/HomeScreen';
import { useGameStore, getMaxLives } from './store/gameStore';
import { useGameTimer } from './hooks/useGameTimer';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App as CapacitorApp } from '@capacitor/app';
import './index.css';

function App() {
  const [screen, setScreen] = useState('loading');
  const [previousScreen, setPreviousScreen] = useState('home');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isAppReady, setIsAppReady] = useState(false);

  // Zustand Store — Selector bazlı erişim
  const balance = useGameStore(state => state.balance);
  const hints = useGameStore(state => state.hints);
  const levelIndex = useGameStore(state => state.levelIndex);
  const lives = useGameStore(state => state.lives);
  const combo = useGameStore(state => state.combo);
  const streak = useGameStore(state => state.streak);
  const unlockedBadges = useGameStore(state => state.unlockedBadges);
  const lastSpinDate = useGameStore(state => state.lastSpinDate);
  const theme = useGameStore(state => state.theme);
  const soundEnabled = useGameStore(state => state.soundEnabled);
  const hapticEnabled = useGameStore(state => state.hapticEnabled);
  const language = useGameStore(state => state.language);
  const totalWordsFound = useGameStore(state => state.totalWordsFound);
  const username = useGameStore(state => state.username);
  const maxUnlockedLevel = useGameStore(state => state.maxUnlockedLevel);

  // Aksiyonlar
  const addHints = useGameStore(state => state.addHints);
  const addBalance = useGameStore(state => state.addBalance);
  const incrementCombo = useGameStore(state => state.incrementCombo);
  const resetCombo = useGameStore(state => state.resetCombo);
  const deductLife = useGameStore(state => state.deductLife);
  const resetGame = useGameStore(state => state.resetGame);
  const unlockBadge = useGameStore(state => state.unlockBadge);
  const checkStreak = useGameStore(state => state.checkStreak);
  const incrementTotalGames = useGameStore(state => state.incrementTotalGames);
  const incrementTotalWords = useGameStore(state => state.incrementTotalWords);
  const { t } = useTranslation();

  // Dil bazlı kelime seti
  const VALID_WORDS = language === 'en' ? VALID_WORDS_EN : VALID_WORDS_TR;
  const WORD_MEANINGS = language === 'en' ? WORD_MEANINGS_EN : WORD_MEANINGS_TR;

  const [showDailySpin, setShowDailySpin] = useState(false);
  const [flashBalance, setFlashBalance] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const showFeedback = useCallback((type, text) => {
    setFeedback({ type, text, id: Date.now() });
  }, []);

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const prevBalance = useRef(balance);
  useEffect(() => {
    if (balance > prevBalance.current) {
      setFlashBalance(true);
      setTimeout(() => setFlashBalance(false), 600);
    }
    prevBalance.current = balance;
  }, [balance]);

  useEffect(() => {
    // Yeni oyuncu önce oynasın: günlük çark ilk seviye bitince devreye girer
    if (isAppReady && screen === 'home' && maxUnlockedLevel >= 1) {
      const today = new Date().toLocaleDateString();
      if (lastSpinDate !== today) {
        setShowDailySpin(true);
      }
    }
  }, [isAppReady, screen, lastSpinDate, maxUnlockedLevel]);

  useEffect(() => {
    document.body.className = `theme-${theme}`;
  }, [theme]);

  useEffect(() => {
    checkStreak(); // Uygulama açıldığında veya component yüklendiğinde gün kontrolü
    setTimeout(() => setIsAppReady(true), 1500); // Açılış (Skeleton/Splash) ekranı
  }, [checkStreak]);

  // maxUnlockedLevel artık Zustand selector'dan geliyor (satır 36)

  // Rozet Kontrolleri ve Kutlama
  const prevBadgesCount = useRef(unlockedBadges.length);
  useEffect(() => {
    if (streak >= 3) unlockBadge('streak_3');
    if (streak >= 7) unlockBadge('streak_7');
    if (combo >= 5) unlockBadge('combo_5');
    if (combo >= 10) unlockBadge('combo_10');
    if (balance >= 5000) unlockBadge('rich');
    if (balance >= 20000) unlockBadge('wealthy');
    if (maxUnlockedLevel >= 1) unlockBadge('first_ticket');
    if (maxUnlockedLevel >= 5) unlockBadge('level_5');
    if (maxUnlockedLevel >= 10) unlockBadge('level_10');
    if (maxUnlockedLevel >= 20) unlockBadge('level_20');
    if (maxUnlockedLevel >= 30) unlockBadge('level_30');
    if (totalWordsFound >= 10) unlockBadge('words_10');
    if (totalWordsFound >= 50) unlockBadge('words_50');
    if (totalWordsFound >= 100) unlockBadge('words_100');

    if (unlockedBadges.length > prevBadgesCount.current) {
      // Oyun ekranında kutlamayı GameContainer yapıyor; burada da yapılırsa ses iki kez çalar
      if (screen !== 'game') {
        setTimeout(() => {
          showFeedback('correct', t('new_badge'));
          if (soundEnabled) playBadgeUnlock();
          if (hapticEnabled) Haptics.notification({ type: NotificationType.Success }).catch(()=>{});
        }, 1000);
      }
      prevBadgesCount.current = unlockedBadges.length;
    }
  }, [streak, combo, balance, maxUnlockedLevel, unlockedBadges.length, unlockBadge, totalWordsFound, screen]);

  const [levelData, setLevelData] = useState(null);
  const [foundWords, setFoundWords] = useState([]);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [levelStartTime, setLevelStartTime] = useState(0);

  // Teknik Bilgi Kartı (Tooltip) State'i
  const [infoCard, setInfoCard] = useState(null);

  const [learnedWords, setLearnedWords] = useState(() => {
    const saved = localStorage.getItem('turnike_dictionary');
    return saved ? JSON.parse(saved) : [];
  });

  // maxLevel ve learnedWords artık Zustand persist middleware tarafından otomatik kaydediliyor


  // NATIVE: Donanım Geri Tuşu & Durum Çubuğu
  useEffect(() => {
    const setupNative = async () => {
      try {
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#051424' });
      } catch (e) {} // Sadece web'de çalışırken hata vermesin
    };
    setupNative();

    const backListener = CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      if (screen === 'game') setScreen('home');
      else if (['dictionary', 'levels', 'badges', 'stats', 'settings', 'akbil', 'vault', 'leaderboard', 'lostitems', 'duels', 'daily', 'postcards'].includes(screen)) setScreen('home');
      else if (screen === 'home') CapacitorApp.exitApp();
    });
    
    return () => { 
      backListener.then(l => l.remove()).catch(()=>{}); 
    };
  }, [screen]);

  // Düello bağlantısı (?duel=...): kodu sakla, adres çubuğunu temizle, yükleme sonrası düelloya git
  // (yalnızca bu açılışta bağlantıyla gelindiyse düello ekranı açılır; kayıtlı kod her açılışta yönlendirmez)
  const openDuelOnStart = useRef(false);
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('duel');
    if (code) {
      openDuelOnStart.current = true;
      useGameStore.setState({ incomingDuel: code });
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (screen === 'loading') {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 28;
        if (progress >= 100) { progress = 100; clearInterval(interval); setTimeout(() => setScreen(openDuelOnStart.current ? 'duels' : 'home'), 500); }
        setLoadingProgress(Math.floor(progress));
      }, 130);
      return () => clearInterval(interval);
    }
  }, [screen]);


  /* ========== LOADING SCREEN ========== */
  if (screen === 'loading') {
    return (
      <div className="game-bg h-full flex flex-col items-center justify-center fade-in relative z-10">
        <div className="relative w-28 h-28 mb-8">
          <div className="absolute inset-0 rounded-full loading-ring"
            style={{ border: '3px solid transparent', borderTopColor: '#22c55e', borderRightColor: '#22c55e' }} />
          <div className="absolute inset-3 rounded-full loading-ring"
            style={{ border: '2px solid transparent', borderBottomColor: '#3b82f6', animationDirection: 'reverse', animationDuration: '0.7s' }} />
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span aria-hidden="true" className="material-symbols-outlined text-white text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>train</span>
          </div>
        </div>

        <h2 className="text-white text-2xl font-black tracking-[6px] mb-1">
          {t('word_journey')}
        </h2>
        <p className="text-white/30 text-[11px] tracking-[4px] mb-6 font-bold">TURNİKE</p>

        <div className="relative w-56">
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="h-full rounded-full transition-all duration-150"
              style={{ width: `${loadingProgress}%`, background: 'linear-gradient(90deg, #22c55e, #16a34a)', boxShadow: '0 0 10px rgba(34,197,94,0.5)' }} />
          </div>
          <p className="text-center text-white/40 text-[11px] font-bold mt-2 tracking-widest">{loadingProgress}%</p>
        </div>
      </div>
    );
  }


  if (!isAppReady) {
    return (
      <div className="game-bg min-h-full flex flex-col items-center justify-center relative z-10 fade-in">
        <div className="w-24 h-24 rounded-full flex items-center justify-center pulse-soft mb-6" style={{ background: 'linear-gradient(135deg, #1a3a1a, #0d2010)', border: '2px solid rgba(34,197,94,0.6)' }}>
          <span aria-hidden="true" className="material-symbols-outlined text-[52px]" style={{ color: '#4ade80' }}>train</span>
        </div>
        <h1 className="text-white text-2xl font-black tracking-widest uppercase mb-4">Turnike</h1>
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-bounce" style={{ animationDelay: '0s' }} />
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
          <div className="w-2 h-2 rounded-full bg-yellow-500 animate-bounce" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    );
  }

  /* ========== HOME SCREEN ========== */
  if (screen === 'home') {
    return (
      <>
        {showDailySpin && <DailySpinScreen onComplete={() => setShowDailySpin(false)} />}
        <HomeScreen
          setScreen={setScreen}
          showFeedback={showFeedback}
          flashBalance={flashBalance}
          onPlay={() => { incrementTotalGames(); useGameStore.setState({ levelIndex: maxUnlockedLevel, lives: getMaxLives(useGameStore.getState().completedSets) }); setScreen('game'); }}
        />
        {/* Ekran okuyucu için kalıcı canlı bölge: görsel toast her seferinde yeniden oluştuğundan okunmuyordu */}
        <div className="sr-only" role="status" aria-live="polite">{feedback?.text || ''}</div>
        {feedback && (
          <div key={feedback.id} className="toast-container z-50" aria-hidden="true">
            <div className={`toast ${feedback.type === 'correct' ? 'correct' : feedback.type === 'wrong' ? 'wrong' : 'exists'}`}>
              {feedback.text}
            </div>
          </div>
        )}
      </>
    );
  }

  /* ========== NAVIGATION SCREENS ========== */
  if (['akbil', 'vault', 'leaderboard', 'settings', 'stats', 'levels', 'dictionary', 'badges', 'lostitems', 'duels', 'daily', 'postcards'].includes(screen)) {
    return (
      <NavigationContainer 
        screen={screen} 
        setScreen={setScreen} 
         
         
      />
    );
  }

  /* ========== GAME SCREEN ========== */
  if (screen === 'game') {
    return (
      <GameContainer 
        setScreen={setScreen}
        setPreviousScreen={setPreviousScreen}
        
        
        
        
      />
    );
  }

  return null;
}

export default App;
