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
