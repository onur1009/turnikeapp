# TURNİKE: SÖZCÜK SEFERİ - PROJECT SOURCE & DOCUMENTATION

This document compiles the entire source code and development history of the "Turnike: Sözcük Seferi" project. It is structured to be easily read and parsed by an AI assistant (like Manus AI) to continue development, refactor, or debug.

---

## 1. PROJECT OVERVIEW & ARCHITECTURE

**Turnike: Sözcük Seferi** is a Turkish/English word puzzle game built with **React**, **Vite**, and **TailwindCSS/Vanilla CSS**. It is designed as a Mobile-First Web App (PWA) and is wrapped using **Capacitor** for native mobile features (Haptics, StatusBar, etc.).

### Key Architecture Components:
1. **State Management (`src/store/gameStore.js`):**
   * Powered by **Zustand** with `persist` middleware.
   * Manages player balance (₺), hints, level index, lives, combos, streaks, spin wheel dates, unlocked badges, vault words, and general statistics.
2. **Navigation/Routing (`src/App.jsx`):**
   * Uses a simple state-based screen router (`screen` state: `'loading' | 'home' | 'game' | 'levels' | 'dictionary' | 'vault' | 'leaderboard' | 'settings' | 'stats' | 'badges' | 'akbil'`).
3. **Core Gameplay Logic (`src/utils/gameLogic.js`):**
   * Word generation, validation, grid layout calculations, and dynamic level timers.
   * Features a TDK (Turkish Language Association) API check fallback for words not in the local dictionary. If a player submits a valid Turkish word not in the grid, it goes to the "Vault" (Kasa) and yields bonus balance.
4. **Theme & Localization:**
   * Custom themes: `dark`, `light`, `retro`.
   * Localization helper: `src/utils/i18n.js`.

---

## 2. DEVELOPMENT HISTORY & IMPLEMENTED FEATURES
- **Daily Spin Wheel:** Players can spin a wheel once a day to earn balance (₺) or hints.
- **Locker Bonus Game (Kayıp Eşya Bürosu):** Every 10 levels completed (or level index multiple of 10), a bonus screen overlays the game board. Players choose from 9 lockers (representing lost items on Istanbul transit) to find rewards.
- **Istanbulkart Theme:** Player balance is represented as Istanbulkart balance (₺). The Akbil screen allows custom card styling.
- **Stats & Achievements (Badges):** Tracks streak days, total words, total games, and unlocks badges (e.g., "Speed Demon", "Flawless").
- **Haptic Feedback:** Integrates `@capacitor/haptics` for tactile feedback on correct/wrong answers, time expiration, etc.

---

## 3. SOURCE CODES


### File: `package.json`

```json
{
  "name": "turnikeapp",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "@capacitor/android": "^8.4.1",
    "@capacitor/app": "^8.1.0",
    "@capacitor/cli": "^8.4.1",
    "@capacitor/core": "^8.4.1",
    "@capacitor/haptics": "^8.0.2",
    "@capacitor/ios": "^8.4.1",
    "@capacitor/preferences": "^8.0.1",
    "@capacitor/status-bar": "^8.0.2",
    "lucide-react": "^1.21.0",
    "react": "^19.2.6",
    "react-dom": "^19.2.6",
    "zustand": "^5.0.14"
  },
  "devDependencies": {
    "@eslint/js": "^10.0.1",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.1",
    "autoprefixer": "^10.5.0",
    "eslint": "^10.3.0",
    "eslint-plugin-react-hooks": "^7.1.1",
    "eslint-plugin-react-refresh": "^0.5.2",
    "globals": "^17.6.0",
    "postcss": "^8.5.15",
    "puppeteer": "^25.2.1",
    "tailwindcss": "^3.4.19",
    "vite": "^8.0.12",
    "vite-plugin-pwa": "^1.3.0"
  }
}

```

---

### File: `vite.config.js`

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'Turnike: Sözcük Seferi',
        short_name: 'Turnike',
        description: 'İstanbul toplu taşıma temalı kelime bulmaca oyunu',
        theme_color: '#051424',
        background_color: '#051424',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})

```

---

### File: `src/main.jsx`

```javascript
import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return <div style={{color:'red', background:'white', padding:'20px', zIndex:99999, position:'relative'}}>
        <h2>Something went wrong.</h2>
        <pre style={{whiteSpace:'pre-wrap'}}>{this.state.error.toString()}</pre>
        <pre style={{whiteSpace:'pre-wrap', fontSize:'10px'}}>{this.state.error.stack}</pre>
      </div>;
    }
    return this.props.children; 
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)

```

---

### File: `src/App.jsx`

```javascript
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { generateLevel, VALID_WORDS_TR, VALID_WORDS_EN, WORD_MEANINGS_TR, WORD_MEANINGS_EN, getTimeForLevel } from './utils/gameLogic';
import { playCorrect, playWrong, playLevelComplete, playTurnike, playCombo, playBadgeUnlock, playBalanceUp, playTick, playTimeUp, playGameOver } from './utils/soundManager';
import { useTranslation } from './utils/i18n';
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
import VaultScreen from './components/VaultScreen';
import LeaderboardScreen from './components/LeaderboardScreen';
import BonusLockers from './components/BonusLockers';
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
      setLearnedWords(prev => Array.from(new Set([...prev, word])));
      
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
        stopTimer();
        if (soundEnabled) playLevelComplete();
        if (mistakeCount === 0) { 
          setTimeout(() => showFeedback('correct', t('perfect')), 800); 
          addBalance(50); 
          unlockBadge('flawless'); 
        }
        const currentLevelsCompleted = (useGameStore.getState().levelsCompleted || 0) + 1;
        useGameStore.getState().incrementLevelsCompleted();

        setTimeout(() => { 
          // Ya OYUNUN SEVİYESİ 10'un katı ise, ya da KULLANICININ BİTİRDİĞİ seviye 10'un katı ise
          const isLevelMultipleOf10 = (levelIndex + 1) % 10 === 0;
          const isCompletedMultipleOf10 = currentLevelsCompleted % 10 === 0;
          
          if (isLevelMultipleOf10 || isCompletedMultipleOf10) {
            setShowBonus(true);
          } else {
            setScreen('levelComplete'); 
          }
        }, 3000);
      }
      return true;
    } else {
      if (VALID_WORDS.has(word)) { 
        incrementCombo();
        incrementTotalWords();
        setLearnedWords(prev => Array.from(new Set([...prev, word])));
        
        const currentVaultCount = useGameStore.getState().vaultWords.length;
        useGameStore.getState().addVaultWord(word);
        const newVaultCount = useGameStore.getState().vaultWords.length;
        
        if (currentVaultCount === 9 && newVaultCount === 0) {
          showFeedback('correct', 'KASA KIRILDI! +100₺');
          if (soundEnabled) setTimeout(() => playBalanceUp(), 500);
        } else if (newVaultCount > currentVaultCount) {
          showFeedback('exists', `KASAYA EKLENDİ (${newVaultCount}/10)`);
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
          const res = await fetch(`https://sozluk.gov.tr/gts?ara=${word.toLocaleLowerCase('tr-TR')}`);
          const data = await res.json();
          if (data && !data.error && data.length > 0) {
            // TDK'da kelime var!
            incrementCombo();
            incrementTotalWords();
            setLearnedWords(prev => Array.from(new Set([...prev, word])));
            
            const currentVaultCount = useGameStore.getState().vaultWords.length;
            useGameStore.getState().addVaultWord(word);
            const newVaultCount = useGameStore.getState().vaultWords.length;
            
            if (currentVaultCount === 9 && newVaultCount === 0) {
              showFeedback('correct', 'KASA KIRILDI! +100₺');
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

        {showTutorial && <TutorialModal onClose={() => { localStorage.setItem('turnike_tutorial_seen', 'true'); setShowTutorial(false); }} />}
        {showDailySpin && !showTutorial && <DailySpinScreen onComplete={() => setShowDailySpin(false)} />}
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

  /* ========== AKBİL SCREEN ========== */
  if (screen === 'akbil') {
    return (
      <div className="game-bg h-screen flex flex-col relative z-10 fade-in">
        <AkbilScreen onBack={() => setScreen('home')} />
      </div>
    );
  }

  /* ========== VAULT SCREEN ========== */
  if (screen === 'vault') {
    return (
      <div className="game-bg h-screen flex flex-col relative z-10 fade-in overflow-hidden">
        <VaultScreen onBack={() => setScreen('home')} />
      </div>
    );
  }

  /* ========== LEADERBOARD SCREEN ========== */
  if (screen === 'leaderboard') {
    return (
      <div className="game-bg h-screen flex flex-col relative z-10 fade-in overflow-hidden">
        <LeaderboardScreen onBack={() => setScreen('home')} />
      </div>
    );
  }
  /* Duplicate akbil block removed — already handled at line 718 */

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
          <div className="metro-board">{t('istanbul_line')}</div>
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
          <div className="metro-board">{t('dictionary')}</div>
          <div className="w-10" />
        </header>
        <DictionaryScreen learnedWords={learnedWords} />
      </div>
    );
  }

  /* ========== LEVEL COMPLETE ========== */
  if (screen === 'levelComplete') {
    if (!levelData) {
      // Test butonundan gelinmişse levelData null olabilir, ana menüye dön
      setTimeout(() => setScreen('home'), 0);
      return null;
    }
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
          onHome={() => setScreen('home')}
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
        {showBonus && (
          <div className="absolute inset-0 z-[100] flex flex-col fade-in" style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
            <BonusLockers onComplete={() => { setShowBonus(false); setScreen('levelComplete'); }} />
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
              {combo >= 4 ? t('combo_20') : t('combo_15')}
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
      
      {/* İpucu butonları (sağ üst köşe, grid'in dışında) */}
      <div className="absolute right-2 top-[100px] z-40 flex flex-col gap-2">
        <button
          onClick={handleHint}
          className="flex flex-col items-center justify-center rounded-full active:scale-90 transition-transform relative"
          style={{
            width: 40, height: 40,
            background: 'rgba(251,191,36,0.12)',
            border: '1.5px solid rgba(251,191,36,0.35)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 0 14px rgba(251,191,36,0.2)',
          }}
        >
          <span className="material-symbols-outlined text-yellow-400 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
          <span className="text-yellow-400/70 text-[6px] font-bold">{hints > 0 ? `${hints}✦` : '75₺'}</span>
        </button>

        <button
          onClick={handleLetterHint}
          className="flex flex-col items-center justify-center rounded-full active:scale-90 transition-transform relative"
          style={{
            width: 36, height: 36,
            background: 'rgba(59,130,246,0.12)',
            border: '1.5px solid rgba(59,130,246,0.35)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 0 14px rgba(59,130,246,0.2)',
          }}
        >
          <span className="material-symbols-outlined text-blue-400 text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>spellcheck</span>
          <span className="text-blue-400/70 text-[6px] font-bold">{hints > 0 ? `${hints}✦` : '25₺'}</span>
        </button>
      </div>

      {/* Grid Alanı */}
      <main className="flex-grow flex flex-col relative w-full overflow-hidden mt-4 pb-[85px]">
        <div className="flex-grow flex flex-col items-center justify-center px-2 pt-2 pb-[310px]">
          <Grid words={levelData.words} foundWords={foundWords} hintedLetters={hintedLetters} />
        </div>

        {/* Wheel Area */}
        <div className="absolute bottom-[85px] left-0 w-full h-[310px] flex flex-col justify-center">
          <Wheel letters={levelData.wheelLetters} onWordSubmit={handleWordSubmit} onShuffle={handleShuffle} bonusLetter={goldLetter} wrongWordTrigger={wrongWordTrigger} />
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

  return null;
}

export default App;

```

---

### File: `src/index.css`

```css
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Orbitron:wght@700;800;900&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * { box-sizing: border-box; }
  body {
    @apply bg-[#051424] text-white;
    font-family: 'Plus Jakarta Sans', 'Space Grotesk', sans-serif;
    margin: 0; padding: 0;
    overflow: hidden; /* No scroll at all for native feel */
    -webkit-font-smoothing: antialiased;
    
    /* NATIVE FEEL CSS */
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
    touch-action: pan-x pan-y;
  }
  
  /* Çentikli telefonlar (iPhone X ve üstü) için güvenli alanlar */
  #root {
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
    padding-left: env(safe-area-inset-left);
    padding-right: env(safe-area-inset-right);
    height: 100vh;
    height: 100dvh;
  }
  
  .material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 48;
  }
}

/* ================================================
   TURNIKE: SÖZCÜK SEFERİ — Metro Dark Theme v3
   Koyu gece arka plan, neon hat renkleri,
   LED levha efektleri, cam paneller.
   ================================================ */

/* ===== METRO BACKGROUND ===== */
/* Koyu lacivert gece, ince hat çizgisi dokusu */
.game-bg {
  background:
    radial-gradient(ellipse 120% 60% at 50% -10%, rgba(34,197,94,0.07) 0%, transparent 70%),
    radial-gradient(ellipse 80% 40% at 80% 80%,  rgba(59,130,246,0.06) 0%, transparent 60%),
    radial-gradient(ellipse 60% 30% at 10% 90%,  rgba(234,179,8,0.05)  0%, transparent 60%),
    linear-gradient(180deg, #050a18 0%, #0b1428 40%, #0d1f35 70%, #091520 100%);
  min-height: 100vh;
  background-attachment: fixed;
}

/* Arka planda ince ray dokusu */
.game-bg::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image:
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 79px,
      rgba(255,255,255,0.015) 79px,
      rgba(255,255,255,0.015) 80px
    ),
    repeating-linear-gradient(
      180deg,
      transparent,
      transparent 79px,
      rgba(255,255,255,0.015) 79px,
      rgba(255,255,255,0.015) 80px
    );
  pointer-events: none;
  z-index: 0;
}

/* ===== COMPONENTS ===== */
@layer components {

  /* --- Cam panel (glassmorphism koyu) --- */
  .card-panel {
    background: rgba(255,255,255,0.04);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 20px;
    box-shadow:
      0 4px 32px rgba(0,0,0,0.4),
      inset 0 1px 0 rgba(255,255,255,0.07);
  }

  /* --- Beyaz Grid Hücreleri --- */
  .grid-cell-empty {
    background: rgba(255,255,255,0.06);
    border: 1.5px solid rgba(255,255,255,0.12);
    border-radius: 10px;
  }
  .grid-cell-found {
    background: #ffffff;
    border: 2px solid rgba(255,255,255,0.9);
    border-radius: 10px;
    color: #0a0f1e;
    font-weight: 800;
    box-shadow: 0 0 16px rgba(255,255,255,0.15), 0 4px 12px rgba(0,0,0,0.3);
  }

  /* --- Çark harf düğümleri --- */
  .wheel-letter {
    background: rgba(255,255,255,0.92);
    border: 3px solid rgba(255,255,255,1);
    border-radius: 50%;
    box-shadow:
      0 4px 20px rgba(0,0,0,0.5),
      0 0 12px rgba(255,255,255,0.1),
      inset 0 -3px 0 rgba(0,0,0,0.15);
    color: #0a0f1e;
    font-weight: 800;
    font-size: 28px;
  }
  .wheel-letter-active {
    background: linear-gradient(135deg, #fbbf24, #f59e0b);
    border: 3px solid #fbbf24;
    box-shadow:
      0 0 24px rgba(251,191,36,0.6),
      0 0 48px rgba(251,191,36,0.2),
      inset 0 -3px 0 rgba(0,0,0,0.2);
    color: #0a0f1e;
    transform: scale(1.12);
  }

  /* --- Metro Kapsül (üst bar rozeti) --- */
  .capsule {
    background: rgba(255,255,255,0.06);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 50px;
    padding: 8px 16px;
    color: white;
    font-weight: 700;
    font-size: 13px;
    display: flex; align-items: center; gap: 6px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06);
  }

  /* --- Metro LED Tabelası (Seviye ismi) --- */
  .metro-board {
    font-family: 'Orbitron', monospace;
    background: linear-gradient(135deg, #0d1f0d, #0a2010);
    border: 1.5px solid #22c55e;
    border-radius: 10px;
    padding: 6px 16px;
    color: #4ade80;
    font-weight: 700;
    font-size: 13px;
    letter-spacing: 2px;
    box-shadow: 0 0 16px rgba(34,197,94,0.25), inset 0 0 12px rgba(34,197,94,0.05);
    text-shadow: 0 0 8px rgba(74,222,128,0.8);
  }

  /* --- Ana Oyna butonu (neon yeşil) --- */
  .play-btn {
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
    border: 2px solid rgba(74,222,128,0.4);
    border-radius: 50px;
    color: white;
    font-weight: 800;
    font-size: 18px;
    padding: 16px 44px;
    box-shadow:
      0 0 32px rgba(34,197,94,0.4),
      0 0 64px rgba(34,197,94,0.15),
      0 8px 24px rgba(0,0,0,0.3),
      inset 0 -4px 0 rgba(0,0,0,0.2);
    transition: all 0.2s ease;
    text-transform: uppercase;
    letter-spacing: 3px;
    font-family: 'Orbitron', monospace;
    position: relative;
    overflow: hidden;
  }
  .play-btn::before {
    content: '';
    position: absolute;
    top: 0; left: -100%;
    width: 60%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
    animation: shine 3s ease-in-out infinite;
  }
  .play-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 48px rgba(34,197,94,0.55), 0 12px 32px rgba(0,0,0,0.4), inset 0 -4px 0 rgba(0,0,0,0.2);
  }
  .play-btn:active {
    transform: translateY(1px) scale(0.98);
  }

  /* --- İkincil menü butonu --- */
  .menu-btn {
    background: rgba(255,255,255,0.05);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 14px;
    color: rgba(255,255,255,0.8);
    transition: all 0.25s ease;
  }
  .menu-btn:hover {
    background: rgba(255,255,255,0.1);
    border-color: rgba(255,255,255,0.22);
    color: white;
    transform: translateY(-2px);
  }
  .menu-btn:active { transform: scale(0.97); }

  /* --- Bottom Navbar --- */
  .bottom-nav {
    background: linear-gradient(to top, rgba(5,10,24,0.98) 0%, rgba(5,10,24,0.85) 70%, transparent 100%);
    border-top: 1px solid rgba(255,255,255,0.06);
  }

  /* --- Metro Hat Badge --- */
  .line-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 10px 3px 7px;
    border-radius: 50px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.5px;
  }
}

/* ===== THEME OVERRIDES ===== */
/* LIGHT THEME */
body.theme-light .game-bg {
  background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%) !important;
}
body.theme-light .game-bg::before {
  opacity: 0.3;
}
body.theme-light .text-white { color: #0f172a !important; }
body.theme-light .text-white\/80 { color: rgba(15,23,42,0.8) !important; }
body.theme-light .text-white\/70 { color: rgba(15,23,42,0.7) !important; }
body.theme-light .text-white\/60 { color: rgba(15,23,42,0.6) !important; }
body.theme-light .text-white\/50 { color: rgba(15,23,42,0.5) !important; }
body.theme-light .text-white\/40 { color: rgba(15,23,42,0.4) !important; }
body.theme-light .bg-white\/5 { background: rgba(0,0,0,0.05) !important; }
body.theme-light .bg-white\/10 { background: rgba(0,0,0,0.1) !important; }
body.theme-light .border-white\/10 { border-color: rgba(0,0,0,0.1) !important; }
body.theme-light .border-white\/20 { border-color: rgba(0,0,0,0.2) !important; }
body.theme-light .card-panel { background: rgba(255,255,255,0.7); border-color: rgba(0,0,0,0.1); box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
body.theme-light .grid-cell-empty { background: rgba(0,0,0,0.05); border-color: rgba(0,0,0,0.1); }
body.theme-light .capsule { background: rgba(255,255,255,0.8); border-color: rgba(0,0,0,0.1); color: #0f172a; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }

/* RETRO THEME */
body.theme-retro {
  font-family: 'Courier New', Courier, monospace !important;
}
body.theme-retro * {
  font-family: 'Courier New', Courier, monospace !important;
}
body.theme-retro .game-bg {
  background: #0f0f0f !important;
}
body.theme-retro .game-bg::before { display: none; }
body.theme-retro .text-white, body.theme-retro .text-white\/80, body.theme-retro .text-white\/70, body.theme-retro .text-white\/60, body.theme-retro .text-white\/50 {
  color: #33ff33 !important;
}
body.theme-retro .play-btn {
  background: black !important;
  color: #33ff33 !important;
  border: 2px solid #33ff33 !important;
  border-radius: 0 !important;
  box-shadow: none !important;
}
body.theme-retro .play-btn::before { display: none; }
body.theme-retro .capsule, body.theme-retro .card-panel, body.theme-retro .bg-white\/5, body.theme-retro .bg-white\/10 {
  background: black !important;
  border: 2px solid #33ff33 !important;
  border-radius: 0 !important;
  color: #33ff33 !important;
  box-shadow: none !important;
}
body.theme-retro .wheel-letter {
  background: black !important;
  border: 2px solid #33ff33 !important;
  color: #33ff33 !important;
  border-radius: 0 !important;
  box-shadow: none !important;
}
body.theme-retro .wheel-letter-active {
  background: #33ff33 !important;
  color: black !important;
  border-color: #33ff33 !important;
  transform: none !important;
  border-radius: 0 !important;
  box-shadow: none !important;
}
body.theme-retro .grid-cell-empty {
  background: black !important;
  border: 1px solid #33ff33 !important;
  border-radius: 0 !important;
}
body.theme-retro .grid-cell-found {
  background: #33ff33 !important;
  color: black !important;
  border: none !important;
  border-radius: 0 !important;
}
body.theme-retro svg line { stroke-width: 8 !important; stroke-linecap: butt !important; }
body.theme-retro .rounded-full, body.theme-retro .rounded-xl, body.theme-retro .rounded-2xl { border-radius: 0 !important; }


/* ===== ANİMASYONLAR ===== */
.fade-in {
  animation: fadeIn 0.45s ease-out both;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

.scale-in {
  animation: scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.7); }
  to   { opacity: 1; transform: scale(1); }
}

.float-slow { animation: float 6s ease-in-out infinite; }

@keyframes lifeLoss {
  0% { transform: translateY(0) scale(0.5); opacity: 0; }
  20% { transform: translateY(-20px) scale(1.2); opacity: 1; }
  80% { transform: translateY(-80px) scale(1); opacity: 1; }
  100% { transform: translateY(-100px) scale(0.8); opacity: 0; }
}

.animate-life-loss {
  animation: lifeLoss 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}
@keyframes floatSlow {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-10px); }
}

.pulse-soft {
  animation: pulseSoft 2s ease-in-out infinite;
}
@keyframes pulseSoft {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50%       { opacity: 1; transform: scale(1.06); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-6px); }
  40%, 80% { transform: translateX(6px); }
}
.animate-shake {
  animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
}

@keyframes balanceFlash {
  0% { box-shadow: 0 0 24px rgba(34,197,94,0.8); border-color: #22c55e; transform: scale(1.05); }
  100% { box-shadow: 0 2px 12px rgba(0,0,0,0.3); border-color: rgba(255,255,255,0.12); transform: scale(1); }
}
.balance-flash {
  animation: balanceFlash 0.6s ease-out;
}

/* Turnike kapısı geçiş tarama efekti */
@keyframes scanLine {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
}

/* Parlaklık sweep (play-btn) */
@keyframes shine {
  0%   { left: -100%; }
  50%, 100% { left: 150%; }
}

/* Neon LED yanıp sönme */
@keyframes neonBlink {
  0%, 96%, 100% { opacity: 1; }
  98%           { opacity: 0.6; }
}
.neon-blink {
  animation: neonBlink 4s ease-in-out infinite;
}

/* İstasyon pulse */
@keyframes stationPulse {
  0%, 100% { box-shadow: 0 0 0 0 currentColor; }
  50%       { box-shadow: 0 0 0 8px transparent; }
}

/* ===== TOAST ===== */
.toast-container {
  position: fixed;
  top: 14%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 200;
  pointer-events: none;
}
.toast {
  padding: 10px 28px;
  border-radius: 50px;
  color: white;
  font-weight: 700;
  font-size: 15px;
  letter-spacing: 2px;
  font-family: 'Orbitron', monospace;
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
  animation: toastPop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
.toast.correct {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  border: 1px solid rgba(74,222,128,0.4);
  box-shadow: 0 0 24px rgba(34,197,94,0.5), 0 8px 32px rgba(0,0,0,0.4);
  text-shadow: 0 0 10px rgba(255,255,255,0.6);
}
.toast.wrong {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  border: 1px solid rgba(252,165,165,0.3);
  box-shadow: 0 0 20px rgba(239,68,68,0.4), 0 8px 32px rgba(0,0,0,0.4);
}
.toast.exists {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  border: 1px solid rgba(251,191,36,0.3);
  box-shadow: 0 0 20px rgba(245,158,11,0.4), 0 8px 32px rgba(0,0,0,0.4);
}
@keyframes toastPop {
  from { opacity: 0; transform: translateY(-16px) scale(0.85); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* ===== LOADING RING ===== */
.loading-ring {
  animation: spin 1.1s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ===== METRO LOGO LINES ===== */
/* Logonun arkasındaki dekoratif metro hatları */
.metro-lines-deco {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  border-radius: inherit;
}
.metro-lines-deco::before {
  content: '';
  position: absolute;
  top: 30%; left: -20%;
  width: 140%; height: 3px;
  background: linear-gradient(90deg, transparent, rgba(34,197,94,0.3), transparent);
  transform: rotate(-20deg);
}
.metro-lines-deco::after {
  content: '';
  position: absolute;
  bottom: 25%; left: -20%;
  width: 140%; height: 2px;
  background: linear-gradient(90deg, transparent, rgba(59,130,246,0.25), transparent);
  transform: rotate(-20deg);
}

```

---

### File: `src/store/gameStore.js`

```javascript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { cloudService } from '../utils/firebaseService';
// Senkron localStorage kullanılarak state sıfırlanma sorunu giderildi

export const useGameStore = create(
  persist(
    (set, get) => ({
      // --- STATE ---
      balance: 0.0, // İstanbulkart bakiyesi (₺ formatı için)
      hints: 0, // İpucu bakiyesi
      levelIndex: 0,
      lives: 5,
      gameStatus: 'idle', // 'idle' | 'playing' | 'gameover' | 'levelcomplete'
      
      // Combo Sistemi
      combo: 0,
      maxCombo: 0,

      // Günlük Streak
      streak: 0,
      lastLoginDate: null,

      // Günlük Çark
      lastSpinDate: null,

      // Rozet Sistemi (Achievements)
      unlockedBadges: [],
      
      // Kasa Sistemi (Vault)
      vaultWords: [], // Fazla kelimelerin biriktiği dizi
      
      // Ayarlar ve Tema
      soundEnabled: true,
      hapticEnabled: true,
      theme: 'dark', // 'dark' | 'light' | 'retro'
      language: 'tr', // 'tr' | 'en'
      cardColor: '#1d4ed8', // Akbil kart rengi

      // Genel İstatistikler
      totalGamesPlayed: 0,
      totalWordsFound: 0,
      totalBalanceEarned: 0,
      levelsCompleted: 0,

      // --- ACTIONS ---
      startGame: () => set({ gameStatus: 'playing', lives: 5, combo: 0 }),
      
      setGameStatus: (status) => set({ gameStatus: status }),
      
      addBalance: (amount) => set((state) => {
        const newBalance = state.balance + amount;
        return { 
          balance: newBalance,
          totalBalanceEarned: amount > 0 ? state.totalBalanceEarned + amount : state.totalBalanceEarned
        };
      }),
      
      addLives: (amount) => set((state) => ({ 
        lives: Math.min(5, state.lives + amount) 
      })),

      addHints: (amount) => set((state) => ({ 
        hints: state.hints + amount 
      })),

      syncCloud: async () => {
        const state = get();
        await cloudService.syncData({
          balance: state.balance,
          hints: state.hints,
          lives: state.lives,
          streak: state.streak,
          unlockedBadges: state.unlockedBadges,
          totalWordsFound: state.totalWordsFound,
          totalGamesPlayed: state.totalGamesPlayed,
          totalBalanceEarned: state.totalBalanceEarned
        });
      },

      // Ayarlar
      setSettings: (settings) => set((state) => ({ ...state, ...settings })),

      // İstatistik Güncellemeleri
      incrementTotalWords: () => set((state) => ({ totalWordsFound: state.totalWordsFound + 1 })),
      incrementTotalGames: () => set((state) => ({ totalGamesPlayed: state.totalGamesPlayed + 1 })),
      incrementLevelsCompleted: () => set((state) => ({ levelsCompleted: (state.levelsCompleted || 0) + 1 })),

      // Rozet aksiyonu
      unlockBadge: (badgeId) => set((state) => {
        if (!state.unlockedBadges.includes(badgeId)) {
          return { unlockedBadges: [...state.unlockedBadges, badgeId] };
        }
        return state;
      }),
      
      // Combo aksiyonları
      incrementCombo: () => set((state) => {
        const newCombo = state.combo + 1;
        return { 
          combo: newCombo,
          maxCombo: Math.max(state.maxCombo, newCombo)
        };
      }),
      resetCombo: () => set({ combo: 0 }),

      // Kasa Sistemi
      addVaultWord: (word) => set((state) => {
        if (state.vaultWords.includes(word)) return state;
        
        const newVault = [...state.vaultWords, word];
        // Kasa doldu mu? (10 kelime)
        if (newVault.length >= 10) {
          return {
            vaultWords: [], // Kasayı sıfırla
            balance: state.balance + 100, // 100₺ büyük ödül
            totalBalanceEarned: state.totalBalanceEarned + 100
          };
        }
        return { vaultWords: newVault };
      }),

      // Günlük Streak kontrolü
      checkStreak: () => set((state) => {
        const today = new Date().toLocaleDateString();
        if (state.lastLoginDate === today) return state; // Bugün zaten giriş yapılmış
        
        let newStreak = state.streak;
        if (state.lastLoginDate) {
          const lastDate = new Date(state.lastLoginDate);
          const current = new Date();
          const diffDays = Math.floor((current - lastDate) / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) newStreak += 1; // Ardışık gün
          else if (diffDays > 1) newStreak = 1; // Seri bozuldu
        } else {
          newStreak = 1; // İlk giriş
        }
        
        return { streak: newStreak, lastLoginDate: today };
      }),

      // Günlük Çark Kaydı
      setLastSpinDate: (dateStr) => set({ lastSpinDate: dateStr }),

      deductLife: () => set((state) => {
        const newLives = state.lives - 1;
        if (newLives <= 0) {
          return { lives: 0, gameStatus: 'gameover', combo: 0 };
        }
        return { lives: newLives, combo: 0 }; // Hata yapınca combo da sıfırlanır
      }),
      
      nextLevel: () => set((state) => ({ 
        levelIndex: state.levelIndex + 1,
        gameStatus: 'idle'
      })),
      
      resetGame: () => set({ 
        levelIndex: 0, 
        lives: 5, 
        gameStatus: 'idle',
        combo: 0 
        // NOT: bakiye, rozetler, istatistikler KORUNUYOR
      }),

      // Tamamen sıfırlama (ayarlar ekranından)
      fullReset: () => set({
        balance: 0.0,
        hints: 0,
        levelIndex: 0,
        lives: 5,
        gameStatus: 'idle',
        combo: 0,
        maxCombo: 0,
        streak: 0,
        lastLoginDate: null,
        lastSpinDate: null,
        unlockedBadges: [],
        vaultWords: [],
        totalGamesPlayed: 0,
        totalWordsFound: 0,
        totalBalanceEarned: 0,
      }),
    }),
    {
      name: 'turnike-game-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

```

---

### File: `src/hooks/useGameTimer.js`

```javascript
import { useState, useEffect, useRef, useCallback } from 'react';

export function useGameTimer(initialSeconds, onExpire) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  
  const requestRef = useRef();
  const startTimeRef = useRef();
  const initialTimeRef = useRef(initialSeconds * 1000);
  
  const onExpireRef = useRef(onExpire);
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  const tick = useCallback((time) => {
    if (!startTimeRef.current) startTimeRef.current = time;
    const elapsed = time - startTimeRef.current;
    
    const remaining = Math.max(0, initialTimeRef.current - elapsed);
    setTimeLeft(Math.ceil(remaining / 1000));

    if (remaining > 0) {
      requestRef.current = requestAnimationFrame(tick);
    } else {
      setIsRunning(false);
      if (onExpireRef.current) onExpireRef.current();
    }
  }, []);

  useEffect(() => {
    if (isRunning) {
      requestRef.current = requestAnimationFrame(tick);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [isRunning, tick]);

  const startTimer = useCallback((seconds) => {
    initialTimeRef.current = seconds * 1000;
    setTimeLeft(seconds);
    startTimeRef.current = null;
    setIsRunning(true);
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    requestRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const stopTimer = useCallback(() => {
    setIsRunning(false);
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
  }, []);

  return { timeLeft, startTimer, stopTimer, isRunning };
}

```

---

### File: `src/utils/gameLogic.js`

```javascript
// Turnike: Sözcük Seferi - Kelime Havuzu ve Seviye Üretici
// Kök kelime daima teknik bir terimdir. Çark (wheel) harfleri SADECE kök kelimenin harflerinden oluşur.
// Alt kelimeler tamamen bu kök kelimenin harflerinden türetilebilen anlamlı kelimelerdir.

const PUZZLE_SETS_TR = [
  // SEVİYE 1-10: SADECE TEK KELİME (Çark = Kök Kelime)
  { root: "RAY", subs: [] },
  { root: "HAT", subs: [] },
  { root: "YOL", subs: [] },
  { root: "TEL", subs: [] },
  { root: "BOJİ", subs: [] },
  { root: "TREN", subs: [] },
  { root: "DEPO", subs: [] },
  { root: "GİŞE", subs: [] },
  { root: "KART", subs: [] },
  { root: "FREN", subs: [] },
  
  // SEVİYE 11-20: 2 KELİMELİ (1 Kök + 1 Alt Kelime)
  { root: "PERON", subs: [] },
  { root: "VAGON", subs: ["OVA"] },
  { root: "DURAK", subs: ["KUR"] },
  { root: "BİLET", subs: ["TEL"] },
  { root: "VAPUR", subs: ["VAR"] },
  { root: "MAKAS", subs: ["KAS"] },
  { root: "MOTOR", subs: ["ROT"] },
  { root: "TRAFO", subs: ["FAR"] },
  { root: "SEFER", subs: ["SER"] },
  { root: "PANEL", subs: ["ALP"] },
  
  // SEVİYE 21-30: 3 KELİMELİ (1 Kök + 2 Alt Kelime)
  { root: "SİSTEM", subs: ["SES", "SİM"] },
  { root: "RULMAN", subs: ["NUR", "NAM"] },
  { root: "BALAST", subs: ["BAL", "AST"] },
  { root: "KONTAK", subs: ["KOT", "KAN"] },
  { root: "ULAŞIM", subs: ["AŞI", "ŞAL"] }, 
  { root: "SENSÖR", subs: ["SEN", "SES"] },
  { root: "İSKELE", subs: ["İLK", "KES"] },
  { root: "SİNYAL", subs: ["ASİL", "SAL"] },
  { root: "DİNGİL", subs: ["DİL", "DİN"] },
  { root: "BAKIM", subs: ["AKIM", "BAK"] },
  
  // SEVİYE 31-40: 4-5 KELİMELİ (Kesişen bulmacalar)
  { root: "TURNİKE", subs: ["TREN", "RENK", "TEK", "KENT"] },
  { root: "KATENER", subs: ["KART", "TANK", "KAN", "NET"] },
  { root: "İSTASYON", subs: ["SON", "SOY", "YAN"] },
  { root: "TRAMVAY", subs: ["RAY", "AYAR", "TAY", "YAR"] },
  { root: "KÜPEŞTE", subs: ["KÜP", "PEŞ", "TEPE", "KEP"] },
  { root: "GÜZERGAH", subs: ["GÜR", "ZAR", "GAR", "HER"] },
  { root: "MAKİNİST", subs: ["KAS", "İSİM", "MİT", "SİM"] },
  { root: "OTOBÜS", subs: ["BOT", "SÜT", "ÜST", "TOS"] },
  { root: "TRAVERS", subs: ["SERT", "TERS", "VER", "SET"] },
  { root: "PANTOGRAF", subs: ["POT", "NOT", "GAR", "NAR"] },

  // SEVİYE 41-50: 5-6 KELİMELİ (Çok Karmaşık)
  { root: "MARMARAY", subs: ["RAY", "AYAR", "YAR", "MAR", "ARA"] },
  { root: "KONTROL", subs: ["KOT", "KOL", "ROL", "KOR", "NOT"] },
  { root: "METROBÜS", subs: ["METRO", "TERS", "SÜT", "BET", "ÜST"] },
  { root: "GÜVENLİK", subs: ["GÜVEN", "İLK", "NİL", "KİL", "LİG"] },
  { root: "YOLCULUK", subs: ["YOL", "KOL", "KUL", "ULU", "YOK"] },
  { root: "AKTARMA", subs: ["KART", "AYAR", "AKT", "TAR", "ARA"] },
  { root: "EMNİYET", subs: ["NET", "YEM", "YEN", "MEY", "İTİ"] },
  { root: "TERSANE", subs: ["TERS", "SER", "NET", "SET"] },
  { root: "RÜZGÂR", subs: ["GÜR", "ZAR", "RUZ", "GÂR"] },
  { root: "BİLETLİK", subs: ["BİLET", "İLK", "TEK", "BİT", "KEL"] }
];

const PUZZLE_SETS_EN = [
  // LEVEL 1-10: SINGLE WORD
  { root: "BUS", subs: [] },
  { root: "CAB", subs: [] },
  { root: "CAR", subs: [] },
  { root: "VAN", subs: [] },
  { root: "RAIL", subs: [] },
  { root: "TUBE", subs: [] },
  { root: "TAXI", subs: [] },
  { root: "TRAM", subs: [] },
  { root: "DOCK", subs: [] },
  { root: "GATE", subs: [] },

  // LEVEL 11-20: 2 WORDS
  { root: "TRAIN", subs: ["TIN"] },
  { root: "FERRY", subs: ["FRY"] },
  { root: "ROUTE", subs: ["TOE"] },
  { root: "TRACK", subs: ["ARC"] },
  { root: "BRAKE", subs: ["BAR"] },
  { root: "MOTOR", subs: ["ROT"] },
  { root: "DEPOT", subs: ["POD"] },
  { root: "LEVER", subs: ["EVE"] },
  { root: "CABIN", subs: ["BAN"] },
  { root: "WHEEL", subs: ["HEW"] },

  // LEVEL 21-30: 3 WORDS
  { root: "SIGNAL", subs: ["NAIL", "GAS"] },
  { root: "TUNNEL", subs: ["TUNE", "LET"] },
  { root: "BRIDGE", subs: ["RIG", "BID"] },
  { root: "ENGINE", subs: ["GIN", "INN"] },
  { root: "TICKET", subs: ["TIE", "KIT"] },
  { root: "HARBOR", subs: ["BAR", "ORB"] },
  { root: "PISTON", subs: ["PIN", "SON"] },
  { root: "SWITCH", subs: ["WIT", "HIS"] },
  { root: "BOILER", subs: ["OIL", "ORE"] },
  { root: "TENDER", subs: ["TEN", "DEN"] },

  // LEVEL 31-40: 4-5 WORDS
  { root: "STATION", subs: ["SAINT", "SON", "TAN", "SIT"] },
  { root: "TRANSIT", subs: ["RAIN", "SIT", "TAN", "ART"] },
  { root: "PLATFORM", subs: ["FLAT", "PORT", "LAP", "OAT"] },
  { root: "TERMINAL", subs: ["MILE", "RENT", "TIN", "AIM"] },
  { root: "OVERPASS", subs: ["OVER", "PASS", "SEA", "OAR"] },
  { root: "COMMUTER", subs: ["CORE", "MORE", "CUT", "MET"] },
  { root: "CARRIAGE", subs: ["RACE", "CAGE", "AGE", "AIR"] },
  { root: "ENGINEER", subs: ["GENE", "RING", "GIN", "IRE"] },
  { root: "CONDUCTOR", subs: ["CORD", "COURT", "NUT", "COD"] },
  { root: "CROSSROAD", subs: ["ROAD", "CROSS", "OAR", "ARC"] },

  // LEVEL 41-50: 5-6 WORDS
  { root: "UNDERGROUND", subs: ["UNDER", "ROUND", "DUG", "RUN", "GNU"] },
  { root: "LOCOMOTIVE", subs: ["MOTIVE", "COOL", "TIE", "LOT"] },
  { root: "SUSPENSION", subs: ["SPINE", "NOSE", "SUN", "PEN", "ION"] },
  { root: "ACCELERATE", subs: ["CLEAR", "RATE", "ALE", "ACE", "EAR"] },
  { root: "HORSEPOWER", subs: ["HORSE", "POWER", "ROPE", "HERO", "PORE"] },
  { root: "TURNTABLE", subs: ["TABLE", "TURN", "BELT", "NUT", "BUT"] },
  { root: "DEPARTURE", subs: ["DEPART", "TAPE", "PURE", "RAT", "RUE"] },
  { root: "TRANSPORT", subs: ["SPORT", "TRAP", "PORT", "RAT", "NOT"] },
  { root: "SUBMARINE", subs: ["MARINE", "BRAIN", "MINE", "BAN"] },
  { root: "CHECKPOINT", subs: ["CHECK", "POINT", "HINT", "PEN", "NET"] }
];

export const VALID_WORDS_TR = new Set([
  // Kökler
  "RAY", "HAT", "YOL", "TEL", "BOJİ", "TREN", "DEPO", "GİŞE", "KART", "FREN",
  "PERON", "VAGON", "DURAK", "BİLET", "VAPUR", "MAKAS", "MOTOR", "TRAFO", "SEFER", "PANEL",
  "SİSTEM", "RULMAN", "BALAST", "KONTAK", "ULAŞIM", "SENSÖR", "İSKELE", "SİNYAL", "DİNGİL", "BAKIM",
  "TURNİKE", "KATENER", "İSTASYON", "TRAMVAY", "KÜPEŞTE", "GÜZERGAH", "MAKİNİST", "OTOBÜS", "TRAVERS", "PANTOGRAF",
  "MARMARAY", "LOKOMOTİF", "METROBÜS", "FÜNİKÜLER", "DEMİRYOLU", "AKTARMA", "TELEFERİK", "TERSANE", "RÜZGÂR", "KOMPARTİMAN",
  // Alt Kelimeler
  "OVA", "KUR", "VAR", "KAS", "ROT", "FAR", "SER", "ALP", "SES", "SİM", "NUR", "NAM", "BAL", "AST", "KOT", "KAN",
  "ŞAL", "AŞI", "SEN", "İLK", "KES", "ASİL", "SAL", "DİL", "DİN", "AKIM", "BAK", "RENK", "TEK", "KENT",
  "TANK", "NET", "SON", "SOY", "TAS", "YAN", "AYAR", "TAY", "YAR", "KÜP", "PEŞ", "TEPE", "KEP",
  "GÜR", "ZAR", "GAR", "HER", "İSİM", "MİT", "BOT", "SÜT", "ÜST", "TOS", "SERT", "TERS", "VER", "SET",
  "POT", "NOT", "NAR", "MAR", "ARA", "MOL", "KOL", "FİL", "KİM", "METRO", "BET", "FÜL", "KÜR", "NİL",
  "DEMİR", "MİR", "DOR", "AKT", "TAR", "FER", "KEL", "ELİ", "RUZ", "GÂR",
  "KOT", "KOL", "ROL", "KOR", "NOT", "GÜVEN", "İLK", "NİL", "KİL", "LİG",
  "YOL", "KUL", "ULU", "YOK", "NET", "YEM", "YEN", "MEY", "İTİ", "BİLET", "TEK", "BİT",
  "KARAKÖY", "EMİNÖNÜ", "KADIKÖY", "BEŞİKTAŞ", "ÜSKÜDAR", "BOSTANCI", "KARTAL", "PENDİK", "TUZLA", "GEBZE", "TAKSİM", "LEVENT", "ŞİŞLİ", "MECİDİYEKÖY", "MASLAK", "SARIYER", "BEYKOZ", "BEYOĞLU", "FATİH", "ZEYTİNBURNU", "BAKIRKÖY", "ŞİRİNEVLER", "YENİBOSNA", "SEFAKÖY", "AVCILAR", "BEYLİKDÜZÜ", "ESENYURT", "BÜYÜKÇEKMECE", "SİLİVRİ", "ÇATALCA", "AKSU", "LALELİ", "BEYAZIT", "SİRKECİ", "GÜLHANE", "SULTANAHMET", "ÇEMBERLİTAŞ", "KABATAŞ", "FINDIKLI", "TOPHANE"
]);

export const VALID_WORDS_EN = new Set([
  "BUS", "CAB", "CAR", "VAN", "RAIL", "TUBE", "TAXI", "TRAM", "DOCK", "GATE",
  "TRAIN", "FERRY", "ROUTE", "TRACK", "BRAKE", "MOTOR", "DEPOT", "LEVER", "CABIN", "WHEEL",
  "SIGNAL", "TUNNEL", "BRIDGE", "ENGINE", "TICKET", "HARBOR", "PISTON", "SWITCH", "BOILER", "TENDER",
  "STATION", "TRANSIT", "PLATFORM", "TERMINAL", "OVERPASS", "COMMUTER", "CARRIAGE", "ENGINEER", "CONDUCTOR", "CROSSROAD",
  "UNDERGROUND", "LOCOMOTIVE", "SUSPENSION", "ACCELERATE", "HORSEPOWER", "TURNTABLE", "DEPARTURE", "TRANSPORT", "SUBMARINE", "CHECKPOINT",
  // Sub-words
  "TIN", "FRY", "TOE", "ARC", "BAR", "ROT", "POD", "EVE", "BAN", "HEW",
  "NAIL", "GAS", "TUNE", "LET", "RIG", "BID", "GIN", "INN", "TIE", "KIT",
  "ORB", "PIN", "SON", "WIT", "HIS", "OIL", "ORE", "TEN", "DEN",
  "SAINT", "TAN", "SIT", "RAIN", "ART", "FLAT", "PORT", "LAP", "OAT",
  "MILE", "RENT", "AIM", "OVER", "PASS", "SEA", "OAR", "CORE", "MORE", "CUT", "MET",
  "RACE", "CAGE", "AGE", "AIR", "GENE", "RING", "IRE", "CORD", "COURT", "NUT", "COD",
  "ROAD", "CROSS", "UNDER", "ROUND", "DUG", "RUN", "GNU", "MOTIVE", "COOL", "LOT",
  "SPINE", "NOSE", "SUN", "PEN", "ION", "CLEAR", "RATE", "ALE", "ACE", "EAR",
  "HORSE", "POWER", "ROPE", "HERO", "PORE", "TABLE", "TURN", "BELT", "BUT",
  "DEPART", "TAPE", "PURE", "RAT", "RUE", "SPORT", "TRAP", "NOT",
  "MARINE", "BRAIN", "MINE", "RIM", "CHECK", "POINT", "HINT", "NET",
  "BROOKLYN", "MANHATTAN", "QUEENS", "BRONX", "STATEN", "HARLEM", "CHELSEA", "SOHO", "TRIBECA", "GREENWICH", "TIMES", "SQUARE", "PENN", "GRAND", "CENTRAL", "MADISON", "LEXINGTON", "BROADWAY", "WALL", "STREET", "WATERLOO", "VICTORIA", "PADDINGTON", "EUSTON", "KINGS", "CROSS", "PANCRAS", "LIVERPOOL", "LONDON", "BRIDGE", "BAKER", "BOND", "OXFORD", "PICCADILLY", "CIRCUS", "CHARING", "LEICESTER", "COVENT", "GARDEN", "HOLBORN"
]);

// Kelime anlamları — TR
export const WORD_MEANINGS_TR = {
  "BOJİ": "Tren ve metro vagonlarının tekerlek takımlarını barındıran, titreşimi emen alt şasi.",
  "TREN": "Raylar üzerinde hareket eden, lokomotif ve vagonlardan oluşan ulaşım aracı.",
  "DEPO": "Raylı sistem araçlarının bakım, onarım ve park edildiği kapalı tesis.",
  "GİŞE": "İstasyonlarda bilet satışı ve bilgilendirme hizmeti verilen pencere.",
  "KART": "İstanbulkart; temassız ödeme yapılan elektronik ulaşım kartı.",
  "FREN": "Araç hızını düşüren veya durduran mekanik/elektrik/pnömatik sistem.",
  "PERON": "Yolcuların trene binip indikleri, raylara paralel uzanan platform.",
  "VAGON": "Tren katarını oluşturan, yolcu veya yük taşıyan birimlerden her biri.",
  "DURAK": "Toplu taşıma araçlarının yolcu indirip bindirmek için durduğu belirlenmiş nokta.",
  "BİLET": "Toplu taşımada yolculuk hakkı veren basılı veya dijital geçiş belgesi.",
  "VAPUR": "İstanbul Boğazı ve Haliç hatlarında çalışan yolcu gemisi.",
  "MAKAS": "Trenin bir raydan diğerine geçmesini sağlayan hareketli ray donanımı.",
  "MOTOR": "Elektrik enerjisini mekanik harekete çeviren cer (çekiş) ünitesi.",
  "TRAFO": "Yüksek gerilimi istasyon ve araçların kullanabileceği seviyeye düşüren dönüştürücü.",
  "SEFER": "Bir aracın başlangıçtan bitiş noktasına kadar yaptığı tek yönlü çalışma.",
  "PANEL": "Kontrol merkezinde sistem durumunu gösteren ve kumanda eden gösterge tablosu.",
  "SİSTEM": "Birbiriyle uyumlu çalışan teknik bileşenlerin oluşturduğu bütün.",
  "RULMAN": "Mekanik parçaların sürtünmesini azaltarak dönmesini sağlayan bilyalı yatak.",
  "BALAST": "Rayların altına döşenen, titreşimi emen ve drenaj sağlayan kırık taş tabakası.",
  "KONTAK": "Elektrik devresinde akımın geçişini sağlayan ya da kesen temas noktası.",
  "ULAŞIM": "İnsanları ve yükleri bir noktadan diğerine taşıma hizmeti.",
  "SENSÖR": "Sıcaklık, basınç, hız gibi fiziksel büyüklükleri ölçen elektronik algılayıcı.",
  "İSKELE": "Gemi ve vapurların yanaştığı, yolcu indirip bindirdiği kıyı yapısı.",
  "SİNYAL": "Makiniste dur/yavaş/geç komutlarını ileten ışıklı veya mekanik gösterge.",
  "DİNGİL": "Bogi içinde tekerlekleri birbirine bağlayan ana çelik eksen.",
  "BAKIM": "Araç ve tesislerin güvenli çalışmasını sürdürmek için yapılan periyodik kontrol.",
  "TURNİKE": "İstasyon girişlerinde kart okutarak geçişi kontrol eden elektro-mekanik kapı.",
  "KATENER": "Elektrikli trenlere havadan enerji sağlayan yüksek gerilim kablo sistemi.",
  "İSTASYON": "Yolcuların raylı sisteme erişim sağladığı, peron ve konkorstan oluşan yapı.",
  "TRAMVAY": "Cadde üzerinde raylarda hareket eden hafif raylı taşıma aracı.",
  "KÜPEŞTE": "Vapur ve gemilerde güverte kenarındaki güvenlik korkuluğu.",
  "GÜZERGAH": "Bir toplu taşıma hattının izlediği sabit rota.",
  "MAKİNİST": "Metro veya tren aracını süren, sinyallere göre seferi yöneten personel.",
  "OTOBÜS": "Karayolunda yolcu taşıyan, İETT filosundaki büyük toplu taşıma aracı.",
  "TRAVERS": "Rayların üzerine oturduğu ve yükü balasta dağıtan beton/ahşap destek.",
  "PANTOGRAF": "Trenin tavanında bulunan, katener telinden elektriği araca ileten mekanizma.",
  "MARMARAY": "İstanbul Boğazı'nın altından geçen, Anadolu ile Avrupa'yı bağlayan raylı sistem.",
  "LOKOMOTİF": "Tren katarını çeken, enerji kaynağı taşıyan ana çekici araç.",
  "METROBÜS": "Özel şeritlerde çalışan, yüksek kapasiteli hızlı otobüs sistemi.",
  "DEMİRYOLU": "Çelik raylar üzerinde trenlerin hareket ettiği ulaşım altyapısı.",
  "AKTARMA": "Bir ulaşım aracından diğerine ek ücret ödemeden geçiş yapma hakkı.",
  "TERSANE": "Gemilerin yapıldığı, onarıldığı ve bakımının yapıldığı kıyı tesisi.",
  "KOMPARTİMAN": "Tren vagonlarının bölümlere ayrılmış kapalı yolcu kabinlerinden her biri.",
  "KARAKÖY": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "EMİNÖNÜ": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "KADIKÖY": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "BEŞİKTAŞ": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "ÜSKÜDAR": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "BOSTANCI": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "KARTAL": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "PENDİK": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "TUZLA": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "GEBZE": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "TAKSİM": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "LEVENT": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "ŞİŞLİ": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "MECİDİYEKÖY": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "MASLAK": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "SARIYER": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "BEYKOZ": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "BEYOĞLU": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "FATİH": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "ZEYTİNBURNU": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "BAKIRKÖY": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "ŞİRİNEVLER": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "YENİBOSNA": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "SEFAKÖY": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "AVCILAR": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "BEYLİKDÜZÜ": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "ESENYURT": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "BÜYÜKÇEKMECE": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "SİLİVRİ": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "ÇATALCA": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "AKSU": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "LALELİ": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "BEYAZIT": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "SİRKECİ": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "GÜLHANE": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "SULTANAHMET": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "ÇEMBERLİTAŞ": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "KABATAŞ": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "FINDIKLI": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "TOPHANE": "İstanbul ulaşım ağında önemli bir durak/bölge."
};

// Kelime anlamları — EN
export const WORD_MEANINGS_EN = {
  "RAIL": "A steel bar forming part of the track on which trains run.",
  "TUBE": "An underground railway system, especially the one in London.",
  "TRAM": "A light rail vehicle that runs on tracks along public streets.",
  "TRAIN": "A series of connected railroad cars pulled by a locomotive.",
  "FERRY": "A boat or ship for conveying passengers and goods across water.",
  "ROUTE": "A way or course taken in getting from a starting point to a destination.",
  "TRACK": "A pair of parallel rails providing a runway for trains.",
  "BRAKE": "A device for slowing or stopping a moving vehicle.",
  "MOTOR": "A machine that converts electrical energy into mechanical motion.",
  "DEPOT": "A place for the storage of large quantities of equipment or vehicles.",
  "CABIN": "A compartment or room in a train for passengers or crew.",
  "WHEEL": "A circular component that rotates on an axle to enable movement.",
  "SIGNAL": "An apparatus used to convey information about track conditions to train operators.",
  "TUNNEL": "An underground passage built for a railway to pass through.",
  "BRIDGE": "A structure carrying a road or railway across a river or other obstacle.",
  "ENGINE": "A machine with moving parts that converts power into motion.",
  "TICKET": "A piece of paper or card giving the holder a right to travel.",
  "HARBOR": "A sheltered port where ships may anchor safely.",
  "PISTON": "A cylindrical component that moves up and down within an engine cylinder.",
  "SWITCH": "A device for making and breaking connections in railway tracks.",
  "STATION": "A place where trains stop for passengers to board and exit.",
  "TRANSIT": "The carrying of people or goods from one place to another.",
  "PLATFORM": "A raised level surface alongside a railway track where passengers wait.",
  "TERMINAL": "A station at the end of a transportation line.",
  "COMMUTER": "A person who travels regularly between home and work by train or bus.",
  "CARRIAGE": "A separate section of a train for carrying passengers.",
  "ENGINEER": "A person who drives a locomotive or manages an engine.",
  "CONDUCTOR": "A person who collects fares on a bus, train, or other public transport.",
  "UNDERGROUND": "A railway system running through tunnels beneath a city.",
  "LOCOMOTIVE": "A powered railway vehicle used for pulling trains.",
  "TRANSPORT": "The system or means of conveying people or goods from place to place.",
  "DEPARTURE": "The act of leaving a place, especially the start of a journey.",
  "CHECKPOINT": "A barrier or manned entrance where travelers are inspected.",
  "SUBMARINE": "A watercraft capable of operating underwater.",
  "BROOKLYN": "A well-known transit location or area.",
  "MANHATTAN": "A well-known transit location or area.",
  "QUEENS": "A well-known transit location or area.",
  "BRONX": "A well-known transit location or area.",
  "STATEN": "A well-known transit location or area.",
  "HARLEM": "A well-known transit location or area.",
  "CHELSEA": "A well-known transit location or area.",
  "SOHO": "A well-known transit location or area.",
  "TRIBECA": "A well-known transit location or area.",
  "GREENWICH": "A well-known transit location or area.",
  "TIMES": "A well-known transit location or area.",
  "SQUARE": "A well-known transit location or area.",
  "PENN": "A well-known transit location or area.",
  "GRAND": "A well-known transit location or area.",
  "CENTRAL": "A well-known transit location or area.",
  "MADISON": "A well-known transit location or area.",
  "LEXINGTON": "A well-known transit location or area.",
  "BROADWAY": "A well-known transit location or area.",
  "WALL": "A well-known transit location or area.",
  "STREET": "A well-known transit location or area.",
  "WATERLOO": "A well-known transit location or area.",
  "VICTORIA": "A well-known transit location or area.",
  "PADDINGTON": "A well-known transit location or area.",
  "EUSTON": "A well-known transit location or area.",
  "KINGS": "A well-known transit location or area.",
  "CROSS": "A well-known transit location or area.",
  "PANCRAS": "A well-known transit location or area.",
  "LIVERPOOL": "A well-known transit location or area.",
  "LONDON": "A well-known transit location or area.",
  "BRIDGE": "A well-known transit location or area.",
  "BAKER": "A well-known transit location or area.",
  "BOND": "A well-known transit location or area.",
  "OXFORD": "A well-known transit location or area.",
  "PICCADILLY": "A well-known transit location or area.",
  "CIRCUS": "A well-known transit location or area.",
  "CHARING": "A well-known transit location or area.",
  "LEICESTER": "A well-known transit location or area.",
  "COVENT": "A well-known transit location or area.",
  "GARDEN": "A well-known transit location or area.",
  "HOLBORN": "A well-known transit location or area."
};

const normalizeTerm = (term) => term.toLocaleUpperCase('tr-TR');

const canFormNormalizedWord = (word, availableLetters) => {
  let chars = availableLetters.split('');
  for (let i = 0; i < word.length; i++) {
    let index = chars.indexOf(word[i]);
    if (index === -1) return false;
    chars.splice(index, 1);
  }
  return true;
};

const seededRandom = (seed) => {
  return () => {
    let x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };
};

const shuffleWith = (array, rand) => {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export const canFormWord = (word, availableLetters) => {
  return canFormNormalizedWord(normalizeTerm(word), normalizeTerm(availableLetters));
};

const LEVEL_CAP = 10000;

// Yalnızca geçerli kök kelimeleri barındıran havuz (örnek veri setinden dönüştürüldü)
const TECH_TR = Array.from(VALID_WORDS_TR).filter(w => w.length >= 3).map(root => ({
  root,
  provider: ["Metro Istanbul", "IETT", "Sehir Hatlari", "Busforus"][Math.floor(Math.random() * 4)],
  category: "Genel"
}));

const TECH_EN = Array.from(VALID_WORDS_EN).filter(w => w.length >= 3).map(root => ({
  root,
  provider: ["Metro", "IETT", "City Lines", "Busforus"][Math.floor(Math.random() * 4)],
  category: "General"
}));

const FORMABLE_TR = new Map();
const FORMABLE_EN = new Map();

const getDifficulty = (levelIndex) => {
  if (levelIndex < 10) return { targetWords: 2, minRoot: 3, maxRoot: 5, label: "baslangic" };
  if (levelIndex < 50) return { targetWords: 3, minRoot: 4, maxRoot: 7, label: "kolay" };
  if (levelIndex < 150) return { targetWords: 4, minRoot: 5, maxRoot: 8, label: "orta" };
  if (levelIndex < 400) return { targetWords: 4, minRoot: 6, maxRoot: 8, label: "orta-plus" };
  if (levelIndex < 1000) return { targetWords: 5, minRoot: 6, maxRoot: 8, label: "zor" }; // Max 8 harf (UI taşmasını önlemek için)
  if (levelIndex < 2500) return { targetWords: 5, minRoot: 7, maxRoot: 8, label: "uzman" };
  if (levelIndex < 5000) return { targetWords: 6, minRoot: 7, maxRoot: 8, label: "usta" };
  return { targetWords: 6, minRoot: 7, maxRoot: 8, label: "efsane" };
};

const getCandidateWords = (root, validWords, levelIndex, rand, formableCache) => {
  const rootLen = root.length;
  const minLen = levelIndex < 50 ? 3 : 4;
  const baseCandidates = formableCache.get(root) || [...validWords].filter((word) => word !== root && word.length < rootLen && canFormNormalizedWord(word, root));
  const candidates = baseCandidates.filter((word) => word.length >= minLen);

  return shuffleWith(candidates, rand).sort((a, b) => {
    const lengthBias = levelIndex > 400 ? b.length - a.length : a.length - b.length;
    return lengthBias || a.localeCompare(b);
  });
};

const placePuzzleWords = (root, candidates, targetWords) => {
  const selectedWords = [];
  const gridLetters = new Map();

  const placeWord = (word, startX, startY, isHorizontal) => {
    selectedWords.push({ word, startX, startY, isHorizontal });
    for (let i = 0; i < word.length; i++) {
      const x = startX + (isHorizontal ? i : 0);
      const y = startY + (isHorizontal ? 0 : i);
      gridLetters.set(`${x},${y}`, word[i]);
    }
  };

  const canPlaceWord = (word, startX, startY, isHorizontal) => {
    const beforeX = startX - (isHorizontal ? 1 : 0);
    const beforeY = startY - (isHorizontal ? 0 : 1);
    const afterX = startX + (isHorizontal ? word.length : 0);
    const afterY = startY + (isHorizontal ? 0 : word.length);
    if (gridLetters.has(`${beforeX},${beforeY}`)) return false;
    if (gridLetters.has(`${afterX},${afterY}`)) return false;

    let hasIntersection = false;
    for (let i = 0; i < word.length; i++) {
      const x = startX + (isHorizontal ? i : 0);
      const y = startY + (isHorizontal ? 0 : i);
      const key = `${x},${y}`;

      if (gridLetters.has(key)) {
        if (gridLetters.get(key) !== word[i]) return false;
        hasIntersection = true;
        continue;
      }

      const sideA = isHorizontal ? `${x},${y - 1}` : `${x - 1},${y}`;
      const sideB = isHorizontal ? `${x},${y + 1}` : `${x + 1},${y}`;
      if (gridLetters.has(sideA) || gridLetters.has(sideB)) return false;
    }

    return selectedWords.length === 0 || hasIntersection;
  };

  placeWord(root, 0, 0, true);

  for (const word of candidates) {
    if (selectedWords.length >= targetWords) break;
    let placed = false;

    for (const target of [...selectedWords]) {
      if (placed) break;
      for (let i = 0; i < word.length; i++) {
        if (placed) break;
        const char = word[i];
        let targetIndex = target.word.indexOf(char);

        while (targetIndex !== -1) {
          const isHorizontal = !target.isHorizontal;
          const startX = target.startX + (target.isHorizontal ? targetIndex : 0) - (isHorizontal ? i : 0);
          const startY = target.startY + (target.isHorizontal ? 0 : targetIndex) - (isHorizontal ? 0 : i);

          if (canPlaceWord(word, startX, startY, isHorizontal)) {
            placeWord(word, startX, startY, isHorizontal);
            placed = true;
            break;
          }
          targetIndex = target.word.indexOf(char, targetIndex + 1);
        }
      }
    }
  }

  return selectedWords;
};

const getPools = (language) => {
  if (language === "en") {
    return { techTerms: TECH_EN, validWords: VALID_WORDS_EN, formableCache: FORMABLE_EN };
  }
  return { techTerms: TECH_TR, validWords: VALID_WORDS_TR, formableCache: FORMABLE_TR };
};

const chooseTechnicalRoot = (levelIndex, language) => {
  const { techTerms, validWords, formableCache } = getPools(language);
  const difficulty = getDifficulty(levelIndex);
  const rand = seededRandom((levelIndex + 1) * (language === "en" ? 997 : 613));
  
  const providerCycle = language === "en"
    ? ["Metro", "IETT", "City Lines", "Busforus"]
    : ["Metro Istanbul", "IETT", "Sehir Hatlari", "Busforus"];
  const desiredProvider = providerCycle[levelIndex % providerCycle.length];
  const providerTerms = techTerms.filter((term) => term.provider === desiredProvider);
  const scopedTerms = providerTerms.length > 0 ? providerTerms : techTerms;

  const preferred = scopedTerms.filter((term) => {
    const len = term.root.length;
    return len >= difficulty.minRoot && len <= difficulty.maxRoot;
  });

  const pool = preferred.length > 0 ? preferred : scopedTerms;
  
  // Havuzu karıştırıp ilk uygun olanı alalım (Sürekli aynı kelimenin gelmesini engeller)
  const shuffledPool = shuffleWith(pool, rand);
  
  let best = shuffledPool[0];
  let bestScore = -1;

  for (const term of shuffledPool) {
    const count = (formableCache.get(term.root) || [...validWords].filter(w => canFormNormalizedWord(w, term.root))).filter((word) => word.length >= (levelIndex < 50 ? 3 : 4)).length;
    const score = Math.min(count, difficulty.targetWords - 1) * 10 + term.root.length;
    
    if (score > bestScore) {
      best = term;
      bestScore = score;
    }
    
    // Yeterli sayıda kelime çıkıyorsa direkt bunu kullan (çeşitliliği sağlar)
    if (count >= difficulty.targetWords - 1) {
      best = term;
      break;
    }
  }

  // Güvenlik amaçlı fallback
  if (!best) {
    best = { root: language === "en" ? "TRAIN" : "TREN", provider: "Metro Istanbul", category: "Genel" };
  }
  return best;
};

export const getTimeForLevel = (levelIndex, wordCount) => {
  const difficulty = getDifficulty(levelIndex);
  const base = wordCount <= 1 ? 45 : 42;
  const levelPressure = Math.floor(levelIndex / 250) * 2;
  const wordPressure = Math.max(0, wordCount - 3) * 2;
  const tierPressure = {
    baslangic: 0,
    kolay: 2,
    orta: 4,
    "orta-plus": 6,
    zor: 8,
    uzman: 10,
    usta: 12,
    efsane: 14
  }[difficulty.label] || 4;

  return Math.max(18, base - levelPressure - wordPressure - tierPressure);
};

export const generateLevel = (levelIndex, language = "tr") => {
  const safeLevel = ((levelIndex % LEVEL_CAP) + LEVEL_CAP) % LEVEL_CAP;
  const rand = seededRandom((safeLevel + 1) * (language === "en" ? 1879 : 1297));
  const { validWords, formableCache } = getPools(language);
  const difficulty = getDifficulty(safeLevel);
  
  let term = chooseTechnicalRoot(safeLevel, language);
  let candidates = getCandidateWords(term.root, validWords, safeLevel, rand, formableCache);
  
  // Eğer hiç candidate yoksa (örn: "YOL" gibi çok kısa bir kelime geldiyse),
  // sonsuz döngüden kaçınmak veya bulmacanın boş kalmasını engellemek için
  // yeni bir kelime seç.
  if (candidates.length === 0) {
    term = { root: language === 'en' ? 'TRAIN' : 'TRAMVAY', provider: 'Metro', category: 'General' };
    candidates = getCandidateWords(term.root, validWords, safeLevel, rand, formableCache);
  }

  const words = placePuzzleWords(term.root, candidates, difficulty.targetWords);
  const wheelLetters = shuffleWith(term.root.split(""), rand);

  return {
    levelName: language === "en" ? `Level ${levelIndex + 1}` : `Seviye ${levelIndex + 1}`,
    stationName: term.root,
    words,
    wheelLetters,
    allValidWords: words.map((item) => item.word),
    validWordsSet: validWords,
    technicalTerm: term.root,
    provider: term.provider,
    category: term.category,
    difficulty: difficulty.label,
    maxSupportedLevel: LEVEL_CAP
  };
};

export const VALID_WORDS = VALID_WORDS_TR;
export const WORD_MEANINGS = WORD_MEANINGS_TR;

```

---

### File: `src/utils/i18n.js`

```javascript
import { useGameStore } from '../store/gameStore';

export const translations = {
  tr: {
    // Menü
    play: 'OYNA',
    map: 'HARİTA',
    dictionary: 'SÖZLÜK',
    badges: 'ROZETLERİM',
    settings: 'AYARLAR',
    stats: 'İSTATİSTİKLER',
    akbil: 'İSTANBULKART',
    back: 'GERİ',

    // Ana Ekran
    welcome: 'Hoş Geldin!',
    subtitle: 'İstanbul\'u dolaşarak kelime bul',
    day_streak: 'GÜN SERİSİ',
    level_label: 'Seviye',
    word_journey: 'SÖZCÜK SEFERİ',

    // Oyun
    correct: 'DOĞRU!',
    wrong: 'GEÇERSİZ',
    already_found: 'ZATEN BULUNDU',
    extra_word: 'EKSTRA! +₺0.20',
    time_up: 'SÜRE BİTTİ!',
    perfect: 'KUSURSUZ! +₺0.50',
    gold_letter: 'ALTIN HARF! +₺0.25',
    balance_low: 'BAKİYE YETERSİZ',
    new_badge: '🏆 YENİ ROZET!',
    combo_15: '1.5x KOMBO',
    combo_20: '2.0x KOMBO',
    journey: 'SEFER',

    // Game Over
    game_over: 'Treni Kaçırdın!',
    game_over_desc: 'Devam etmek için aşağıdaki seçeneklerden birini kullanabilirsin.',
    watch_ad: 'Reklam İzle (1 Can Al)',
    watching_ad: 'Reklam İzleniyor...',
    buy_life: '₺0.25 Öde (1 Can Al)',
    skip_level: '₺0.50 Öde (Seviyeyi Geç)',
    main_menu: 'ANA MENÜYE DÖN',

    // Sözlük
    search_word: 'Kelime ara...',
    discovered_words: 'Keşfedilen Kelimeler',
    count_unit: 'Adet',
    no_words_yet: 'Henüz kelime keşfetmediniz.',
    no_search_result: 'Arama sonucu bulunamadı.',
    play_to_discover: 'Oyunda kelime bularak sözlüğü doldurabilirsiniz.',

    // Rozet
    earned_badges: 'Kazanılan Rozetler',

    // Akbil
    available_balance: 'Kullanılabilir Bakiye',
    watch_ad_balance: 'Reklam İzle (+₺0.50)',
    load_balance: 'Bakiye Yükle',
    history: 'Geçmiş İşlemler',
    recent_ops: 'Son İşlemler',
    card_color: 'Kart Rengi',

    // İstatistik
    games_played: 'Oynanan Oyun',
    words_found: 'Bulunan Kelime',
    max_combo: 'Maksimum Kombo',
    daily_streak: 'Günlük Seri',
    total_earned: 'Toplam Kazanılan Bakiye',

    // Ayarlar
    sound: 'Ses Efektleri',
    haptic: 'Titreşim (Haptik)',
    theme: 'Tema Seçimi',
    lang: 'Dil (Language)',
    dark_theme: 'Koyu Tema',
    light_theme: 'Açık Tema',
    retro_theme: 'Retro (8-Bit)',

    // Harita
    istanbul_line: 'İSTANBUL HATTI',

    // Seviye Tamamlama
    level_complete: 'SEFER TAMAMLANDI!',

    // Kasa & Liderlik
    vault: 'KASA',
    leaderboard: 'LİDERLİK',

    // Onay
    confirm_reset: 'Ana menüye dönmek istediğinize emin misiniz? İlerlemeniz korunacaktır.',

    // Hint Maliyetleri
    hint_cost_word: 'İpucu (75₺)',
    hint_cost_letter: 'Harf (25₺)',
  },
  en: {
    // Menu
    play: 'PLAY',
    map: 'MAP',
    dictionary: 'DICTIONARY',
    badges: 'MY BADGES',
    settings: 'SETTINGS',
    stats: 'STATISTICS',
    akbil: 'TRANSIT CARD',
    back: 'BACK',

    // Home Screen
    welcome: 'Welcome!',
    subtitle: 'Travel through Istanbul and find words',
    day_streak: 'DAY STREAK',
    level_label: 'Level',
    word_journey: 'WORD JOURNEY',

    // Game
    correct: 'CORRECT!',
    wrong: 'INVALID',
    already_found: 'ALREADY FOUND',
    extra_word: 'EXTRA! +₺0.20',
    time_up: 'TIME IS UP!',
    perfect: 'PERFECT! +₺0.50',
    gold_letter: 'GOLD LETTER! +₺0.25',
    balance_low: 'LOW BALANCE',
    new_badge: '🏆 NEW BADGE!',
    combo_15: '1.5x COMBO',
    combo_20: '2.0x COMBO',
    journey: 'TRIP',

    // Game Over
    game_over: 'You Missed the Train!',
    game_over_desc: 'Use one of the options below to continue.',
    watch_ad: 'Watch Ad (+1 Life)',
    watching_ad: 'Watching Ad...',
    buy_life: 'Pay ₺0.25 (+1 Life)',
    skip_level: 'Pay ₺0.50 (Skip Level)',
    main_menu: 'MAIN MENU',

    // Dictionary
    search_word: 'Search word...',
    discovered_words: 'Discovered Words',
    count_unit: 'Total',
    no_words_yet: 'No words discovered yet.',
    no_search_result: 'No search results found.',
    play_to_discover: 'Find words in the game to fill your dictionary.',

    // Badges
    earned_badges: 'Earned Badges',

    // Akbil
    available_balance: 'Available Balance',
    watch_ad_balance: 'Watch Ad (+₺0.50)',
    load_balance: 'Load Balance',
    history: 'Transaction History',
    recent_ops: 'Recent Transactions',
    card_color: 'Card Color',

    // Stats
    games_played: 'Games Played',
    words_found: 'Words Found',
    max_combo: 'Max Combo',
    daily_streak: 'Daily Streak',
    total_earned: 'Total Balance Earned',

    // Settings
    sound: 'Sound Effects',
    haptic: 'Haptics (Vibration)',
    theme: 'Theme Selection',
    lang: 'Language (Dil)',
    dark_theme: 'Dark Theme',
    light_theme: 'Light Theme',
    retro_theme: 'Retro (8-Bit)',

    // Map
    istanbul_line: 'TRANSIT LINE',

    // Level Complete
    level_complete: 'JOURNEY COMPLETE!',

    // Vault & Leaderboard
    vault: 'VAULT',
    leaderboard: 'LEADERBOARD',

    // Confirm
    confirm_reset: 'Are you sure you want to return to menu? Your progress will be saved.',

    // Hint Costs
    hint_cost_word: 'Hint (₺75)',
    hint_cost_letter: 'Letter (₺25)',
  }
};

export const useTranslation = () => {
  const language = useGameStore(state => state.language);
  
  const t = (key) => {
    if (translations[language] && translations[language][key]) {
      return translations[language][key];
    }
    return translations['tr'][key] || key;
  };

  return { t, language };
};

```

---

### File: `src/utils/soundManager.js`

```javascript
// Turnike: Sözcük Seferi — Ses Efektleri (Web Audio API)
// soundEnabled ayarı ile kontrol edilir.

let audioCtx = null;

const getAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
};

const playTone = (frequency, duration, type = 'sine', volume = 0.3) => {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (e) { /* Sessizce başarısız ol */ }
};

// Doğru kelime bulunduğunda — kısa "ding"
export const playCorrect = () => {
  playTone(880, 0.15, 'sine', 0.25);
  setTimeout(() => playTone(1100, 0.2, 'sine', 0.2), 80);
};

// Yanlış kelime — kısa "buzz"
export const playWrong = () => {
  playTone(200, 0.25, 'sawtooth', 0.15);
};

// Seviye tamamlama — mini fanfar
export const playLevelComplete = () => {
  playTone(523, 0.15, 'sine', 0.2);
  setTimeout(() => playTone(659, 0.15, 'sine', 0.2), 120);
  setTimeout(() => playTone(784, 0.15, 'sine', 0.2), 240);
  setTimeout(() => playTone(1047, 0.3, 'sine', 0.25), 360);
};

// Turnike geçişi — "bip"
export const playTurnike = () => {
  playTone(1200, 0.08, 'square', 0.15);
  setTimeout(() => playTone(1600, 0.08, 'square', 0.12), 100);
};

// Kombo sesi
export const playCombo = () => {
  playTone(660, 0.1, 'sine', 0.2);
  setTimeout(() => playTone(880, 0.1, 'sine', 0.2), 60);
  setTimeout(() => playTone(1100, 0.15, 'sine', 0.25), 120);
};

// Rozet kazanma
export const playBadgeUnlock = () => {
  playTone(440, 0.12, 'sine', 0.2);
  setTimeout(() => playTone(554, 0.12, 'sine', 0.2), 100);
  setTimeout(() => playTone(659, 0.12, 'sine', 0.2), 200);
  setTimeout(() => playTone(880, 0.3, 'triangle', 0.3), 300);
};

// Çark çevirme
export const playSpin = () => {
  for (let i = 0; i < 8; i++) {
    setTimeout(() => playTone(800 + (i * 50), 0.05, 'sine', 0.1), i * 60);
  }
};

// Bakiye kazanma
export const playBalanceUp = () => {
  playTone(600, 0.1, 'sine', 0.15);
  setTimeout(() => playTone(900, 0.15, 'sine', 0.2), 80);
};

// Süre azaldığında (Tick) - Süreye göre tansiyon artar
export const playTick = (timeLeft = 10) => {
  const freq = Math.min(1500, 800 + ((15 - timeLeft) * 40));
  playTone(freq, 0.05, 'triangle', 0.25);
};

// Süre bittiğinde
export const playTimeUp = () => {
  // Modern, yumuşak bir hata tonu
  playTone(200, 0.15, 'sine', 0.6);
  setTimeout(() => playTone(150, 0.3, 'sine', 0.6), 180);
};

// Game Over (Canların hepsi bittiğinde)
export const playGameOver = () => {
  playTone(300, 0.2, 'sine', 0.3);
  setTimeout(() => playTone(280, 0.2, 'sine', 0.3), 200);
  setTimeout(() => playTone(250, 0.2, 'sine', 0.3), 400);
  setTimeout(() => playTone(200, 0.5, 'sine', 0.3), 600);
};

// Web Speech API ile İstasyon Anonsu
export const playStationAnnouncement = (stationName, lang = 'tr') => {
  if (!('speechSynthesis' in window)) return;
  
  // Önceki anonsları iptal et
  window.speechSynthesis.cancel();
  
  const text = lang === 'en' 
    ? `Next station is ${stationName}.` 
    : `Bir sonraki istasyon... ${stationName}.`;
    
  const utterance = new SpeechSynthesisUtterance(text);
  
  // Uygun dili seçmeye çalış
  utterance.lang = lang === 'en' ? 'en-US' : 'tr-TR';
  utterance.rate = 0.9;
  utterance.pitch = 1.1; // Biraz anons tonu vermek için
  utterance.volume = 0.8;
  
  // Metro çanı (ding-dong) çal, ardından anonsu oku
  playTone(600, 0.3, 'sine', 0.2);
  setTimeout(() => playTone(500, 0.4, 'sine', 0.2), 400);
  
  setTimeout(() => {
    window.speechSynthesis.speak(utterance);
  }, 1000);
};

```

---

### File: `src/utils/firebaseService.js`

```javascript
// Gelecekte gerçek Firebase / Supabase entegrasyonu yapıldığında bu dosya güncellenecektir.
// Şimdilik bulut senkronizasyonunu simüle eden (Mock) bir yapı kullanıyoruz.

class MockCloudService {
  constructor() {
    this.isConnected = false;
    this.uid = "user_" + Math.random().toString(36).substr(2, 9);
    console.log("[Cloud] Servis başlatıldı. UID:", this.uid);
  }

  async connect() {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.isConnected = true;
        console.log("[Cloud] Bağlantı başarılı.");
        resolve(true);
      }, 800);
    });
  }

  async syncData(data) {
    if (!this.isConnected) {
      await this.connect();
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        // Gerçek bir senaryoda burada fetch/axios ile Firebase veya Supabase'e yazma işlemi yapılır.
        localStorage.setItem('turnike_cloud_backup', JSON.stringify(data));
        console.log("[Cloud] Veri buluta eşitlendi:", data);
        resolve(true);
      }, 500);
    });
  }

  async fetchUserData() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = localStorage.getItem('turnike_cloud_backup');
        resolve(data ? JSON.parse(data) : null);
      }, 500);
    });
  }
}

export const cloudService = new MockCloudService();

```

---

### File: `src/components/AkbilScreen.jsx`

```javascript
import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { useTranslation } from '../utils/i18n';

const CARD_COLORS = [
  { id: '#1d4ed8', name: 'Mavi', nameEn: 'Blue' },
  { id: '#dc2626', name: 'Kırmızı', nameEn: 'Red' },
  { id: '#16a34a', name: 'Yeşil', nameEn: 'Green' },
  { id: '#ea580c', name: 'Turuncu', nameEn: 'Orange' },
  { id: '#7c3aed', name: 'Mor', nameEn: 'Purple' },
  { id: '#0f172a', name: 'Siyah', nameEn: 'Black' },
];

const BALANCE_PACKS = [
  { amount: 100, label: '₺1.00', color: '#22c55e' },
  { amount: 500, label: '₺5.00', color: '#3b82f6' },
  { amount: 1000, label: '₺10.00', color: '#8b5cf6' },
  { amount: 2500, label: '₺25.00', color: '#f59e0b' },
];

const AkbilScreen = ({ onBack }) => {
  const { balance, addBalance, cardColor, setSettings } = useGameStore();
  const { t, language } = useTranslation();
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showPacks, setShowPacks] = useState(false);
  const [purchaseFeedback, setPurchaseFeedback] = useState(null);

  const formattedBalance = (balance / 100).toFixed(2);

  const handlePurchase = (amount, label) => {
    addBalance(amount);
    setPurchaseFeedback(label);
    setTimeout(() => setPurchaseFeedback(null), 2000);
  };

  return (
    <main className="flex-1 w-full flex flex-col p-6 pb-20 relative z-10 fade-in items-center overflow-y-auto">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={onBack} className="capsule">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          </button>
          <h2 className="text-white text-lg font-black tracking-widest uppercase mr-10" style={{ fontFamily: "'Orbitron', monospace" }}>
            {t('akbil')}
          </h2>
        </div>

        {/* Akbil Card */}
        <div 
          className="w-full aspect-[1.586/1] rounded-2xl p-6 flex flex-col justify-between shadow-[0_20px_40px_rgba(0,0,0,0.5)] mb-6 relative overflow-hidden transition-all duration-500 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: `linear-gradient(135deg, ${cardColor}, ${cardColor}dd)`,
            border: '1px solid rgba(255,255,255,0.15)'
          }}
          onClick={() => setShowColorPicker(!showColorPicker)}
        >
          {/* Card Decorations */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-white/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-white/[0.03]" />
          
          <div className="flex justify-between items-start relative z-10">
            <span className="material-symbols-outlined text-white/80 text-[32px]">subway</span>
            <div className="flex gap-2 items-center">
              <span className="material-symbols-outlined text-white/40 text-[16px]">palette</span>
              <div className="px-2 py-1 bg-white/10 rounded font-black text-white/50 text-[10px] tracking-widest">
                {language === 'en' ? 'TRANSIT' : 'İBB'}
              </div>
            </div>
          </div>

          <div className="relative z-10">
            <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-1">{t('available_balance')}</p>
            <div className="flex items-end gap-2">
              <span className="text-white text-5xl font-black tracking-tighter">₺{formattedBalance}</span>
            </div>
          </div>
        </div>

        {/* Renk Seçici */}
        {showColorPicker && (
          <div className="mb-4 p-4 bg-white/5 rounded-2xl border border-white/10 fade-in">
            <h3 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-3">{t('card_color')}</h3>
            <div className="flex gap-2 flex-wrap">
              {CARD_COLORS.map(c => (
                <button
                  key={c.id}
                  onClick={() => { setSettings({ cardColor: c.id }); setShowColorPicker(false); }}
                  className={`w-10 h-10 rounded-full transition-all ${cardColor === c.id ? 'ring-2 ring-white scale-110' : 'hover:scale-105'}`}
                  style={{ background: c.id, border: '2px solid rgba(255,255,255,0.2)' }}
                  title={language === 'en' ? c.nameEn : c.name}
                />
              ))}
            </div>
          </div>
        )}

        {/* Satın Alma Geri Bildirimi */}
        {purchaseFeedback && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-xl text-center fade-in">
            <span className="text-green-400 font-bold text-sm">✓ {purchaseFeedback} yüklendi!</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          {/* Reklam İzle */}
          <button 
            disabled={isWatchingAd}
            onClick={() => {
              setIsWatchingAd(true);
              setTimeout(() => {
                addBalance(50);
                setIsWatchingAd(false);
              }, 3000);
            }}
            className={`w-full py-4 rounded-xl font-bold text-white text-sm tracking-wide bg-blue-600 hover:bg-blue-500 transition-colors flex items-center justify-center gap-2 ${isWatchingAd ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <span className="material-symbols-outlined text-[20px]">
              {isWatchingAd ? 'hourglass_empty' : 'play_circle'}
            </span>
            {isWatchingAd ? t('watching_ad') : t('watch_ad_balance')}
          </button>
          
          {/* Bakiye Yükle */}
          <button 
            onClick={() => setShowPacks(!showPacks)}
            className="w-full py-4 rounded-xl font-bold text-white text-sm tracking-wide bg-green-600 hover:bg-green-500 transition-colors flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            {t('load_balance')}
          </button>

          {showPacks && (
            <div className="grid grid-cols-2 gap-2 fade-in">
              {BALANCE_PACKS.map(pack => (
                <button
                  key={pack.amount}
                  onClick={() => handlePurchase(pack.amount, pack.label)}
                  className="py-3 rounded-xl font-bold text-white text-sm transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-1"
                  style={{ background: `${pack.color}20`, border: `1px solid ${pack.color}40` }}
                >
                  <span className="material-symbols-outlined text-[16px]" style={{ color: pack.color }}>add</span>
                  {pack.label}
                </button>
              ))}
            </div>
          )}
          
          {/* Geçmiş */}
          <button 
            onClick={() => setShowHistory(true)}
            className="w-full py-4 rounded-xl font-bold text-white/80 text-sm tracking-wide bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[20px]">history</span>
            {t('history')}
          </button>
        </div>

        {/* History Modal */}
        {showHistory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm fade-in px-4">
            <div className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative">
              <button 
                onClick={() => setShowHistory(false)}
                className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
              <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-400">history</span>
                {t('recent_ops')}
              </h3>
              <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2">
                <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                  <div>
                    <p className="text-white/90 text-sm font-medium">{language === 'en' ? 'Ad Reward' : 'Video İzleme Ödülü'}</p>
                    <p className="text-white/40 text-xs">{language === 'en' ? 'Today' : 'Bugün'}</p>
                  </div>
                  <span className="text-green-400 font-bold">+₺0.50</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                  <div>
                    <p className="text-white/90 text-sm font-medium">{language === 'en' ? 'Word Found (Fast)' : 'Kelime Bulma (Hızlı)'}</p>
                    <p className="text-white/40 text-xs">{language === 'en' ? 'Today' : 'Bugün'}</p>
                  </div>
                  <span className="text-green-400 font-bold">+₺2.00</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                  <div>
                    <p className="text-white/90 text-sm font-medium">{language === 'en' ? 'Hint Used' : 'Otomatik Bul (Kopya)'}</p>
                    <p className="text-white/40 text-xs">{language === 'en' ? 'Today' : 'Bugün'}</p>
                  </div>
                  <span className="text-red-400 font-bold">-₺0.75</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default AkbilScreen;

```

---

### File: `src/components/AnimatedBalance.jsx`

```javascript
import React, { useEffect, useState } from 'react';

const formatValue = (val) => `₺ ${(val / 100).toFixed(2)}`;

const AnimatedBalance = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (value === displayValue) return;

    setIsAnimating(true);
    let startTimestamp = null;
    const duration = 800; // ms
    const startValue = displayValue;
    const difference = value - startValue;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutCubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      setDisplayValue(Math.floor(startValue + difference * easeProgress));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
        setIsAnimating(false);
      }
    };

    window.requestAnimationFrame(step);
  }, [value]);

  return (
    <span
      className={`font-mono transition-colors duration-300 ${isAnimating && value > displayValue ? 'text-green-400' : isAnimating && value < displayValue ? 'text-red-400' : ''}`}
    >
      {formatValue(displayValue)}
    </span>
  );
};

export default React.memo(AnimatedBalance);

```

---

### File: `src/components/BadgesScreen.jsx`

```javascript
import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { BADGES } from '../utils/badges';
import { useTranslation } from '../utils/i18n';

const BadgesScreen = ({ onBack }) => {
  const { unlockedBadges } = useGameStore();
  const { t, language } = useTranslation();
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [animatingBadge, setAnimatingBadge] = useState(null);

  const handleBadgeClick = (badge, isUnlocked) => {
    if (!isUnlocked) return;
    setAnimatingBadge(badge.id);
    setTimeout(() => setAnimatingBadge(null), 600);
    setSelectedBadge(badge);
  };

  return (
    <main className="flex-1 w-full flex flex-col p-4 relative z-10 fade-in overflow-y-auto">
      {/* Header */}
      <div className="flex items-center mb-6 pt-4">
        <button onClick={onBack} className="capsule">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        </button>
        <h2 className="flex-1 text-center text-white text-xl font-black tracking-widest uppercase mr-12">
          {t('badges')}
        </h2>
      </div>

      <div className="text-center mb-6">
        <p className="text-white/40 text-sm font-medium mb-1">{t('earned_badges')}</p>
        <div className="text-3xl font-black text-white" style={{ fontFamily: "'Orbitron', monospace" }}>
          {unlockedBadges.length} <span className="text-white/20 text-xl">/ {BADGES.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pb-10">
        {BADGES.map((badge) => {
          const isUnlocked = unlockedBadges.includes(badge.id);
          const isAnimating = animatingBadge === badge.id;
          const title = language === 'en' ? badge.titleEn : badge.title;
          const desc = language === 'en' ? badge.descriptionEn : badge.description;

          return (
            <button 
              key={badge.id}
              onClick={() => handleBadgeClick(badge, isUnlocked)}
              className={`p-4 rounded-2xl flex flex-col items-center text-center transition-all ${isUnlocked ? 'card-panel active:scale-95 cursor-pointer' : 'bg-white/5 border border-white/5 cursor-default'} ${isAnimating ? 'badge-flip' : ''}`}
              style={isUnlocked ? { 
                border: `1px solid ${badge.color}40`, 
                boxShadow: isAnimating 
                  ? `0 0 30px ${badge.color}60, 0 0 60px ${badge.color}30, inset 0 2px 0 ${badge.color}20` 
                  : `0 8px 32px ${badge.color}15, inset 0 2px 0 ${badge.color}20` 
              } : {}}
            >
              <div 
                className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-all ${isUnlocked ? '' : 'grayscale opacity-20'} ${isAnimating ? 'scale-125' : ''}`}
                style={isUnlocked ? { 
                  background: `linear-gradient(135deg, ${badge.color}30, ${badge.color}10)`, 
                  border: `2px solid ${badge.color}`,
                  boxShadow: isAnimating ? `0 0 20px ${badge.color}80` : 'none'
                } : { background: 'rgba(255,255,255,0.1)' }}
              >
                <span 
                  className={`material-symbols-outlined text-[32px] transition-transform ${isAnimating ? 'animate-bounce' : ''}`}
                  style={{ color: isUnlocked ? badge.color : 'white', fontVariationSettings: "'FILL' 1" }}
                >
                  {isUnlocked ? badge.icon : 'lock'}
                </span>
              </div>
              <h3 className={`text-[13px] font-black uppercase tracking-wider mb-1 ${isUnlocked ? 'text-white' : 'text-white/30'}`}>
                {title}
              </h3>
              <p className={`text-[10px] leading-tight ${isUnlocked ? 'text-white/60' : 'text-white/20'}`}>
                {desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* Rozet Detay Modal */}
      {selectedBadge && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm fade-in px-6"
          onClick={() => setSelectedBadge(null)}
        >
          <div 
            className="bg-[#0f172a] border rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl badge-flip"
            style={{ borderColor: `${selectedBadge.color}50` }}
            onClick={(e) => e.stopPropagation()}
          >
            <div 
              className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ 
                background: `linear-gradient(135deg, ${selectedBadge.color}30, ${selectedBadge.color}10)`, 
                border: `3px solid ${selectedBadge.color}`,
                boxShadow: `0 0 30px ${selectedBadge.color}40`
              }}
            >
              <span 
                className="material-symbols-outlined text-[52px]"
                style={{ color: selectedBadge.color, fontVariationSettings: "'FILL' 1" }}
              >
                {selectedBadge.icon}
              </span>
            </div>
            <h3 className="text-white text-xl font-black uppercase tracking-widest mb-2">
              {language === 'en' ? selectedBadge.titleEn : selectedBadge.title}
            </h3>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              {language === 'en' ? selectedBadge.descriptionEn : selectedBadge.description}
            </p>
            <button 
              onClick={() => setSelectedBadge(null)}
              className="px-8 py-2 rounded-full bg-white/10 text-white/80 font-bold text-sm hover:bg-white/20 transition-colors"
            >
              {t('back')}
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default BadgesScreen;

```

---

### File: `src/components/BonusLockers.jsx`

```javascript
import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { useTranslation } from '../utils/i18n';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { playCorrect, playWrong, playBalanceUp, playBadgeUnlock } from '../utils/soundManager';

const REWARD_TYPES = [
  { type: 'cash_small', id: 'istanbulkart', value: 10.00, label: 'Unutulmuş\nİstanbulkart\n(+₺10)', icon: 'credit_card', color: '#22c55e', chance: 35 },
  { type: 'cash_big', id: 'cuzdan', value: 50.00, label: 'Dolu Cüzdan\n(+₺50)', icon: 'account_balance_wallet', color: '#fbbf24', chance: 15 },
  { type: 'hints', id: 'gozluk', value: 2, label: 'Gözlük\n(+2 İpucu)', icon: 'eyeglasses', color: '#3b82f6', chance: 20 },
  { type: 'life', id: 'semsiye', value: 1, label: 'Şemsiye\n(+1 Can)', icon: 'umbrella', color: '#ec4899', chance: 15 },
  { type: 'empty', id: 'takmadis', value: 0, label: 'Takma Diş\n(Boş)', icon: 'dentistry', color: '#94a3b8', chance: 10 },
  { type: 'empty', id: 'tencere', value: 0, label: 'Tencere\n(Boş)', icon: 'cooking', color: '#64748b', chance: 5 },
];

const generateLockerContents = () => {
  const contents = [];
  for (let i = 0; i < 9; i++) {
    const roll = Math.random() * 100;
    let cumulative = 0;
    let selectedReward = REWARD_TYPES[0];
    for (const reward of REWARD_TYPES) {
      cumulative += reward.chance;
      if (roll < cumulative) {
        selectedReward = reward;
        break;
      }
    }
    contents.push(selectedReward);
  }
  // İçinde en az 1 tane büyük ödül (cüzdan) olmasını garantile
  if (!contents.some(c => c.type === 'cash_big')) {
    contents[Math.floor(Math.random() * 9)] = REWARD_TYPES.find(r => r.type === 'cash_big');
  }
  return contents;
};

const BonusLockers = ({ onComplete }) => {
  const [lockers, setLockers] = useState([]);
  const [openedIndices, setOpenedIndices] = useState([]);
  const [picksLeft, setPicksLeft] = useState(3);
  const [isFinishing, setIsFinishing] = useState(false);
  const [totalWon, setTotalWon] = useState({ cash: 0, hints: 0, lives: 0 });

  const { soundEnabled, hapticEnabled, addBalance, addHints, addLives } = useGameStore();
  const { t } = useTranslation();

  useEffect(() => {
    setLockers(generateLockerContents());
  }, []);

  const handleOpenLocker = (index) => {
    if (picksLeft <= 0 || openedIndices.includes(index) || isFinishing) return;
    
    setOpenedIndices(prev => [...prev, index]);
    setPicksLeft(prev => prev - 1);
    
    const reward = lockers[index];
    
    if (reward.type === 'empty') {
      if (soundEnabled) playWrong();
      if (hapticEnabled) Haptics.impact({ style: ImpactStyle.Heavy }).catch(()=>{});
    } else {
      if (reward.type.includes('cash')) {
        addBalance(reward.value);
        setTotalWon(prev => ({ ...prev, cash: prev.cash + reward.value }));
        if (soundEnabled) playBalanceUp();
      } else if (reward.type === 'hints') {
        addHints(reward.value);
        setTotalWon(prev => ({ ...prev, hints: prev.hints + reward.value }));
        if (soundEnabled) playCorrect();
      } else if (reward.type === 'life') {
        addLives(reward.value);
        setTotalWon(prev => ({ ...prev, lives: prev.lives + reward.value }));
        if (soundEnabled) playBadgeUnlock();
      }
      if (hapticEnabled) Haptics.notification({ type: NotificationType.Success }).catch(()=>{});
    }

    if (picksLeft - 1 === 0) {
      setIsFinishing(true);
      setTimeout(() => {
        onComplete();
      }, 4500);
    }
  };

  return (
    <main className="flex-grow flex flex-col items-center justify-center p-4 relative z-10 fade-in">
      {/* Title */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-3" style={{ background: 'rgba(245, 158, 11, 0.15)', border: '2px solid rgba(245, 158, 11, 0.4)' }}>
          <span className="material-symbols-outlined text-[32px] text-amber-500">luggage</span>
        </div>
        <h1 className="text-white text-2xl font-black mb-1 uppercase tracking-widest" style={{ fontFamily: "'Orbitron', monospace" }}>Kayıp Eşya Bürosu</h1>
        <p className="text-white/60 text-sm font-semibold max-w-xs mx-auto">İETT ve Metro'da unutulan eşyalar arasında şansını dene!</p>
      </div>

      {/* Picks Left Badge */}
      <div className="mb-6 px-4 py-2 rounded-full flex items-center gap-2 transition-all shadow-lg"
        style={{
          background: picksLeft > 0 ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
          border: `1px solid ${picksLeft > 0 ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`
        }}
      >
        <span className="material-symbols-outlined text-[18px]" style={{ color: picksLeft > 0 ? '#4ade80' : '#f87171' }}>key</span>
        <span className="font-bold text-sm" style={{ color: picksLeft > 0 ? '#4ade80' : '#f87171' }}>{picksLeft} HAKKIN KALDI</span>
      </div>

      {/* Lockers Grid */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-[340px] mb-8" style={{ perspective: '1000px' }}>
        {lockers.map((reward, i) => {
          const isOpened = openedIndices.includes(i);
          const isRevealed = isFinishing && !isOpened; // Oyun bitince açılmayanları da göster
          const showFront = !isOpened && !isRevealed;

          return (
            <div 
              key={i} 
              className="relative aspect-square cursor-pointer group"
              onClick={() => handleOpenLocker(i)}
            >
              <div 
                className="w-full h-full transition-transform duration-700 relative preserve-3d"
                style={{ 
                  transformStyle: 'preserve-3d', 
                  transform: showFront ? 'rotateY(0deg)' : 'rotateY(180deg)' 
                }}
              >
                {/* FRONT (Kapak Kapalı) */}
                <div 
                  className="absolute inset-0 rounded-xl flex flex-col items-center justify-center backface-hidden shadow-lg border-2 transition-colors duration-200"
                  style={{ 
                    backfaceVisibility: 'hidden',
                    background: 'linear-gradient(145deg, #1e293b, #0f172a)',
                    borderColor: 'rgba(255,255,255,0.1)'
                  }}
                >
                  <div className="w-8 h-1 bg-white/10 rounded-full mb-3"></div>
                  <span className="material-symbols-outlined text-white/20 text-[28px] mb-1 group-hover:text-amber-500/50 transition-colors">lock</span>
                  <span className="text-white/20 text-xs font-black tracking-widest">{i + 1}</span>
                </div>

                {/* BACK (Kapak Açık - Eşya) */}
                <div 
                  className="absolute inset-0 rounded-xl flex flex-col items-center justify-center backface-hidden shadow-xl border-2"
                  style={{ 
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    background: isOpened ? 'rgba(15,23,42,0.9)' : 'rgba(15,23,42,0.5)',
                    borderColor: isOpened ? reward.color : 'rgba(255,255,255,0.05)',
                    boxShadow: isOpened ? `0 0 20px ${reward.color}40, inset 0 0 15px ${reward.color}20` : 'none',
                    opacity: isRevealed ? 0.6 : 1,
                  }}
                >
                  <span className="material-symbols-outlined text-[36px] mb-1" style={{ color: reward.color, fontVariationSettings: "'FILL' 1" }}>
                    {reward.icon}
                  </span>
                  <span className="font-bold text-[10px] leading-tight text-center px-1 whitespace-pre-line" style={{ color: reward.color }}>
                    {reward.label}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Finishing Summary */}
      <div className={`transition-all duration-700 flex flex-col items-center ${isFinishing ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95 pointer-events-none'}`}>
        <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-2xl p-4 shadow-2xl flex flex-col items-center">
          <p className="text-white font-black text-sm uppercase tracking-widest mb-3 text-center">TOPLAM KAZANÇ</p>
          <div className="flex flex-wrap justify-center gap-2">
            {totalWon.cash > 0 && <span className="text-green-400 font-bold bg-green-500/10 px-3 py-1.5 rounded-lg border border-green-500/30">+{totalWon.cash.toFixed(2)}₺</span>}
            {totalWon.hints > 0 && <span className="text-blue-400 font-bold bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/30">+{totalWon.hints} İpucu</span>}
            {totalWon.lives > 0 && <span className="text-pink-400 font-bold bg-pink-500/10 px-3 py-1.5 rounded-lg border border-pink-500/30">+{totalWon.lives} Can</span>}
            {totalWon.cash === 0 && totalWon.hints === 0 && totalWon.lives === 0 && <span className="text-slate-400 font-bold bg-slate-500/10 px-3 py-1.5 rounded-lg border border-slate-500/30">Maalesef boş çektin...</span>}
          </div>
        </div>
      </div>
    </main>
  );
};

export default BonusLockers;

```

---

### File: `src/components/DailySpinScreen.jsx`

```javascript
import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Haptics, NotificationType } from '@capacitor/haptics';

const PRIZES = [
  { label: '100₺', type: 'money', value: 10000, color: '#22c55e', icon: 'payments', line: 'M2' },     // Yeşil
  { label: '1 Can', type: 'life', value: 1, color: '#ef4444', icon: 'favorite', line: 'M1' },        // Kırmızı
  { label: '50₺', type: 'money', value: 5000, color: '#eab308', icon: 'toll', line: 'METROBÜS' },    // Sarı
  { label: 'İpucu', type: 'hint', value: 1, color: '#3b82f6', icon: 'lightbulb', line: 'VAPUR' },    // Mavi
  { label: '150₺', type: 'money', value: 15000, color: '#1d4ed8', icon: 'diamond', line: 'T1' },      // Lacivert
  { label: 'Pas', type: 'none', value: 0, color: '#64748b', icon: 'block', line: 'MARMARAY' },       // Gri
];

const DailySpinScreen = ({ onComplete }) => {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [prize, setPrize] = useState(null);
  
  const { addBalance, addLives, addHints, setLastSpinDate } = useGameStore();

  const handleSpin = () => {
    if (spinning) return;
    setSpinning(true);
    Haptics.notification({ type: NotificationType.Warning }).catch(() => {});

    // Rastgele bir ödül seç (pas gelme ihtimali düşük)
    const weights = [0.15, 0.15, 0.3, 0.2, 0.1, 0.1];
    let rand = Math.random();
    let selectedIndex = 0;
    let sum = 0;
    for (let i = 0; i < weights.length; i++) {
      sum += weights[i];
      if (rand <= sum) {
        selectedIndex = i;
        break;
      }
    }

    const segments = PRIZES.length;
    const degreesPerSegment = 360 / segments;
    // Çarkın ibresi tepede. Seçilen dilimin merkeze gelmesi için hesaplama
    const targetRotation = (360 * 6) + (360 - (selectedIndex * degreesPerSegment));
    
    setRotation(targetRotation);

    setTimeout(() => {
      setSpinning(false);
      const wonPrize = PRIZES[selectedIndex];
      setPrize(wonPrize);
      Haptics.notification({ type: NotificationType.Success }).catch(() => {});
      
      // Ödülü ver
      if (wonPrize.type === 'money') {
        addBalance(wonPrize.value);
      } else if (wonPrize.type === 'life') {
        addLives(wonPrize.value);
      } else if (wonPrize.type === 'hint') {
        addHints(wonPrize.value);
      }
      
      // Bugünün tarihini kaydet
      setLastSpinDate(new Date().toLocaleDateString());

      setTimeout(() => {
        onComplete();
      }, 3500);
    }, 4000); // 4 saniye animasyon süresi
  };

  return (
    <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center p-6 bg-black/95 backdrop-blur-xl fade-in overflow-hidden">
      {/* Arka plan ray dekorasyonları */}
      <div className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundSize: '40px 40px',
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)'
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center mb-10">
        <span className="material-symbols-outlined text-[48px] text-green-400 mb-2 drop-shadow-[0_0_15px_rgba(74,222,128,0.8)]" style={{ fontVariationSettings: "'FILL' 1" }}>change_circle</span>
        <h1 className="text-white text-4xl font-black tracking-[8px] uppercase mb-1" style={{ fontFamily: "'Orbitron', monospace", textShadow: '0 0 20px rgba(255,255,255,0.5)' }}>
          TURNİKE ÇARKI
        </h1>
        <p className="text-white/70 font-medium tracking-widest text-sm uppercase">Günün Şanslı Seferini Çek</p>
      </div>

      <div className="relative w-80 h-80 mb-14 drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
        {/* İbre (Metro Ön Yüzü) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-6 z-30 flex flex-col items-center">
          <div className="w-12 h-14 bg-white rounded-t-xl rounded-b-md flex flex-col items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.6)] border-b-4 border-gray-300">
            <div className="w-8 h-4 bg-black rounded-sm mb-1 opacity-80" />
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-yellow-400" />
              <div className="w-2 h-2 rounded-full bg-yellow-400" />
            </div>
          </div>
          <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[14px] border-t-white mt-1 drop-shadow-lg" />
        </div>

        {/* Çark Dış Çerçevesi */}
        <div className="absolute inset-0 rounded-full border-[12px] border-[#0f172a] shadow-[0_0_0_2px_rgba(255,255,255,0.1)_inset,0_0_40px_rgba(0,0,0,1)] z-20 pointer-events-none" />

        {/* Çark Gövdesi */}
        <div 
          className="w-full h-full rounded-full overflow-hidden transition-transform ease-out relative z-10"
          style={{
            transform: `rotate(${rotation}deg)`,
            transitionDuration: spinning ? '4s' : '0s',
            // Daha sert çizgiler için conic-gradient
            background: `conic-gradient(${PRIZES.map((p, i) => {
              const start = i * (360/PRIZES.length);
              const end = (i+1) * (360/PRIZES.length);
              return `${p.color} ${start}deg ${end}deg`;
            }).join(', ')})`
          }}
        >
          {PRIZES.map((p, i) => {
            const rot = (i * (360/PRIZES.length)) + (360/PRIZES.length)/2;
            return (
              <div 
                key={i}
                className="absolute top-0 left-1/2 origin-bottom"
                style={{ 
                  height: '50%', 
                  width: '0px', 
                  transform: `translateX(-50%) rotate(${rot}deg)` 
                }}
              >
                {/* Tek bir yatay konteyner oluşturup onu 90 derece döndürüyoruz */}
                <div 
                  className="absolute flex items-center justify-start gap-2"
                  style={{
                    top: '100%', 
                    left: '50%',
                    transformOrigin: 'center center',
                    transform: 'translate(-50%, -50%) rotate(-90deg) translateX(70px)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {/* Etiket (Siyah stroke ile her renkte okunur) */}
                  <span 
                    className="text-white font-black text-[24px] tracking-wide"
                    style={{ 
                      textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0 4px 8px rgba(0,0,0,0.8)' 
                    }}
                  >
                    {p.label}
                  </span>
                  
                  {/* Hat Kodu */}
                  <div className="px-2 py-1 bg-black/75 rounded-md text-white/90 text-[10px] font-black tracking-widest border border-white/20 shadow-lg">
                    {p.line}
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Çark Merkez Göbeği */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-[#0f172a] rounded-full z-20 border-[4px] border-[#1e293b] flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.8)]">
            <span className="material-symbols-outlined text-white/50 text-[28px] animate-spin-slow">toll</span>
          </div>
        </div>
      </div>

      {!prize ? (
        <button
          onClick={handleSpin}
          disabled={spinning}
          className={`relative group overflow-hidden w-full max-w-xs py-5 rounded-2xl font-black text-xl tracking-[4px] transition-all ${spinning ? 'opacity-50 scale-95' : 'hover:scale-105 active:scale-95'}`}
          style={{
            background: 'linear-gradient(135deg, #16a34a, #15803d)',
            boxShadow: '0 10px 30px rgba(22,163,74,0.4), inset 0 2px 0 rgba(255,255,255,0.2)',
            textShadow: '0 2px 4px rgba(0,0,0,0.5)'
          }}
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-20"></div>
          <span className="relative z-10 text-white">{spinning ? 'ÇEVRİLİYOR...' : 'ÇARKI ÇEVİR'}</span>
        </button>
      ) : (
        <div className="text-center fade-in bg-white/10 border border-white/20 p-6 rounded-3xl backdrop-blur-md w-full max-w-xs shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
          <p className="text-white/60 text-xs font-bold tracking-widest uppercase mb-1">KAZANDIĞIN ÖDÜL</p>
          <div className="text-green-400 font-black text-4xl mb-3 drop-shadow-md">{prize.label}</div>
          <div className="w-12 h-1 bg-green-500/50 mx-auto rounded-full mb-3" />
          <p className="text-white/80 text-sm font-medium">Bakiye İstanbulkart'a aktarılıyor...</p>
        </div>
      )}
    </div>
  );
};

export default DailySpinScreen;

```

---

### File: `src/components/DictionaryScreen.jsx`

```javascript
import React, { useState } from 'react';
import { WORD_MEANINGS_TR, WORD_MEANINGS_EN } from '../utils/gameLogic';
import { useTranslation } from '../utils/i18n';

const CATEGORY_COLORS = {
  'ULAŞIM': '#3b82f6',
  'ALTYAPI': '#8b5cf6',
  'BİLET': '#22c55e',
  'MİMARİ': '#f59e0b',
  'TEKNİK': '#ef4444',
  'DENİZCİLİK': '#06b6d4',
  'TARİHİ': '#ec4899',
  'TRANSPORT': '#3b82f6',
  'TECH': '#ef4444',
  'MARINE': '#06b6d4',
};

const DictionaryScreen = ({ learnedWords = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { t, language } = useTranslation();

  const WORD_MEANINGS = language === 'en' ? WORD_MEANINGS_EN : WORD_MEANINGS_TR;

  // Sadece WORD_MEANINGS'de olan (teknik/açıklaması olan) kelimeleri göster
  const displayedWords = learnedWords.filter(word =>
    word.toLowerCase().includes(searchTerm.toLowerCase()) && !!WORD_MEANINGS[word]
  );

  return (
    <main className="flex-1 w-full p-4 overflow-y-auto pb-20">
      {/* Search */}
      <div className="relative mb-5 max-w-lg mx-auto">
        <div className="flex items-center rounded-full overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.25)',
            backdropFilter: 'blur(12px)'
          }}
        >
          <span className="material-symbols-outlined text-white/50 pl-4 pr-2 text-[20px]">search</span>
          <input
            className="w-full bg-transparent border-none py-3 pr-4 text-white placeholder-white/40 outline-none text-sm font-semibold"
            placeholder={t('search_word')}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Counter */}
      <div className="card-panel px-4 py-2.5 mb-5 max-w-lg mx-auto flex items-center justify-between">
        <span className="text-white/60 text-xs font-bold tracking-wider uppercase">{t('discovered_words')}</span>
        <span className="text-white text-sm font-extrabold">{displayedWords.length} {t('count_unit')}</span>
      </div>

      {/* Word List */}
      <div className="max-w-lg mx-auto flex flex-col gap-3">
        {displayedWords.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-white/20 text-[56px] mb-3 block">menu_book</span>
            <p className="text-white/40 text-sm font-semibold">
              {learnedWords.length === 0 ? t('no_words_yet') : t('no_search_result')}
            </p>
            <p className="text-white/25 text-xs mt-1">{t('play_to_discover')}</p>
          </div>
        ) : (
          displayedWords.map((wordKey) => {
            const meaning = WORD_MEANINGS[wordKey];
            const hasMeaning = !!meaning;

            return (
              <div key={wordKey} className="card-panel p-4 relative overflow-hidden">
                {/* Accent line */}
                <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-full" style={{ background: hasMeaning ? '#22c55e' : '#64748b' }} />

                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-white text-lg font-extrabold tracking-wide">{wordKey}</h3>
                  {hasMeaning && (
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: 'rgba(34,197,94,0.15)',
                        color: '#22c55e',
                        border: '1px solid rgba(34,197,94,0.3)'
                      }}
                    >
                      {language === 'en' ? 'TECH' : 'TEKNİK'}
                    </span>
                  )}
                </div>

                {/* Description */}
                {hasMeaning ? (
                  <p className="text-white/60 text-sm leading-relaxed">{meaning}</p>
                ) : (
                  <p className="text-white/40 text-xs italic">{language === 'en' ? 'Word found during gameplay' : 'Oyun sırasında bulunan kelime'}</p>
                )}

                {/* Rarity */}
                <div className="flex items-center gap-1 mt-2">
                  <span className="material-symbols-outlined text-[12px]" style={{ color: hasMeaning ? '#fbbf24' : 'rgba(255,255,255,0.3)' }}>
                    {hasMeaning ? 'star' : 'circle'}
                  </span>
                  <span className="text-white/30 text-[10px] font-bold">
                    {hasMeaning 
                      ? (language === 'en' ? 'TECHNICAL' : 'TEKNİK') 
                      : (language === 'en' ? 'COMMON' : 'GENEL')
                    }
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </main>
  );
};

export default DictionaryScreen;

```

---

### File: `src/components/Grid.jsx`

```javascript
import React, { useMemo, useEffect, useState } from 'react';

const Grid = ({ words, foundWords, hintedLetters = [] }) => {
  const [containerWidth, setContainerWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setContainerWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { gridMap, bounds } = useMemo(() => {
    const map = new Map();
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    if (!words || words.length === 0) return { gridMap: map, bounds: null };

    words.forEach(wordObj => {
      const isWordFound = foundWords.includes(wordObj.word);
      for (let i = 0; i < wordObj.word.length; i++) {
        const x = wordObj.startX + (wordObj.isHorizontal ? i : 0);
        const y = wordObj.startY + (wordObj.isHorizontal ? 0 : i);
        const key = `${x},${y}`;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        
        const isHinted = hintedLetters.some(hl => hl.x === x && hl.y === y);
        
        if (!map.has(key)) {
          map.set(key, { char: wordObj.word[i], isRevealed: isWordFound || isHinted });
        } else if (isWordFound || isHinted) {
          map.get(key).isRevealed = true;
        }
      }
    });

    return {
      gridMap: map,
      bounds: { minX, maxX, minY, maxY, cols: maxX - minX + 1, rows: maxY - minY + 1 }
    };
  }, [words, foundWords, hintedLetters]);

  if (!bounds) return null;

  const availableW = containerWidth - 32;
  const defaultCellSize = 46;
  const GAP = 6;
  const rawTotalW = bounds.cols * defaultCellSize + (bounds.cols - 1) * GAP;
  
  // Eğer sığmıyorsa, hücreleri küçült
  const CELL = rawTotalW > availableW 
    ? Math.floor((availableW - (bounds.cols - 1) * GAP) / bounds.cols) 
    : defaultCellSize;
    
  const totalW = bounds.cols * CELL + (bounds.cols - 1) * GAP;
  const totalH = bounds.rows * CELL + (bounds.rows - 1) * GAP;

  const cells = [];
  let cellIndex = 0;
  gridMap.forEach((cellData, key) => {
    const [sx, sy] = key.split(',');
    const x = parseInt(sx) - bounds.minX;
    const y = parseInt(sy) - bounds.minY;
    const delay = cellIndex * 0.05;
    cellIndex++;
    cells.push(
      <div
        key={key}
        className="absolute flex items-center justify-center"
        style={{
          left: x * (CELL + GAP),
          top: y * (CELL + GAP),
          width: CELL,
          height: CELL,
          transition: 'all 0.35s ease'
        }}
      >
        {cellData.isRevealed ? (
          <div className="grid-cell-found w-full h-full flex items-center justify-center text-[22px]" style={{animationDelay: `${delay}s`}}>
            {cellData.char}
          </div>
        ) : (
          <div className="grid-cell-empty w-full h-full" />
        )}
      </div>
    );
  });

  return (
    <div className="flex-1 w-full flex items-center justify-center px-4">
      <div
        className="relative"
        style={{
          width: totalW,
          height: totalH
        }}
      >
        {cells}
      </div>
    </div>
  );
};

export default React.memo(Grid);

```

---

### File: `src/components/LeaderboardScreen.jsx`

```javascript
import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

// Mock Data for Leaderboard
const MOCK_LEADERBOARD = [
  { id: '1', name: 'MetroUstası', score: 12500, avatar: 'train' },
  { id: '2', name: 'SözcükAvcısı', score: 11200, avatar: 'sports_esports' },
  { id: '3', name: 'Makinist_34', score: 9800, avatar: 'directions_subway' },
  { id: '4', name: 'TurnikeKralı', score: 8500, avatar: 'stars' },
  { id: '5', name: 'VapurYolcusu', score: 7600, avatar: 'directions_boat' },
  { id: '6', name: 'AkbilPro', score: 6400, avatar: 'credit_card' },
  { id: '7', name: 'Galata_1905', score: 5900, avatar: 'location_on' },
  { id: '8', name: 'MarmarayBey', score: 4800, avatar: 'directions_transit' },
  { id: '9', name: 'KadıköyBoga', score: 3200, avatar: 'pets' },
];

const LeaderboardScreen = ({ onBack }) => {
  const { totalBalanceEarned } = useGameStore();
  const [data, setData] = useState([]);
  
  // Oyuncunun kendi skorunu listeye dahil edip sıralayalım
  useEffect(() => {
    const myScore = {
      id: 'me',
      name: 'Sen (Misafir)',
      score: totalBalanceEarned * 10, // Örnek puan hesabı (Kazanılan bakiye x 10)
      avatar: 'person',
      isMe: true
    };
    
    const combined = [...MOCK_LEADERBOARD, myScore];
    combined.sort((a, b) => b.score - a.score);
    setData(combined.slice(0, 10)); // Sadece ilk 10
  }, [totalBalanceEarned]);

  return (
    <div className="flex-1 w-full flex flex-col items-center bg-[#0a110a] relative z-20 fade-in pt-8 pb-6 px-4">
      {/* Üst Kısım */}
      <div className="w-full flex items-center justify-between mb-6 max-w-sm px-2">
        <button onClick={onBack} className="p-3 bg-white/5 rounded-full border border-white/10 active:scale-95 transition-all text-white">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-xl font-black text-white tracking-widest font-orbitron text-center flex-1">
          LİDERLİK
        </h2>
        <div className="w-[50px]"></div>
      </div>

      {/* Kupa Görseli */}
      <div className="flex flex-col items-center justify-center mb-6">
        <div className="relative w-24 h-24 flex flex-col items-center justify-center mb-2">
          <div className="absolute inset-0 bg-yellow-500/20 rounded-full blur-[30px]"></div>
          <span className="material-symbols-outlined text-[64px] text-yellow-400 relative z-10 float-slow" style={{ fontVariationSettings: "'FILL' 1" }}>
            trophy
          </span>
        </div>
        <p className="text-white/50 text-[11px] font-black tracking-[4px] uppercase text-center">
          Haftalık Sıralama
        </p>
      </div>

      {/* Liste */}
      <div className="w-full max-w-sm flex-1 overflow-y-auto px-1 flex flex-col gap-3 pb-8">
        {data.map((player, index) => {
          const isTop3 = index < 3;
          const rankColor = index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : index === 2 ? '#b45309' : '#334155';
          
          return (
            <div 
              key={player.id}
              className={`w-full p-3 rounded-2xl flex items-center gap-3 transition-transform ${player.isMe ? 'scale-105 my-2 shadow-lg z-10' : ''}`}
              style={{
                background: player.isMe ? 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(21,128,61,0.2))' : 'rgba(255,255,255,0.03)',
                border: player.isMe ? '1.5px solid rgba(34,197,94,0.5)' : '1px solid rgba(255,255,255,0.05)',
                boxShadow: player.isMe ? '0 0 20px rgba(34,197,94,0.2)' : 'none',
              }}
            >
              {/* Sıra Numarası */}
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center font-black text-lg border-2 shrink-0"
                style={{
                  background: isTop3 ? rankColor : 'transparent',
                  borderColor: rankColor,
                  color: isTop3 ? '#000' : '#fff'
                }}
              >
                {index + 1}
              </div>

              {/* Avatar & İsim */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]" style={{ color: player.isMe ? '#4ade80' : '#94a3b8' }}>
                    {player.avatar}
                  </span>
                  <h3 className={`font-bold text-[15px] truncate ${player.isMe ? 'text-green-400' : 'text-white'}`}>
                    {player.name}
                  </h3>
                </div>
              </div>

              {/* Puan */}
              <div className="text-right shrink-0">
                <p className="text-white font-black text-[16px] tracking-wider">{player.score}</p>
                <p className="text-white/30 text-[9px] font-bold tracking-widest uppercase">PUAN</p>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default LeaderboardScreen;

```

---

### File: `src/components/LevelComplete.jsx`

```javascript
import React, { useState, useEffect } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const CountUp = ({ end, duration = 1500, suffix = '', prefix = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;
    let animationFrame;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      const easePercentage = percentage === 1 ? 1 : 1 - Math.pow(2, -10 * percentage);
      
      setCount(Math.floor(end * easePercentage));

      if (progress < duration) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return <span>{prefix}{count}{suffix}</span>;
};

const LevelComplete = ({ level, wordsFoundCount, totalWords, timeSpent, accuracy, onNextLevel, onRetry, onHome }) => {
  const stars = accuracy >= 95 ? 3 : accuracy >= 70 ? 2 : 1;

  const handleShare = async () => {
    Haptics.impact({ style: ImpactStyle.Light }).catch(()=>{});
    const shareText = `🚇 Turnike: Sözcük Seferi'nde ${level} durağını %${accuracy} isabet ve ${timeSpent} saniyede tamamladım!\nSende İstanbul'u dolaşarak kelimeleri bul:`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Turnike: Sözcük Seferi',
          text: shareText,
          url: window.location.origin
        });
      } catch (err) {
        console.log('Paylaşım iptal edildi veya desteklenmiyor', err);
      }
    } else {
      navigator.clipboard.writeText(`${shareText} ${window.location.origin}`);
      alert('Sonucun panoya kopyalandı! İstediğin yere yapıştırabilirsin.');
    }
  };

  return (
    <main className="flex-grow flex flex-col items-center justify-center p-6 relative z-10">
      
      {/* İstasyon varış animasyonu */}
      <div className="relative mb-8">
        {/* Dış ışıma halkası */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-36 h-36 rounded-full pulse-soft" style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.15) 0%, transparent 70%)' }} />
        </div>

        {/* Ana rozet */}
        <div className="relative w-24 h-24 rounded-full flex items-center justify-center float-slow"
          style={{
            background: 'linear-gradient(135deg, #1a3a1a, #0d2010)',
            border: '2px solid rgba(34,197,94,0.6)',
            boxShadow: '0 0 40px rgba(34,197,94,0.35), 0 0 80px rgba(34,197,94,0.12)',
          }}
        >
          <span className="material-symbols-outlined text-[52px]" style={{ color: '#4ade80', fontVariationSettings: "'FILL' 1" }}>
            emoji_events
          </span>
        </div>
      </div>

      {/* LED Tabela: İstasyona Ulaştınız */}
      <div className="px-5 py-2 rounded-sm mb-3 neon-blink"
        style={{
          background: 'linear-gradient(135deg, #0d1f0d, #091509)',
          border: '1px solid rgba(34,197,94,0.5)',
          boxShadow: '0 0 20px rgba(34,197,94,0.2)',
        }}
      >
        <p className="text-[11px] font-black tracking-[4px] uppercase" style={{ fontFamily: "'Orbitron', monospace", color: '#4ade80', textShadow: '0 0 8px rgba(74,222,128,0.7)' }}>
          DURAĞA ULAŞILDI
        </p>
      </div>

      {/* Yıldızlar */}
      <div className="flex items-center gap-3 mb-2">
        {[1, 2, 3].map(s => (
          <span
            key={s}
            className="material-symbols-outlined scale-in"
            style={{
              fontSize: 38,
              color: s <= stars ? '#fbbf24' : 'rgba(255,255,255,0.1)',
              fontVariationSettings: s <= stars ? "'FILL' 1" : "'FILL' 0",
              filter: s <= stars ? 'drop-shadow(0 0 8px rgba(251,191,36,0.6))' : 'none',
              animationDelay: `${s * 0.15}s`
            }}
          >
            star
          </span>
        ))}
      </div>

      <h1 className="text-white text-3xl font-black mb-1 tracking-tight">TEBRİKLER!</h1>
      <p className="text-white/40 text-sm font-bold mb-8 tracking-wide">{level} tamamlandı</p>

      {/* İstatistik Kartları — Metro bilet paneli gibi */}
      <div className="grid grid-cols-3 gap-2.5 w-full max-w-sm mb-6">
        <div className="card-panel p-3.5 text-center flex flex-col items-center">
          <span className="material-symbols-outlined text-[20px] mb-1.5 block" style={{ color: '#22c55e', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          <p className="text-white text-xl font-black"><CountUp end={wordsFoundCount} />/{totalWords}</p>
          <p className="text-[9px] font-black tracking-[2px] mt-0.5 text-white/30">KELİME</p>
        </div>
        <div className="card-panel p-3.5 text-center flex flex-col items-center">
          <span className="material-symbols-outlined text-[20px] mb-1.5 block" style={{ color: '#fbbf24', fontVariationSettings: "'FILL' 1" }}>timer</span>
          <p className="text-white text-xl font-black"><CountUp end={timeSpent} suffix="s" /></p>
          <p className="text-[9px] font-black tracking-[2px] mt-0.5 text-white/30">SÜRE</p>
        </div>
        <div className="card-panel p-3.5 text-center flex flex-col items-center">
          <span className="material-symbols-outlined text-[20px] mb-1.5 block" style={{ color: '#60a5fa', fontVariationSettings: "'FILL' 1" }}>target</span>
          <p className="text-white text-xl font-black"><CountUp end={accuracy} prefix="%" /></p>
          <p className="text-[9px] font-black tracking-[2px] mt-0.5 text-white/30">İSABET</p>
        </div>
      </div>

      {/* Aksiyon Butonları */}
      <div className="flex flex-col gap-3 w-full max-w-sm mt-4">
        <button onClick={onNextLevel} className="play-btn w-full flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>directions_railway</span>
          SONRAKİ DURAK
        </button>
        
        <div className="flex gap-3">
          <button
            onClick={handleShare}
            className="flex-1 py-4 rounded-full font-bold text-white text-[13px] tracking-widest uppercase transition-all active:scale-95 menu-btn flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(37,99,235,0.05))', border: '1px solid rgba(59,130,246,0.3)' }}
          >
            <span className="material-symbols-outlined text-blue-400 text-[18px]">share</span>
            Paylaş
          </button>
          
          <button
            onClick={onRetry}
            className="flex-1 py-4 rounded-full font-bold text-white/50 text-[13px] tracking-widest uppercase transition-all active:scale-95 menu-btn"
          >
            Tekrar Oyna
          </button>
        </div>
        
        <button
          onClick={onHome}
          className="w-full py-4 rounded-full font-bold text-white/50 text-[13px] tracking-widest uppercase transition-all active:scale-95 flex items-center justify-center gap-2 mt-2"
          style={{ border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <span className="material-symbols-outlined text-[18px]">home</span>
          ANA MENÜ
        </button>
      </div>
    </main>
  );
};

export default LevelComplete;

```

---

### File: `src/components/MapScreen.jsx`

```javascript
import React, { useState, useEffect, useRef } from 'react';
import { getStationData, getStationXPosition, LEVELS_PER_STATION, LINES, STATION_NAMES } from '../utils/transitNetwork';

const MapScreen = ({ onLevelSelect, currentLevel }) => {
  // currentLevel: 1-indexed (örn: 1, 2, 3...)
  const totalLevelsCompleted = currentLevel - 1;
  const currentStationIndex = Math.floor(totalLevelsCompleted / LEVELS_PER_STATION);
  
  // Bulunduğumuz istasyonun hat bilgisini bul
  const currentStationData = getStationData(currentStationIndex);
  const currentLineId = currentStationData.id;
  const currentLoop = currentStationData.loopCount;

  // Haritada gösterilecek hat ve tur (loop)
  const [viewLineId, setViewLineId] = useState(currentLineId);
  const [viewLoop, setViewLoop] = useState(currentLoop);
  
  const scrollRef = useRef(null);

  // Gösterilecek hat verisini hazırla
  const activeLineObj = LINES.find(l => l.id === viewLineId);
  const stationsInLine = STATION_NAMES[viewLineId];
  
  // Bu hattın global olarak hangi index aralığına denk geldiğini hesapla
  // Önce viewLoop kadar tam tur atıyoruz
  let baseGlobalOffset = viewLoop * Object.values(STATION_NAMES).flat().length;
  // Sonra bu hatta kadar olan diğer hatların istasyon sayısını ekliyoruz
  let lineOffset = 0;
  for (let l of LINES) {
    if (l.id === viewLineId) break;
    lineOffset += STATION_NAMES[l.id].length;
  }
  const startGlobalIndex = baseGlobalOffset + lineOffset;

  // Sayfalama (Hat değiştirme) işlemleri
  const handlePrevLine = () => {
    const currentLineIndex = LINES.findIndex(l => l.id === viewLineId);
    if (currentLineIndex > 0) {
      setViewLineId(LINES[currentLineIndex - 1].id);
    } else if (viewLoop > 0) {
      setViewLoop(l => l - 1);
      setViewLineId(LINES[LINES.length - 1].id);
    }
  };

  const handleNextLine = () => {
    const currentLineIndex = LINES.findIndex(l => l.id === viewLineId);
    
    // Yalnızca kilitli olmayan (veya en fazla 1 ileriki) hatlara geçişe izin ver
    // Gelecekteki ilk kilitli istasyonun olduğu hatta kadar gidebilir
    const maxGlobalIndex = currentStationIndex + 1; // Sadece bulunduğumuz istasyonun bir sonrasına kadar görebiliriz
    
    // Eğer 'sonraki' hat, gelecekteki sınırı aşıyorsa gitme
    let nextLoop = viewLoop;
    let nextLineId = viewLineId;
    
    if (currentLineIndex < LINES.length - 1) {
      nextLineId = LINES[currentLineIndex + 1].id;
    } else {
      nextLoop += 1;
      nextLineId = LINES[0].id;
    }

    // Next hattın başlangıç global indexini bul
    let nextBaseGlobalOffset = nextLoop * Object.values(STATION_NAMES).flat().length;
    let nextLineOffset = 0;
    for (let l of LINES) {
      if (l.id === nextLineId) break;
      nextLineOffset += STATION_NAMES[l.id].length;
    }
    const nextStartGlobalIndex = nextBaseGlobalOffset + nextLineOffset;

    // Eğer geçeceğimiz hat henüz tamamen kilitliyse (hatta hiç giremediysek ve bir sonraki istasyon değilse)
    if (nextStartGlobalIndex > currentStationIndex + 1) {
      return; // Daha fazla ileri gidemez
    }

    setViewLineId(nextLineId);
    setViewLoop(nextLoop);
  };

  // Açıldığında veya hat değiştiğinde mevcut istasyona odaklan
  useEffect(() => {
    if (viewLineId === currentLineId && viewLoop === currentLoop) {
      setTimeout(() => {
        if (scrollRef.current) {
          const currentEl = document.getElementById('current-station');
          if (currentEl) {
            currentEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }, 100);
    }
  }, [viewLineId, viewLoop, currentLineId, currentLoop]);

  // UI için engelleme durumları
  const isFirstLine = viewLineId === LINES[0].id && viewLoop === 0;
  
  // Next butonu kilit kontrolü
  let nextLoopTest = viewLoop;
  let nextLineIdTest = viewLineId;
  const currentLineIndexTest = LINES.findIndex(l => l.id === viewLineId);
  if (currentLineIndexTest < LINES.length - 1) {
    nextLineIdTest = LINES[currentLineIndexTest + 1].id;
  } else {
    nextLoopTest += 1;
    nextLineIdTest = LINES[0].id;
  }
  let nextBaseGlobalOffsetTest = nextLoopTest * Object.values(STATION_NAMES).flat().length;
  let nextLineOffsetTest = 0;
  for (let l of LINES) {
    if (l.id === nextLineIdTest) break;
    nextLineOffsetTest += STATION_NAMES[l.id].length;
  }
  const isNextLocked = nextBaseGlobalOffsetTest + nextLineOffsetTest > currentStationIndex + 1;

  const STATION_HEIGHT = 100;

  return (
    <main className="flex-1 w-full flex flex-col p-4 pb-20 overflow-hidden">
      {/* HEADER: Line Info & Pagination */}
      <div className="flex items-center justify-between mb-2">
        <button 
          onClick={handlePrevLine} 
          disabled={isFirstLine}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isFirstLine ? 'opacity-30' : 'bg-white/10 hover:bg-white/20 active:scale-90'}`}
        >
          <span className="material-symbols-outlined text-white">chevron_left</span>
        </button>
        
        <div className="text-center flex-1 mx-2">
          <div className="flex items-center justify-center gap-1.5 mb-0.5">
            <span className="material-symbols-outlined text-[14px]" style={{ color: activeLineObj.color }}>{activeLineObj.icon}</span>
            <p className="text-xs font-bold tracking-[2px] uppercase" style={{ color: activeLineObj.color }}>
              {activeLineObj.id} Hattı {viewLoop > 0 && `(Tur ${viewLoop + 1})`}
            </p>
          </div>
          <h2 className="text-white text-[15px] font-extrabold leading-tight">{activeLineObj.name}</h2>
        </div>

        <button 
          onClick={handleNextLine} 
          disabled={isNextLocked}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isNextLocked ? 'opacity-30' : 'bg-white/10 hover:bg-white/20 active:scale-90'}`}
        >
          <span className="material-symbols-outlined text-white">chevron_right</span>
        </button>
      </div>

      <div className="text-center mb-4">
        <div className="inline-block px-3 py-1 rounded-full" style={{ background: `${activeLineObj.color}22`, border: `1px solid ${activeLineObj.color}44` }}>
          <span className="text-[10px] font-extrabold text-white">Bölüm {startGlobalIndex * LEVELS_PER_STATION + 1} - {(startGlobalIndex + stationsInLine.length) * LEVELS_PER_STATION}</span>
        </div>
      </div>

      {/* MAP SCROLL CONTAINER */}
      <div 
        ref={scrollRef}
        className="flex-grow relative w-full max-w-sm mx-auto overflow-y-auto overflow-x-hidden rounded-3xl pb-10"
        style={{
          background: 'rgba(0,0,0,0.15)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <div className="relative w-full" style={{ height: `${stationsInLine.length * STATION_HEIGHT + 50}px` }}>
          
          {/* SVG Yolu (Kalın Transit Çizgisi) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
            {stationsInLine.slice(0, -1).map((_, i) => {
              const globalIdx1 = startGlobalIndex + i;
              const globalIdx2 = startGlobalIndex + i + 1;
              const y1 = i * STATION_HEIGHT + 50;
              const y2 = (i + 1) * STATION_HEIGHT + 50;
              const x1 = getStationXPosition(globalIdx1);
              const x2 = getStationXPosition(globalIdx2);

              const isActive = currentStationIndex > globalIdx1;
              
              return (
                <g key={i}>
                  {/* Outer border for the line */}
                  <line
                    x1={`${x1}%`} y1={y1}
                    x2={`${x2}%`} y2={y2}
                    stroke="rgba(0,0,0,0.3)"
                    strokeWidth="24"
                    strokeLinecap="round"
                  />
                  {/* Main colored line */}
                  <line
                    x1={`${x1}%`} y1={y1}
                    x2={`${x2}%`} y2={y2}
                    stroke={isActive ? activeLineObj.color : 'rgba(255,255,255,0.1)'}
                    strokeWidth="16"
                    strokeLinecap="round"
                  />
                </g>
              );
            })}
          </svg>

          {/* İstasyon Noktaları */}
          {stationsInLine.map((stationName, i) => {
            const globalIdx = startGlobalIndex + i;
            const yPos = i * STATION_HEIGHT + 50;
            const xPos = getStationXPosition(globalIdx);

            const isCompleted = currentStationIndex > globalIdx;
            const isCurrentStation = currentStationIndex === globalIdx;
            const isLocked = currentStationIndex < globalIdx;

            // Bu istasyondaki level aralığı
            const stationStartLvl = globalIdx * LEVELS_PER_STATION + 1;
            const stationEndLvl = stationStartLvl + LEVELS_PER_STATION - 1;
            
            // Eğer isCurrentStation ise, kullanıcının bu istasyondaki kaçıncı bölümde olduğunu bulalım
            let progressRatio = 0;
            let currentLvlInStation = 0;
            if (isCurrentStation) {
              currentLvlInStation = currentLevel - stationStartLvl + 1;
              progressRatio = (currentLvlInStation - 1) / LEVELS_PER_STATION;
            } else if (isCompleted) {
              progressRatio = 1;
            }

            return (
              <div
                key={i}
                id={isCurrentStation ? 'current-station' : undefined}
                className="absolute flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${xPos}%`,
                  top: `${yPos}px`,
                  zIndex: isCurrentStation ? 10 : 1
                }}
              >
                {/* Station Node Interactive Area */}
                <button
                  onClick={() => !isLocked && onLevelSelect(stationStartLvl)}
                  disabled={isLocked}
                  className="flex flex-col items-center group relative"
                  style={{ opacity: isLocked ? 0.5 : 1, cursor: isLocked ? 'not-allowed' : 'pointer' }}
                >
                  {/* Outer glow if current */}
                  {isCurrentStation && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-16 h-16 rounded-full pulse-soft absolute" style={{ border: `3px solid ${activeLineObj.color}` }} />
                    </div>
                  )}

                  {/* İstasyon Noktası (Beyaz İçli, Renkli Çember) */}
                  <div 
                    className={`rounded-full flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg relative z-10 ${
                      i === stationsInLine.length - 1 ? 'w-12 h-12 bg-white border-[5px] border-[#0f172a]' : 'w-10 h-10 bg-white'
                    }`}
                    style={i !== stationsInLine.length - 1 ? {
                      border: `6px solid ${isLocked ? 'rgba(255,255,255,0.2)' : activeLineObj.color}`,
                    } : {}}
                  >
                    {isCompleted && <span className="material-symbols-outlined text-[18px]" style={{ color: activeLineObj.color, fontVariationSettings: "'FILL' 1" }}>check</span>}
                    {isLocked && <span className="material-symbols-outlined text-[16px] text-gray-400">lock</span>}
                    {isCurrentStation && <span className="material-symbols-outlined text-[18px] animate-bounce" style={{ color: activeLineObj.color, fontVariationSettings: "'FILL' 1" }}>train</span>}
                  </div>

                  {/* İlerleme Çubuğu (Eğer mevcut istasyonsa) */}
                  {isCurrentStation && (
                    <div className="absolute top-12 flex flex-col items-center w-24">
                      <div className="w-full h-1.5 rounded-full overflow-hidden mb-1" style={{ background: 'rgba(255,255,255,0.2)' }}>
                        <div className="h-full transition-all duration-500" style={{ width: `${progressRatio * 100}%`, background: activeLineObj.color }} />
                      </div>
                      <span className="text-[9px] font-bold text-white/80">{currentLvlInStation} / {LEVELS_PER_STATION} Bölüm</span>
                    </div>
                  )}

                  {/* İstasyon İsmi */}
                  <div className={`absolute ${xPos > 50 ? 'right-12' : 'left-12'} whitespace-nowrap px-3 py-1.5 rounded-lg pointer-events-none transition-all`}
                    style={{
                      background: isCurrentStation ? activeLineObj.color : 'rgba(0,0,0,0.6)',
                      backdropFilter: 'blur(4px)',
                      color: 'white',
                      border: isCurrentStation ? 'none' : '1px solid rgba(255,255,255,0.1)'
                    }}
                  >
                    <p className="text-[11px] font-extrabold">{stationName}</p>
                    {i === stationsInLine.length - 1 && (
                      <p className="text-[8px] font-bold opacity-75 uppercase tracking-wider mt-0.5">Aktarma Noktası</p>
                    )}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
};

export default MapScreen;

```

---

### File: `src/components/SettingsScreen.jsx`

```javascript
import React from 'react';
import { useGameStore } from '../store/gameStore';
import { useTranslation } from '../utils/i18n';

const SettingsScreen = ({ onBack }) => {
  const { soundEnabled, hapticEnabled, theme, language, setSettings } = useGameStore();
  const { t } = useTranslation();

  return (
    <main className="flex-1 w-full flex flex-col p-6 pb-20 relative z-10 fade-in items-center">
      <div className="w-full max-w-sm">
        <div className="flex items-center mb-8">
          <button onClick={onBack} className="capsule mr-4">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          </button>
          <h2 className="text-white text-xl font-black tracking-widest uppercase">
            {t('settings')}
          </h2>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="flex justify-between items-center mb-4">
              <span className="text-white font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-400">volume_up</span>
                {t('sound')}
              </span>
              <button 
                onClick={() => setSettings({ soundEnabled: !soundEnabled })}
                className={`w-12 h-6 rounded-full transition-colors relative ${soundEnabled ? 'bg-green-500' : 'bg-gray-600'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${soundEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-white font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-orange-400">vibration</span>
                {t('haptic')}
              </span>
              <button 
                onClick={() => setSettings({ hapticEnabled: !hapticEnabled })}
                className={`w-12 h-6 rounded-full transition-colors relative ${hapticEnabled ? 'bg-green-500' : 'bg-gray-600'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${hapticEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <h3 className="text-white/50 text-sm font-bold mb-3 uppercase tracking-wider">{t('theme')}</h3>
            <div className="flex flex-col gap-2">
              {['dark', 'light', 'retro'].map((themeOption) => (
                <button
                  key={themeOption}
                  onClick={() => setSettings({ theme: themeOption })}
                  className={`w-full py-3 rounded-xl font-bold text-sm tracking-wide transition-colors flex items-center justify-between px-4 ${theme === themeOption ? 'bg-blue-600 text-white' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
                >
                  {t(`${themeOption}_theme`)}
                  {theme === themeOption && <span className="material-symbols-outlined">check_circle</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <h3 className="text-white/50 text-sm font-bold mb-3 uppercase tracking-wider">{t('lang')}</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setSettings({ language: 'tr' })}
                className={`flex-1 py-3 rounded-xl font-bold text-sm tracking-wide transition-colors ${language === 'tr' ? 'bg-red-600 text-white' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
              >
                Türkçe
              </button>
              <button
                onClick={() => setSettings({ language: 'en' })}
                className={`flex-1 py-3 rounded-xl font-bold text-sm tracking-wide transition-colors ${language === 'en' ? 'bg-blue-600 text-white' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
              >
                English
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default SettingsScreen;

```

---

### File: `src/components/StatsScreen.jsx`

```javascript
import React from 'react';
import { useGameStore } from '../store/gameStore';
import { useTranslation } from '../utils/i18n';

const StatsScreen = ({ onBack }) => {
  const { totalGamesPlayed, totalWordsFound, totalBalanceEarned, maxCombo, streak } = useGameStore();
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

```

---

### File: `src/components/TutorialModal.jsx`

```javascript
import React, { useState } from 'react';

const TutorialModal = ({ onClose }) => {
  const [step, setStep] = useState(1);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md fade-in px-6">
      <div className="bg-[#0f172a] border-2 border-green-500/50 rounded-2xl w-full max-w-sm p-6 shadow-[0_0_40px_rgba(34,197,94,0.3)] relative text-center">
        {step === 1 && (
          <div className="fade-in">
            <span className="material-symbols-outlined text-green-400 text-6xl mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>touch_app</span>
            <h2 className="text-white font-black text-xl mb-2">Çarkı Çevir</h2>
            <p className="text-white/80 text-sm leading-relaxed mb-6">Harfleri sürükleyerek birleştirin ve İstanbul ulaşım kelimelerini oluşturun.</p>
          </div>
        )}
        {step === 2 && (
          <div className="fade-in">
            <span className="material-symbols-outlined text-blue-400 text-6xl mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>sync</span>
            <h2 className="text-white font-black text-xl mb-2">Harfleri Karıştır</h2>
            <p className="text-white/80 text-sm leading-relaxed mb-6">Ortadaki düğmeye dokunarak harflerin yerlerini değiştirebilirsiniz. Bazen farklı bir açı kelimeyi bulmanızı kolaylaştırır.</p>
          </div>
        )}
        {step === 3 && (
          <div className="fade-in">
            <div className="flex justify-center gap-4 mb-4">
              <span className="material-symbols-outlined text-yellow-400 text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
              <span className="material-symbols-outlined text-blue-400 text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>spellcheck</span>
            </div>
            <h2 className="text-white font-black text-xl mb-2">Yardımcılar</h2>
            <p className="text-white/80 text-sm leading-relaxed mb-6">Takıldığınızda bakiyenizi kullanarak <b>sarı ampul</b> ile tek bir harf, <b>mavi ikon</b> ile tüm kelimeyi açtırabilirsiniz.</p>
          </div>
        )}

        {/* Dots */}
        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3].map(i => (
            <div key={i} className={`w-2 h-2 rounded-full transition-colors ${step === i ? 'bg-green-500' : 'bg-white/20'}`} />
          ))}
        </div>

        <button 
          onClick={handleNext}
          className="w-full py-4 rounded-xl font-bold text-white text-sm tracking-widest bg-green-600 hover:bg-green-500 transition-colors uppercase">
          {step < 3 ? 'İLERİ' : 'BAŞLA'}
        </button>
      </div>
    </div>
  );
};

export default TutorialModal;

```

---

### File: `src/components/VaultScreen.jsx`

```javascript
import React from 'react';
import { useGameStore } from '../store/gameStore';

const VaultScreen = ({ onBack }) => {
  const { vaultWords, balance } = useGameStore();
  const maxCapacity = 10;
  const currentCount = vaultWords.length;
  const progressPercent = (currentCount / maxCapacity) * 100;

  return (
    <div className="flex-1 w-full flex flex-col items-center bg-[#0a110a] relative z-20 fade-in pt-8 pb-6 px-4">
      {/* Üst Kısım */}
      <div className="w-full flex items-center justify-between mb-8 max-w-sm px-2">
        <button onClick={onBack} className="p-3 bg-white/5 rounded-full border border-white/10 active:scale-95 transition-all text-white">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-xl font-black text-white tracking-widest font-orbitron text-center flex-1">
          KASA
        </h2>
        <div className="w-[50px]"></div>
      </div>

      {/* Kasa Görseli */}
      <div className="relative mb-8 mt-4">
        {/* Işıma */}
        <div className="absolute inset-0 bg-green-500/20 rounded-full blur-[60px]"></div>
        
        <div 
          className="relative w-48 h-48 rounded-full flex flex-col items-center justify-center border-4"
          style={{
            background: 'radial-gradient(circle at 30% 30%, #153315, #081108)',
            borderColor: currentCount === maxCapacity ? '#4ade80' : '#22c55e',
            boxShadow: 'inset 0 0 40px rgba(0,0,0,0.8), 0 0 30px rgba(34,197,94,0.3)',
          }}
        >
          <span className="material-symbols-outlined text-[80px] mb-2" style={{ color: '#4ade80', fontVariationSettings: "'FILL' 1" }}>
            account_balance_wallet
          </span>
          <div className="text-2xl font-black text-white" style={{ fontFamily: "'Orbitron', monospace" }}>
            {currentCount} / {maxCapacity}
          </div>
        </div>
      </div>

      {/* Kasa İlerleme Barı */}
      <div className="w-full max-w-xs mb-8">
        <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden relative" style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)' }}>
          <div 
            className="h-full bg-green-500 transition-all duration-1000 ease-out relative"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white/40"></div>
          </div>
        </div>
        <p className="text-center text-white/50 text-xs font-bold mt-3 uppercase tracking-wider">
          Kasanın kırılmasına <span className="text-green-400">{maxCapacity - currentCount}</span> kelime kaldı!
        </p>
      </div>

      {/* Kelimeler Listesi */}
      <div className="w-full max-w-sm flex-1 bg-black/40 rounded-3xl border border-white/5 p-5 overflow-y-auto">
        <h3 className="text-white/60 text-[11px] font-black tracking-[3px] mb-4 uppercase">
          Biriken Kelimeler
        </h3>
        
        {currentCount === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 opacity-50">
            <span className="material-symbols-outlined text-4xl mb-2 text-white/40">search_off</span>
            <p className="text-white/60 text-sm font-bold text-center">Henüz ekstra kelime bulmadın.</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {vaultWords.map((word, i) => (
              <div 
                key={i}
                className="px-4 py-2 rounded-xl border font-bold text-sm tracking-widest fade-in"
                style={{
                  background: 'rgba(34,197,94,0.1)',
                  borderColor: 'rgba(34,197,94,0.3)',
                  color: '#4ade80',
                  animationDelay: `${i * 0.05}s`
                }}
              >
                {word}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Kural Uyarısı */}
      <div className="w-full max-w-sm mt-6 p-4 rounded-2xl bg-white/5 border border-white/5 flex items-start gap-3">
        <span className="material-symbols-outlined text-yellow-500 text-[20px]">info</span>
        <p className="text-white/60 text-[12px] leading-relaxed font-bold">
          Bulmacada yer almayan ama sözlükte bulunan (geçerli) her kelime Kasaya eklenir. Kasa dolduğunda anında <span className="text-green-400">100₺ bakiye</span> kazanırsınız!
        </p>
      </div>

    </div>
  );
};

export default VaultScreen;

```

---

### File: `src/components/Wheel.jsx`

```javascript
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const Wheel = ({ letters, onWordSubmit, onShuffle, bonusLetter, wrongWordTrigger }) => {
  const containerRef = useRef(null);
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [isSwiping, setIsSwiping] = useState(false);
  const [currentMousePos, setCurrentMousePos] = useState(null);
  const [nodePositions, setNodePositions] = useState([]);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isWrongAnim, setIsWrongAnim] = useState(false);

  useEffect(() => {
    if (wrongWordTrigger > 0) {
      setIsWrongAnim(true);
      setTimeout(() => setIsWrongAnim(false), 400);
    }
  }, [wrongWordTrigger]);

  useEffect(() => {
    if (!containerRef.current) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    const radius = Math.min(width, height) * 0.34;
    const centerX = width / 2;
    const centerY = height / 2;
    const positions = letters.map((_, i) => {
      const angle = (i * 2 * Math.PI) / letters.length - Math.PI / 2;
      return {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    });
    setNodePositions(positions);
  }, [letters]);

  const getEventPos = (e) => {
    if (!containerRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const checkNodeHit = (pos) => {
    if (!pos) return;
    for (let i = 0; i < nodePositions.length; i++) {
      const dist = Math.hypot(nodePositions[i].x - pos.x, nodePositions[i].y - pos.y);
      if (dist < 46) { // Increased hit area from 38 to 46
        if (!selectedIndices.includes(i)) {
          setSelectedIndices(prev => [...prev, i]);
          Haptics.impact({ style: ImpactStyle.Light }).catch(()=>{});
        } else if (selectedIndices.length > 1 && selectedIndices[selectedIndices.length - 2] === i) {
          setSelectedIndices(prev => prev.slice(0, -1));
          Haptics.impact({ style: ImpactStyle.Light }).catch(()=>{});
        }
        break;
      }
    }
  };

  const handleStart = (e) => {
    e.preventDefault();
    setIsSwiping(true);
    const pos = getEventPos(e);
    setCurrentMousePos(pos);
    checkNodeHit(pos);
  };

  const handleMove = useCallback((e) => {
    if (!isSwiping) return;
    const pos = getEventPos(e);
    setCurrentMousePos(pos);
    checkNodeHit(pos);
  }, [isSwiping, nodePositions, selectedIndices]);

  const handleEnd = useCallback(async () => {
    if (isSwiping) {
      if (selectedIndices.length > 1) {
        const word = selectedIndices.map(i => letters[i]).join('');
        const isCorrect = await onWordSubmit(word);
        if (isCorrect) {
          setSelectedIndices([]);
        } else {
          setTimeout(() => setSelectedIndices([]), 400);
        }
      } else {
        setSelectedIndices([]);
      }
      setIsSwiping(false);
      setCurrentMousePos(null);
    }
  }, [isSwiping, selectedIndices, letters, onWordSubmit]);

  useEffect(() => {
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchend', handleEnd);
    return () => {
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [handleEnd]);

  useEffect(() => {
    const handleKeyDown = async (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === 'Backspace') {
        setSelectedIndices(prev => prev.slice(0, -1));
        Haptics.impact({ style: ImpactStyle.Light }).catch(()=>{});
        return;
      }

      if (e.key === 'Enter') {
        if (selectedIndices.length > 1) {
          const word = selectedIndices.map(i => letters[i]).join('');
          const isCorrect = await onWordSubmit(word);
          if (isCorrect) {
            setSelectedIndices([]);
          } else {
            setTimeout(() => setSelectedIndices([]), 400);
          }
        } else {
          setSelectedIndices([]);
        }
        Haptics.impact({ style: ImpactStyle.Medium }).catch(()=>{});
        return;
      }

      const key = e.key.toLocaleUpperCase('tr-TR');
      const matchingIndex = letters.findIndex((l, idx) => l === key && !selectedIndices.includes(idx));
      if (matchingIndex !== -1) {
        setSelectedIndices(prev => [...prev, matchingIndex]);
        Haptics.impact({ style: ImpactStyle.Light }).catch(()=>{});
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [letters, selectedIndices, onWordSubmit]);

  const polylinePoints = selectedIndices.map(i => `${nodePositions[i]?.x},${nodePositions[i]?.y}`).join(' ');
  const lineToCursor = (isSwiping && selectedIndices.length > 0 && currentMousePos)
    ? `${nodePositions[selectedIndices[selectedIndices.length - 1]]?.x},${nodePositions[selectedIndices[selectedIndices.length - 1]]?.y} ${currentMousePos.x},${currentMousePos.y}`
    : '';
  const currentWord = selectedIndices.map(i => letters[i]).join('');

  return (
    <div
      className="relative w-full aspect-square max-w-[340px] mx-auto z-20 touch-none select-none"
      ref={containerRef}
      onMouseDown={handleStart}
      onTouchStart={handleStart}
      onMouseMove={handleMove}
      onTouchMove={handleMove}
    >
      {/* Shuffle button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (isShuffling) return;
          setIsShuffling(true);
          setTimeout(() => { onShuffle(); setTimeout(() => setIsShuffling(false), 100); }, 300);
        }}
        className="absolute top-1/2 left-1/2 w-[52px] h-[52px] rounded-full flex items-center justify-center z-10"
        style={{
          background: 'rgba(255,255,255,0.25)',
          border: '2px solid rgba(255,255,255,0.4)',
          backdropFilter: 'blur(8px)',
          transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
          transform: isShuffling
            ? 'translate(-50%,-50%) rotate(180deg) scale(0.5)'
            : 'translate(-50%,-50%) rotate(0deg) scale(1)'
        }}
      >
        <span className="material-symbols-outlined text-white text-[26px]">sync</span>
      </button>

      {/* Word preview */}
      {currentWord.length > 0 && (
        <div
          className="absolute -top-14 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          style={{
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(12px)',
            borderRadius: 50,
            padding: '8px 24px',
            boxShadow: '0 6px 24px rgba(0,0,0,0.15)',
            border: '1px solid rgba(255,255,255,0.8)',
            minWidth: 100,
            textAlign: 'center'
          }}
        >
          <span style={{
            color: '#1e293b',
            fontWeight: 800,
            fontSize: 22,
            letterSpacing: 6,
            textTransform: 'uppercase'
          }}>{currentWord}</span>
        </div>
      )}

      {/* SVG lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
        {containerRef.current && (
          <circle
            cx={containerRef.current.clientWidth / 2}
            cy={containerRef.current.clientHeight / 2}
            r={containerRef.current.clientWidth * 0.34 + 36}
            fill="rgba(255,255,255,0.12)"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="3"
          />
        )}
        <polyline
          points={polylinePoints}
          fill="none"
          stroke={isWrongAnim ? '#ef4444' : '#fbbf24'}
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: `drop-shadow(0 3px 8px ${isWrongAnim ? 'rgba(239,68,68,0.4)' : 'rgba(251,191,36,0.4)'})`, transition: 'stroke 0.2s' }}
        />
        {lineToCursor && !isWrongAnim && (
          <polyline
            points={lineToCursor}
            fill="none"
            stroke="#fbbf24"
            strokeWidth="7"
            strokeLinecap="round"
            style={{ filter: 'drop-shadow(0 3px 8px rgba(251,191,36,0.4))' }}
          />
        )}
      </svg>

      {/* Letter nodes */}
      {nodePositions.map((pos, i) => {
        const isSelected = selectedIndices.includes(i);
        const isBonus = letters[i] === bonusLetter;
        return (
          <div
            key={i}
            className={isSelected ? 'wheel-letter-active' : 'wheel-letter'}
            style={{
              position: 'absolute',
              left: pos.x - 36,
              top: pos.y - 36,
              width: 72,
              height: 72,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              userSelect: 'none',
              transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
              transform: isShuffling ? 'scale(0) rotate(180deg)' : 'scale(1) rotate(0deg)',
              opacity: isShuffling ? 0 : 1,
              border: isBonus && !isSelected ? '4px solid #fbbf24' : (isSelected && isWrongAnim ? '4px solid #ef4444' : undefined),
              boxShadow: isBonus && !isSelected ? '0 0 24px rgba(251,191,36,0.8), inset 0 0 10px rgba(251,191,36,0.4)' : (isSelected && isWrongAnim ? '0 0 20px rgba(239,68,68,0.6)' : undefined),
              color: isBonus && !isSelected ? '#d97706' : (isSelected && isWrongAnim ? '#ef4444' : undefined)
            }}
          >
            {letters[i]}
          </div>
        );
      })}
    </div>
  );
};

export default React.memo(Wheel);

```

---
