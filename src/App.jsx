import React, { useState, useEffect, useCallback, useRef } from 'react';
import { generateLevel, VALID_WORDS_TR, VALID_WORDS_EN, WORD_MEANINGS_TR, WORD_MEANINGS_EN, getTimeForLevel } from './utils/gameLogic';
import { playCorrect, playWrong, playLevelComplete, playTurnike, playCombo, playBadgeUnlock, playBalanceUp, playTick, playTimeUp, playGameOver } from './utils/soundManager';
import { useTranslation } from './utils/i18n';
import DailySpinScreen from './components/DailySpinScreen';
import AnimatedBalance from './components/AnimatedBalance';
import NavigationContainer from './components/NavigationContainer';
import GameContainer from './components/GameContainer';
import UsernameModal from './components/UsernameModal';
import { useGameStore } from './store/gameStore';
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

  const prevBalance = useRef(balance);
  useEffect(() => {
    if (balance > prevBalance.current) {
      setFlashBalance(true);
      setTimeout(() => setFlashBalance(false), 600);
    }
    prevBalance.current = balance;
  }, [balance]);

  useEffect(() => {
    if (isAppReady && screen === 'home') {
      const today = new Date().toLocaleDateString();
      if (lastSpinDate !== today) {
        setShowDailySpin(true);
      }
    }
  }, [isAppReady, screen, lastSpinDate]);

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
      setTimeout(() => {
        showFeedback('correct', t('new_badge'));
        if (soundEnabled) playBadgeUnlock();
        if (hapticEnabled) Haptics.notification({ type: NotificationType.Success }).catch(()=>{});
      }, 1000);
      prevBadgesCount.current = unlockedBadges.length;
    }
  }, [streak, combo, balance, maxUnlockedLevel, unlockedBadges.length, unlockBadge, totalWordsFound]);

  const [levelData, setLevelData] = useState(null);
  const [foundWords, setFoundWords] = useState([]);
  const [feedback, setFeedback] = useState(null);
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
      else if (['dictionary', 'levels', 'badges', 'stats', 'settings', 'akbil'].includes(screen)) setScreen('home');
      else if (screen === 'home') CapacitorApp.exitApp();
    });
    
    return () => { 
      backListener.then(l => l.remove()).catch(()=>{}); 
    };
  }, [screen]);

  useEffect(() => {
    if (screen === 'loading') {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 28;
        if (progress >= 100) { progress = 100; clearInterval(interval); setTimeout(() => setScreen('home'), 500); }
        setLoadingProgress(Math.floor(progress));
      }, 130);
      return () => clearInterval(interval);
    }
  }, [screen]);


  /* ========== LOADING SCREEN ========== */
  if (screen === 'loading') {
    return (
      <div className="game-bg h-screen flex flex-col items-center justify-center fade-in relative z-10">
        <div className="relative w-28 h-28 mb-8">
          <div className="absolute inset-0 rounded-full loading-ring"
            style={{ border: '3px solid transparent', borderTopColor: '#22c55e', borderRightColor: '#22c55e' }} />
          <div className="absolute inset-3 rounded-full loading-ring"
            style={{ border: '2px solid transparent', borderBottomColor: '#3b82f6', animationDirection: 'reverse', animationDuration: '0.7s' }} />
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="material-symbols-outlined text-white text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>train</span>
          </div>
        </div>

        <h2 className="text-white text-2xl font-black tracking-[6px] mb-1" style={{ fontFamily: "'Orbitron', monospace" }}>
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
      <div className="game-bg min-h-screen flex flex-col items-center justify-center relative z-10 fade-in">
        <div className="w-24 h-24 rounded-full flex items-center justify-center pulse-soft mb-6" style={{ background: 'linear-gradient(135deg, #1a3a1a, #0d2010)', border: '2px solid rgba(34,197,94,0.6)' }}>
          <span className="material-symbols-outlined text-[52px]" style={{ color: '#4ade80' }}>train</span>
        </div>
        <h1 className="text-white text-2xl font-black tracking-widest uppercase mb-4" style={{ fontFamily: "'Orbitron', monospace" }}>Turnike</h1>
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
    const currentStationName = language === 'en' ? `LEVEL ${maxUnlockedLevel + 1}` : `SEVİYE ${maxUnlockedLevel + 1}`;
    const nextStationHint = language === 'en' ? 'SÖZCÜK SEFERI' : 'SÖZCÜK SEFERİ';
    return (
      <div className="game-bg min-h-screen flex flex-col relative z-10 fade-in overflow-hidden">
        <style>{`
          @keyframes ybsMarquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
          @keyframes ybsLedBlink { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
          @keyframes homeFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
          @keyframes homeGlow { 0%,100% { box-shadow: 0 0 30px rgba(34,197,94,0.15); } 50% { box-shadow: 0 0 60px rgba(34,197,94,0.4); } }
          @keyframes homeScaleIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
          @keyframes homeFadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes homeRing { to { transform: rotate(360deg); } }
          @keyframes trainShake { 0%,100% { transform: translateY(-50%) translateX(0); } 25% { transform: translateY(-50%) translateX(-2px); } 75% { transform: translateY(-50%) translateX(2px); } }
          .ybs-display { background: #0a0a0a; border: 1.5px solid #ff8c00; border-radius: 8px; font-family: 'Orbitron', monospace; color: #ff8c00; overflow: hidden; }
          .ybs-led { text-shadow: 0 0 8px #ff8c00, 0 0 16px #ff6600; }
          .ybs-marquee-track { overflow: hidden; white-space: nowrap; }
          .ybs-marquee-inner { display: inline-block; white-space: nowrap; animation: ybsMarquee 15s linear infinite; }
        `}</style>

        {showDailySpin && <DailySpinScreen onComplete={() => setShowDailySpin(false)} />}
        {!username && <UsernameModal />}

        {/* YBS — Yolcu Bilgilendirme Sistemi */}
        <div className="w-full px-4 pt-10 pb-2 relative z-50">
          <div className="flex justify-between items-center mb-3">
            <button className={`capsule active:scale-95 transition-transform cursor-pointer ${flashBalance ? 'balance-flash' : ''}`} onClick={() => setScreen('akbil')}>
              <span className="material-symbols-outlined text-[16px]" style={{ color: '#fbbf24', fontVariationSettings: "'FILL' 1" }}>toll</span>
              <AnimatedBalance value={balance} />
            </button>
            <div className="flex gap-2">
              <button className="capsule active:scale-95 transition-transform cursor-pointer" onClick={() => setScreen('stats')}>
                <span className="material-symbols-outlined text-[16px]">bar_chart</span>
              </button>
              <button className="capsule active:scale-95 transition-transform cursor-pointer" onClick={() => setScreen('settings')}>
                <span className="material-symbols-outlined text-[16px]">settings</span>
              </button>
            </div>
          </div>

          {/* YBS Pano */}
          <div className="ybs-display p-0 w-full">
            {/* Üst hat — Hat + Platform */}
            <div className="flex items-center justify-between px-3 pt-2 pb-1 border-b border-orange-800/40">
              <div className="flex items-center gap-2">
                <span className="ybs-led text-[10px] font-black tracking-[3px]">🚇 M1</span>
                <span style={{ color: '#ff8c00', opacity: 0.5, fontSize: 10 }}>|</span>
                <span className="ybs-led text-[10px] font-black tracking-[2px]">SÖZCÜK SEFERİ</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span className="ybs-led text-[9px]" style={{ animation: 'ybsLedBlink 1.2s ease-in-out infinite' }}>●</span>
                <span style={{ color: '#ff8c00', fontSize: 9, fontFamily: 'Orbitron', fontWeight: 700 }}>CANLI</span>
              </div>
            </div>

            {/* Orta — Mevcut Durak (Kayan Yazı) */}
            <div className="px-3 py-2 overflow-hidden">
              <div className="text-[8px] tracking-[4px] mb-1" style={{ color: 'rgba(255,140,0,0.5)', fontFamily: 'Orbitron' }}>MEVCUT DURAK</div>
              <div className="ybs-marquee-track">
                <div className="ybs-marquee-inner w-max">
                  <span className="ybs-led font-black tracking-[6px] pr-8" style={{ fontSize: 18 }}>
                    ►  {currentStationName}  ■  {nextStationHint}  ■  TURNIKE  ■  SÖZCÜK SEFERİ  ■ 
                  </span>
                  <span className="ybs-led font-black tracking-[6px] pr-8" style={{ fontSize: 18 }}>
                    ►  {currentStationName}  ■  {nextStationHint}  ■  TURNIKE  ■  SÖZCÜK SEFERİ  ■ 
                  </span>
                </div>
              </div>
            </div>

            {/* Alt bilgi şeridi */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-orange-950/30">
              {streak > 0 ? (
                <span style={{ color: '#fbbf24', fontSize: 9, fontFamily: 'Orbitron', fontWeight: 700 }}>🔥 {streak} GÜN SERİSİ</span>
              ) : (
                <span style={{ color: 'rgba(255,140,0,0.4)', fontSize: 9, fontFamily: 'Orbitron' }}>MET.-İSTB. 2025</span>
              )}
              <span style={{ color: 'rgba(255,140,0,0.5)', fontSize: 9, fontFamily: 'Orbitron' }}>v1.3 ■ {new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center px-4 -mt-4 relative">
          {/* Logo */}
          <div className="relative w-28 h-28 mb-6" style={{ animation: 'homeFloat 3s ease-in-out infinite, homeGlow 3s ease-in-out infinite' }}>
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(34,197,94,0.25)" strokeWidth="1" strokeDasharray="12 8" strokeLinecap="round" style={{ animation: 'homeRing 6s linear infinite' }} />
            </svg>
            <div className="absolute inset-0 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(34,197,94,0.02))', border: '1px solid rgba(34,197,94,0.3)' }}>
              <span className="material-symbols-outlined text-[58px] text-green-500" style={{ fontVariationSettings: "'FILL' 1", filter: 'drop-shadow(0 0 12px rgba(34,197,94,0.5))' }}>train</span>
            </div>
          </div>

          <div style={{ animation: 'homeFadeIn 0.6s ease-out forwards', animationDelay: '0.25s', opacity: 0 }}>
            <p className="text-white/35 text-sm mb-5 font-medium text-center">{t('subtitle')}</p>
          </div>

          <div style={{ animation: 'homeScaleIn 0.5s ease-out forwards', animationDelay: '0.4s', opacity: 0 }}>
            <button
              onClick={() => { incrementTotalGames(); useGameStore.setState({ levelIndex: maxUnlockedLevel, lives: 3 }); setScreen('game'); }}
              className="play-btn mb-5 flex items-center gap-3"
            >
              <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
              {t('play')}
            </button>
          </div>

          <div style={{ animation: 'homeFadeIn 0.6s ease-out forwards', animationDelay: '0.55s', opacity: 0 }}>
            <div className="grid grid-cols-2 gap-3 w-full max-w-[280px]">
              <button onClick={() => setScreen('levels')} className="py-3 rounded-2xl font-bold text-white/80 text-[13px] tracking-widest uppercase transition-all active:scale-95 menu-btn flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[18px]">map</span>{t('map')}
              </button>
              <button onClick={() => { if (maxUnlockedLevel >= 2) setScreen('dictionary'); else showFeedback('wrong', '3. Seviyede Açılır!'); }}
                className={`py-3 rounded-2xl font-bold text-white/80 text-[13px] tracking-widest uppercase transition-all active:scale-95 menu-btn flex items-center justify-center gap-2 ${maxUnlockedLevel < 2 ? 'opacity-50' : ''}`}>
                <span className="material-symbols-outlined text-[18px]">{maxUnlockedLevel < 2 ? 'lock' : 'menu_book'}</span>{t('dictionary')}
              </button>
              <button onClick={() => setScreen('vault')} className="py-3 rounded-2xl font-bold text-white/80 text-[13px] tracking-widest uppercase transition-all active:scale-95 menu-btn flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-green-400">account_balance_wallet</span>{t('vault')}
              </button>
              <button onClick={() => setScreen('leaderboard')} className="py-3 rounded-2xl font-bold text-white/80 text-[13px] tracking-widest uppercase transition-all active:scale-95 menu-btn flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-yellow-400">trophy</span>{t('leaderboard')}
              </button>
            </div>
            <button onClick={() => { if (maxUnlockedLevel >= 4) setScreen('badges'); else showFeedback('wrong', '5. Seviyede Açılır!'); }}
              className={`mt-3 w-full max-w-[280px] py-3 rounded-2xl font-bold text-white/80 text-[13px] tracking-widest uppercase transition-all active:scale-95 menu-btn flex items-center justify-center gap-2 ${maxUnlockedLevel < 4 ? 'opacity-50' : ''}`}>
              <span className="material-symbols-outlined text-[18px]" style={{ color: maxUnlockedLevel >= 4 ? '#fbbf24' : 'inherit', fontVariationSettings: maxUnlockedLevel >= 4 ? "'FILL' 1" : undefined }}>
                {maxUnlockedLevel < 4 ? 'lock' : 'emoji_events'}
              </span>{t('badges')}
            </button>
            <div className="flex gap-2 mt-3 w-full max-w-[280px]">
              <button onClick={() => setScreen('lostitems')} className="flex-1 py-3 rounded-2xl font-bold text-white/80 text-[11px] tracking-widest uppercase transition-all active:scale-95 menu-btn flex items-center justify-center gap-1 bg-blue-900/40 border border-blue-500/30">
                <span className="material-symbols-outlined text-[16px] text-blue-400">search</span>KAYIP EŞYA
              </button>
              <button onClick={() => setScreen('duels')} className="flex-1 py-3 rounded-2xl font-bold text-white/80 text-[11px] tracking-widest uppercase transition-all active:scale-95 menu-btn flex items-center justify-center gap-1 bg-red-900/40 border border-red-500/30">
                <span className="material-symbols-outlined text-[16px] text-red-400">swords</span>DÜELLO
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ========== NAVIGATION SCREENS ========== */
  if (['akbil', 'vault', 'leaderboard', 'settings', 'stats', 'levels', 'dictionary', 'badges', 'lostitems', 'duels'].includes(screen)) {
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
