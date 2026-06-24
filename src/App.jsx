import React, { useState, useEffect, useCallback, useRef } from 'react';
import { generateLevel, VALID_WORDS, WORD_MEANINGS } from './utils/gameLogic';
import Grid from './components/Grid';
import Wheel from './components/Wheel';
import MapScreen from './components/MapScreen';
import DictionaryScreen from './components/DictionaryScreen';
import BadgesScreen from './components/BadgesScreen';
import DailySpinScreen from './components/DailySpinScreen';
import AkbilScreen from './components/AkbilScreen';
import LevelComplete from './components/LevelComplete';
import TutorialModal from './components/TutorialModal';
import AnimatedBalance from './components/AnimatedBalance';
import SettingsScreen from './components/SettingsScreen';
import StatsScreen from './components/StatsScreen';
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
  const { balance, levelIndex, lives, combo, streak, checkStreak, incrementCombo, resetCombo, addBalance, deductLife, resetGame, unlockBadge, unlockedBadges, lastSpinDate, incrementTotalGames, incrementTotalWords, theme } = useGameStore();

  const [showDailySpin, setShowDailySpin] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [hintedLetters, setHintedLetters] = useState([]);
  const [isAdLoading, setIsAdLoading] = useState(false);
  const [goldLetter, setGoldLetter] = useState(null);
  
  const [shake, setShake] = useState(false);
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
      const tutorialSeen = localStorage.getItem('turnike_tutorial_seen');
      if (!tutorialSeen) {
        setShowTutorial(true);
      } else {
        const today = new Date().toLocaleDateString();
        if (lastSpinDate !== today) {
          setShowDailySpin(true);
        }
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
    if (combo >= 5) unlockBadge('combo_5');
    if (balance >= 5000) unlockBadge('rich'); // 50 TL
    if (maxUnlockedLevel >= 1) unlockBadge('first_ticket');

    if (unlockedBadges.length > prevBadgesCount.current) {
      setTimeout(() => {
        showFeedback('correct', '🏆 YENİ ROZET!');
        Haptics.notification({ type: NotificationType.Success }).catch(()=>{});
      }, 1000); // Oyundaki diğer aksiyonlarla çakışmaması için ufak gecikme
      prevBadgesCount.current = unlockedBadges.length;
    }
  }, [streak, combo, balance, maxUnlockedLevel, unlockedBadges.length, unlockBadge]);

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

  const advanceLevel = () => {
    const next = levelIndex + 1;
    useGameStore.setState({ levelIndex: next });
    if (next > maxUnlockedLevel) setMaxUnlockedLevel(next);
    setScreen('game');
  };

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
      else if (screen === 'dictionary' || screen === 'levels' || screen === 'badges') setScreen('home');
      else if (screen === 'home') CapacitorApp.exitApp();
    });
    return () => { backListener.then(l => l.remove()).catch(()=>{}); };
  }, [screen]);

  const timerRef = useRef(null);
  const handleTimeExpire = useCallback(() => {
    if (screen !== 'game') return;
    showFeedback('wrong', 'SÜRE BİTTİ - YENİ KELİME');
    Haptics.notification({ type: NotificationType.Warning }).catch(()=>{});
    if (timerRef.current) timerRef.current.startTimer(30);
  }, [screen]);

  const timer = useGameTimer(30, handleTimeExpire);
  useEffect(() => { timerRef.current = timer; }, [timer]);
  const { timeLeft, startTimer, stopTimer } = timer;

  useEffect(() => {
    if (lives === 0 && screen === 'game') {
      stopTimer();
      setScreen('gameover');
      Haptics.notification({ type: NotificationType.Error }).catch(()=>{});
    }
  }, [lives, screen, stopTimer]);

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

  const loadLevel = useCallback((idx) => {
    const data = generateLevel(idx);
    setLevelData(data);
    setFoundWords([]);
    setHintedLetters([]);
    setMistakeCount(0);
    setLevelStartTime(Date.now());
    
    if (Math.random() < 0.25 && data.characters.length > 0) {
      setGoldLetter(data.characters[Math.floor(Math.random() * data.characters.length)]);
    } else {
      setGoldLetter(null);
    }

    // Zorluğa göre süre: Tek kelime=35sn, Çok kelime=30sn
    const timeToGive = data.words.length <= 1 ? 35 : 30;
    startTimer(timeToGive);
  }, [startTimer]);

  useEffect(() => { if (screen === 'game') loadLevel(levelIndex); }, [levelIndex, screen, loadLevel]);

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

  const showFeedback = (type, text) => setFeedback({ type, text, id: Date.now() });

  const formatBalance = (val) => `₺ ${(val / 100).toFixed(2)}`;

  const handleWordSubmit = (word) => {
    if (screen !== 'game') return;
    const isGridWord = levelData.words.some(w => w.word === word);
    if (foundWords.includes(word)) { showFeedback('exists', 'ZATEN BULUNDU'); return; }
    
    if (isGridWord) {
      const newFound = [...foundWords, word];
      setFoundWords(newFound);
      
      // Combo ve Hız bonusu
      const answerTime = (Date.now() - levelStartTime) / 1000;
      let baseScore = 150; // 1.50 TL 
      if (answerTime < 3) baseScore += 50; // Hızlı cevap bonusu

      const multiplier = combo >= 4 ? 2.0 : (combo >= 2 ? 1.5 : 1);
      const scoreReward = Math.floor(baseScore * multiplier);

      if (answerTime < 3) unlockBadge('speed_demon'); // Hızlı kelime
      incrementCombo();
      addBalance(scoreReward);

      if (WORD_MEANINGS[word]) {
        const newFound = [...foundWords, word];
        setFoundWords(newFound);
        
        // Altın harf kontrolü
        if (goldLetter && word.includes(goldLetter)) {
          addBalance(25); // 0.25 TL bonus
          setGoldLetter(null);
          setTimeout(() => showFeedback('exists', 'ALTIN HARF! +₺0.25'), 400);
        }

        setInfoCard({ word, meaning: WORD_MEANINGS[word], id: Date.now() });
        Haptics.notification({ type: NotificationType.Success }).catch(()=>{});
      } else {
        const newFound = [...foundWords, word];
        setFoundWords(newFound);
        // Turnike geçişi animasyon hissi (yeşil doğru)
        showFeedback('correct', 'DOĞRU!');
        Haptics.impact({ style: ImpactStyle.Light }).catch(()=>{});
      }

      // Süreyi yenile
      const timeToGive = levelData.words.length <= 1 ? 35 : 30;
      startTimer(timeToGive);

      if (newFound.length === levelData.words.length) {
        incrementTotalWords();
        stopTimer();
        if (mistakeCount === 0) { 
          setTimeout(() => showFeedback('correct', 'KUSURSUZ! +₺0.50'), 800); 
          addBalance(50); 
          unlockBadge('flawless'); 
        }
        setTimeout(() => { setLearnedWords(prev => Array.from(new Set([...prev, ...newFound]))); setScreen('levelComplete'); }, 3000);
      }
    } else {
      if (VALID_WORDS.has(word)) { 
        incrementCombo();
        if (WORD_MEANINGS[word]) {
          setInfoCard({ word, meaning: WORD_MEANINGS[word], id: Date.now() });
        } else {
          showFeedback('exists', 'EKSTRA! +₺0.20'); 
        }
        addBalance(20); 
        Haptics.impact({ style: ImpactStyle.Light }).catch(()=>{});
      }
      else { 
        setMistakeCount(c => c + 1); 
        deductLife(); // Yanlış kelime can götürür
        resetCombo();
        setShake(true);
        setTimeout(() => setShake(false), 400);
        showFeedback('wrong', 'GEÇERSİZ'); 
        Haptics.notification({ type: NotificationType.Error }).catch(()=>{});
      }
    }
  };

  const handleLetterHint = () => {
    if (balance >= 25) { // 0.25 TL
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
          addBalance(-25);
          const pick = candidates[Math.floor(Math.random() * candidates.length)];
          setHintedLetters(prev => [...prev, pick]);
          Haptics.impact({ style: ImpactStyle.Light }).catch(()=>{});
        }
      }
    } else {
      showFeedback('wrong', 'BAKİYE YETERSİZ');
      Haptics.notification({ type: NotificationType.Warning }).catch(()=>{});
    }
  };

  const handleHint = () => {
    if (balance >= 75) { // 0.75 TL
      const missing = levelData.words.filter(w => !foundWords.includes(w.word));
      if (missing.length > 0) {
        addBalance(-75);
        const pick = missing[Math.floor(Math.random() * missing.length)];
        const newFound = [...foundWords, pick.word];
        setFoundWords(newFound);
        const meaning = WORD_MEANINGS[pick.word] ? `${pick.word}: ${WORD_MEANINGS[pick.word]}` : pick.word;
        showFeedback('exists', meaning);
        Haptics.impact({ style: ImpactStyle.Medium }).catch(()=>{});
        if (newFound.length === levelData.words.length) {
          stopTimer();
          setTimeout(() => { setLearnedWords(prev => Array.from(new Set([...prev, ...newFound]))); setScreen('levelComplete'); }, 1500);
        }
      }
    } else { 
      showFeedback('wrong', 'BAKİYE YETERSİZ'); 
      Haptics.notification({ type: NotificationType.Warning }).catch(()=>{});
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
          SÖZCÜK SEFERİ
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
  if (screen === 'gameover') {
    return (
      <div className="game-bg min-h-screen flex flex-col items-center justify-center relative z-10 fade-in px-6 text-center">
        <span className="material-symbols-outlined text-red-500 text-6xl mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>directions_run</span>
        <h1 className="text-white text-3xl font-black mb-2">Treni Kaçırdın!</h1>
        <p className="text-white/60 mb-8">Devam etmek için aşağıdaki seçeneklerden birini kullanabilirsin.</p>
        
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
            {isAdLoading ? 'Reklam İzleniyor...' : 'Reklam İzle (1 Can Al)'}
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
            25₺ Öde (1 Can Al)
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
            50₺ Öde (Seviyeyi Geç)
          </button>
        </div>

        <button
          onClick={() => { resetGame(); setScreen('home'); }}
          className="text-white/50 hover:text-white transition-colors text-sm font-bold underline"
        >
          ANA MENÜYE DÖN
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
      <div className="game-bg min-h-screen flex flex-col relative z-10 fade-in">
        {showTutorial && <TutorialModal onClose={() => { localStorage.setItem('turnike_tutorial_seen', 'true'); setShowTutorial(false); }} />}
        {showDailySpin && !showTutorial && <DailySpinScreen onComplete={() => setShowDailySpin(false)} />}
        <div className="w-full flex justify-between items-center px-4 pt-10 pb-4">
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

        <div className="flex-1 flex flex-col justify-center items-center px-4 -mt-10">
          <div className="w-32 h-32 rounded-full flex items-center justify-center mb-8 float-slow" style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(34,197,94,0.02))', border: '1px solid rgba(34,197,94,0.3)' }}>
            <span className="material-symbols-outlined text-[64px] text-green-500" style={{ fontVariationSettings: "'FILL' 1" }}>train</span>
          </div>

          <h1 className="text-white text-3xl font-black mb-1 tracking-tight">Hoş Geldin!</h1>
          <p className="text-white/35 text-sm mb-3 font-medium">İstanbul'u dolaşarak kelime bul</p>

          <div className="text-center mb-2">
            <div className="inline-block px-5 py-1.5 rounded-sm mb-3 neon-blink"
              style={{
                background: 'linear-gradient(135deg, #0d1f0d, #091509)',
                border: '1px solid rgba(34,197,94,0.5)',
                boxShadow: '0 0 20px rgba(34,197,94,0.2)',
              }}
            >
              <p className="text-[11px] font-black tracking-[5px] uppercase" style={{ fontFamily: "'Orbitron', monospace", color: '#4ade80', textShadow: '0 0 8px rgba(74,222,128,0.8)' }}>
                SÖZCÜK SEFERİ
              </p>
            </div>
          </div>

          {streak > 0 && (
            <div className="flex items-center gap-1.5 px-4 py-1.5 bg-orange-500/10 border border-orange-500/30 rounded-full mb-8">
              <span className="text-orange-500 text-sm">🔥</span>
              <span className="text-orange-400 font-bold text-xs tracking-wider">{streak} GÜN SERİSİ</span>
            </div>
          )}

          <button
            onClick={() => { incrementTotalGames(); useGameStore.setState({ levelIndex: maxUnlockedLevel, lives: 3 }); setScreen('game'); }}
            className="play-btn mb-5 flex items-center gap-3"
          >
            <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
            OYNA
          </button>

          <div className="grid grid-cols-2 gap-3 w-full max-w-[280px]">
            <button
              onClick={() => setScreen('levels')}
              className="py-3 rounded-2xl font-bold text-white/80 text-[13px] tracking-widest uppercase transition-all active:scale-95 menu-btn flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">map</span>
              Harita
            </button>
            <button
              onClick={() => setScreen('dictionary')}
              className="py-3 rounded-2xl font-bold text-white/80 text-[13px] tracking-widest uppercase transition-all active:scale-95 menu-btn flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">menu_book</span>
              Sözlük
            </button>
          </div>
          <button
            onClick={() => setScreen('badges')}
            className="mt-3 w-full max-w-[280px] py-3 rounded-2xl font-bold text-white/80 text-[13px] tracking-widest uppercase transition-all active:scale-95 menu-btn flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]" style={{ color: '#fbbf24', fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
            Rozetlerim
          </button>
        </div>
      </div>
    );
  }

  /* ========== AKBİL SCREEN ========== */
  if (screen === 'akbil') {
    return (
      <div className="game-bg h-screen flex flex-col relative z-10 fade-in">
        <AkbilScreen onBack={() => setScreen('home')} />
      </div>
    );
  }

  /* ========== SETTINGS SCREEN ========== */
  if (screen === 'settings') {
    return (
      <div className="game-bg h-screen flex flex-col relative z-10 fade-in">
        <SettingsScreen onBack={() => setScreen('home')} />
      </div>
    );
  }

  /* ========== STATS SCREEN ========== */
  if (screen === 'stats') {
    return (
      <div className="game-bg h-screen flex flex-col relative z-10 fade-in">
        <StatsScreen onBack={() => setScreen('home')} />
      </div>
    );
  }

  /* ========== LEVELS SCREEN ========== */
  if (screen === 'levels') {
    return (
      <div className="game-bg h-screen flex flex-col relative z-10 fade-in">
        <header className="flex items-center justify-between px-4 pt-10 pb-3">
          <button onClick={() => setScreen('home')} className="capsule">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          </button>
          <div className="metro-board">İSTANBUL HATTI</div>
          <div className="w-10" />
        </header>
        <MapScreen currentLevel={maxUnlockedLevel + 1} onLevelSelect={(lvl) => { useGameStore.setState({ levelIndex: lvl - 1, lives: 3 }); setScreen('game'); }} />
      </div>
    );
  }

  /* ========== DICTIONARY SCREEN ========== */
  if (screen === 'dictionary') {
    return (
      <div className="game-bg h-screen flex flex-col relative z-10 fade-in">
        <header className="flex items-center justify-between px-4 pt-10 pb-3">
          <button onClick={() => setScreen('home')} className="capsule">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          </button>
          <div className="metro-board">TERİM SÖZLÜĞÜ</div>
          <div className="w-10" />
        </header>
        <DictionaryScreen learnedWords={learnedWords} />
      </div>
    );
  }

  /* ========== LEVEL COMPLETE ========== */
  if (screen === 'levelComplete') {
    const accuracy = Math.round((levelData.words.length / (levelData.words.length + mistakeCount)) * 100);
    const timeSpent = Math.round((Date.now() - levelStartTime) / 1000);
    return (
      <div className="game-bg min-h-screen flex flex-col relative z-10 fade-in">
        <LevelComplete
          level={levelData.levelName}
          wordsFoundCount={foundWords.length}
          totalWords={levelData.words.length}
          timeSpent={timeSpent}
          accuracy={accuracy}
          onNextLevel={advanceLevel}
          onRetry={() => { loadLevel(levelIndex); setScreen('game'); }}
        />
      </div>
    );
  }

  /* ========== BADGES SCREEN ========== */
  if (screen === 'badges') {
    return (
      <div className="game-bg h-screen flex flex-col relative z-10 fade-in">
        <BadgesScreen onBack={() => setScreen('home')} />
      </div>
    );
  }

  /* ========== GAME SCREEN ========== */
  if (screen === 'game') {
    if (!levelData) return null;

    return (
      <div className="game-bg h-screen w-screen overflow-hidden flex flex-col relative z-10 fade-in">
        {/* Top Bar */}
      <header className="w-full z-50 flex justify-between items-center px-4 pt-8 pb-2 shrink-0">
        <button onClick={() => { stopTimer(); setScreen('home'); }} className="capsule">
          <span className="material-symbols-outlined text-[15px]">arrow_back</span>
        </button>

        {/* İstasyon İlerleme Çubuğu */}
        <div className="flex-grow mx-4 flex items-center justify-center gap-1 relative max-w-[120px]">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/10 -translate-y-1/2 z-0" />
          <div className="absolute top-1/2 left-0 h-0.5 bg-green-500 -translate-y-1/2 z-0 transition-all duration-500" 
               style={{ width: `${(foundWords.length / levelData.words.length) * 100}%` }} />
          {levelData.words.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full z-10 transition-colors duration-500 border border-black ${i < foundWords.length ? 'bg-green-400' : 'bg-gray-600'}`} />
          ))}
        </div>

        <div className={`capsule flex flex-col items-end py-1 h-[42px] justify-center min-w-[90px] ${flashBalance ? 'balance-flash' : ''}`}>
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px]" style={{ color: '#fbbf24', fontVariationSettings: "'FILL' 1" }}>toll</span>
            <AnimatedBalance value={balance} />
          </div>
          {combo > 1 && (
            <span className="text-orange-400 font-bold text-[9px] uppercase tracking-widest mt-0.5 animate-pulse">
              {combo >= 4 ? '2.0x KOMBO' : '1.5x KOMBO'}
            </span>
          )}
        </div>
      </header>

      {/* Can Göstergesi ve Süre Çubuğu (Timer Bar) */}
      <div className="w-full flex items-center px-4 mb-1 justify-between text-xs">
        <div className="flex gap-1">
          {[1, 2, 3].map(i => (
            <span key={i} className={`material-symbols-outlined text-[14px] transition-all ${i <= lives ? 'text-red-500' : 'text-white/20'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
              favorite
            </span>
          ))}
        </div>
        <div className="text-white/50">{timeLeft}s</div>
      </div>
      <div className="w-full h-1 bg-white/10">
        <div 
          className="h-full transition-all duration-1000 ease-linear"
          style={{ 
            width: `${(timeLeft / (levelData.words.length <= 1 ? 35 : 30)) * 100}%`,
            background: timeLeft > 5 ? '#22c55e' : '#ef4444' 
          }}
        />
      </div>
      
      {/* İpucu butonları (sağda sabit) */}
      <div className="absolute right-4 z-40 flex flex-col gap-3" style={{ top: '50%', transform: 'translateY(-50%)' }}>
        <button
          onClick={handleHint}
          className="flex items-center justify-center rounded-full active:scale-90 transition-transform"
          style={{
            width: 44, height: 44,
            background: 'rgba(251,191,36,0.12)',
            border: '1.5px solid rgba(251,191,36,0.35)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 0 14px rgba(251,191,36,0.2)',
          }}
        >
          <span className="material-symbols-outlined text-yellow-400 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
        </button>

        <button
          onClick={handleLetterHint}
          className="flex items-center justify-center rounded-full active:scale-90 transition-transform"
          style={{
            width: 40, height: 40,
            background: 'rgba(59,130,246,0.12)',
            border: '1.5px solid rgba(59,130,246,0.35)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 0 14px rgba(59,130,246,0.2)',
          }}
        >
          <span className="material-symbols-outlined text-blue-400 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>spellcheck</span>
        </button>
      </div>

      {/* Grid Alanı */}
      <main className="flex-grow flex flex-col relative w-full overflow-hidden mt-4">
        <div className="flex-grow flex flex-col items-center justify-center px-2 pt-2 pb-[330px]">
          <Grid words={levelData.words} foundWords={foundWords} hintedLetters={hintedLetters} />
        </div>

        {/* Wheel Area */}
        <div className="flex-1 flex flex-col justify-center max-h-[400px]">
          <Wheel 
            letters={levelData.wheelLetters} 
            onWordSubmit={handleWordSubmit} 
            onShuffle={handleShuffle}
            bonusLetter={goldLetter}
          />
        </div>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full z-40 bottom-nav px-4 pb-5 pt-2">
        <div className="flex h-0.5 mb-3 mx-auto max-w-xs">
          {['#22c55e','#64748b','#eab308','#3b82f6','#1d4ed8'].map((c,i) => (
            <div key={i} className="flex-1" style={{ background: c }} />
          ))}
        </div>
        <div className="flex justify-around items-center max-w-sm mx-auto">
          <button onClick={() => { stopTimer(); setScreen('levels'); }} className="flex flex-col items-center gap-0.5 text-white/40 hover:text-white transition-colors active:scale-95 p-2">
            <span className="material-symbols-outlined text-[22px]">map</span>
            <span className="text-[9px] font-black tracking-widest">HARİTA</span>
          </button>
          <div className="flex flex-col items-center gap-0.5 px-6 py-2 rounded-2xl text-white relative"
            style={{
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              boxShadow: '0 0 24px rgba(34,197,94,0.4), 0 4px 16px rgba(0,0,0,0.3)'
            }}
          >
            <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>train</span>
            <span className="text-[9px] font-black tracking-widest">SEFER</span>
          </div>
          <button onClick={() => { stopTimer(); setPreviousScreen('game'); setScreen('dictionary'); }} className="flex flex-col items-center gap-0.5 text-white/40 hover:text-white transition-colors active:scale-95 p-2">
            <span className="material-symbols-outlined text-[22px]">menu_book</span>
            <span className="text-[9px] font-black tracking-widest">SÖZLÜK</span>
          </button>
        </div>
      </nav>

      {/* Teknik Bilgi Kartı Overlay */}
      {infoCard && (
        <div key={infoCard.id} className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center fade-in px-6">
          <div className="relative overflow-hidden rounded-2xl w-full max-w-md p-6 pointer-events-auto"
            style={{
              background: 'rgba(13, 31, 13, 0.95)',
              border: '1px solid rgba(34,197,94,0.4)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.8), 0 0 20px rgba(34,197,94,0.2)',
              backdropFilter: 'blur(16px)'
            }}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-green-500/30">
              <div className="h-full bg-green-400" style={{ width: '100%', animation: 'shrink 4s linear forwards' }} />
            </div>
            
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center bg-green-500/10 border border-green-500/30">
                <span className="material-symbols-outlined text-green-400 text-[26px]">precision_manufacturing</span>
              </div>
              <div>
                <h3 className="text-green-400 font-black text-lg tracking-widest mb-1 font-orbitron">{infoCard.word}</h3>
                <p className="text-white/80 text-sm leading-relaxed">{infoCard.meaning}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {feedback && (
        <div key={feedback.id} className="toast-container z-50">
          <div className={`toast ${feedback.type === 'correct' ? 'correct' : feedback.type === 'wrong' ? 'wrong' : 'exists'}`}>
            {feedback.text}
          </div>
        </div>
      )}
    </div>
  );
  }

  return null;
}

export default App;
