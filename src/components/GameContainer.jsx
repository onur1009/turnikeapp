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
import { getStationForLevel } from '../utils/transitNetwork';
import VehicleSprite from './VehicleSprite';
import { VAULT_SIZE, VAULT_REWARD, getMaxLives, getHintCosts, getEarningsMultiplier } from '../store/gameStore';
import { formatKurus } from '../utils/format';
import '../index.css';

const SHOW_AD_REWARDS = false;

// Çarkın altındaki güç düğmesi: ikon solda, etiket ve fiyat sağda (alçak, ızgaraya yer bırakır)
const ToolButton = ({ icon, label, price, affordable, onClick, accent = '#ffffff' }) => (
  <button onClick={onClick} className={`tool-btn ${affordable ? '' : 'opacity-45'}`}>
    <span aria-hidden="true" className="material-symbols-outlined text-[20px]" style={{ color: accent, fontVariationSettings: "'FILL' 1" }}>{icon}</span>
    <span className="flex flex-col items-start gap-0.5">
      <span className="text-[12px] font-bold text-white/90 leading-none">{label}</span>
      <span className="text-[11px] font-bold text-white/55 leading-none tabular-nums">{price}</span>
    </span>
  </button>
);

// Izgaranın satır sayısı: çark boyutu buna göre ayarlanır ki çok satırlı bulmacalarda hücreler küçülmesin
const gridRows = (words) => {
  let min = Infinity, max = -Infinity;
  words.forEach(w => {
    const end = w.startY + (w.isHorizontal ? 0 : w.word.length - 1);
    min = Math.min(min, w.startY); max = Math.max(max, end);
  });
  return Number.isFinite(min) ? max - min + 1 : 1;
};
// Başlık + durum + ekspres + araçlar + boşluklar (px) ve ızgara satırı başına ayrılan yükseklik
const GAME_CHROME_PX = 270;
const GRID_ROW_PX = 46;

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
  const vaultCount = useGameStore(state => state.vaultWords.length);
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
  const [feedback, setFeedback] = useState(null);

  const showFeedback = useCallback((type, text) => {
    setFeedback({ type, text, id: Date.now() });
  }, []);

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
  const [mistakeCount, setMistakeCount] = useState(0);
  const [levelStartTime, setLevelStartTime] = useState(0);

  // Faz 2: Kayıp Vagon & Hat Arızası & Eleme Jokeri State'leri
  // "Terim" ipucu bu seviyede açıldı mı (ikinci basış ücretsiz)
  const [termRevealed, setTermRevealed] = useState(false);
  const [hatArizasi, setHatArizasi] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [hiddenWord, setHiddenWord] = useState(null);

  // LevelData değiştiğinde Faz 2 mekaniklerini sıfırla/hazırla
  useEffect(() => {
    if (levelData) {
      setTermRevealed(false);
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
  // Rahat mod: süre dolunca ceza yok. Sadece ekspres penceresi kapanır, bonus kaçar.
  const [isExpressOver, setIsExpressOver] = useState(false);
  const handleTimeExpire = useCallback(() => {
    setIsExpressOver(true);
  }, []);

  const trainRef = useRef(null);
  const barRef = useRef(null);
  const totalTimeMsRef = useRef(30000);
  
  const updateTrainPosition = useCallback((remainingMs) => {
    const totalMs = totalTimeMsRef.current;
    const pct = totalMs > 0 ? Math.min(1, Math.max(0, remainingMs / totalMs)) : 1;
    const hue = Math.round(pct * 120);
    
    if (trainRef.current) {
      trainRef.current.style.left = `calc(${pct * 100}% - 30px)`;
      // SVG filter'ı parent div'den kontrol et
      const svg = trainRef.current.querySelector('svg');
      if (svg) {
        svg.style.filter = pct <= 0.25 
          ? 'drop-shadow(0 0 4px rgba(239,68,68,0.9))' 
          : `drop-shadow(0 0 3px hsl(${hue}, 84%, 55%))`;
      }
    }
    if (barRef.current) {
      barRef.current.style.width = `${pct * 100}%`;
      barRef.current.style.background = `hsl(${hue}, 84%, 55%)`;
      barRef.current.style.boxShadow = `0 0 6px hsl(${hue}, 84%, 55%)`;
    }
  }, []);
  
  const timer = useGameTimer(30, handleTimeExpire, updateTrainPosition);
  
  useEffect(() => { timerRef.current = timer; }, [timer]);
  const { timeLeft, startTimer: rawStartTimer, stopTimer } = timer;
  
  // startTimer'ı wrap et: totalTimeMsRef'i güncelle ve ilk pozisyonu ayarla
  const startTimer = useCallback((seconds) => {
    totalTimeMsRef.current = seconds * 1000;
    // İlk pozisyonu hemen set et (tren beklemeden görünsün)
    requestAnimationFrame(() => updateTrainPosition(seconds * 1000));
    rawStartTimer(seconds);
  }, [rawStartTimer, updateTrainPosition]);

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

  // Ekspres penceresinin son saniyeleri: hafif tik sesi (ceza yok, sadece bonus hatırlatması)
  useEffect(() => {
    if (internalState === 'playing' && levelData && timeLeft > 0 && timeLeft <= 5) {
      if (useGameStore.getState().soundEnabled) playTick(timeLeft);
    }
  }, [timeLeft, levelData, internalState]);

  // Seviye sonu ekranı için kazanç dökümü
  const [levelSummary, setLevelSummary] = useState(null);

  // NOT: mistakeCount'a bağımlı olmamalı; aksi halde her hatada effect yeniden çalışıp seviyeyi baştan üretir
  const loadLevel = useCallback((idx) => {
    const store = useGameStore.getState();
    const data = generateLevel(idx, language, 1, store.performanceScore, store.currentVolatilityClass);
    setLevelData(data);
    levelDataRef.current = data; // Timer callback için güncel referans
    setFoundWords([]);
    setHintedLetters([]);
    setMistakeCount(0);
    setLevelStartTime(Date.now());
    setIsExpressOver(false);
    setLevelSummary(null);
    store.setLevelSessionScore(0);

    // DDA pity: zorlanan oyuncuya ilk kelimenin ilk harfi bedava açılır (Grid {x,y} bekler)
    if (data.extraHintAvailable && data.words.length > 0) {
      const first = data.words[0];
      setHintedLetters([{ x: first.startX, y: first.startY, char: first.word[0] }]);
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

  // Kelimeyle ya da ipucuyla son kelime açıldığında tek ortak bitiş akışı
  const completeLevel = (wordsFound) => {
    if (levelIndex === 0) localStorage.setItem('turnike_tutorial_seen', 'true');
    const expressRemaining = isExpressOver ? 0 : timeLeft;
    stopTimer();
    if (soundEnabled) playLevelComplete();

    const isFlawless = mistakeCount === 0;
    const perfectBonus = isFlawless ? 50 : 0;
    if (isFlawless) {
      setTimeout(() => showFeedback('correct', t('perfect')), 800);
      unlockBadge('flawless');
    }
    const store = useGameStore.getState();
    const { perfectClearBonus: expressBonus } = calculateLevelCompletionBonus(
      store.levelSessionScore, expressRemaining > 0, expressRemaining
    );
    // Gizemli Paket seti: seviye kazancının tamamı 1,5x (kelime puanı zaten eklendi, farkı burada verilir)
    const multiplier = getEarningsMultiplier(completedSets);
    const setBonus = Math.round((store.levelSessionScore + perfectBonus + expressBonus) * (multiplier - 1));
    addBalance(perfectBonus + expressBonus + setBonus);

    // DDA: başarı sinyali (bitirme süresi / ekspres süresi)
    const timeLimit = totalTimeMsRef.current / 1000;
    const timeSpent = Math.min(timeLimit, (Date.now() - levelStartTime) / 1000);
    const signal = computeRawSignal({ success: true, timeSpent, timeLimit, attempts: mistakeCount + 1 });
    const alpha = getAlpha(store.totalGamesPlayed);
    const { ema, ewmv, zScore } = updateEwmvAndZScore(signal, store.performanceScore, store.ewmv, alpha);
    const recent = [...store.recentPerformance, signal].slice(-5);
    store.setDDAState({
      performanceScore: ema,
      ewmv,
      recentPerformance: recent,
      currentVolatilityClass: detectVolatility(recent, zScore)
    });

    setLevelSummary({
      wordPoints: store.levelSessionScore,
      expressBonus,
      perfectBonus,
      setBonus,
      words: wordsFound,
      timeSpent: Math.round((Date.now() - levelStartTime) / 1000)
    });
    store.incrementLevelsCompleted();
    // İlerleme bitiş anında kaydedilir; oyuncu "Ana menü"ye dönse de sonraki seviye açık kalır
    store.setMaxUnlockedLevel(levelIndex + 1);
    store.syncCloud();

    setTimeout(() => {
      // Variable-Ratio Reinforcement: %12.5 ihtimalle sürpriz dolap; her 10. seviyede kesin
      const isProbabilisticBonus = levelIndex >= 3 && Math.random() < 0.125; // ilk seviyelerde akışı bölmesin
      const isLevelMultipleOf10 = (levelIndex + 1) % 10 === 0;
      if (isProbabilisticBonus || isLevelMultipleOf10) setShowBonus(true);
      else setInternalState('levelComplete');
    }, 1800);
  };

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

      // Rahat mod: ekspres süresi kelime bulununca sıfırlanmaz
      if (newFound.length === levelData.words.length) completeLevel(newFound);
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
          const timeoutId = setTimeout(() => controller.abort(), 4000);
          // TDK API'si CORS'a izin veriyor (Access-Control-Allow-Origin: *); üçüncü taraf proxy'ye
          // (corsproxy.io) gerek yok. Web'de ve Android WebView'da doğrudan çağrılır.
          const tdkUrl = `https://sozluk.gov.tr/gts?ara=${encodeURIComponent(word.toLocaleLowerCase('tr-TR'))}`;
          const res = await fetch(tdkUrl, { signal: controller.signal });
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

  const hintCosts = getHintCosts(completedSets);
  const maxLives = getMaxLives(completedSets);

  const handleLetterHint = () => {
    if (hints > 0 || balance >= hintCosts.letter) {
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
            addBalance(-hintCosts.letter);
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
    const hintCost = hintCosts.word;

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
        if (newFound.length === levelData.words.length) completeLevel(newFound);
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

  // "Terim" ipucu: kök ulaşım teriminin anlamını gösterir, kelimenin kendisini maskeler.
  // ("Ele" aracının yerini aldı: çarktaki tüm harfler kökten geldiği için elenecek harf olmuyordu.)
  const handleTermHint = () => {
    const term = levelData.technicalTerm;
    const meaning = WORD_MEANINGS[term];
    if (!meaning) {
      showFeedback('exists', t('term_unavailable'));
      return;
    }
    if (!termRevealed) {
      if (balance < hintCosts.term) {
        showFeedback('wrong', t('balance_low'));
        if (hapticEnabled) Haptics.notification({ type: NotificationType.Warning }).catch(()=>{});
        return;
      }
      addBalance(-hintCosts.term);
      setTermRevealed(true);
      if (soundEnabled) playTurnike();
    }
    const masked = meaning.split(term).join('●'.repeat(term.length));
    setInfoCard({ word: `${t('tool_term')}: ${'●'.repeat(term.length)} (${term.length})`, meaning: masked, id: Date.now() });
    if (hapticEnabled) Haptics.impact({ style: ImpactStyle.Light }).catch(()=>{});
  };

  const handleShuffle = () => {
    if (levelData) setLevelData({ ...levelData, wheelLetters: [...levelData.wheelLetters].sort(() => Math.random() - 0.5) });
  };

  /* ========== LOADING SCREEN ========== */
  if (!levelData) {
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
      <div className="game-bg min-h-full flex flex-col items-center justify-center relative z-10 fade-in px-6 text-center">
        <span aria-hidden="true" className="material-symbols-outlined text-red-500 text-6xl mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>directions_run</span>
        <h1 className="text-white text-3xl font-black mb-2">{t('game_over')}</h1>
        <p className="text-white/60 mb-8">{t('game_over_desc')}</p>
        
        <div className="flex flex-col gap-3 w-full max-w-sm mb-6">
          {/* Reklam SDK'sı bağlanana kadar gizli (sahte bekleme yapıyordu) */}
          {SHOW_AD_REWARDS && (
            <button
              disabled={isAdLoading}
              onClick={() => {
                setIsAdLoading(true);
                setTimeout(() => {
                  useGameStore.setState({ lives: 1, gameStatus: 'playing' });
                  setIsAdLoading(false);
                  setInternalState('playing');
                }, 3000);
              }}
              className={`w-full py-3.5 rounded-xl font-bold text-white text-sm tracking-wide bg-blue-600 hover:bg-blue-500 transition-colors flex items-center justify-center gap-2 ${isAdLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span aria-hidden="true" className="material-symbols-outlined text-[20px]">{isAdLoading ? 'hourglass_empty' : 'play_circle'}</span>
              {isAdLoading ? t('watching_ad') : t('watch_ad')}
            </button>
          )}

          <button
            disabled={balance < 25}
            onClick={() => {
              if (balance >= 25) {
                addBalance(-25);
                useGameStore.setState({ lives: 1, gameStatus: 'playing' });
                // Ekspres süresi oyun sonunda durdu; devam ederken bonus penceresi kapalı kalır
                setIsExpressOver(true);
                setInternalState('playing');
              }
            }}
            className={`w-full py-3.5 rounded-xl font-bold text-white text-sm tracking-wide bg-green-600 hover:bg-green-500 transition-colors flex items-center justify-center gap-2 ${balance < 25 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span aria-hidden="true" className="material-symbols-outlined text-[20px]">favorite</span>
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
            <span aria-hidden="true" className="material-symbols-outlined text-[20px]">fast_forward</span>
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
              <span aria-hidden="true" className="material-symbols-outlined text-red-500 text-5xl mb-4 mt-2" style={{ fontVariationSettings: "'FILL' 1" }}>
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
                    useGameStore.setState({ lives: maxLives, gameStatus: 'idle', combo: 0 });
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



  /* ========== GAME SCREEN ========== */
  if (internalState === 'playing') {
    if (!levelData) return null;

    const station = getStationForLevel(levelIndex);
    const isTutorial = levelIndex === 0 && foundWords.length === 0 && localStorage.getItem('turnike_tutorial_seen') !== 'true';
    const showStationInfo = () => {
      setInfoCard({ word: station.displayName, meaning: `${station.stationInfo} ${levelData.missionTask || ''}`.trim(), id: Date.now() });
      if (hapticEnabled) Haptics.selectionStart().catch(()=>{});
    };

    return (
      <div className={`game-bg h-full w-screen overflow-hidden flex flex-col relative z-10 fade-in ${shake ? 'animate-shake' : ''}`}>
        {showBonus && (
          <div className="absolute inset-0 z-[100] flex flex-col fade-in" style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
            <BonusLockers onComplete={() => { setShowBonus(false); setInternalState('levelComplete'); }} />
          </div>
        )}
        {showVaultAnimation && (
          <div className="absolute inset-0 z-[110] flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm fade-in">
            <div className="scale-in flex flex-col items-center p-6 rounded-3xl border border-green-500/30 text-center"
                 style={{ background: 'linear-gradient(135deg, #0f2d1a, #07170d)', boxShadow: '0 0 40px rgba(34,197,94,0.4)' }}>
              <span aria-hidden="true" className="material-symbols-outlined text-green-400 text-6xl animate-bounce" style={{ fontVariationSettings: "'FILL' 1" }}>lock_open</span>
              <h2 className="text-white text-2xl font-black tracking-widest mt-4">KASA PATLATILDI!</h2>
              <p className="text-green-400/80 font-bold text-lg mt-2">+{formatKurus(VAULT_REWARD)} İstanbulkart Bakiyesi</p>
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
          .life-loss-float { animation: lifeLossAnim 1.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
        `}</style>

        {/* Başlık: geri | hat + durak | bakiye */}
        <header className="w-full z-50 flex items-center gap-2 px-4 pt-4 pb-2 shrink-0">
          <button onClick={() => { stopTimer(); setScreen('home'); }} className="icon-btn" aria-label={t('back')}>
            <span aria-hidden="true" className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <button onClick={showStationInfo} className="flex-1 min-w-0 flex items-center gap-2.5 text-left active:opacity-70 transition-opacity">
            <span className="line-badge" style={{ background: station.color }}>{station.code}</span>
            <span className="min-w-0">
              {/* Uzun durak adları (Küçükçekmece, Sabiha Gökçen Havalimanı) iki satıra sığar */}
              <span className={`block font-extrabold text-white leading-tight line-clamp-2 break-words ${station.displayName.length > 14 ? 'text-[14px]' : 'text-[16px]'}`}>{station.displayName}</span>
              <span className="block text-[11px] font-semibold text-white/55 truncate">
                {/* Kök kelime burada gösterilmez: bulmacanın cevabıdır */}
                {t('leg')} {station.leg}/{station.legsPerStation} · {station.modeLabel}
              </span>
            </span>
          </button>
          <div className={`balance-pill ${flashBalance ? 'balance-flash' : ''}`}>
            <span aria-hidden="true" className="material-symbols-outlined text-[16px]" style={{ color: 'var(--coin)', fontVariationSettings: "'FILL' 1" }}>toll</span>
            <AnimatedBalance value={balance} />
          </div>
        </header>

        {/* Durum satırı: can | kelime ilerlemesi | kasa */}
        <div className="flex items-center justify-between px-4 pb-2 shrink-0">
          <div className="flex gap-0.5" role="img" aria-label={`${lives}/${maxLives} can`}>
            {Array.from({ length: maxLives }, (_, i) => (
              <span key={i} aria-hidden="true" className={`material-symbols-outlined text-[18px] transition-all ${i < lives ? 'text-red-500' : 'text-white/15'}`} style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            {levelData.words.map((w, i) => (
              <span key={i} className={`h-2 rounded-full transition-all duration-500 ${i < foundWords.length ? 'w-5 bg-green-400' : 'w-2 bg-white/20'}`} />
            ))}
            <span className="text-[12px] font-bold text-white/60 ml-1 tabular-nums">{foundWords.length}/{levelData.words.length}</span>
            {combo > 1 && <span className="ml-1 text-[12px] font-black text-orange-400">🔥x{combo}</span>}
          </div>
          <div className="status-chip" title={t('vault')}>
            <span aria-hidden="true" className="material-symbols-outlined text-[15px] text-green-400" style={{ fontVariationSettings: "'FILL' 1" }}>savings</span>
            <span className="tabular-nums">{vaultCount}/{VAULT_SIZE}</span>
          </div>
        </div>

        {/* Ekspres treni: bitene kadar bonus penceresi; bitince sadece bilgi */}
        <div className="px-4 shrink-0">
          <div className="flex items-center justify-between text-[11px] font-bold mb-1">
            <span style={{ color: isExpressOver ? 'rgba(255,255,255,0.4)' : 'var(--led)' }}>
              {isExpressOver ? t('express_over') : `⚡ ${t('express')}`}
            </span>
            {!isExpressOver && <span className="text-white/60 tabular-nums">{timeLeft}s</span>}
          </div>
          {!isExpressOver && (
            <div className="relative h-[22px] overflow-hidden">
              <div className="absolute left-0 right-0 bottom-[4px] h-[5px] rounded-full bg-white/10">
                <div ref={barRef} className="h-full rounded-full" style={{ width: '100%', background: 'hsl(120, 84%, 55%)' }} />
              </div>
              <div ref={trainRef} className="absolute bottom-0 pointer-events-none" style={{ left: 'calc(100% - 30px)', width: 60, height: 16 }}>
                <VehicleSprite mode={station.mode} color={station.color} />
              </div>
            </div>
          )}
        </div>

        {lifeLossAnims.map(animId => (
          <div key={animId} className="absolute inset-0 flex items-center justify-center pointer-events-none z-[100] life-loss-float">
            <div className="flex items-center gap-2 text-red-500 font-black text-5xl" style={{ textShadow: '0 0 20px rgba(239,68,68,1)' }}>
              -1 <span aria-hidden="true" className="material-symbols-outlined text-[48px]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
            </div>
          </div>
        ))}

        {/* Izgara: kalan alanın tamamı */}
        <main className="flex-1 min-h-0 w-full px-3 pt-2 pb-12 relative z-10">
          <Grid
            words={levelData.words}
            foundWords={foundWords}
            hintedLetters={hintedLetters}
            onIntersectionFound={handleIntersectionFound}
          />
        </main>

        {/* Çark ve araçlar */}
        <div className="w-full shrink-0 flex flex-col items-center pb-5 relative z-20">
          {isTutorial && (
            <p className="tutorial-hint mb-2">
              <span aria-hidden="true" className="material-symbols-outlined text-[16px]">swipe</span>{t('tutorial_hint')}
            </p>
          )}
          <div className={`relative ${hatArizasi ? 'animate-shake opacity-70 filter grayscale' : ''}`}
               style={{ width: `min(296px, calc(100vw - 48px), calc(100dvh - ${GAME_CHROME_PX + gridRows(levelData.words) * GRID_ROW_PX}px))`, minWidth: 200, aspectRatio: '1 / 1' }}>
            <div className="absolute inset-0 rounded-full pointer-events-none wheel-plate" />
            <div className="absolute inset-0">
              <Wheel
                letters={levelData.wheelLetters}
                onWordSubmit={handleWordSubmit}
                onShuffle={handleShuffle}
                bonusLetter={goldLetter}
                wrongWordTrigger={wrongWordTrigger}
                isTutorial={isTutorial}
                tutorialWord={levelData.technicalTerm}
              />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <ToolButton icon="spellcheck" label={t('tool_letter')} price={hints > 0 ? `${hints} ✦` : formatKurus(hintCosts.letter)}
              affordable={hints > 0 || balance >= hintCosts.letter} onClick={handleLetterHint} />
            <ToolButton icon="lightbulb" label={t('tool_word')} price={hints > 0 ? `${hints} ✦` : formatKurus(hintCosts.word)}
              affordable={hints > 0 || balance >= hintCosts.word} onClick={handleHint} accent="#fbbf24" />
            <ToolButton icon="menu_book" label={t('tool_term')} price={termRevealed ? '✓' : formatKurus(hintCosts.term)}
              affordable={termRevealed || balance >= hintCosts.term} onClick={handleTermHint} accent="#60a5fa" />
          </div>
        </div>

        {/* Teknik Bilgi Kartı Overlay */}
        {infoCard && (
          <div key={infoCard.id} className="absolute inset-x-0 top-24 z-50 pointer-events-none flex justify-center fade-in px-5">
            <div
              className="relative overflow-hidden rounded-2xl w-full max-w-md p-5 pointer-events-auto transition-transform"
              onClick={() => setInfoCard(null)}
              onTouchStart={handleInfoCardTouchStart}
              onTouchMove={handleInfoCardTouchMove}
              onTouchEnd={handleInfoCardTouchEnd}
              style={{
                background: 'rgba(10, 24, 40, 0.97)',
                border: `1px solid ${station.color}66`,
                boxShadow: '0 20px 40px rgba(0,0,0,0.7)',
                transform: `translateX(${swipeOffsetX}px)`,
                opacity: 1 - Math.abs(swipeOffsetX) / 300
              }}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-white/10">
                <div className="h-full" style={{ background: station.color, width: '100%', animation: 'shrink 4s linear forwards' }} />
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${station.color}22`, border: `1px solid ${station.color}55` }}>
                  <span aria-hidden="true" className="material-symbols-outlined text-[22px]" style={{ color: station.color }}>menu_book</span>
                </div>
                <div className="min-w-0">
                  <h3 className="font-black text-[17px] tracking-wide mb-1 text-white">{infoCard.word}</h3>
                  <p className="text-white/80 text-[14px] leading-relaxed">{infoCard.meaning}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toast. Ekran okuyucu için kalıcı canlı bölge; görsel toast her seferinde yeniden oluştuğundan okunmuyordu */}
        <div className="sr-only" role="status" aria-live="polite">{feedback?.text || ''}</div>
        {feedback && (
          <div key={feedback.id} className="toast-container z-50" aria-hidden="true">
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
    return (
      <LevelComplete
        level={levelIndex + 1}
        station={getStationForLevel(levelIndex)}
        summary={levelSummary}
        mistakes={mistakeCount}
        meanings={WORD_MEANINGS}
        onNextLevel={advanceLevel}
        onRetry={() => {
          loadLevel(levelIndex);
          setInternalState('playing');
        }}
        onHome={() => { stopTimer(); setScreen('home'); }}
      />
    );
  }

  return null;
}

