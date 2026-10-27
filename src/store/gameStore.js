import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { cloudService } from '../utils/supabaseClient';
import { backedUpStorage } from '../utils/persistStorage';
// Senkron localStorage kullanılarak state sıfırlanma sorunu giderildi (native'de Preferences'a yedeklenir)
export const GAME_STORAGE_KEY = 'turnike-game-storage';

// Oyunun tek can ve kasa ödülü kaynağı; ekranlar bu sabitleri kullanır
export const MAX_LIVES = 3;
export const VAULT_SIZE = 10;
export const VAULT_REWARD = 1500; // kuruş (₺15)

// Kayıp Eşya set ödülleri (src/data/lostItems.js): tek yerden hesaplanır
export const getMaxLives = (completedSets = []) => MAX_LIVES + (completedSets.includes('unutkan') ? 1 : 0);
export const getHintCosts = (completedSets = []) => {
  const factor = completedSets.includes('nostalji') ? 0.8 : 1; // Nostalji: tüm ipuçları %20 indirimli
  return { letter: Math.round(25 * factor), word: Math.round(75 * factor), term: Math.round(50 * factor), target: Math.round(40 * factor) };
};
export const getEarningsMultiplier = (completedSets = []) => (completedSets.includes('gizli') ? 1.5 : 1);

export const useGameStore = create(
  persist(
    (set, get) => ({
      // --- STATE ---
      balance: 0.0, // İstanbulkart bakiyesi (₺ formatı için)
      hints: 0, // İpucu bakiyesi
      levelIndex: 0,
      maxUnlockedLevel: 0,
      lives: MAX_LIVES,
      gameStatus: 'idle', // 'idle' | 'playing' | 'gameover' | 'levelcomplete'
      learnedWords: [],
      username: '', // Cloud Leaderboard username
      
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
      
      // Kayıp Eşya Sistemi
      inventory: {}, // item_id -> count
      completedSets: [],
      dailyItemTarget: null,
      dailyItemDate: null,
      
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

      // DDA (Dynamic Difficulty Adjustment) State
      levelSessionScore: 0,
      performanceScore: 0.55,
      ewmv: 0.02,
      recentPerformance: [],
      currentVolatilityClass: 'stable',

      // --- ACTIONS ---
      startGame: () => set({ gameStatus: 'playing', lives: MAX_LIVES, combo: 0 }),
      
      setUsername: (username) => set({ username }),

      setGameStatus: (status) => set({ gameStatus: status }),
      
      addBalance: (amount) => set((state) => {
        const newBalance = state.balance + amount;
        return { 
          balance: newBalance,
          totalBalanceEarned: amount > 0 ? state.totalBalanceEarned + amount : state.totalBalanceEarned
        };
      }),
      
      addLives: (amount) => set((state) => ({ 
        lives: Math.min(getMaxLives(state.completedSets), state.lives + amount) 
      })),

      addHints: (amount) => set((state) => ({ 
        hints: state.hints + amount 
      })),

      syncCloud: async () => {
        const state = get();
        if (state.username) {
          await cloudService.syncData(state.username, {
            score: Math.floor(state.balance),
            level: state.maxUnlockedLevel,
            streak: state.streak,
            totalWordsFound: state.totalWordsFound,
            totalBalanceEarned: state.totalBalanceEarned,
            performanceScore: state.performanceScore,
            totalGamesPlayed: state.totalGamesPlayed
          });
        }
      },

      // Ayarlar
      setSettings: (settings) => set((state) => ({ ...state, ...settings })),

      // İstatistik Güncellemeleri
      incrementTotalWords: () => set((state) => ({ totalWordsFound: state.totalWordsFound + 1 })),
      incrementTotalGames: () => set((state) => ({ totalGamesPlayed: state.totalGamesPlayed + 1 })),
      incrementLevelsCompleted: () => set((state) => ({ levelsCompleted: (state.levelsCompleted || 0) + 1 })),

      // DDA Actions
      setLevelSessionScore: (score) => set({ levelSessionScore: score }),
      setDDAState: (ddaState) => set((state) => ({ ...state, ...ddaState })),

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
        if (newVault.length >= VAULT_SIZE) {
          return {
            vaultWords: [], // Kasayı sıfırla
            balance: state.balance + VAULT_REWARD,
            totalBalanceEarned: state.totalBalanceEarned + VAULT_REWARD
          };
        }
        return { vaultWords: newVault };
      }),

      // Günlük Streak kontrolü
      checkStreak: () => set((state) => {
        const date = new Date();
        const today = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        
        if (state.lastLoginDate === today) return state; // Bugün zaten giriş yapılmış
        
        let newStreak = state.streak;
        if (state.lastLoginDate) {
          const lastDate = new Date(state.lastLoginDate);
          const current = new Date(today);
          const diffDays = Math.round((current - lastDate) / (1000 * 60 * 60 * 24));
          
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
      
      nextLevel: () => set((state) => {
        const nextIdx = state.levelIndex + 1;
        return { 
          levelIndex: nextIdx,
          maxUnlockedLevel: Math.max(state.maxUnlockedLevel, nextIdx),
          gameStatus: 'idle'
        };
      }),
      
      setMaxUnlockedLevel: (level) => set((state) => ({ maxUnlockedLevel: Math.max(state.maxUnlockedLevel, level) })),
      
      addLearnedWord: (word) => set((state) => {
        if (!state.learnedWords.includes(word)) {
          return { learnedWords: [...state.learnedWords, word] };
        }
        return state;
      }),
      
      resetGame: () => set({ 
        levelIndex: 0, 
        lives: MAX_LIVES, 
        gameStatus: 'idle',
        combo: 0 
        // NOT: bakiye, rozetler, istatistikler KORUNUYOR
      }),

      // Kayıp Eşya Sistemi Aksiyonları
      addLostItem: (itemId) => set((state) => {
        const currentCount = state.inventory[itemId] || 0;
        const newInventory = { ...state.inventory, [itemId]: currentCount + 1 };
        return { inventory: newInventory };
      }),
      sellItem: (itemId, price) => set((state) => {
        const currentCount = state.inventory[itemId] || 0;
        if (currentCount <= 1) return state; // Can only sell duplicates
        const newInventory = { ...state.inventory, [itemId]: currentCount - 1 };
        return { 
          inventory: newInventory,
          balance: state.balance + price,
          totalBalanceEarned: state.totalBalanceEarned + price
        };
      }),
      buyMysteryBox: (price, itemId) => set((state) => {
        if (state.balance < price) return state;
        const currentCount = state.inventory[itemId] || 0;
        const newInventory = { ...state.inventory, [itemId]: currentCount + 1 };
        return {
          balance: state.balance - price,
          inventory: newInventory
        };
      }),
      checkCompletedSets: (setsData) => set((state) => {
        const newlyCompleted = [];
        setsData.forEach(setInfo => {
          if (!state.completedSets.includes(setInfo.id)) {
            const hasAll = setInfo.items.every(itemId => (state.inventory[itemId] || 0) > 0);
            if (hasAll) newlyCompleted.push(setInfo.id);
          }
        });
        if (newlyCompleted.length > 0) {
          return { completedSets: [...state.completedSets, ...newlyCompleted] };
        }
        return state;
      }),
      refreshDailyItem: (itemId) => set((state) => {
        const date = new Date();
        const today = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        if (state.dailyItemDate !== today) {
          return { dailyItemDate: today, dailyItemTarget: itemId };
        }
        return state;
      }),

      // Tamamen sıfırlama (ayarlar ekranından)
      fullReset: () => set({
        balance: 0.0,
        hints: 0,
        levelIndex: 0,
        lives: MAX_LIVES,
        gameStatus: 'idle',
        combo: 0,
        maxCombo: 0,
        streak: 0,
        lastLoginDate: null,
        lastSpinDate: null,
        levelSessionScore: 0,
        performanceScore: 0.55,
        ewmv: 0.02,
        recentPerformance: [],
        currentVolatilityClass: 'stable',
        unlockedBadges: [],
        vaultWords: [],
        totalGamesPlayed: 0,
        totalWordsFound: 0,
        totalBalanceEarned: 0,
        inventory: {},
        completedSets: [],
        dailyItemTarget: null,
        dailyItemDate: null,
      }),
    }),
    {
      name: GAME_STORAGE_KEY,
      storage: createJSONStorage(() => backedUpStorage),
    }
  )
);
