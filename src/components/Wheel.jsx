import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const Wheel = ({ letters, onWordSubmit, onShuffle, bonusLetter, wrongWordTrigger, isTutorial, tutorialWord, eliminatedLetters }) => {
  const containerRef = useRef(null);
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [isSwiping, setIsSwiping] = useState(false);
  const [currentMousePos, setCurrentMousePos] = useState(null);
  const [nodePositions, setNodePositions] = useState([]);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isWrongAnim, setIsWrongAnim] = useState(false);
  const [isAwaiting, setIsAwaiting] = useState(false);

  const gestureRef = useRef({
    isSwiping: false,
    selectedIndices: [],
    lastPos: null,
    rewindTimeoutId: null,
    isAwaitingResult: false
  });

  useEffect(() => {
    if (wrongWordTrigger > 0) {
      setIsWrongAnim(true);
      setTimeout(() => setIsWrongAnim(false), 400);
    }
  }, [wrongWordTrigger]);

  useEffect(() => {
    if (!containerRef.current) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    const n = letters.length;
    // Dinamik yarıçap ve düğmüm boyutu — harf sayısına göre
    const radiusFactor = n <= 5 ? 0.32 : n === 6 ? 0.34 : n === 7 ? 0.36 : 0.38;
    const radius = Math.min(width, height) * radiusFactor;
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
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const checkNodeHit = (pos) => {
    if (!pos) return;
    for (let i = 0; i < nodePositions.length; i++) {
      const dist = Math.hypot(nodePositions[i].x - pos.x, nodePositions[i].y - pos.y);
      if (dist < 42) { // 42px hit area: fluid selection, no accidental cross-snapping
        const prev = gestureRef.current.selectedIndices;
        let next = prev;
        const index = prev.indexOf(i);
        if (index === -1) {
          Haptics.impact({ style: ImpactStyle.Light }).catch(()=>{});
          next = [...prev, i];
        } else if (index < prev.length - 1) {
          Haptics.impact({ style: ImpactStyle.Light }).catch(()=>{});
          next = prev.slice(0, index + 1);
        }
        
        if (next !== prev) {
          gestureRef.current.selectedIndices = next;
          setSelectedIndices(next);
        }
        break;
      }
    }
  };

  const handleStart = (e) => {
    if (gestureRef.current.isAwaitingResult) return;
    e.preventDefault();
    gestureRef.current.isSwiping = true;
    if (gestureRef.current.rewindTimeoutId) {
      clearTimeout(gestureRef.current.rewindTimeoutId);
      gestureRef.current.rewindTimeoutId = null;
    }
    gestureRef.current.selectedIndices = [];
    setIsSwiping(true);
    setSelectedIndices([]);
    
    const pos = getEventPos(e);
    gestureRef.current.lastPos = pos;
    setCurrentMousePos(pos);
    checkNodeHit(pos);
  };

  const handleMove = useCallback((e) => {
    if (gestureRef.current.isAwaitingResult) return;
    if (!gestureRef.current.isSwiping) return;
    const pos = getEventPos(e);
    
    const lastPos = gestureRef.current.lastPos;
    if (lastPos) {
      const steps = 3;
      for (let s = 1; s <= steps; s++) {
        checkNodeHit({
          x: lastPos.x + (pos.x - lastPos.x) * (s / steps),
          y: lastPos.y + (pos.y - lastPos.y) * (s / steps)
        });
      }
    } else {
      checkNodeHit(pos);
    }
    
    gestureRef.current.lastPos = pos;
    setCurrentMousePos(pos);
  }, [nodePositions]);

  const callbacksRef = useRef({ onWordSubmit, letters });
  useEffect(() => {
    callbacksRef.current = { onWordSubmit, letters };
  }, [onWordSubmit, letters]);

  const handleEnd = useCallback(async () => {
    if (!gestureRef.current.isSwiping) return;
    
    gestureRef.current.isSwiping = false;
    setIsSwiping(false);
    setCurrentMousePos(null);
    
    const currentIndices = [...gestureRef.current.selectedIndices];
    
    if (currentIndices.length > 1) {
      const word = currentIndices.map(i => callbacksRef.current.letters[i]).join('');
      setIsAwaiting(true);
      gestureRef.current.isAwaitingResult = true;
      let isCorrect = false;
      try {
        isCorrect = await callbacksRef.current.onWordSubmit(word);
      } catch(e) {
        isCorrect = false;
      }
      setIsAwaiting(false);
      gestureRef.current.isAwaitingResult = false;
      
      if (isCorrect) {
        gestureRef.current.selectedIndices = [];
        setSelectedIndices([]);
      } else {
        setIsWrongAnim(true);
        let currentLen = gestureRef.current.selectedIndices.length;
        gestureRef.current.rewindTimeoutId = setInterval(() => {
          if (!gestureRef.current.isSwiping) {
            currentLen--;
            if (currentLen > 0) {
              const next = gestureRef.current.selectedIndices.slice(0, currentLen);
              gestureRef.current.selectedIndices = next;
              setSelectedIndices([...next]); // force new array for re-render
            } else {
              clearInterval(gestureRef.current.rewindTimeoutId);
              gestureRef.current.selectedIndices = [];
              setSelectedIndices([]);
              setIsWrongAnim(false);
            }
          } else {
            clearInterval(gestureRef.current.rewindTimeoutId);
            setIsWrongAnim(false);
          }
        }, 60);
      }
    } else {
      // Tek harf veya iptal: Anında sıfırla
      gestureRef.current.selectedIndices = [];
      setSelectedIndices([]);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('pointerup', handleEnd);
    window.addEventListener('pointercancel', handleEnd);
    return () => {
      window.removeEventListener('pointerup', handleEnd);
      window.removeEventListener('pointercancel', handleEnd);
    };
  }, [handleEnd]);

  useEffect(() => {
    const handleKeyDown = async (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === 'Backspace') {
        const prev = gestureRef.current.selectedIndices;
        if (prev.length > 0) {
          const next = prev.slice(0, -1);
          gestureRef.current.selectedIndices = next;
          setSelectedIndices(next);
          Haptics.impact({ style: ImpactStyle.Light }).catch(()=>{});
        }
        return;
      }

      if (e.key === 'Enter') {
        const currentIndices = gestureRef.current.selectedIndices;
        if (currentIndices.length > 1) {
          const word = currentIndices.map(i => callbacksRef.current.letters[i]).join('');
          const isCorrect = await callbacksRef.current.onWordSubmit(word);
          if (isCorrect) {
            gestureRef.current.selectedIndices = [];
            setSelectedIndices([]);
          } else {
            setTimeout(() => {
               if (!gestureRef.current.isSwiping) {
                 startRewind();
               }
            }, 400);
          }
        } else {
          startRewind();
        }
        Haptics.impact({ style: ImpactStyle.Medium }).catch(()=>{});
        return;
      }

      const key = e.key.toLocaleUpperCase('tr-TR');
      const matchingIndex = callbacksRef.current.letters.findIndex((l, idx) => l === key && !gestureRef.current.selectedIndices.includes(idx));
      if (matchingIndex !== -1) {
        const next = [...gestureRef.current.selectedIndices, matchingIndex];
        gestureRef.current.selectedIndices = next;
        setSelectedIndices(next);
        Haptics.impact({ style: ImpactStyle.Light }).catch(()=>{});
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const polylinePoints = selectedIndices.map(i => `${nodePositions[i]?.x},${nodePositions[i]?.y}`).join(' ');
  const lineToCursor = (isSwiping && selectedIndices.length > 0 && currentMousePos)
    ? `${nodePositions[selectedIndices[selectedIndices.length - 1]]?.x},${nodePositions[selectedIndices[selectedIndices.length - 1]]?.y} ${currentMousePos.x},${currentMousePos.y}`
    : '';
  const currentWord = selectedIndices.map(i => letters[i]).join('');

  return (
    <div
      className="relative w-full aspect-square max-w-[340px] mx-auto z-20 touch-none select-none"
      ref={containerRef}
      onPointerDown={handleStart}
      onPointerMove={handleMove}
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
          className={`absolute -top-14 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300 ${isAwaiting ? 'animate-pulse' : ''}`}
          style={{
            background: isAwaiting ? 'rgba(239, 108, 0, 0.95)' : 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(12px)',
            borderRadius: 50,
            padding: '8px 24px',
            boxShadow: isAwaiting ? '0 0 20px rgba(239, 108, 0, 0.6)' : '0 6px 24px rgba(0,0,0,0.15)',
            border: isAwaiting ? '1.5px solid #ff8c00' : '1px solid rgba(255,255,255,0.8)',
            minWidth: 100,
            textAlign: 'center'
          }}
        >
          <span style={{
            color: isAwaiting ? '#ffffff' : '#1e293b',
            fontWeight: 800,
            fontSize: 22,
            letterSpacing: 6,
            textTransform: 'uppercase'
          }}>{currentWord}</span>
        </div>
      )}

      {/* SVG lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
        {/* Circle background removed, handled by GameContainer */}
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
        
        {/* Tutorial animated path */}
        {isTutorial && selectedIndices.length === 0 && nodePositions.length > 0 && tutorialWord && (
          (() => {
             const targetIndices = [];
             const lettersCopy = [...letters];
             for (let i = 0; i < tutorialWord.length; i++) {
               const idx = lettersCopy.indexOf(tutorialWord[i]);
               if (idx !== -1) {
                 targetIndices.push(idx);
                 lettersCopy[idx] = null;
               }
             }
             if (targetIndices.length === tutorialWord.length && targetIndices.every(idx => nodePositions[idx])) {
               const pathString = targetIndices.map((idx, i) => `${i===0?'M':'L'} ${nodePositions[idx].x},${nodePositions[idx].y}`).join(' ');
               return (
                 <g className="pointer-events-none opacity-60">
                   <path
                     d={pathString}
                     fill="none"
                     stroke="#ffffff"
                     strokeWidth="8"
                     strokeLinecap="round"
                     strokeLinejoin="round"
                     strokeDasharray="10, 15"
                     className="animate-pulse"
                   />
                   <circle
                     cx={nodePositions[targetIndices[0]].x}
                     cy={nodePositions[targetIndices[0]].y}
                     r="24"
                     fill="none"
                     stroke="#ffffff"
                     strokeWidth="4"
                     className="animate-ping"
                   />
                 </g>
               );
             }
             return null;
          })()
        )}
      </svg>

      {/* Letter nodes */}
      {nodePositions.map((pos, i) => {
        const isSelected = selectedIndices.includes(i);
        const isBonus = letters[i] === bonusLetter;
        const isEliminated = eliminatedLetters?.includes(letters[i]);
        const n = letters.length;
        // Dinamik boyut: harf sayısına göre küçül
        const nodeSize = n <= 5 ? 72 : n === 6 ? 62 : n === 7 ? 54 : 46;
        const fontSize = n <= 5 ? 22 : n === 6 ? 20 : n === 7 ? 18 : 16;
        const half = nodeSize / 2;
        return (
          <div
            key={i}
            className={isSelected ? 'wheel-letter-active' : 'wheel-letter'}
            style={{
              position: 'absolute',
              left: pos.x - half,
              top: pos.y - half,
              width: nodeSize,
              height: nodeSize,
              fontSize: fontSize,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              userSelect: 'none',
              transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
              transform: isShuffling ? 'scale(0) rotate(180deg)' : 'scale(1) rotate(0deg)',
              opacity: isShuffling ? 0 : (isEliminated ? 0.3 : 1),
              pointerEvents: isEliminated ? 'none' : 'auto',
              filter: isEliminated ? 'grayscale(100%)' : 'none',
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
