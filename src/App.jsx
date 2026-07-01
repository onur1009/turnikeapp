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

  // Zustand Store
  const { balance, hints, addHints, levelIndex, lives, combo, streak, checkStreak, incrementCombo, resetCombo, addBalance, deductLife, resetGame, unlockBadge, unlockedBadges, lastSpinDate, incrementTotalGames, incrementTotalWords, theme, soundEnabled, hapticEnabled, language, totalWordsFound, username } = useGameStore();
  const { t } = useTranslation();

  // Dil bazlı kelime seti
  const VALID_WORDS = language === 'en' ? VALID_WORDS_EN : VALID_WORDS_TR;
  const WORD_MEANINGS = language === 'en' ? WORD_MEANINGS_EN : WORD_MEANINGS_TR;

  const [showDailySpin, setShowDailySpin] = useState(false);
  const [hintedLetters, setHintedLetters] = useState([]);
  const [isAdLoading, setIsAdLoading] = useState(false);
  const [goldLetter, setGoldLetter] = useState(null);
  
  const [shake, setShake] = useState(false);
  const [flashBalance, setFlashBalance] = useState(false);
  const [lifeLossAnims, setLifeLossAnims] = useState([]);
  const [wrongWordTrigger, setWrongWordTrigger] = useState(0);
  const [showBonus, setShowBonus] = useState(false);
  const [showVaultAnimation, setShowVaultAnimation] = useState(false);

  const triggerLifeLossAnim = () => {
    const id = Date.now();
    setLifeLossAnims(prev => [...prev, id]);
    setTimeout(() => {
      setLifeLossAnims(prev => prev.filter(animId => animId !== id));
    }, 1500);
  };

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

  const [maxUnlockedLevel, setMaxUnlockedLevel] = useState(() => parseInt(localStorage.getItem('turnike_maxLevel')) || 0);

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

  useEffect(() => { localStorage.setItem('turnike_maxLevel', maxUnlockedLevel.toString()); }, [maxUnlockedLevel]);
  useEffect(() => { localStorage.setItem('turnike_dictionary', JSON.stringify(learnedWords)); }, [learnedWords]);


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

  const timerRef = useRef(null);
  const levelDataRef = useRef(null); // Timer callback'i için güncel levelData referansı
  const handleTimeExpire = useCallback(() => {
    if (screen !== 'game') return;
    showFeedback('wrong', t('time_up'));
    
    useGameStore.getState().deductLife(); // deductLife zaten combo'yu sıfırlıyor
    const remainingLives = useGameStore.getState().lives;
    triggerLifeLossAnim();
    
    if (remainingLives > 0 && useGameStore.getState().soundEnabled) {
      playTimeUp();
    }
    
    setMistakeCount(c => c + 1);
    setShake(true);
    setTimeout(() => setShake(false), 400);
    if (hapticEnabled) Haptics.notification({ type: NotificationType.Warning }).catch(()=>{});
    
    // Güncel levelData'dan doğru kelime sayısıyla süreyi sıfırla
    if (timerRef.current) {
      const { levelIndex } = useGameStore.getState();
      const wordCount = levelDataRef.current?.words?.length || 4;
      const timeToGive = getTimeForLevel(levelIndex, wordCount);
      timerRef.current.startTimer(timeToGive);
    }
  }, [screen, t, hapticEnabled]);

  const timer = useGameTimer(30, handleTimeExpire);
  useEffect(() => { timerRef.current = timer; }, [timer]);
  const { timeLeft, startTimer, stopTimer } = timer;

  useEffect(() => {
    if (lives === 0 && screen === 'game') {
      stopTimer();
      setScreen('gameover');
      if (useGameStore.getState().soundEnabled) playGameOver();
      if (hapticEnabled) Haptics.notification({ type: NotificationType.Error }).catch(()=>{});
    }
  }, [lives, screen, stopTimer, hapticEnabled]);

  // Tick Sesi
  useEffect(() => {
    if (screen === 'game' && levelData && timeLeft > 0) {
      const totalTime = getTimeForLevel(useGameStore.getState().levelIndex, levelData.words.length);
      if (timeLeft <= totalTime / 2 && useGameStore.getState().soundEnabled) {
        playTick(timeLeft);
      }
    }
  }, [timeLeft, screen, levelData]);

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


  
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  useEffect(() => {
    if (infoCard) {
      const timer = setTimeout(() => setInfoCard(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [infoCard]);

  // InfoCard Swipe States
  const [touchStartX, setTouchStartX] = useState(null);
  const [swipeOffsetX, setSwipeOffsetX] = useState(0);

  const handleInfoCardTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };
  const handleInfoCardTouchMove = (e) => {
    if (touchStartX === null) return;
    const currentX = e.touches[0].clientX;
    setSwipeOffsetX(currentX - touchStartX);
  };
  const handleInfoCardTouchEnd = () => {
    if (Math.abs(swipeOffsetX) > 100) {
      setInfoCard(null); // Kapat
    }
    setTouchStartX(null);
    setSwipeOffsetX(0);
  };

  const showFeedback = (type, text) => setFeedback({ type, text, id: Date.now() });

  const formatBalance = (val) => `₺ ${(val / 100).toFixed(2)}`;


  const handleLetterHint = () => {
    if (hints > 0 || balance >= 25) {
      const missingWords = levelData.words.filter(w => !foundWords.includes(w.word));
      if (missingWords.length > 0) {
        const candidates = [];
        missingWords.forEach(wordObj => {
          for (let i = 0; i < wordObj.word.length; i++) {
            const x = wordObj.startX + (wordObj.isHorizontal ? i : 0);
            const y = wordObj.startY + (wordObj.isHorizontal ? 0 : i);
            const isRevealed = hintedLetters.some(hl => hl.x === x && hl.y === y);
            if (!isRevealed) {
              candidates.push({ x, y, char: wordObj.word[i] });
            }
          }
        });

        if (candidates.length > 0) {
          if (hints > 0) {
            addHints(-1);
          } else {
            addBalance(-25);
          }
          const pick = candidates[Math.floor(Math.random() * candidates.length)];
          setHintedLetters(prev => [...prev, pick]);
          if (soundEnabled) playTurnike();
          if (hapticEnabled) Haptics.impact({ style: ImpactStyle.Light }).catch(()=>{});
        }
      }
    } else {
      showFeedback('wrong', t('balance_low'));
      if (hapticEnabled) Haptics.notification({ type: NotificationType.Warning }).catch(()=>{});
    }
  };

  const handleHint = () => {
    if (hints > 0 || balance >= 75) {
      const missing = levelData.words.filter(w => !foundWords.includes(w.word));
      if (missing.length > 0) {
        if (hints > 0) {
          addHints(-1);
        } else {
          addBalance(-75);
        }
        const pick = missing[Math.floor(Math.random() * missing.length)];
        const newFound = [...foundWords, pick.word];
        setFoundWords(newFound);
        incrementTotalWords();
        // Hint ile açılan kelimeyi hemen sözlüğe ekle
        setLearnedWords(prev => Array.from(new Set([...prev, pick.word])));
        const meaning = WORD_MEANINGS[pick.word] ? `${pick.word}: ${WORD_MEANINGS[pick.word]}` : pick.word;
        showFeedback('exists', meaning);
        if (soundEnabled) playTurnike();
        if (hapticEnabled) Haptics.impact({ style: ImpactStyle.Medium }).catch(()=>{});
        if (newFound.length === levelData.words.length) {
          stopTimer();
          if (soundEnabled) playLevelComplete();
          
          // Bonus kontrol (handleWordSubmit ile aynı mantık)
          const currentLevelsCompleted = (useGameStore.getState().levelsCompleted || 0) + 1;
          useGameStore.getState().incrementLevelsCompleted();
          
          setTimeout(() => {
            const isLevelMultipleOf10 = (levelIndex + 1) % 10 === 0;
            const isCompletedMultipleOf10 = currentLevelsCompleted % 10 === 0;
            
            if (isLevelMultipleOf10 || isCompletedMultipleOf10) {
              setShowBonus(true);
            } else {
              setScreen('levelComplete');
            }
          }, 1500);
        }
      }
    } else { 
      showFeedback('wrong', t('balance_low')); 
      if (hapticEnabled) Haptics.notification({ type: NotificationType.Warning }).catch(()=>{});
    }
  };

  const handleShuffle = () => {
    if (levelData) setLevelData({ ...levelData, wheelLetters: [...levelData.wheelLetters].sort(() => Math.random() - 0.5) });
  };

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

  /* ========== GAME OVER SCREEN ========== */
  /* ========== GAME OVER SCREEN ========== */
  if (screen === 'gameover') {
    return (
      <div className="game-bg min-h-screen flex flex-col items-center justify-center relative z-10 fade-in px-6 text-center">
        <span className="material-symbols-outlined text-red-500 text-6xl mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>directions_run</span>
        <h1 className="text-white text-3xl font-black mb-2">{t('game_over')}</h1>
        <p className="text-white/60 mb-8">{t('game_over_desc')}</p>
        
        <div className="flex flex-col gap-3 w-full max-w-sm mb-6">
          <button
            disabled={isAdLoading}
            onClick={() => {
              setIsAdLoading(true);
              setTimeout(() => {
                useGameStore.setState({ lives: 1, gameStatus: 'playing' });
                setIsAdLoading(false);
                setScreen('game');
                startTimer(30);
              }, 3000);
            }}
            className={`w-full py-3.5 rounded-xl font-bold text-white text-sm tracking-wide bg-blue-600 hover:bg-blue-500 transition-colors flex items-center justify-center gap-2 ${isAdLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className="material-symbols-outlined text-[20px]">{isAdLoading ? 'hourglass_empty' : 'play_circle'}</span>
            {isAdLoading ? t('watching_ad') : t('watch_ad')}
          </button>
          
          <button
            disabled={balance < 25}
            onClick={() => {
              if (balance >= 25) {
                addBalance(-25);
                useGameStore.setState({ lives: 1, gameStatus: 'playing' });
                setScreen('game');
                startTimer(30);
              }
            }}
            className={`w-full py-3.5 rounded-xl font-bold text-white text-sm tracking-wide bg-green-600 hover:bg-green-500 transition-colors flex items-center justify-center gap-2 ${balance < 25 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className="material-symbols-outlined text-[20px]">favorite</span>
            {t('buy_life')}
          </button>

          <button
            disabled={balance < 50}
            onClick={() => {
              if (balance >= 50) {
                addBalance(-50);
                advanceLevel();
              }
            }}
            className={`w-full py-3.5 rounded-xl font-bold text-white text-sm tracking-wide bg-yellow-600 hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2 ${balance < 50 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className="material-symbols-outlined text-[20px]">fast_forward</span>
            {t('skip_level')}
          </button>
        </div>

        <button
          onClick={() => {
            if (window.confirm(t('confirm_reset'))) {
              useGameStore.setState({ lives: 5, gameStatus: 'idle', combo: 0 });
              setScreen('home');
            }
          }}
          className="text-white/50 hover:text-white transition-colors text-sm font-bold underline"
        >
          {t('main_menu')}
        </button>
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
    return (
      <div className="game-bg min-h-screen flex flex-col relative z-10 fade-in overflow-hidden">
        <style>{`
          @keyframes homeFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
          @keyframes homeGlow { 0%,100% { box-shadow: 0 0 30px rgba(34,197,94,0.15); } 50% { box-shadow: 0 0 60px rgba(34,197,94,0.4), 0 0 100px rgba(34,197,94,0.15); } }
          @keyframes homeSlide { from { transform: translateX(-100%); } to { transform: translateX(300%); } }
          @keyframes homeFadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes homeScaleIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
          @keyframes homeRing { to { transform: rotate(360deg); } }
          @keyframes homeParticle { 0% { opacity: 0; transform: translateY(0) scale(0); } 50% { opacity: 0.8; transform: translateY(-30px) scale(1); } 100% { opacity: 0; transform: translateY(-60px) scale(0.3); } }
          .home-particle { position: absolute; animation: homeParticle 3s ease-out infinite; }
        `}</style>

        {/* Animated Background Lines */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="absolute h-[1px] w-full" style={{
              top: `${20 + i * 20}%`,
              background: `linear-gradient(90deg, transparent, rgba(34,197,94,${0.04 + i * 0.02}), transparent)`,
              transform: `rotate(${-1 + i * 0.5}deg)`,
            }}>
              <div style={{ width: '60px', height: '2px', borderRadius: '1px', background: `rgba(34,197,94,${0.2 + i * 0.05})`, animation: `homeSlide ${4 + i}s linear infinite`, animationDelay: `${i * 0.8}s` }} />
            </div>
          ))}
          {/* Floating Particles */}
          {[...Array(6)].map((_, i) => (
            <div key={`p${i}`} className="home-particle" style={{ left: `${10 + i * 15}%`, bottom: '30%', animationDelay: `${i * 0.5}s` }}>
              <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px rgba(34,197,94,0.6)' }} />
            </div>
          ))}
        </div>

        {showDailySpin && <DailySpinScreen onComplete={() => setShowDailySpin(false)} />}
        {!username && <UsernameModal />}
        
        <div className="w-full flex justify-between items-center px-4 pt-10 pb-4 relative z-50">
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

        <div className="flex-1 flex flex-col justify-center items-center px-4 -mt-10 relative">
          {/* Animated Logo */}
          <div className="relative w-32 h-32 mb-8" style={{ animation: 'homeFloat 3s ease-in-out infinite, homeGlow 3s ease-in-out infinite' }}>
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(34,197,94,0.08)" strokeWidth="0.5" />
              <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(34,197,94,0.25)" strokeWidth="1"
                strokeDasharray="12 8" strokeLinecap="round"
                style={{ animation: 'homeRing 6s linear infinite' }} />
            </svg>
            <div className="absolute inset-0 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(34,197,94,0.02))', border: '1px solid rgba(34,197,94,0.3)' }}>
              <span className="material-symbols-outlined text-[64px] text-green-500" style={{
                fontVariationSettings: "'FILL' 1",
                filter: 'drop-shadow(0 0 12px rgba(34,197,94,0.5))'
              }}>train</span>
            </div>
          </div>

          {/* Title with animation */}
          <div style={{ animation: 'homeFadeIn 0.6s ease-out forwards', animationDelay: '0.1s', opacity: 0 }}>
            <div className="flex items-center justify-center gap-2 mb-1">
              <h1 className="text-white text-3xl font-black tracking-tight">{t('welcome')}</h1>
              <span className="bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded text-[10px] font-black tracking-widest mt-1">v1.2</span>
            </div>
          </div>
          <div style={{ animation: 'homeFadeIn 0.6s ease-out forwards', animationDelay: '0.25s', opacity: 0 }}>
            <p className="text-white/35 text-sm mb-3 font-medium">{t('subtitle')}</p>
          </div>

          <div style={{ animation: 'homeFadeIn 0.6s ease-out forwards', animationDelay: '0.4s', opacity: 0 }}>
            <div className="text-center mb-2">
              <div className="inline-block px-5 py-1.5 rounded-sm mb-3 neon-blink"
                style={{
                  background: 'linear-gradient(135deg, #0d1f0d, #091509)',
                  border: '1px solid rgba(34,197,94,0.5)',
                  boxShadow: '0 0 20px rgba(34,197,94,0.2)',
                }}
              >
                <p className="text-[11px] font-black tracking-[5px] uppercase" style={{ fontFamily: "'Orbitron', monospace", color: '#4ade80', textShadow: '0 0 8px rgba(74,222,128,0.8)' }}>
                  {t('word_journey')}
                </p>
              </div>
            </div>
          </div>

          {streak > 0 && (
            <div className="flex items-center gap-1.5 px-4 py-1.5 bg-orange-500/10 border border-orange-500/30 rounded-full mb-8" style={{ animation: 'homeScaleIn 0.5s ease-out forwards', animationDelay: '0.5s', opacity: 0 }}>
              <span className="text-orange-500 text-sm">🔥</span>
              <span className="text-orange-400 font-bold text-xs tracking-wider">{streak} {t('day_streak')}</span>
            </div>
          )}

          <div style={{ animation: 'homeScaleIn 0.5s ease-out forwards', animationDelay: '0.55s', opacity: 0 }}>
            <button
              onClick={() => { incrementTotalGames(); useGameStore.setState({ levelIndex: maxUnlockedLevel, lives: 3 }); setScreen('game'); }}
              className="play-btn mb-5 flex items-center gap-3"
            >
              <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
              {t('play')}
            </button>
          </div>

          <div style={{ animation: 'homeFadeIn 0.6s ease-out forwards', animationDelay: '0.7s', opacity: 0 }}>
            <div className="grid grid-cols-2 gap-3 w-full max-w-[280px]">
              <button
                onClick={() => setScreen('levels')}
                className="py-3 rounded-2xl font-bold text-white/80 text-[13px] tracking-widest uppercase transition-all active:scale-95 menu-btn flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">map</span>
                {t('map')}
              </button>
              <button
                onClick={() => {
                  if (maxUnlockedLevel >= 2) setScreen('dictionary');
                  else showFeedback('wrong', '3. Seviyede Açılır!');
                }}
                className={`py-3 rounded-2xl font-bold text-white/80 text-[13px] tracking-widest uppercase transition-all active:scale-95 menu-btn flex items-center justify-center gap-2 ${maxUnlockedLevel < 2 ? 'opacity-50' : ''}`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {maxUnlockedLevel < 2 ? 'lock' : 'menu_book'}
                </span>
                {t('dictionary')}
              </button>
              <button
                onClick={() => setScreen('vault')}
                className="py-3 rounded-2xl font-bold text-white/80 text-[13px] tracking-widest uppercase transition-all active:scale-95 menu-btn flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px] text-green-400">account_balance_wallet</span>
                {t('vault')}
              </button>
              <button
                onClick={() => setScreen('leaderboard')}
                className="py-3 rounded-2xl font-bold text-white/80 text-[13px] tracking-widest uppercase transition-all active:scale-95 menu-btn flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px] text-yellow-400">trophy</span>
                {t('leaderboard')}
              </button>
            </div>
            <button
              onClick={() => {
                if (maxUnlockedLevel >= 4) setScreen('badges');
                else showFeedback('wrong', '5. Seviyede Açılır!');
              }}
              className={`mt-3 w-full max-w-[280px] py-3 rounded-2xl font-bold text-white/80 text-[13px] tracking-widest uppercase transition-all active:scale-95 menu-btn flex items-center justify-center gap-2 ${maxUnlockedLevel < 4 ? 'opacity-50' : ''}`}
            >
              <span className="material-symbols-outlined text-[18px]" style={{ color: maxUnlockedLevel >= 4 ? '#fbbf24' : 'inherit', fontVariationSettings: maxUnlockedLevel >= 4 ? "'FILL' 1" : undefined }}>
                {maxUnlockedLevel < 4 ? 'lock' : 'emoji_events'}
              </span>
              {t('badges')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ========== NAVIGATION SCREENS ========== */
  if (['akbil', 'vault', 'leaderboard', 'settings', 'stats', 'levels', 'dictionary', 'badges'].includes(screen)) {
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
