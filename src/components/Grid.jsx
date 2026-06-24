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

  const CELL = 46;
  const GAP = 6;
  const totalW = bounds.cols * CELL + (bounds.cols - 1) * GAP;
  const totalH = bounds.rows * CELL + (bounds.rows - 1) * GAP;
  const available = containerWidth - 32;
  const scale = available < totalW ? available / totalW : 1;

  const cells = [];
  gridMap.forEach((cellData, key) => {
    const [sx, sy] = key.split(',');
    const x = parseInt(sx) - bounds.minX;
    const y = parseInt(sy) - bounds.minY;
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
          <div className="grid-cell-found w-full h-full flex items-center justify-center text-[22px]" style={{animationDelay: `${Math.random()*0.3}s`}}>
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
          height: totalH,
          transform: `scale(${scale})`,
          transformOrigin: 'center center'
        }}
      >
        {cells}
      </div>
    </div>
  );
};

export default React.memo(Grid);
