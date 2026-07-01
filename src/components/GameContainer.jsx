import React, { useState, useEffect, useCallback, useRef } from 'react';
import { generateLevel, VALID_WORDS_TR, VALID_WORDS_EN, WORD_MEANINGS_TR, WORD_MEANINGS_EN, getTimeForLevel } from '../utils/gameLogic';
import { playCorrect, playWrong, playLevelComplete, playTurnike, playCombo, playBadgeUnlock, playBalanceUp, playTick, playTimeUp, playGameOver } from '../utils/soundManager';
import { useTranslation } from '../utils/i18n';
import Grid from './Grid';
import Wheel from './Wheel';
import DailySpinScreen from './DailySpinScreen';
import LevelComplete from './LevelComplete';
import AnimatedBalance from './AnimatedBalance';
import BonusLockers from './BonusLockers';
import { useGameStore } from '../store/gameStore';
import { useGameTimer } from '../hooks/useGameTimer';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App as CapacitorApp } from '@capacitor/app';
import '../index.css';

export default function GameContainer({ 
  setScreen,
  setPreviousScreen,
}) {
  const [internalState, setInternalState] = useState('playing'); // 'playing' or 'levelComplete'


  // Zustand Store
  const maxUnlockedLevel = useGameStore(state => state.maxUnlockedLevel);
  const setMaxUnlockedLevel = useGameStore(state => state.setMaxUnlockedLevel);
  const addLearnedWord = useGameStore(state => state.addLearnedWord);
  const { balance, hints, addHints, levelIndex, lives, combo, streak, checkStreak, incrementCombo, resetCombo, addBalance, deductLife, resetGame, unlockBadge, unlockedBadges, lastSpinDate, incrementTotalGames, incrementTotalWords, theme, soundEnabled, hapticEnabled, language, totalWordsFound } = useGameStore();
  const { t } = useTranslation();

  // Dil bazlı kelime seti
  const VALID_WORDS = language === 'en' ? VALID_WORDS_EN : VALID_WORDS_TR;
  const WORD_MEANINGS = language === 'en' ? WORD_MEANINGS_EN : WORD_MEANINGS_TR;

  const [showDailySpin, setShowDailySpin] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
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



  const advanceLevel = () => {
    const next = levelIndex + 1;
    useGameStore.setState({ levelIndex: next });
    if (next > maxUnlockedLevel) setMaxUnlockedLevel(next);
    setInternalState('playing');
  };

  const timerRef = useRef(null);
  const levelDataRef = useRef(null); // Timer callback'i için güncel levelData referansı
  const handleTimeExpire = useCallback(() => {
    if (internalState !== 'playing') return;
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
  }, [timeLeft, levelData]);

  const loadLevel = useCallback((idx) => {
    const data = generateLevel(idx, language);
    setLevelData(data);
    levelDataRef.current = data; // Timer callback için güncel referans
    setFoundWords([]);
    setHintedLetters([]);
    setMistakeCount(0);
    setLevelStartTime(Date.now());
    
    if (Math.random() < 0.25 && data.wheelLetters.length > 0) {
      setGoldLetter(data.wheelLetters[Math.floor(Math.random() * data.wheelLetters.length)]);
    } else {
      setGoldLetter(null);
    }

    // Seviye bazlı süre (yüksek seviye = daha az süre)
    const timeToGive = getTimeForLevel(idx, data.words.length);
    setShowBonus(false);
    startTimer(timeToGive);
  }, [startTimer, language]);

  useEffect(() => { loadLevel(levelIndex); }, [levelIndex, loadLevel]);

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

  const handleWordSubmit = async (word) => {
    if (screen !== 'game') return false;
    const isGridWord = levelData.words.some(w => w.word === word);
    if (foundWords.includes(word) || useGameStore.getState().vaultWords.includes(word)) { 
      showFeedback('exists', t('already_found')); 
      return false; 
    }
    
    if (isGridWord) {
      const newFound = [...foundWords, word];
      setFoundWords(newFound);
      incrementTotalWords();
      
      // Kelimeyi hemen sözlüğe ekle
      addLearnedWord(word);
      
      // Combo ve Hız bonusu
      const answerTime = (Date.now() - levelStartTime) / 1000;
      let baseScore = 150;
      if (answerTime < 3) baseScore += 50;

      const multiplier = combo >= 4 ? 2.0 : (combo >= 2 ? 1.5 : 1);
      const scoreReward = Math.floor(baseScore * multiplier);

      if (answerTime < 3) unlockBadge('speed_demon');
      incrementCombo();
      addBalance(scoreReward);
      if (soundEnabled) playCorrect();
      if (soundEnabled && combo >= 2) playCombo();

      // Altın harf kontrolü
      if (goldLetter && word.includes(goldLetter)) {
        addBalance(25);
        setGoldLetter(null);
        setTimeout(() => showFeedback('exists', t('gold_letter')), 400);
        if (soundEnabled) playBalanceUp();
      }

      if (WORD_MEANINGS[word]) {
        setInfoCard({ word, meaning: WORD_MEANINGS[word], id: Date.now() });
        if (hapticEnabled) Haptics.notification({ type: NotificationType.Success }).catch(()=>{});
      } else {
        showFeedback('correct', t('correct'));
        if (hapticEnabled) Haptics.impact({ style: ImpactStyle.Light }).catch(()=>{});
      }

      // Süreyi yenile (seviye bazlı)
      const timeToGive = getTimeForLevel(levelIndex, levelData.words.length);
      startTimer(timeToGive);

      // Seviye tamamlandı mı?
      if (newFound.length === levelData.words.length) {
        if (levelIndex === 0) {
          localStorage.setItem('turnike_tutorial_seen', 'true');
        }
        stopTimer();
        if (soundEnabled) playLevelComplete();
        if (mistakeCount === 0) { 
          setTimeout(() => showFeedback('correct', t('perfect')), 800); 
          addBalance(50); 
          unlockBadge('flawless'); 
        }
        const currentLevelsCompleted = (useGameStore.getState().levelsCompleted || 0) + 1;
        useGameStore.getState().incrementLevelsCompleted();
        useGameStore.getState().syncCloud();

        setTimeout(() => { 
          // Ya OYUNUN SEVİYESİ 10'un katı ise, ya da KULLANICININ BİTİRDİĞİ seviye 10'un katı ise
          const isLevelMultipleOf10 = (levelIndex + 1) % 10 === 0;
          const isCompletedMultipleOf10 = currentLevelsCompleted % 10 === 0;
          
          if (isLevelMultipleOf10 || isCompletedMultipleOf10) {
            setShowBonus(true);
          } else {
            setInternalState('levelComplete'); 
          }
        }, 3000);
      }
      return true;
    } else {
      if (VALID_WORDS.has(word)) { 
        incrementCombo();
        incrementTotalWords();
        addLearnedWord(word);
        
        const currentVaultCount = useGameStore.getState().vaultWords.length;
        useGameStore.getState().addVaultWord(word);
        const newVaultCount = useGameStore.getState().vaultWords.length;
        
        if (currentVaultCount === 9 && newVaultCount === 0) {
          setShowVaultAnimation(true);
          setTimeout(() => setShowVaultAnimation(false), 3000);
          if (soundEnabled) setTimeout(() => playBalanceUp(), 500);
        } else if (newVaultCount > currentVaultCount) {
          showFeedback('exists', `KASAYA EKLENDİ (${newVaultCount}/10)`);
          if (hapticEnabled) Haptics.impact({ style: ImpactStyle.Light }).catch(()=>{});
        } else {
          showFeedback('exists', t('extra_word'));
        }
        
        if (WORD_MEANINGS[word]) {
          setInfoCard({ word, meaning: WORD_MEANINGS[word], id: Date.now() });
        }
        
        addBalance(5); // Kasa için küçük anında ödül
        if (soundEnabled) playCorrect();
        if (hapticEnabled) Haptics.impact({ style: ImpactStyle.Light }).catch(()=>{});
        return true;
      }
      else { 
        // TDK SÖZLÜK KONTROLÜ
        try {
          const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://sozluk.gov.tr/gts?ara=${word.toLocaleLowerCase('tr-TR')}`)}`;
          const res = await fetch(proxyUrl);
          const proxyData = await res.json();
          const data = proxyData.contents ? JSON.parse(proxyData.contents) : null;
          if (data && !data.error && data.length > 0) {
            // TDK'da kelime var!
            incrementCombo();
            incrementTotalWords();
            addLearnedWord(word);
            
            const currentVaultCount = useGameStore.getState().vaultWords.length;
            useGameStore.getState().addVaultWord(word);
            const newVaultCount = useGameStore.getState().vaultWords.length;
            
            if (currentVaultCount === 9 && newVaultCount === 0) {
              setShowVaultAnimation(true);
              setTimeout(() => setShowVaultAnimation(false), 3000);
              if (soundEnabled) setTimeout(() => playBalanceUp(), 500);
            } else if (newVaultCount > currentVaultCount) {
              showFeedback('exists', `KASAYA EKLENDİ (${newVaultCount}/10)`);
            }
            
            const meaning = data[0]?.anlamlarListe?.[0]?.anlam || "TDK onaylı kelime.";
            setInfoCard({ word, meaning, id: Date.now() });
            
            addBalance(5); // Kasa ödülü
            if (soundEnabled) playCorrect();
            if (hapticEnabled) Haptics.impact({ style: ImpactStyle.Light }).catch(()=>{});
            return true;
          }
        } catch (err) {
          console.error("TDK Check Failed", err);
          // Ağ hatası durumunda da kelimeyi reddet (sessizce geçme)
        }

        // TDK'da da yoksa veya ağ hatası varsa hata ver
        setMistakeCount(c => c + 1); 
        deductLife();
        triggerLifeLossAnim();
        resetCombo();
        setShake(true);
        setTimeout(() => setShake(false), 400);
        showFeedback('wrong', t('wrong')); 
        if (soundEnabled) playWrong();
        setWrongWordTrigger(Date.now());
        if (hapticEnabled) Haptics.notification({ type: NotificationType.Error }).catch(()=>{});
        return false;
      }
    }
  };

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
        addLearnedWord(pick.word);
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
              setInternalState('levelComplete');
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



  /* ========== HOME SCREEN ========== */
  /* ========== GAME SCREEN ========== */
  if (internalState === 'playing') {
    if (!levelData) return null;

    return (
      <div className="game-bg h-screen w-screen overflow-hidden flex flex-col relative z-10 fade-in">
        {showBonus && (
          <div className="absolute inset-0 z-[100] flex flex-col fade-in" style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
            <BonusLockers onComplete={() => { setShowBonus(false); setInternalState('levelComplete'); }} />
          </div>
        )}
        {showVaultAnimation && (
          <div className="absolute inset-0 z-[110] flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm fade-in">
            <div className="scale-in flex flex-col items-center p-6 rounded-3xl border border-green-500/30 text-center"
                 style={{ background: 'linear-gradient(135deg, #0f2d1a, #07170d)', boxShadow: '0 0 40px rgba(34,197,94,0.4)' }}>
              <span className="material-symbols-outlined text-green-400 text-6xl animate-bounce" style={{ fontVariationSettings: "'FILL' 1" }}>lock_open</span>
              <h2 className="text-white text-2xl font-black tracking-widest mt-4">KASA PATLATILDI!</h2>
              <p className="text-green-400/80 font-bold text-lg mt-2">+100.00 ₺ İstanbulkart Bakiyesi</p>
              <span className="text-white/40 text-xs mt-4 tracking-widest uppercase">Güvenli Seferler Dileriz</span>
            </div>
          </div>
        )}
        <style>{`
          @keyframes lifeLossAnim {
            0% { transform: translateY(0) scale(0.5); opacity: 0; }
            20% { transform: translateY(-20px) scale(1.2); opacity: 1; }
            80% { transform: translateY(-100px) scale(1); opacity: 1; }
            100% { transform: translateY(-130px) scale(0.8); opacity: 0; }
          }
          .life-loss-float {
            animation: lifeLossAnim 1.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          }
        `}</style>
        {/* Top Bar */}
      <header className="w-full z-50 flex justify-between items-center px-4 pt-8 pb-2 shrink-0 gap-2">
        <button onClick={() => { stopTimer(); setScreen('home'); }} className="capsule">
          <span className="material-symbols-outlined text-[15px]">arrow_back</span>
        </button>

        {/* İstasyon İlerleme Çubuğu */}
        <div className="flex-grow flex items-center justify-center gap-1 relative max-w-[100px]">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/10 -translate-y-1/2 z-0" />
          <div className="absolute top-1/2 left-0 h-0.5 bg-green-500 -translate-y-1/2 z-0 transition-all duration-500" 
               style={{ width: `${(foundWords.length / levelData.words.length) * 100}%` }} />
          {levelData.words.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full z-10 transition-colors duration-500 border border-black ${i < foundWords.length ? 'bg-green-400' : 'bg-gray-600'}`} />
          ))}
        </div>

        {/* Kasa Göstergesi (İstanbulkart Görünümlü) */}
        <div className="capsule flex items-center gap-1.5 px-2 h-[42px] justify-center relative overflow-hidden cursor-pointer" 
             onClick={() => setScreen('vault')}
             style={{ border: '1px solid rgba(34,197,94,0.2)' }}>
          <span className="material-symbols-outlined text-[14px] text-green-400" style={{ fontVariationSettings: "'FILL' 1" }}>credit_card</span>
          <div className="flex flex-col items-start">
            <span className="text-[6px] text-white/40 font-black tracking-widest leading-none">KASA</span>
            <span className="text-[10px] font-bold text-green-400 leading-none mt-0.5">{useGameStore.getState().vaultWords.length}/10</span>
          </div>
          {/* İlerleme doluluk çizgisi */}
          <div className="absolute bottom-0 left-0 h-[3px] bg-green-500 transition-all duration-300" 
               style={{ width: `${(useGameStore.getState().vaultWords.length / 10) * 100}%` }} />
        </div>

        <div className={`capsule flex flex-col items-end py-1 h-[42px] justify-center min-w-[80px] ${flashBalance ? 'balance-flash' : ''}`}>
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px]" style={{ color: '#fbbf24', fontVariationSettings: "'FILL' 1" }}>toll</span>
            <AnimatedBalance value={balance} />
          </div>
          {combo > 1 && (
            <span className="text-orange-400 font-bold text-[9px] uppercase tracking-widest mt-0.5 animate-pulse">
              {combo >= 4 ? t('combo_20') : t('combo_15')}
            </span>
          )}
        </div>
      </header>

      {/* Görev Başlığı / Mission Banner */}
      <div className="mx-4 mb-2 px-3 py-1.5 rounded-xl flex items-center justify-between gap-2 border border-white/5"
           style={{
             background: 'linear-gradient(135deg, rgba(34,197,94,0.08), rgba(59,130,246,0.02))',
             boxShadow: 'inset 0 0 12px rgba(255,255,255,0.02)'
           }}>
        <div className="flex flex-col">
          <span className="text-[9px] font-black tracking-widest text-green-400 uppercase">
            {levelData.missionType || "NORMAL SEFER"}
          </span>
          <span className="text-[11px] font-bold text-white/80">
            {levelData.missionTask || "Hat kontrolü yapılıyor..."}
          </span>
        </div>
        <span className="px-2 py-0.5 rounded-md text-[8px] font-black tracking-wider bg-white/5 text-white/50 uppercase">
          {levelData.provider || "Metro"}
        </span>
      </div>

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
            width: `${(timeLeft / getTimeForLevel(levelIndex, levelData.words.length)) * 100}%`,
            background: `hsl(${(timeLeft / getTimeForLevel(levelIndex, levelData.words.length)) * 120}, 84%, 55%)` 
          }}
        />
      </div>

      {lifeLossAnims.map(animId => (
        <div key={animId} className="absolute inset-0 flex items-center justify-center pointer-events-none z-[100] life-loss-float">
          <div className="flex items-center gap-2 text-red-500 font-black text-5xl" style={{ textShadow: '0 0 20px rgba(239,68,68,1)' }}>
            -1 <span className="material-symbols-outlined text-[48px]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
          </div>
        </div>
      ))}
      
      {/* Grid ve Çark Alanı */}
      <main className="flex-grow flex flex-col w-full overflow-hidden pb-[85px] relative z-10">
        
        {/* Üst Alan: Grid */}
        <div className="flex-1 w-full flex items-center justify-center px-2 py-4 relative z-10">
          <Grid words={levelData.words} foundWords={foundWords} hintedLetters={hintedLetters} />
        </div>

        {/* Alt Alan: Çark ve İpucu Butonları */}
        <div className="w-full relative z-20 flex flex-col items-center pb-6" style={{ height: '340px', flexShrink: 0 }}>
          
          <div className="relative w-full max-w-md h-[300px] flex items-center justify-center">
            
            {/* Sol İpucu (Kontrol Sinyali) */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-1">
              <button
                onClick={handleLetterHint}
                title={language === 'en' ? "Control Signal (Reveal Letter)" : "Kontrol Sinyali (Harf İpucu)"}
                className="flex items-center justify-center rounded-full active:scale-90 transition-transform cursor-pointer"
                style={{
                  width: 52, height: 52,
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1.5px solid rgba(255, 255, 255, 0.3)',
                  backdropFilter: 'blur(16px)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2), inset 0 2px 4px rgba(255, 255, 255, 0.2)',
                }}
              >
                <span className="material-symbols-outlined text-white text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>spellcheck</span>
              </button>
              <span className="px-3 py-1 rounded-full text-[10px] font-black text-white bg-black/30 backdrop-blur-md border border-white/20 shadow-sm">
                {hints > 0 ? `${hints}✦` : '25₺'}
              </span>
            </div>

            {/* Çark Arka Plan Efekti (Glass Plate) */}
            <div className="absolute inset-0 m-auto w-[280px] h-[280px] rounded-full pointer-events-none"
                 style={{ 
                   background: 'radial-gradient(circle, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.1) 100%)',
                   border: '2px solid rgba(255,255,255,0.15)',
                   backdropFilter: 'blur(12px)',
                   boxShadow: '0 12px 40px rgba(0,0,0,0.3), inset 0 4px 10px rgba(255,255,255,0.1)'
                 }} />

            {/* Çark */}
            <div className="absolute inset-0 m-auto w-[280px] h-[280px]">
              <Wheel 
                letters={levelData.wheelLetters} 
                onWordSubmit={handleWordSubmit} 
                onShuffle={handleShuffle} 
                bonusLetter={goldLetter} 
                wrongWordTrigger={wrongWordTrigger}
                isTutorial={levelIndex === 0 && localStorage.getItem('turnike_tutorial_seen') !== 'true'}
                tutorialWord={levelData.rootWord}
              />
            </div>

            {/* Sağ İpucu (Operasyon Desteği) */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-1">
              <button
                onClick={handleHint}
                title={language === 'en' ? "Operation Support (Reveal Word)" : "Operasyon Desteği (Kelime İpucu)"}
                className="flex items-center justify-center rounded-full active:scale-90 transition-transform cursor-pointer"
                style={{
                  width: 52, height: 52,
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1.5px solid rgba(255, 255, 255, 0.3)',
                  backdropFilter: 'blur(16px)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2), inset 0 2px 4px rgba(255, 255, 255, 0.2)',
                }}
              >
                <span className="material-symbols-outlined text-[#fbbf24] text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
              </button>
              <span className="px-3 py-1 rounded-full text-[10px] font-black text-[#fbbf24] bg-black/30 backdrop-blur-md border border-[#fbbf24]/30 shadow-sm">
                {hints > 0 ? `${hints}✦` : '75₺'}
              </span>
            </div>

          </div>
        </div>
      </main>

      {/* Bottom Nav removed for WoW aesthetics. Player can use back button in header to exit level. */}

      {/* Teknik Bilgi Kartı Overlay */}
      {infoCard && (
        <div key={infoCard.id} className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center fade-in px-6">
          <div 
            className="relative overflow-hidden rounded-2xl w-full max-w-md p-6 pointer-events-auto transition-transform"
            onTouchStart={handleInfoCardTouchStart}
            onTouchMove={handleInfoCardTouchMove}
            onTouchEnd={handleInfoCardTouchEnd}
            style={{
              background: 'rgba(13, 31, 13, 0.95)',
              border: '1px solid rgba(34,197,94,0.4)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.8), 0 0 20px rgba(34,197,94,0.2)',
              backdropFilter: 'blur(16px)',
              transform: `translateX(${swipeOffsetX}px)`,
              opacity: 1 - Math.abs(swipeOffsetX) / 300
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

  /* ========== LEVEL COMPLETE SCREEN ========== */
  if (internalState === 'levelComplete') {
    const accuracy = Math.round((levelData.words.length / (levelData.words.length + mistakeCount)) * 100) || 0;
    const timeSpent = Math.round((Date.now() - levelStartTime) / 1000);

    return (
      <LevelComplete 
        level={levelIndex + 1}
        wordsFoundCount={foundWords.length}
        totalWords={levelData.words.length}
        timeSpent={timeSpent}
        accuracy={accuracy}
        levelData={levelData} 
        onNextLevel={advanceLevel} 
        onRetry={() => {
          loadLevel(levelIndex);
          setInternalState('playing');
          const wordCount = levelDataRef.current?.words?.length || 4;
          timerRef.current?.startTimer(getTimeForLevel(levelIndex, wordCount));
        }}
        onHome={() => { stopTimer(); setScreen('home'); }}
      />
    );
  }

  return null;
}

