import React, { useMemo, useEffect, useState } from 'react';

const Grid = ({ words, foundWords, hintedLetters = [], onIntersectionFound }) => {
  const [containerWidth, setContainerWidth] = useState(window.innerWidth);
  const [confettiCells, setConfettiCells] = useState([]);

  useEffect(() => {
    const handleResize = () => setContainerWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
          map.set(key, { char: wordObj.word[i], isRevealed: isWordFound || isHinted, wordNames: [wordObj.word] });
        } else {
          const cell = map.get(key);
          if (isWordFound || isHinted) cell.isRevealed = true;
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

  // Kesişim bulunduğunda parent'a bildir
  const rewardedIntersectionsRef = React.useRef(new Set());
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

  if (!bounds) return null;

  const availableW = containerWidth - 32;
  const defaultCellSize = 46;
  const GAP = 6;
  const rawTotalW = bounds.cols * defaultCellSize + (bounds.cols - 1) * GAP;

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
    const isIntersection = intersections.has(key);
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
            className={`grid-cell-found w-full h-full flex items-center justify-center text-[22px] ${hasConfetti ? 'cell-confetti' : ''}`}
            style={{
              animationDelay: `${delay}s`,
              ...(isIntersection ? {
                border: '2px solid rgba(59,130,246,0.6)',
                boxShadow: '0 0 12px rgba(59,130,246,0.3), inset 0 -4px 0px rgba(0,0,0,0.15), 0 6px 12px rgba(0,0,0,0.25)'
              } : {})
            }}
          >
            {cellData.char}
            {isIntersection && (
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-blue-500 border border-white"
                style={{ boxShadow: '0 0 6px rgba(59,130,246,0.6)' }}
              />
            )}
          </div>
        ) : (
          <div className="grid-cell-empty w-full h-full relative">
            {/* Sinyal Lambası: kesişim noktalarında kırmızı, normal hücrelerde gizli */}
            {isIntersection && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full signal-red" />
              </div>
            )}
          </div>
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
