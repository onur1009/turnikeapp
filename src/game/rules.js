// Oyun kuralları: React'tan ve store'dan bağımsız, saf fonksiyonlar. GameContainer bunları çağırıp
// sonucu ekrana ve store'a uygular; testler (tests/unit) doğrudan bunları sınar.
import { calculateLevelCompletionBonus } from '../utils/scoring';

// İlk 5 seviye öğrenme alanı: yanlış kelime can götürmez
export const FREE_MISTAKE_LEVELS = 5;
export const FLAWLESS_BONUS = 20; // kuruş
export const STATION_BONUS = 100; // durağın 5. ayağı
export const DAILY_LOST_ITEM_BONUS = 150; // günün aranan eşyası
export const EXTRA_WORD_REWARD = 5; // ızgarada olmayan geçerli kelime

// Gönderilen kelime ne? 'duplicate' (zaten bulundu/kasada), 'grid' (ızgarada), 'extra' (sözlükte var,
// ızgarada yok) ya da 'unknown' (yerel sözlükte yok; TDK'ya sorulur)
export const classifyWord = (word, { gridWords, foundWords, vaultWords, dictionary }) => {
  if (foundWords.includes(word) || vaultWords.includes(word)) return 'duplicate';
  if (gridWords.includes(word)) return 'grid';
  if (dictionary.has(word)) return 'extra';
  return 'unknown';
};

export const wrongWordCostsLife = (levelIndex) => levelIndex >= FREE_MISTAKE_LEVELS;

// Kasa (10 ekstra kelime) sonucu: dolup boşaldıysa 'jackpot', yeni kelime eklendiyse 'added'
export const vaultOutcome = (countBefore, countAfter) => {
  if (countBefore === 9 && countAfter === 0) return 'jackpot';
  return countAfter > countBefore ? 'added' : 'none';
};

// Bölüm sonu ek kazançlar (kelime puanları bulundukça zaten eklendi). Tümü kuruş.
// earningsMultiplier: "Gizemli Paket" seti 1,5; eventMultiplier: hafta sonu etkinliği (yoksa 1)
export const levelRewards = ({ sessionScore, expressRemaining, isFlawless, earningsMultiplier = 1, isLastLeg, eventMultiplier = 1, lostItemIsDaily = false }) => {
  const perfectBonus = isFlawless ? FLAWLESS_BONUS : 0;
  const { perfectClearBonus: expressBonus } = calculateLevelCompletionBonus(sessionScore, expressRemaining > 0, expressRemaining);
  const setBonus = Math.round((sessionScore + perfectBonus + expressBonus) * (earningsMultiplier - 1));
  const stationBonus = isLastLeg ? STATION_BONUS : 0;
  const eventBonus = Math.round(sessionScore * (eventMultiplier - 1));
  const lostBonus = lostItemIsDaily ? DAILY_LOST_ITEM_BONUS : 0;
  return { perfectBonus, expressBonus, setBonus, stationBonus, eventBonus, lostBonus, total: perfectBonus + expressBonus + setBonus + stationBonus + eventBonus + lostBonus };
};

// Bölüm sonunda kayıp eşya: durağın son ayağında kesin, diğerlerinde %15
export const dropsLostItem = (isLastLeg, rand = Math.random) => isLastLeg || rand() < 0.15;

// Emanet dolapları: her 10. seviyede kesin; 4. seviyeden sonra %12,5 sürpriz
export const showsBonusLockers = (levelIndex, rand = Math.random) =>
  (levelIndex + 1) % 10 === 0 || (levelIndex >= 3 && rand() < 0.125);
