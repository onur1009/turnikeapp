import React, { useMemo, useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';

// pickMode: "Nokta" ipucu açıkken boş kutular dokunulabilir olur, seçilen kutu onCellPick ile bildirilir
const Grid = ({ words, foundWords, hintedLetters = [], onIntersectionFound, accent, pickMode = false, onCellPick }) => {
  // Izgara hem genişliğe hem yüksekliğe sığmalı (küçük ekranlarda çark ile çakışmasın)
  const containerRef = React.useRef(null);
  const [containerSize, setContainerSize] = useState({ w: window.innerWidth, h: 320 });
  const [confettiCells, setConfettiCells] = useState([]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => setContainerSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Konfeti efekti: yeni bulunan kelime olduğunda tetikle
  const prevFoundRef = React.useRef(foundWords.length);
  useEffect(() => {
    if (foundWords.length > prevFoundRef.current) {
      // Son bulunan kelimeyi al
      const lastWord = foundWords[foundWords.length - 1];
      const wordObj = words.find(w => w.word === lastWord);
      if (wordObj) {
        const newConfetti = [];
        for (let i = 0; i < wordObj.word.length; i++) {
          const x = wordObj.startX + (wordObj.isHorizontal ? i : 0);
          const y = wordObj.startY + (wordObj.isHorizontal ? 0 : i);
          newConfetti.push({ x, y, id: Date.now() + i });
        }
        setConfettiCells(newConfetti);
        setTimeout(() => setConfettiCells([]), 1200);
      }
    }
    prevFoundRef.current = foundWords.length;
  }, [foundWords, words]);

  const { gridMap, bounds, intersections } = useMemo(() => {
    const map = new Map();
    const cellWordCount = new Map(); // Kaç kelime bu hücreyi paylaşıyor
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    if (!words || words.length === 0) return { gridMap: map, bounds: null, intersections: new Set() };

    // İlk geçiş: tüm hücreleri yerleştir
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

        // Kesişim sayacı
        cellWordCount.set(key, (cellWordCount.get(key) || 0) + 1);

        if (!map.has(key)) {
          map.set(key, { char: wordObj.word[i], isRevealed: isWordFound || isHinted, isFound: isWordFound, wordNames: [wordObj.word] });
        } else {
          const cell = map.get(key);
          if (isWordFound || isHinted) cell.isRevealed = true;
          if (isWordFound) cell.isFound = true;
          if (!cell.wordNames.includes(wordObj.word)) cell.wordNames.push(wordObj.word);
        }
      }
    });

    // Kesişim noktalarını bul (2+ kelime paylaşıyor)
    const intersectionSet = new Set();
    cellWordCount.forEach((count, key) => {
      if (count >= 2) intersectionSet.add(key);
    });

    return {
      gridMap: map,
      bounds: { minX, maxX, minY, maxY, cols: maxX - minX + 1, rows: maxY - minY + 1 },
      intersections: intersectionSet
    };
  }, [words, foundWords, hintedLetters]);

  // Kesişim bulunduğunda parent'a bildir. Yeni seviyede sıfırlanır; aksi halde aynı koordinattaki
  // kesişimler (ör. "0,0") sonraki seviyelerde hiç ödül vermiyordu.
  const rewardedIntersectionsRef = React.useRef(new Set());
  useEffect(() => { rewardedIntersectionsRef.current = new Set(); }, [words]);
  useEffect(() => {
    if (!onIntersectionFound || !intersections) return;
    intersections.forEach(key => {
      const cell = gridMap.get(key);
      if (cell && cell.isRevealed && cell.wordNames.length >= 2) {
        // Tüm kesişen kelimeler bulunmuşsa aktarma bonusu
        const allFound = cell.wordNames.every(w => foundWords.includes(w));
        if (allFound && !rewardedIntersectionsRef.current.has(key)) {
          rewardedIntersectionsRef.current.add(key);
          onIntersectionFound(key);
        }
      }
    });
  }, [foundWords, intersections, gridMap, onIntersectionFound]);

  const GAP = 5;
  const MAX_CELL = 58;
  const fitW = bounds ? Math.floor((containerSize.w - 16 - (bounds.cols - 1) * GAP) / bounds.cols) : MAX_CELL;
  const fitH = bounds ? Math.floor((containerSize.h - 8 - (bounds.rows - 1) * GAP) / bounds.rows) : MAX_CELL;
  const CELL = Math.max(24, Math.min(MAX_CELL, fitW, fitH));
  const largeText = useGameStore(st => st.largeText);
  const fontSize = Math.round(CELL * (largeText ? 0.58 : 0.46));

  if (!bounds) return <div ref={containerRef} className="w-full h-full" />;

  const totalW = bounds.cols * CELL + (bounds.cols - 1) * GAP;
  const totalH = bounds.rows * CELL + (bounds.rows - 1) * GAP;

  const cells = [];
  let cellIndex = 0;
  gridMap.forEach((cellData, key) => {
    const [sx, sy] = key.split(',');
    const x = parseInt(sx) - bounds.minX;
    const y = parseInt(sy) - bounds.minY;
    const delay = cellIndex * 0.05;
    const hasConfetti = confettiCells.some(c => c.x === parseInt(sx) && c.y === parseInt(sy));
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
          <div
            className={`${cellData.isFound ? 'grid-cell-found' : 'grid-cell-hinted'} w-full h-full flex items-center justify-center ${hasConfetti ? 'cell-confetti' : ''}`}
            style={{ fontSize, animationDelay: `${delay}s` }}
          >
            {cellData.char}
          </div>
        ) : (
          pickMode ? (
            <button
              type="button"
              aria-label="Bu kutuyu aç"
              onClick={() => onCellPick?.({ x: parseInt(sx), y: parseInt(sy), char: cellData.char })}
              className="grid-cell-empty grid-cell-pickable w-full h-full"
            />
          ) : (
            <div className="grid-cell-empty w-full h-full" />
          )
        )}
      </div>
    );
  });

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center" style={accent ? { '--accent': accent } : undefined}>
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
