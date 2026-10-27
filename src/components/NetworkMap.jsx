import React, { useEffect, useMemo, useRef, useState } from 'react';
import { LINES, STATION_NAMES, MODE_META, getNetworkProgress } from '../utils/transitNetwork';
import { MAP_W, MAP_H, WATER, getStationPoints, toPath } from '../data/networkGeometry';

const ZOOMS = [1, 1.6, 2.4];

// Şematik İstanbul ağ haritası: tamamlanan kısımlar hat renginde, kalanlar soluk, kilitli hatlar
// kesikli gri. "Buradasın" işaretine odaklanır; hatta dokununca alt sayfada durak listesi açılır.
export default function NetworkMap({ currentLevel, onOpenLine }) {
  const progress = useMemo(() => getNetworkProgress(currentLevel), [currentLevel]);
  const [zoom, setZoom] = useState(1);
  const [selected, setSelected] = useState(null);
  const scrollRef = useRef(null);

  const geo = useMemo(() => Object.fromEntries(LINES.map(line => {
    const pts = getStationPoints(line.id, STATION_NAMES[line.id].length);
    return [line.id, pts];
  })), []);

  const currentLine = LINES.find(l => progress.lines[l.id].current) || LINES[0];
  const here = geo[currentLine.id][Math.max(0, progress.lines[currentLine.id].currentIndex)] || geo[currentLine.id][0];

  // Açılışta ve yakınlaştırınca "Buradasın" ekranın ortasında kalsın
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !here) return;
    // Harita alanın yüksekliğini doldurur; genişlik en-boy oranından gelir
    const h = el.clientHeight * zoom;
    const w = h * (MAP_W / MAP_H);
    el.scrollTo({ left: (here[0] / MAP_W) * w - el.clientWidth / 2, top: (here[1] / MAP_H) * h - el.clientHeight / 2 });
  }, [zoom, here]);

  const sel = selected ? LINES.find(l => l.id === selected) : null;
  const selState = sel ? progress.lines[sel.id] : null;
  const pct = Math.round((progress.doneStations / progress.totalStations) * 100);

  // Kilitsiz hatlar üstte çizilsin; seçilen en üstte
  const drawOrder = [...LINES].sort((a, b) =>
    (progress.lines[a.id].locked ? 0 : 1) - (progress.lines[b.id].locked ? 0 : 1) || (a.id === selected) - (b.id === selected));

  return (
    <div className="flex-1 min-h-0 flex flex-col relative">
      {/* Özet şeridi */}
      <div className="shrink-0 grid grid-cols-3 gap-2 px-4 pb-3">
        <div className="map-stat"><span className="map-stat-value">%{pct}</span><span className="map-stat-label">Ağ keşfi</span></div>
        <div className="map-stat"><span className="map-stat-value">{progress.doneStations}/{progress.totalStations}</span><span className="map-stat-label">Durak</span></div>
        <div className="map-stat"><span className="map-stat-value">{progress.doneLines}/{LINES.length}</span><span className="map-stat-label">Hat bitti</span></div>
      </div>

      <div ref={scrollRef} className="flex-1 min-h-0 overflow-auto map-canvas" style={{ overscrollBehavior: 'contain' }}>
        <svg
          viewBox={`0 0 ${MAP_W} ${MAP_H}`}
          style={{ height: `${zoom * 100}%`, width: 'auto', maxWidth: 'none', display: 'block' }}
          role="img"
          aria-label="İstanbul raylı sistem ve deniz hatları haritası"
        >
          <rect width={MAP_W} height={MAP_H} fill="#e9e4d8" />
          <path d={WATER.blackSea} fill="#9cc7e4" />
          <path d={WATER.marmara} fill="#9cc7e4" />
          <path d={WATER.bosphorus} fill="#9cc7e4" />
          <path d={WATER.goldenHorn} fill="#9cc7e4" />
          {WATER.islands.map(([cx, cy, rx, ry], i) => <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} fill="#e9e4d8" />)}
          <text x="200" y="600" className="map-water-label">Marmara Denizi</text>
          <text x="640" y="200" className="map-water-label" transform="rotate(-72 640 200)">İstanbul Boğazı</text>
          <text x="150" y="160" className="map-side-label">AVRUPA</text>
          <text x="790" y="200" className="map-side-label">ANADOLU</text>

          {drawOrder.map(line => {
            const s = progress.lines[line.id];
            const pts = geo[line.id];
            const isFerry = line.mode === 'ferry';
            const isSel = line.id === selected;
            const width = isSel ? 9 : 6;
            const donePts = pts.slice(0, Math.max(1, Math.min(pts.length, s.current ? s.currentIndex + 1 : s.done)));
            return (
              <g key={line.id} onClick={() => setSelected(line.id)} style={{ cursor: 'pointer' }}>
                {/* geniş, görünmez dokunma alanı */}
                <path d={toPath(pts)} stroke="transparent" strokeWidth="26" fill="none" strokeLinecap="round" />
                <path
                  d={toPath(pts)}
                  stroke={s.locked ? '#9ca3af' : line.color}
                  strokeOpacity={s.locked ? 0.7 : 0.35}
                  strokeWidth={width}
                  strokeDasharray={s.locked || isFerry ? '10 7' : undefined}
                  fill="none" strokeLinecap="round" strokeLinejoin="round"
                />
                {!s.locked && donePts.length > 1 && (
                  <path d={toPath(donePts)} stroke={line.color} strokeWidth={width} strokeDasharray={isFerry ? '10 7' : undefined}
                    fill="none" strokeLinecap="round" strokeLinejoin="round" />
                )}
                {(zoom > 1 || isSel) && pts.map((p, i) => (
                  <circle key={i} cx={p[0]} cy={p[1]} r={isSel ? 4.5 : 3.2}
                    fill={!s.locked && i < (s.current ? s.currentIndex : s.done) ? '#ffffff' : '#e5e7eb'}
                    stroke={s.locked ? '#9ca3af' : line.color} strokeWidth="1.6" />
                ))}
                <g transform={`translate(${pts[0][0]} ${pts[0][1]})`}>
                  <rect x="-15" y="-21" width="30" height="14" rx="4" fill={s.locked ? '#9ca3af' : line.color} />
                  <text y="-10.5" textAnchor="middle" className="map-line-code">{line.code}</text>
                </g>
              </g>
            );
          })}

          {/* Buradasın */}
          {here && (
            <g transform={`translate(${here[0]} ${here[1]})`} pointerEvents="none">
              <circle r="18" fill={currentLine.color} className="map-here-pulse" />
              <circle r="9" fill="#ffffff" stroke={currentLine.color} strokeWidth="4" />
            </g>
          )}
        </svg>
      </div>

      {/* Yakınlaştırma */}
      <div className="absolute right-3 top-16 flex flex-col gap-2 z-10">
        <button className="icon-btn" aria-label="Yakınlaştır" onClick={() => setZoom(z => ZOOMS[Math.min(ZOOMS.length - 1, ZOOMS.indexOf(z) + 1)])}>
          <span aria-hidden="true" className="material-symbols-outlined text-[20px]">add</span>
        </button>
        <button className="icon-btn" aria-label="Uzaklaştır" onClick={() => setZoom(z => ZOOMS[Math.max(0, ZOOMS.indexOf(z) - 1)])}>
          <span aria-hidden="true" className="material-symbols-outlined text-[20px]">remove</span>
        </button>
        <button className="icon-btn" aria-label="Bulunduğum yere git" onClick={() => setZoom(z => (z === 1 ? 1.6 : z))}>
          <span aria-hidden="true" className="material-symbols-outlined text-[20px]">my_location</span>
        </button>
      </div>

      {/* Hat alt sayfası */}
      {sel && (
        <div className="absolute inset-x-0 bottom-0 z-20 map-sheet fade-in" role="dialog" aria-label={sel.name}>
          <div className="w-10 h-1 rounded-full bg-white/25 mx-auto mb-3" />
          <div className="flex items-center gap-3 mb-3">
            <span className="line-badge" style={{ background: sel.color }}>{sel.code}</span>
            <div className="flex-1 min-w-0">
              <p className="text-white font-extrabold text-[15px] leading-tight truncate">{sel.name}</p>
              <p className="text-white/60 text-[12px] font-semibold">{MODE_META[sel.mode].label} · {selState.done}/{selState.count} durak</p>
            </div>
            <button className="icon-btn" aria-label="Kapat" onClick={() => setSelected(null)}>
              <span aria-hidden="true" className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-1 px-1" style={{ overscrollBehavior: 'contain' }}>
            {STATION_NAMES[sel.id].map((name, i) => {
              const isHere = selState.current && i === selState.currentIndex;
              const isDone = !selState.locked && i < (selState.current ? selState.currentIndex : selState.done);
              return (
                <span key={i} className="shrink-0 px-2.5 py-1.5 rounded-full text-[12px] font-bold"
                  style={{
                    background: isHere ? sel.color : isDone ? `${sel.color}33` : 'rgba(255,255,255,0.06)',
                    color: isHere || isDone ? '#ffffff' : 'rgba(255,255,255,0.45)',
                  }}>
                  {isDone ? '✓ ' : isHere ? '● ' : ''}{name}
                </span>
              );
            })}
          </div>
          <button
            onClick={() => onOpenLine(sel.id)}
            disabled={selState.locked}
            className="w-full mt-2 py-3 rounded-full font-black text-[14px] text-white disabled:opacity-40"
            style={{ background: sel.color }}
          >
            {selState.locked ? 'Bu hat henüz kilitli' : 'Hattın duraklarını aç'}
          </button>
        </div>
      )}
    </div>
  );
}
