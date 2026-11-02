// İpucu kuralları: saf fonksiyonlar (GameContainer sonucu uygular, tests/unit sınar)

// Bulunmamış kelimelerde henüz açılmamış hücreler
export const hiddenCells = (words, foundWords, hintedLetters) => {
  const cells = [];
  words.filter(w => !foundWords.includes(w.word)).forEach(w => {
    for (let i = 0; i < w.word.length; i++) {
      const x = w.startX + (w.isHorizontal ? i : 0);
      const y = w.startY + (w.isHorizontal ? 0 : i);
      if (!hintedLetters.some(h => h.x === x && h.y === y)) cells.push({ x, y, char: w.word[i] });
    }
  });
  return cells;
};

export const pickRandom = (list, rand = Math.random) => (list.length ? list[Math.floor(rand() * list.length)] : null);

// İpucu neyle ödenir: önce ücretsiz ipucu hakkı, yoksa bakiye; ikisi de yetmezse null
export const hintPayment = ({ hints, balance, cost }) => (hints > 0 ? 'hint' : balance >= cost ? 'balance' : null);

// "Terim" ipucu: anlamın içinde geçen kök kelime gizlenir (cevabı ele vermesin)
export const maskTerm = (meaning, term) => meaning.split(term).join('●'.repeat(term.length));
