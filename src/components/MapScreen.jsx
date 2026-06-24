import React, { useState, useEffect, useRef } from 'react';
import { getStationData, getStationXPosition, LEVELS_PER_STATION, LINES, STATION_NAMES } from '../utils/transitNetwork';

const MapScreen = ({ onLevelSelect, currentLevel }) => {
  // currentLevel: 1-indexed (örn: 1, 2, 3...)
  const totalLevelsCompleted = currentLevel - 1;
  const currentStationIndex = Math.floor(totalLevelsCompleted / LEVELS_PER_STATION);
  
  // Bulunduğumuz istasyonun hat bilgisini bul
  const currentStationData = getStationData(currentStationIndex);
  const currentLineId = currentStationData.id;
  const currentLoop = currentStationData.loopCount;

  // Haritada gösterilecek hat ve tur (loop)
  const [viewLineId, setViewLineId] = useState(currentLineId);
  const [viewLoop, setViewLoop] = useState(currentLoop);
  
  const scrollRef = useRef(null);

  // Gösterilecek hat verisini hazırla
  const activeLineObj = LINES.find(l => l.id === viewLineId);
  const stationsInLine = STATION_NAMES[viewLineId];
  
  // Bu hattın global olarak hangi index aralığına denk geldiğini hesapla
  // Önce viewLoop kadar tam tur atıyoruz
  let baseGlobalOffset = viewLoop * Object.values(STATION_NAMES).flat().length;
  // Sonra bu hatta kadar olan diğer hatların istasyon sayısını ekliyoruz
  let lineOffset = 0;
  for (let l of LINES) {
    if (l.id === viewLineId) break;
    lineOffset += STATION_NAMES[l.id].length;
  }
  const startGlobalIndex = baseGlobalOffset + lineOffset;

  // Sayfalama (Hat değiştirme) işlemleri
  const handlePrevLine = () => {
    const currentLineIndex = LINES.findIndex(l => l.id === viewLineId);
    if (currentLineIndex > 0) {
      setViewLineId(LINES[currentLineIndex - 1].id);
    } else if (viewLoop > 0) {
      setViewLoop(l => l - 1);
      setViewLineId(LINES[LINES.length - 1].id);
    }
  };

  const handleNextLine = () => {
    const currentLineIndex = LINES.findIndex(l => l.id === viewLineId);
    
    // Yalnızca kilitli olmayan (veya en fazla 1 ileriki) hatlara geçişe izin ver
    // Gelecekteki ilk kilitli istasyonun olduğu hatta kadar gidebilir
    const maxGlobalIndex = currentStationIndex + 1; // Sadece bulunduğumuz istasyonun bir sonrasına kadar görebiliriz
    
    // Eğer 'sonraki' hat, gelecekteki sınırı aşıyorsa gitme
    let nextLoop = viewLoop;
    let nextLineId = viewLineId;
    
    if (currentLineIndex < LINES.length - 1) {
      nextLineId = LINES[currentLineIndex + 1].id;
    } else {
      nextLoop += 1;
      nextLineId = LINES[0].id;
    }

    // Next hattın başlangıç global indexini bul
    let nextBaseGlobalOffset = nextLoop * Object.values(STATION_NAMES).flat().length;
    let nextLineOffset = 0;
    for (let l of LINES) {
      if (l.id === nextLineId) break;
      nextLineOffset += STATION_NAMES[l.id].length;
    }
    const nextStartGlobalIndex = nextBaseGlobalOffset + nextLineOffset;

    // Eğer geçeceğimiz hat henüz tamamen kilitliyse (hatta hiç giremediysek ve bir sonraki istasyon değilse)
    if (nextStartGlobalIndex > currentStationIndex + 1) {
      return; // Daha fazla ileri gidemez
    }

    setViewLineId(nextLineId);
    setViewLoop(nextLoop);
  };

  // Açıldığında veya hat değiştiğinde mevcut istasyona odaklan
  useEffect(() => {
    if (viewLineId === currentLineId && viewLoop === currentLoop) {
      setTimeout(() => {
        if (scrollRef.current) {
          const currentEl = document.getElementById('current-station');
          if (currentEl) {
            currentEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }, 100);
    }
  }, [viewLineId, viewLoop, currentLineId, currentLoop]);

  // UI için engelleme durumları
  const isFirstLine = viewLineId === LINES[0].id && viewLoop === 0;
  
  // Next butonu kilit kontrolü
  let nextLoopTest = viewLoop;
  let nextLineIdTest = viewLineId;
  const currentLineIndexTest = LINES.findIndex(l => l.id === viewLineId);
  if (currentLineIndexTest < LINES.length - 1) {
    nextLineIdTest = LINES[currentLineIndexTest + 1].id;
  } else {
    nextLoopTest += 1;
    nextLineIdTest = LINES[0].id;
  }
  let nextBaseGlobalOffsetTest = nextLoopTest * Object.values(STATION_NAMES).flat().length;
  let nextLineOffsetTest = 0;
  for (let l of LINES) {
    if (l.id === nextLineIdTest) break;
    nextLineOffsetTest += STATION_NAMES[l.id].length;
  }
  const isNextLocked = nextBaseGlobalOffsetTest + nextLineOffsetTest > currentStationIndex + 1;

  const STATION_HEIGHT = 100;

  return (
    <main className="flex-1 w-full flex flex-col p-4 pb-20 overflow-hidden">
      {/* HEADER: Line Info & Pagination */}
      <div className="flex items-center justify-between mb-2">
        <button 
          onClick={handlePrevLine} 
          disabled={isFirstLine}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isFirstLine ? 'opacity-30' : 'bg-white/10 hover:bg-white/20 active:scale-90'}`}
        >
          <span className="material-symbols-outlined text-white">chevron_left</span>
        </button>
        
        <div className="text-center flex-1 mx-2">
          <div className="flex items-center justify-center gap-1.5 mb-0.5">
            <span className="material-symbols-outlined text-[14px]" style={{ color: activeLineObj.color }}>{activeLineObj.icon}</span>
            <p className="text-xs font-bold tracking-[2px] uppercase" style={{ color: activeLineObj.color }}>
              {activeLineObj.id} Hattı {viewLoop > 0 && `(Tur ${viewLoop + 1})`}
            </p>
          </div>
          <h2 className="text-white text-[15px] font-extrabold leading-tight">{activeLineObj.name}</h2>
        </div>

        <button 
          onClick={handleNextLine} 
          disabled={isNextLocked}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isNextLocked ? 'opacity-30' : 'bg-white/10 hover:bg-white/20 active:scale-90'}`}
        >
          <span className="material-symbols-outlined text-white">chevron_right</span>
        </button>
      </div>

      <div className="text-center mb-4">
        <div className="inline-block px-3 py-1 rounded-full" style={{ background: `${activeLineObj.color}22`, border: `1px solid ${activeLineObj.color}44` }}>
          <span className="text-[10px] font-extrabold text-white">Bölüm {startGlobalIndex * LEVELS_PER_STATION + 1} - {(startGlobalIndex + stationsInLine.length) * LEVELS_PER_STATION}</span>
        </div>
      </div>

      {/* MAP SCROLL CONTAINER */}
      <div 
        ref={scrollRef}
        className="flex-grow relative w-full max-w-sm mx-auto overflow-y-auto overflow-x-hidden rounded-3xl pb-10"
        style={{
          background: 'rgba(0,0,0,0.15)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <div className="relative w-full" style={{ height: `${stationsInLine.length * STATION_HEIGHT + 50}px` }}>
          
          {/* SVG Yolu (Kalın Transit Çizgisi) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
            {stationsInLine.slice(0, -1).map((_, i) => {
              const globalIdx1 = startGlobalIndex + i;
              const globalIdx2 = startGlobalIndex + i + 1;
              const y1 = i * STATION_HEIGHT + 50;
              const y2 = (i + 1) * STATION_HEIGHT + 50;
              const x1 = getStationXPosition(globalIdx1);
              const x2 = getStationXPosition(globalIdx2);

              const isActive = currentStationIndex > globalIdx1;
              
              return (
                <g key={i}>
                  {/* Outer border for the line */}
                  <line
                    x1={`${x1}%`} y1={y1}
                    x2={`${x2}%`} y2={y2}
                    stroke="rgba(0,0,0,0.3)"
                    strokeWidth="24"
                    strokeLinecap="round"
                  />
                  {/* Main colored line */}
                  <line
                    x1={`${x1}%`} y1={y1}
                    x2={`${x2}%`} y2={y2}
                    stroke={isActive ? activeLineObj.color : 'rgba(255,255,255,0.1)'}
                    strokeWidth="16"
                    strokeLinecap="round"
                  />
                </g>
              );
            })}
          </svg>

          {/* İstasyon Noktaları */}
          {stationsInLine.map((stationName, i) => {
            const globalIdx = startGlobalIndex + i;
            const yPos = i * STATION_HEIGHT + 50;
            const xPos = getStationXPosition(globalIdx);

            const isCompleted = currentStationIndex > globalIdx;
            const isCurrentStation = currentStationIndex === globalIdx;
            const isLocked = currentStationIndex < globalIdx;

            // Bu istasyondaki level aralığı
            const stationStartLvl = globalIdx * LEVELS_PER_STATION + 1;
            const stationEndLvl = stationStartLvl + LEVELS_PER_STATION - 1;
            
            // Eğer isCurrentStation ise, kullanıcının bu istasyondaki kaçıncı bölümde olduğunu bulalım
            let progressRatio = 0;
            let currentLvlInStation = 0;
            if (isCurrentStation) {
              currentLvlInStation = currentLevel - stationStartLvl + 1;
              progressRatio = (currentLvlInStation - 1) / LEVELS_PER_STATION;
            } else if (isCompleted) {
              progressRatio = 1;
            }

            return (
              <div
                key={i}
                id={isCurrentStation ? 'current-station' : undefined}
                className="absolute flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${xPos}%`,
                  top: `${yPos}px`,
                  zIndex: isCurrentStation ? 10 : 1
                }}
              >
                {/* Station Node Interactive Area */}
                <button
                  onClick={() => !isLocked && onLevelSelect(stationStartLvl)}
                  disabled={isLocked}
                  className="flex flex-col items-center group relative"
                  style={{ opacity: isLocked ? 0.5 : 1, cursor: isLocked ? 'not-allowed' : 'pointer' }}
                >
                  {/* Outer glow if current */}
                  {isCurrentStation && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-16 h-16 rounded-full pulse-soft absolute" style={{ border: `3px solid ${activeLineObj.color}` }} />
                    </div>
                  )}

                  {/* İstasyon Noktası (Beyaz İçli, Renkli Çember) */}
                  <div 
                    className={`rounded-full flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg relative z-10 ${
                      i === stationsInLine.length - 1 ? 'w-12 h-12 bg-white border-[5px] border-[#0f172a]' : 'w-10 h-10 bg-white'
                    }`}
                    style={i !== stationsInLine.length - 1 ? {
                      border: `6px solid ${isLocked ? 'rgba(255,255,255,0.2)' : activeLineObj.color}`,
                    } : {}}
                  >
                    {isCompleted && <span className="material-symbols-outlined text-[18px]" style={{ color: activeLineObj.color, fontVariationSettings: "'FILL' 1" }}>check</span>}
                    {isLocked && <span className="material-symbols-outlined text-[16px] text-gray-400">lock</span>}
                    {isCurrentStation && <span className="material-symbols-outlined text-[18px] animate-bounce" style={{ color: activeLineObj.color, fontVariationSettings: "'FILL' 1" }}>train</span>}
                  </div>

                  {/* İlerleme Çubuğu (Eğer mevcut istasyonsa) */}
                  {isCurrentStation && (
                    <div className="absolute top-12 flex flex-col items-center w-24">
                      <div className="w-full h-1.5 rounded-full overflow-hidden mb-1" style={{ background: 'rgba(255,255,255,0.2)' }}>
                        <div className="h-full transition-all duration-500" style={{ width: `${progressRatio * 100}%`, background: activeLineObj.color }} />
                      </div>
                      <span className="text-[9px] font-bold text-white/80">{currentLvlInStation} / {LEVELS_PER_STATION} Bölüm</span>
                    </div>
                  )}

                  {/* İstasyon İsmi */}
                  <div className={`absolute ${xPos > 50 ? 'right-12' : 'left-12'} whitespace-nowrap px-3 py-1.5 rounded-lg pointer-events-none transition-all`}
                    style={{
                      background: isCurrentStation ? activeLineObj.color : 'rgba(0,0,0,0.6)',
                      backdropFilter: 'blur(4px)',
                      color: 'white',
                      border: isCurrentStation ? 'none' : '1px solid rgba(255,255,255,0.1)'
                    }}
                  >
                    <p className="text-[11px] font-extrabold">{stationName}</p>
                    {i === stationsInLine.length - 1 && (
                      <p className="text-[8px] font-bold opacity-75 uppercase tracking-wider mt-0.5">Aktarma Noktası</p>
                    )}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
};

export default MapScreen;
