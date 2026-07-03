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
import { LOST_ITEMS_CATALOG, LOST_ITEMS_SETS, getRandomItem } from '../data/lostItems';
import { calculateWordScore, calculateLevelCompletionBonus } from '../utils/scoring';
import { computeRawSignal, updateEwmvAndZScore, getAlpha, detectVolatility } from '../utils/dda';
import '../index.css';

export default function GameContainer({ 
  setScreen,
  setPreviousScreen,
}) {
  const [internalState, setInternalState] = useState('playing'); // 'playing' or 'levelComplete'


  // Zustand Store — Selector bazlı erişim (gereksiz re-render'ları önler)
  // Render'da kullanılan state değerleri
  const balance = useGameStore(state => state.balance);
  const hints = useGameStore(state => state.hints);
  const levelIndex = useGameStore(state => state.levelIndex);
  const lives = useGameStore(state => state.lives);
  const combo = useGameStore(state => state.combo);
  const streak = useGameStore(state => state.streak);
  const maxUnlockedLevel = useGameStore(state => state.maxUnlockedLevel);
  const unlockedBadges = useGameStore(state => state.unlockedBadges);
  const soundEnabled = useGameStore(state => state.soundEnabled);
  const hapticEnabled = useGameStore(state => state.hapticEnabled);
  const language = useGameStore(state => state.language);
  const totalWordsFound = useGameStore(state => state.totalWordsFound);

  // Aksiyonlar (stable references — re-render tetiklemez)
  const addHints = useGameStore(state => state.addHints);
  const addBalance = useGameStore(state => state.addBalance);
  const incrementCombo = useGameStore(state => state.incrementCombo);
  const resetCombo = useGameStore(state => state.resetCombo);
  const deductLife = useGameStore(state => state.deductLife);
  const resetGame = useGameStore(state => state.resetGame);
  const unlockBadge = useGameStore(state => state.unlockBadge);
  const incrementTotalGames = useGameStore(state => state.incrementTotalGames);
  const incrementTotalWords = useGameStore(state => state.incrementTotalWords);
  const setMaxUnlockedLevel = useGameStore(state => state.setMaxUnlockedLevel);
  const addLearnedWord = useGameStore(state => state.addLearnedWord);
  
  // Kayıp Eşya Seçicileri
  const addLostItem = useGameStore(state => state.addLostItem);
  const completedSets = useGameStore(state => state.completedSets);
  const refreshDailyItem = useGameStore(state => state.refreshDailyItem);
  const dailyItemTarget = useGameStore(state => state.dailyItemTarget);
  const checkStreak = useGameStore(state => state.checkStreak);
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

  // Faz 2: Kayıp Vagon & Hat Arızası & Eleme Jokeri State'leri
  const [eliminatedLetters, setEliminatedLetters] = useState([]);
  const [hatArizasi, setHatArizasi] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [hiddenWord, setHiddenWord] = useState(null);

  // LevelData değiştiğinde Faz 2 mekaniklerini sıfırla/hazırla
  useEffect(() => {
    if (levelData) {
      setEliminatedLetters([]);
      setHatArizasi(false);
      // Şans eseri %30 ihtimalle Kayıp Vagon belirle (çarktaki harflerden oluşabilen rastgele ekstra kelime)
      if (Math.random() < 0.3) {
        // Geçerli kelimelerden çark harfleriyle yazılabilen ama grid'de olmayan birini bul
        const availableChars = levelData.wheelLetters.join('');
        const canForm = (word) => {
          let temp = availableChars;
          for (let char of word) {
            if (temp.includes(char)) temp = temp.replace(char, '');
            else return false;
          }
          return true;
        };
        const possible = Array.from(VALID_WORDS).filter(w => canForm(w) && w.length > 2 && !levelData.words.some(lw => lw.word === w));
        if (possible.length > 0) setHiddenWord(possible[Math.floor(Math.random() * possible.length)]);
      } else {
        setHiddenWord(null);
      }
    }
  }, [levelData, VALID_WORDS]);

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
    
    const { levelIndex, performanceScore, currentVolatilityClass } = useGameStore.getState();
    const wordCount = levelDataRef.current?.words?.length || 4;
    const ddaTimeAdjust = levelDataRef.current?.ddaTimeAdjust || 0;
    const attemptsForTimer = mistakeCount + 2; // Next attempt will be mistakeCount + 1 fails, so the attempt number is mistakeCount + 2
    const timeToGive = getTimeForLevel(levelIndex, wordCount, attemptsForTimer, ddaTimeAdjust);
    
    // DDA: Record failure signal
    const store = useGameStore.getState();
    const attempts = mistakeCount + 1;
    const signal = computeRawSignal({ success: false, timeSpent: timeToGive, timeLimit: timeToGive, attempts });
    const alpha = getAlpha(store.totalGamesPlayed);
    const { ema, ewmv, zScore } = updateEwmvAndZScore(signal, store.performanceScore, store.ewmv, alpha);
    const recent = [...store.recentPerformance, signal].slice(-5);
    const volatility = detectVolatility(recent, zScore);
    
    store.setDDAState({
      performanceScore: ema,
      ewmv,
      recentPerformance: recent,
      currentVolatilityClass: volatility
    });
    
    timerRef.current.startTimer(timeToGive);
  }, [internalState, t, hapticEnabled]);

  const trainRef = useRef(null);
  const barRef = useRef(null);
  
  const timer = useGameTimer(30, handleTimeExpire, (remainingMs) => {
    if (!trainRef.current || !barRef.current) return;
    const totalTimeMs = getTimeForLevel(useGameStore.getState().levelIndex, levelDataRef.current?.words?.length || 4) * 1000;
    const pct = Math.min(1, Math.max(0, remainingMs / totalTimeMs));
    const hue = Math.round(pct * 120);
    
    trainRef.current.style.left = `calc(${pct * 100}% - 30px)`;
    trainRef.current.style.filter = pct <= 0.25 
      ? 'drop-shadow(0 0 4px rgba(239,68,68,0.9))' 
      : `drop-shadow(0 0 3px hsl(${hue}, 84%, 55%))`;
      
    barRef.current.style.width = `${pct * 100}%`;
    barRef.current.style.background = `hsl(${hue}, 84%, 55%)`;
    barRef.current.style.boxShadow = `0 0 6px hsl(${hue}, 84%, 55%)`;
  });
  
  useEffect(() => { timerRef.current = timer; }, [timer]);
  const { timeLeft, startTimer, stopTimer } = timer;

  // Hat Arızası eventi kaldırıldı (kullanıcı talebi)


  const handleInfoCard = (info) => {
    setInfoCard(info);
    if (hapticEnabled) Haptics.selectionStart().catch(()=>{});
  };

  // Teknik Bilgi Kartı (Tooltip) State'i
  const [infoCard, setInfoCard] = useState(null);



  const advanceLevel = () => {
    useGameStore.getState().nextLevel();
    setFoundWords([]);
    setHintedLetters([]);
    setMistakeCount(0);
    setInternalState('playing');
  };

  useEffect(() => {
    if (lives === 0 && internalState === 'playing') {
      stopTimer();
      setInternalState('gameover');
      if (useGameStore.getState().soundEnabled) playGameOver();
      if (hapticEnabled) Haptics.notification({ type: NotificationType.Error }).catch(()=>{});
    }
  }, [lives, internalState, stopTimer, hapticEnabled]);

  // Component mount olduğunda günlük eşyayı belirle
  useEffect(() => {
    refreshDailyItem(getRandomItem());
  }, [refreshDailyItem]);

  // Seviye yükleme (Level Load)
  useEffect(() => {
    if (internalState === 'playing' && levelData && timeLeft > 0) {
      const totalTime = getTimeForLevel(useGameStore.getState().levelIndex, levelData.words.length);
      if (timeLeft <= totalTime / 2 && useGameStore.getState().soundEnabled) {
        playTick(timeLeft);
      }
    }
  }, [timeLeft, levelData]);

  const loadLevel = useCallback((idx) => {
    const store = useGameStore.getState();
    const data = generateLevel(idx, language, mistakeCount + 1, store.performanceScore, store.currentVolatilityClass);
    setLevelData(data);
    levelDataRef.current = data; // Timer callback için güncel referans
    setFoundWords([]);
    setHintedLetters([]);
    setMistakeCount(0);
    setLevelStartTime(Date.now());
    store.setLevelSessionScore(0);
    
    // Check extra hint available from DDA pity system
    if (data.extraHintAvailable && data.words.length > 0) {
      // Free hint: Reveal first letter of the first missing word
      const missing = data.words[0];
      setHintedLetters([`${missing.word}-0`]);
    }
    
    if (Math.random() < 0.25 && data.wheelLetters.length > 0) {
      setGoldLetter(data.wheelLetters[Math.floor(Math.random() * data.wheelLetters.length)]);
    } else {
      setGoldLetter(null);
    }

    // Seviye bazlı süre (yüksek seviye = daha az süre)
    const timeToGive = getTimeForLevel(idx, data.words.length, 1, data.ddaTimeAdjust);
    setShowBonus(false);
    startTimer(timeToGive);
  }, [startTimer, language, mistakeCount]);

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

  const showFeedback = useCallback((type, text) => {
    setFeedback({ type, text, id: Date.now() });
  }, []);

  const formatBalance = (val) => `₺ ${(val / 100).toFixed(2)}`;

  const handleWordSubmit = async (word) => {
    if (internalState !== 'playing') return false;
    const isGridWord = levelData.words.some(w => w.word === word);
    if (foundWords.includes(word) || useGameStore.getState().vaultWords.includes(word)) { 
      showFeedback('exists', t('already_found')); 
      return false; 
    }

    // Faz 2: Kayıp Vagon (Hidden Word) kontrolü
    if (hiddenWord && word === hiddenWord) {
      let earned = 50;
      let msg = 'KAYIP VAGON BULUNDU! +50₺';
      
      // %30 şansla Kayıp Eşya düşür
      if (Math.random() < 0.3) {
        const itemId = getRandomItem();
        addLostItem(itemId);
        const item = LOST_ITEMS_CATALOG[itemId];
        
        if (itemId === dailyItemTarget) {
          earned += 150; // Günün aranan eşyası ekstra ödülü
          msg = `GÜNÜN EŞYASI BULUNDU! ${item.name} (+200₺)`;
        } else {
          msg = `EŞYA BULUNDU: ${item.name} (+50₺)`;
        }
      }
      
      addBalance(earned);
      showFeedback('correct', msg);
      if (soundEnabled) playCombo();
      setHiddenWord(null); // Tek seferlik
      return true;
    }
    
    if (isGridWord) {
      const newFound = [...foundWords, word];
      setFoundWords(newFound);
      incrementTotalWords();
      
      // Kelimeyi hemen sözlüğe ekle
      addLearnedWord(word);
      
      // Yeni Skor Sistemi (Scoring Engine)
      const answerTime = (Date.now() - levelStartTime) / 1000;
      const ddaTimeAdjust = levelData.ddaTimeAdjust || 0;
      const timeToGiveWord = getTimeForLevel(levelIndex, levelData.words.length, mistakeCount + 1, ddaTimeAdjust);
      const remainingTime = Math.max(0, timeToGiveWord - answerTime);
      
      const { points, breakdown } = calculateWordScore(word, combo, remainingTime, timeToGiveWord);

      if (answerTime < 3) unlockBadge('speed_demon');
      incrementCombo();
      addBalance(points);
      useGameStore.getState().setLevelSessionScore(useGameStore.getState().levelSessionScore + points);
      
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
      const newTimeToGive = getTimeForLevel(levelIndex, levelData.words.length, mistakeCount + 1, ddaTimeAdjust);
      startTimer(newTimeToGive);

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
        // Level Completion & Perfect Clear Bonus
        const { total, perfectClearBonus } = calculateLevelCompletionBonus(
          useGameStore.getState().levelSessionScore, 
          mistakeCount === 0, 
          timeLeft
        );
        addBalance(perfectClearBonus);
        
        // DDA: Record success signal
        const store = useGameStore.getState();
        const timeToGive2 = getTimeForLevel(levelIndex, levelData.words.length, mistakeCount + 1, ddaTimeAdjust);
        const timeSpent = timeToGive2 - timeLeft;
        const signal = computeRawSignal({ success: true, timeSpent, timeLimit: timeToGive2, attempts: mistakeCount + 1 });
        const alpha = getAlpha(store.totalGamesPlayed);
        const { ema, ewmv, zScore } = updateEwmvAndZScore(signal, store.performanceScore, store.ewmv, alpha);
        const recent = [...store.recentPerformance, signal].slice(-5);
        const volatility = detectVolatility(recent, zScore);
        
        store.setDDAState({
          performanceScore: ema,
          ewmv,
          recentPerformance: recent,
          currentVolatilityClass: volatility
        });

        const currentLevelsCompleted = (useGameStore.getState().levelsCompleted || 0) + 1;
        useGameStore.getState().incrementLevelsCompleted();
        useGameStore.getState().syncCloud();

        setTimeout(() => { 
          // Variable-Ratio Reinforcement: %12.5 ihtimalle (ortalama 8 levelde bir) sürpriz ödül
          const isProbabilisticBonus = Math.random() < 0.125;
          const isLevelMultipleOf10 = (levelIndex + 1) % 10 === 0; // Keep deterministic anchor for major milestones just in case
          
          if (isProbabilisticBonus || isLevelMultipleOf10) {
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
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2000);
          const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(`https://sozluk.gov.tr/gts?ara=${word.toLocaleLowerCase('tr-TR')}`)}`;
          const res = await fetch(proxyUrl, { signal: controller.signal });
          clearTimeout(timeoutId);
          const data = await res.json();
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
          // Graceful fallback: If API is unreachable, don't penalize. Just inform and accept it as an extra word temporarily without meaning, or just give a small warning.
          showFeedback('exists', 'Sözlük sunucusuna ulaşılamadı.');
          return false;
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
    // Nostalji Seti Buff: İpuçları %20 indirimli
    const hintCost = completedSets.includes('nostalji') ? 60 : 75;

    if (hints > 0 || balance >= hintCost) {
      const missing = levelData.words.filter(w => !foundWords.includes(w.word));
      if (missing.length > 0) {
        if (hints > 0) {
          addHints(-1);
        } else {
          addBalance(-hintCost);
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

  // Faz 2: Kesişim noktası bulunduğunda (Aktarma İstasyonu Bonusu)
  const handleIntersectionFound = useCallback((intersectionKey) => {
    // Aynı kesişim için tekrar bonus vermemek adına bir Set kullanılabilir, 
    // ama basitçe her çağrıldığında bakiye artışı ve UI geri bildirimi sağlayabiliriz.
    addBalance(10);
    showFeedback('correct', t('transfer_bonus') || 'Aktarma Bonusu! +10 ₺');
    if (soundEnabled) playBalanceUp();
  }, [addBalance, showFeedback, soundEnabled, t]);

  const handleEliminateLetter = () => {
    if (balance >= 50) {
      // Izgarada henüz bulunmamış kelimelerin harflerini bul
      const missingWords = levelData.words.filter(w => !foundWords.includes(w.word));
      const neededChars = new Set(missingWords.map(w => w.word.split('')).flat());
      
      // Çarktaki harflerden gereksiz olanları bul (ve henüz elenmemiş olanları)
      const uselessChars = levelData.wheelLetters.filter(c => !neededChars.has(c) && !eliminatedLetters.includes(c));
      
      if (uselessChars.length > 0) {
        addBalance(-50);
        const charToEliminate = uselessChars[Math.floor(Math.random() * uselessChars.length)];
        setEliminatedLetters(prev => [...prev, charToEliminate]);
        showFeedback('correct', `Harf Elendi: ${charToEliminate}`);
        if (soundEnabled) playTurnike();
      } else {
        showFeedback('exists', 'Elenecek harf yok!');
      }
    } else {
      showFeedback('wrong', t('balance_low'));
    }
  };

  const handleShuffle = () => {
    if (levelData) setLevelData({ ...levelData, wheelLetters: [...levelData.wheelLetters].sort(() => Math.random() - 0.5) });
  };

  /* ========== LOADING SCREEN ========== */
  if (!levelData) {
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
              style={{ width: `${0}%`, background: 'linear-gradient(90deg, #22c55e, #16a34a)', boxShadow: '0 0 10px rgba(34,197,94,0.5)' }} />
          </div>
          <p className="text-center text-white/40 text-[11px] font-bold mt-2 tracking-widest">{0}%</p>
        </div>
      </div>
    );
  }

  /* ========== GAME OVER SCREEN ========== */
  if (internalState === 'gameover') {
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
                setInternalState('playing');
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
                setInternalState('playing');
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
            setShowConfirmModal(true);
          }}
          className="text-white/50 hover:text-white transition-colors text-sm font-bold underline"
        >
          {t('main_menu')}
        </button>

        {/* Confirm Menu Return Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 fade-in">
            <div className="bg-[#1a1b26] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl scale-up text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500" />
              <span className="material-symbols-outlined text-red-500 text-5xl mb-4 mt-2" style={{ fontVariationSettings: "'FILL' 1" }}>
                warning
              </span>
              <h3 className="text-white text-xl font-bold mb-2">Ana Menüye Dön</h3>
              <p className="text-white/60 text-sm mb-6 leading-relaxed">
                {t('confirm_reset')}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-3 rounded-xl font-bold text-white/70 bg-white/5 hover:bg-white/10 transition-colors"
                >
                  İPTAL
                </button>
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    useGameStore.setState({ lives: 5, gameStatus: 'idle', combo: 0 });
                    setScreen('home');
                  }}
                  className="flex-1 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-500 transition-colors shadow-lg shadow-red-900/50"
                >
                  EVET, DÖN
                </button>
              </div>
            </div>
          </div>
        )}
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
      <div className="mx-4 mb-2 px-3 py-1.5 rounded-xl flex items-center justify-between gap-2 border border-white/5 cursor-pointer active:scale-95 transition-transform"
           style={{
             background: 'linear-gradient(135deg, rgba(34,197,94,0.08), rgba(59,130,246,0.02))',
             boxShadow: 'inset 0 0 12px rgba(255,255,255,0.02)'
           }}
           onClick={() => {
              if (levelData.missionType === "AKTARMA GÖREVİ") {
                setInfoCard({ word: "Aktarma Görevi", meaning: "Bu durakta kelimeler birbirine bağlı! Kesişim noktalarındaki ortak harfleri tamamlayarak ekstra bakiye kazanabilirsin.", id: Date.now() });
              } else if (levelData.missionType === "KAYIP VAGON") {
                setInfoCard({ word: "Kayıp Vagon", meaning: "Bu seferde listende görünmeyen ekstra bir kelime saklı. Çarktaki harfleri birleştirip kayıp vagonu bul, büyük ödülü kap!", id: Date.now() });
              } else {
                setInfoCard({ word: "Sefer Bilgisi", meaning: "Tüm kelimeleri bularak bir sonraki istasyona ilerle.", id: Date.now() });
              }
              if (hapticEnabled) Haptics.selectionStart().catch(()=>{});
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
      {/* Süre Çubuğu — Metro İstanbul Tasarımlı 4 Vagonlu Tren + Tünel Giriş/Çıkış İllüzyonu */}
      {(() => {
        const totalTime = getTimeForLevel(levelIndex, levelData.words.length);
        const pct = (timeLeft / totalTime);
        const hue = Math.round(pct * 120); // 120=yeşil, 0=kırmızı
        const isCritical = pct <= 0.25;
        return (
          <div className="w-full relative flex items-center px-[22px]" style={{ height: 26, margin: '6px 0' }}>
            {/* Tünel Karanlık Arka Planları (z-5) */}
            <div 
              style={{ 
                position: 'absolute', 
                left: 22, 
                bottom: 0, 
                width: 16, 
                height: 18, 
                background: '#030712', 
                borderTopLeftRadius: '8px', 
                borderTopRightRadius: '8px',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.9)',
                zIndex: 5
              }} 
            />
            <div 
              style={{ 
                position: 'absolute', 
                right: 22, 
                bottom: 0, 
                width: 16, 
                height: 18, 
                background: '#030712', 
                borderTopLeftRadius: '8px', 
                borderTopRightRadius: '8px',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.9)',
                zIndex: 5
              }} 
            />

            {/* Ray & Tren Alanı (z-10, overflow-hidden sadece yatayda tünellere göre sınırlar, dikeyde ise trenin taşmasına izin verir) */}
            <div 
              className="absolute overflow-hidden" 
              style={{ 
                left: 22, 
                right: 22, 
                bottom: 0, 
                height: 22, 
                zIndex: 10 
              }}
            >
              {/* Ray Çizgisi (Track) */}
              <div 
                className="w-full bg-white/10 rounded-[1px]" 
                style={{ 
                  height: 6, 
                  position: 'absolute', 
                  bottom: 5, 
                  left: 0, 
                  right: 0 
                }}
              >
                <div
                  ref={barRef}
                  className="h-full"
                  style={{
                    width: `${pct * 100}%`,
                    background: `hsl(${hue}, 84%, 55%)`,
                    boxShadow: `0 0 6px hsl(${hue}, 84%, 55%)`
                  }}
                />
              </div>

              {/* Tren Konteyneri — Ray Üzerinde Akıcı Hareket Eder */}
              <div
                ref={trainRef}
                className="absolute pointer-events-none"
                style={{
                  left: `calc(${pct * 100}% - 30px)`, // Ray ortalaması
                  width: 60,
                  height: 16,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {/* 4 Vagonlu Mavi/Gri Tren Tasarımı (v1.2 esintisi, daha büyük) */}
                <svg 
                  width="60" 
                  height="16" 
                  viewBox="0 0 60 16" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  style={{
                    transform: 'translateY(-5px)', // Ray üstüne dikey ortala
                    filter: isCritical 
                      ? 'drop-shadow(0 0 4px rgba(239,68,68,0.9))' 
                      : `drop-shadow(0 0 3px hsl(${hue}, 84%, 55%))`
                  }}
                >
                  {/* Vagon 1 (Ön Vagon - Mavi kabin, sola gidiyor) */}
                  <path 
                    d="M2 3C2 2.45 2.45 2 3 2H18C18.55 2 19 2.45 19 3V11C19 11.55 18.55 12 18 12H3C2.45 12 2 11.55 2 11V3Z" 
                    fill="#3b82f6" 
                  />
                  {/* Cam ve Siyah detay */}
                  <path d="M2 3.5C2 2.67 2.67 2 3.5 2H8V12H3.5C2.67 12 2 11.33 2 10.5V3.5Z" fill="#1e293b" />
                  <path d="M2.5 4H5.5V8H2.5V4Z" fill="#93c5fd" />
                  <circle cx="3.5" cy="10.5" r="0.75" fill="#facc15" />
                  <circle cx="6.5" cy="10.5" r="0.75" fill="#facc15" />
                  <rect x="11" y="4.5" width="5" height="3" rx="0.5" fill="#93c5fd" />

                  {/* Bağlantı 1 */}
                  <rect x="19" y="6" width="2" height="2" fill="#475569" />

                  {/* Vagon 2 (Gri) */}
                  <rect x="21" y="2" width="11" height="10" rx="1.5" fill="#4b5563" />
                  <rect x="21" y="5.5" width="11" height="1.5" fill="#3b82f6" />
                  <rect x="23" y="3.5" width="3" height="3" rx="0.5" fill="#93c5fd" />
                  <rect x="27" y="3.5" width="3" height="3" rx="0.5" fill="#93c5fd" />

                  {/* Bağlantı 2 */}
                  <rect x="32" y="6" width="2" height="2" fill="#475569" />

                  {/* Vagon 3 (Gri) */}
                  <rect x="34" y="2" width="11" height="10" rx="1.5" fill="#4b5563" />
                  <rect x="34" y="5.5" width="11" height="1.5" fill="#3b82f6" />
                  <rect x="36" y="3.5" width="3" height="3" rx="0.5" fill="#93c5fd" />
                  <rect x="40" y="3.5" width="3" height="3" rx="0.5" fill="#93c5fd" />

                  {/* Bağlantı 3 */}
                  <rect x="45" y="6" width="2" height="2" fill="#475569" />

                  {/* Vagon 4 (Gri) */}
                  <rect x="47" y="2" width="11" height="10" rx="1.5" fill="#4b5563" />
                  <rect x="47" y="5.5" width="11" height="1.5" fill="#3b82f6" />
                  <rect x="49" y="3.5" width="3" height="3" rx="0.5" fill="#93c5fd" />
                  <rect x="53" y="3.5" width="3" height="3" rx="0.5" fill="#93c5fd" />
                </svg>
              </div>
            </div>

            {/* Sol Beton Tünel Portal Çerçevesi (z-20, fiziksel kesimle rayın üstünü örter ama açıklığı boştur) */}
            <svg 
              className="absolute z-20 pointer-events-none" 
              style={{ left: 0, bottom: 0 }}
              width="40" 
              height="24" 
              viewBox="0 0 40 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Beton Portal Gövdesi */}
              <path 
                d="M 0,24 V 0 H 40 V 8 A 8,8 0 0,0 24,8 V 24 Z" 
                fill="#374151" 
                stroke="#4b5563"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              {/* Derz / Taş Blok Sınırları */}
              <line x1="0" y1="8" x2="24" y2="8" stroke="#1f2937" strokeWidth="1" />
              <line x1="0" y1="16" x2="24" y2="16" stroke="#1f2937" strokeWidth="1" />
              <line x1="24" y1="0" x2="24" y2="8" stroke="#1f2937" strokeWidth="1" />
            </svg>

            {/* Sağ Beton Tünel Portal Çerçevesi (z-20, fiziksel kesimle rayın üstünü örter ama açıklığı boştur) */}
            <svg 
              className="absolute z-20 pointer-events-none" 
              style={{ right: 0, bottom: 0 }}
              width="40" 
              height="24" 
              viewBox="0 0 40 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Beton Portal Gövdesi */}
              <path 
                d="M 40,24 V 0 H 0 V 8 A 8,8 0 0,1 16,8 V 24 Z" 
                fill="#374151" 
                stroke="#4b5563"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              {/* Derz / Taş Blok Sınırları */}
              <line x1="16" y1="8" x2="40" y2="8" stroke="#1f2937" strokeWidth="1" />
              <line x1="16" y1="16" x2="40" y2="16" stroke="#1f2937" strokeWidth="1" />
              <line x1="16" y1="0" x2="16" y2="8" stroke="#1f2937" strokeWidth="1" />
            </svg>
          </div>
        );
      })()}

      {lifeLossAnims.map(animId => (
        <div key={animId} className="absolute inset-0 flex items-center justify-center pointer-events-none z-[100] life-loss-float">
          <div className="flex items-center gap-2 text-red-500 font-black text-5xl" style={{ textShadow: '0 0 20px rgba(239,68,68,1)' }}>
            -1 <span className="material-symbols-outlined text-[48px]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
          </div>
        </div>
      ))}
      
      {/* Grid ve Çark Alanı */}
      <main className="flex-grow flex flex-col w-full overflow-hidden pb-2 relative z-10">
        
        {/* Üst Alan: Grid */}
        <div className="flex-1 w-full flex items-center justify-center px-2 py-4 relative z-10">
          <Grid 
            words={levelData.words} 
            foundWords={foundWords} 
            hintedLetters={hintedLetters} 
            onIntersectionFound={handleIntersectionFound}
          />
        </div>

        {/* Alt Alan: Çark ve İpucu Butonları */}
        <div className="w-full relative z-20 flex flex-col items-center pb-6" style={{ height: '340px', flexShrink: 0 }}>
          
          <div className={`relative w-full max-w-md h-[300px] flex items-center justify-center ${hatArizasi ? 'animate-shake opacity-70 filter grayscale' : ''}`}>
            
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
                eliminatedLetters={eliminatedLetters}
                isTutorial={levelIndex === 0 && localStorage.getItem('turnike_tutorial_seen') !== 'true'}
                tutorialWord={levelData.rootWord}
              />
            </div>

            {/* Sağ İpucu (Kilit Açma) ve Yeni: Harf Eleme */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-4">
              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={handleHint}
                  className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border-2 border-white/20 flex flex-col items-center justify-center text-white active:scale-95 transition-all shadow-[0_4px_16px_rgba(0,0,0,0.3)] hover:bg-white/20 hover:border-yellow-400"
                >
                  <span className="material-symbols-outlined text-[26px]" style={{ color: '#fbbf24' }}>lightbulb</span>
                </button>
                <div className="bg-black/60 rounded-full px-2.5 py-0.5 text-[10px] font-black text-white border border-white/10 mt-1 drop-shadow-md tracking-wider">
                  {hints > 0 ? `${hints} ✦` : '75 ₺'}
                </div>
              </div>

              {/* Faz 2: Harf Eleme Jokeri */}
              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={handleEliminateLetter}
                  className="w-12 h-12 rounded-full bg-red-500/20 backdrop-blur-md border-2 border-red-500/40 flex flex-col items-center justify-center text-red-400 active:scale-95 transition-all shadow-[0_4px_16px_rgba(0,0,0,0.3)] hover:bg-red-500/40 hover:border-red-400"
                >
                  <span className="material-symbols-outlined text-[22px]">disabled_visible</span>
                </button>
                <div className="bg-black/60 rounded-full px-2.5 py-0.5 text-[10px] font-black text-white border border-white/10 drop-shadow-md tracking-wider">
                  50 ₺
                </div>
              </div>
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
        wordsFoundCount={foundWords?.length || 0}
        totalWords={levelData?.words?.length || 0}
        timeSpent={timeSpent || 0}
        accuracy={accuracy || 0}
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

