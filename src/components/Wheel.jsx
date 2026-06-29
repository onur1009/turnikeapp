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
