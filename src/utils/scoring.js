// ============================================================
// A) SKOR FORMÜLÜ (Score Engine)
// Amaç: Kısa kelime spam'ini değil, uzun kelime + hız + combo'yu
// orantısız şekilde ödüllendirmek (flow-state pekiştirmesi).
// ============================================================

/**
 * Tek bir kelime bulunduğunda çağrılır.
 * @param {string} word - Bulunan kelime
 * @param {number} comboCount - Bu oturumdaki ardışık doğru bulma sayısı (0'dan başlar)
 * @param {number} remainingTime - Kalan süre (saniye)
 * @param {number} totalTime - Seviyenin toplam süresi (le() çıktısı)
 * @returns {{points: number, breakdown: object}}
 */
export function calculateWordScore(word, comboCount, remainingTime, totalTime) {
  const length = word.length;

  // 1) Taban puan: uzunluk^1.5 * 10 -> uzun kelimeler orantısız ödüllenir
  //    3 harf: ~52p | 5 harf: ~112p | 7 harf: ~185p | 8 harf: ~226p
  const basePoints = Math.pow(length, 1.5) * 10;

  // 2) Combo çarpanı: her ardışık doğru +%15, tavan 2.5x
  //    (yanlış deneme veya süre dolması comboCount'u sıfırlar)
  const comboMultiplier = Math.min(1 + 0.15 * comboCount, 2.5);

  // 3) Hız bonusu: kalan sürenin oranına göre +%0 ile +%50 arası
  const timeRatio = totalTime > 0 ? Math.max(0, remainingTime / totalTime) : 0;
  const speedBonus = 1 + timeRatio * 0.5;

  const points = Math.round(basePoints * comboMultiplier * speedBonus);

  return {
    points,
    breakdown: {
      basePoints: Math.round(basePoints),
      comboMultiplier: +comboMultiplier.toFixed(2),
      speedBonus: +speedBonus.toFixed(2),
    },
  };
}

/**
 * Seviye tamamlandığında toplam skor + bonuslar.
 * @param {number} sumOfWordScores - calculateWordScore ile biriken toplam
 * @param {boolean} allWordsFoundBeforeTimeUp - Süre bitmeden tüm kelimeler bulundu mu
 * @param {number} remainingTime
 */
export function calculateLevelCompletionBonus(sumOfWordScores, allWordsFoundBeforeTimeUp, remainingTime) {
  // Seviye "perfect clear" bonusu: kalan her saniye için +5 puan
  const perfectClearBonus = allWordsFoundBeforeTimeUp ? Math.round(remainingTime * 5) : 0;
  return {
    total: sumOfWordScores + perfectClearBonus,
    perfectClearBonus,
  };
}
