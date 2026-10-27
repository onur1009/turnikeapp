import React, { useMemo } from 'react';
import { getSceneFor } from '../data/scenes';
import SceneAnimal, { pickAnimal } from './SceneAnimal';

// Bölüm sahnesi: gökyüzü (ayağa göre saat), uzak şehir, semte özgü simgeler, deniz/kara,
// bulutlar ve arada geçen bir hayvan (martı, kedi, baykuş). Tamamen SVG; animasyonlar yalnızca transform.
// Ebeveyn .game-bg (isolation: isolate) olmalı: sahne -z-10 ile içeriğin arkasında kalır.
const HY = 520; // ufuk çizgisi (viewBox 400x800)

const rng = (seed) => {
  let s = (seed * 9301 + 49297) % 233280 || 1;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
};

// --- Simgeler: taban ufuk çizgisinde, x merkez ---
const Mosque = ({ x, fill, s = 1 }) => (
  <g transform={`translate(${x} ${HY}) scale(${s})`} fill={fill}>
    <path d="M-34 0 V-18 Q-34 -46 0 -50 Q34 -46 34 -18 V0 Z" />
    <path d="M-50 0 V-14 Q-50 -26 -38 -27 Q-26 -26 -26 -14 V0 Z" />
    <path d="M26 0 V-14 Q26 -26 38 -27 Q50 -26 50 -14 V0 Z" />
    <rect x="-2" y="-58" width="4" height="9" />
    {[-60, 60].map(mx => (
      <g key={mx}>
        <rect x={mx - 2.5} y="-92" width="5" height="92" />
        <path d={`M${mx - 3} -92 L${mx} -108 L${mx + 3} -92 Z`} />
        <rect x={mx - 4} y="-70" width="8" height="2.5" />
      </g>
    ))}
  </g>
);

const Galata = ({ x, fill, s = 1 }) => (
  <g transform={`translate(${x} ${HY}) scale(${s})`} fill={fill}>
    <rect x="-13" y="-78" width="26" height="78" />
    <rect x="-15" y="-84" width="30" height="7" />
    <path d="M-14 -84 L0 -112 L14 -84 Z" />
    <path d="M-30 0 V-22 H-13 V0 Z M13 0 V-30 H30 V0 Z" />
  </g>
);

const Bridge = ({ x, fill, s = 1 }) => (
  <g transform={`translate(${x} ${HY}) scale(${s})`}>
    <rect x="-150" y="-26" width="300" height="5" fill={fill} />
    {[-90, 90].map(tx => <rect key={tx} x={tx - 4} y="-92" width="8" height="92" fill={fill} />)}
    <path d="M-150 -26 Q-120 -40 -90 -90 Q0 -20 90 -90 Q120 -40 150 -26" stroke={fill} strokeWidth="2.5" fill="none" />
    {Array.from({ length: 17 }, (_, i) => -80 + i * 10).map(hx => (
      <line key={hx} x1={hx} y1="-26" x2={hx} y2={-26 - Math.max(4, 64 * ((Math.abs(hx) / 90) ** 2))} stroke={fill} strokeWidth="0.8" />
    ))}
  </g>
);

const Maiden = ({ x, fill, s = 1 }) => (
  <g transform={`translate(${x} ${HY + 20}) scale(${s})`} fill={fill}>
    <path d="M-26 0 Q0 -8 26 0 Z" />
    <rect x="-16" y="-20" width="32" height="18" />
    <rect x="-6" y="-42" width="12" height="22" />
    <path d="M-7 -42 L0 -58 L7 -42 Z" />
  </g>
);

const Camlica = ({ x, fill, s = 1 }) => (
  <g transform={`translate(${x} ${HY}) scale(${s})`} fill={fill}>
    <path d="M-70 0 Q-20 -40 0 -42 Q30 -40 70 0 Z" />
    <path d="M-6 -40 L-4 -150 H4 L6 -40 Z" />
    <rect x="-10" y="-130" width="20" height="18" rx="4" />
    <rect x="-1" y="-185" width="2" height="36" />
  </g>
);

const Skyscrapers = ({ x, fill, s = 1, night }) => (
  <g transform={`translate(${x} ${HY}) scale(${s})`}>
    {[[-48, 22, 120], [-22, 26, 168], [8, 20, 140], [30, 24, 104], [56, 18, 82]].map(([bx, w, h]) => (
      <g key={bx}>
        <rect x={bx} y={-h} width={w} height={h} fill={fill} />
        {night && Array.from({ length: Math.floor(h / 14) }, (_, r) => (
          <rect key={r} x={bx + 4} y={-h + 8 + r * 14} width={w - 8} height="3" fill="#fde68a" opacity={(r * 7 + bx) % 3 ? 0.55 : 0.15} />
        ))}
      </g>
    ))}
    <path d="M-22 -168 L-9 -190 L4 -168 Z" fill={fill} />
  </g>
);

const Towers = ({ x, fill, s = 1 }) => (
  <g transform={`translate(${x} ${HY}) scale(${s})`} fill={fill}>
    {[[-60, 26, 62], [-30, 22, 84], [-4, 30, 56], [30, 22, 74], [56, 28, 48]].map(([bx, w, h]) => <rect key={bx} x={bx} y={-h} width={w} height={h} />)}
  </g>
);

const Airport = ({ x, fill, s = 1 }) => (
  <g transform={`translate(${x} ${HY}) scale(${s})`} fill={fill}>
    <path d="M-110 0 V-16 Q-40 -34 40 -16 V0 Z" />
    <rect x="70" y="-110" width="8" height="110" />
    <path d="M58 -112 H90 L84 -126 H64 Z" />
    <g className="scene-plane">
      <path d="M-60 -160 l40 -6 l10 -12 l4 0 l-4 11 l22 -3 l6 -7 l3 0 l-2 8 l-79 10 Z" />
    </g>
  </g>
);

const Islands = ({ x, fill, s = 1 }) => (
  <g transform={`translate(${x} ${HY}) scale(${s})`} fill={fill}>
    <path d="M-140 4 Q-110 -36 -70 -30 Q-40 -50 -10 4 Z" />
    <path d="M10 4 Q40 -24 70 -20 Q100 -34 140 4 Z" />
    {[-90, -60, 50, 80].map(tx => <circle key={tx} cx={tx} cy={tx < 0 ? -38 : -26} r="6" />)}
  </g>
);

const Cable = ({ x, fill, s = 1 }) => (
  <g transform={`translate(${x} ${HY}) scale(${s})`}>
    <path d="M-140 -20 Q-20 -60 140 -150" stroke={fill} strokeWidth="1.5" fill="none" />
    <path d="M60 0 Q100 -90 140 -110 V0 Z" fill={fill} />
    <g className="scene-gondola" fill={fill}>
      <rect x="-25" y="-48" width="14" height="11" rx="2" />
      <line x1="-18" y1="-48" x2="-18" y2="-56" stroke={fill} strokeWidth="1" />
    </g>
  </g>
);

const LANDMARKS = { mosque: Mosque, mosque2: Mosque, galata: Galata, bridge: Bridge, maiden: Maiden, camlica: Camlica, skyscrapers: Skyscrapers, towers: Towers, airport: Airport, islands: Islands, cable: Cable };

// Uzak şehir: rastgele ama durağa göre sabit alçak bina sırası
const FarCity = ({ fill, seed, night }) => {
  const parts = useMemo(() => {
    const r = rng(seed + 7);
    const out = [];
    for (let x = -10; x < 410;) {
      const w = 10 + r() * 22, h = 8 + r() * 30;
      out.push({ x, w, h, lit: r() });
      x += w + r() * 3;
    }
    return out;
  }, [seed]);
  return (
    <g>
      {parts.map((p, i) => (
        <g key={i}>
          <rect x={p.x} y={HY - p.h} width={p.w} height={p.h} fill={fill} />
          {night && p.lit > 0.45 && <rect x={p.x + 3} y={HY - p.h + 4} width="2" height="2" fill="#fde68a" opacity="0.8" />}
        </g>
      ))}
    </g>
  );
};

export default function SceneBackground({ station }) {
  const { time, region, seed } = getSceneFor(station);
  const night = !!time.night;
  const id = `sc-${time.id}`;
  const r = rng(seed + 1);
  const clouds = [0, 1, 2].map(i => ({ x: r() * 360, y: 60 + i * 70 + r() * 40, s: 0.6 + r() * 0.7, d: 70 + r() * 60 }));
  const stars = night ? Array.from({ length: 40 }, () => ({ x: r() * 400, y: r() * 380, o: 0.3 + r() * 0.7 })) : [];
  const nearFill = time.land;
  const farFill = time.haze;
  const landmarks = region.landmarks;
  const xs = landmarks.length === 1 ? [200] : landmarks.length === 2 ? [110, 290] : [70, 205, 330];

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none scene-root" aria-hidden="true">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={time.sky[0]} />
            <stop offset="0.45" stopColor={time.sky[1]} />
            <stop offset="0.65" stopColor={time.sky[2]} />
          </linearGradient>
          <linearGradient id={`${id}-water`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={time.water[0]} />
            <stop offset="1" stopColor={time.water[1]} />
          </linearGradient>
          <radialGradient id={`${id}-glow`}>
            <stop offset="0" stopColor={time.sun ? time.sun.color : '#c7d2fe'} stopOpacity="0.55" />
            <stop offset="1" stopColor={time.sun ? time.sun.color : '#c7d2fe'} stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="400" height="800" fill={`url(#${id}-sky)`} />
        {stars.map((st, i) => <circle key={i} cx={st.x} cy={st.y} r="0.9" fill="#ffffff" opacity={st.o} className={i % 4 === 0 ? 'scene-twinkle' : undefined} />)}
        {time.sun && (
          <g>
            <circle cx="300" cy={time.sun.y} r={time.sun.r * 3.5} fill={`url(#${id}-glow)`} />
            <circle cx="300" cy={time.sun.y} r={time.sun.r} fill={time.sun.color} />
          </g>
        )}
        {time.moon && (
          <g>
            <circle cx="310" cy={time.moon.y} r={time.moon.r * 3} fill={`url(#${id}-glow)`} />
            <circle cx="310" cy={time.moon.y} r={time.moon.r} fill="#e2e8f0" />
            <circle cx="316" cy={time.moon.y - 4} r={time.moon.r} fill={time.sky[0]} />
          </g>
        )}

        {clouds.map((c, i) => (
          <g key={i} className="scene-cloud" style={{ animationDuration: `${c.d}s`, animationDelay: `-${c.d * (i / 3)}s` }}>
            <g transform={`translate(${c.x} ${c.y}) scale(${c.s})`} fill={time.cloud} opacity={night ? 0.35 : 0.8}>
              <ellipse cx="0" cy="0" rx="34" ry="10" />
              <ellipse cx="-12" cy="-7" rx="16" ry="10" />
              <ellipse cx="10" cy="-9" rx="18" ry="12" />
            </g>
          </g>
        ))}

        <FarCity fill={farFill} seed={seed} night={night} />
        {landmarks.map((lm, i) => {
          const L = LANDMARKS[lm];
          return <L key={lm + i} x={xs[i]} fill={nearFill} s={lm === 'mosque2' ? 0.7 : 1} night={night} />;
        })}

        {region.water ? (
          <g>
            <rect y={HY} width="400" height={800 - HY} fill={`url(#${id}-water)`} />
            {(time.sun || time.moon) && (
              <rect x={time.sun ? 285 : 300} y={HY + 4} width={time.sun ? 30 : 20} height="200" fill={time.sun ? time.sun.color : '#e2e8f0'} opacity="0.18" />
            )}
            <g className="scene-shimmer">
              {Array.from({ length: 14 }, (_, i) => (
                <rect key={i} x={(i * 53) % 400} y={HY + 18 + i * 16} width={18 + (i % 4) * 8} height="1.4" rx="0.7" fill="#ffffff" opacity="0.22" />
              ))}
            </g>
          </g>
        ) : (
          <g>
            <rect y={HY} width="400" height={800 - HY} fill={time.water[1]} />
            <rect y={HY} width="400" height="14" fill={nearFill} />
            {Array.from({ length: 9 }, (_, i) => (
              <rect key={i} x={i * 48} y={HY + 30} width="26" height="3" fill="#ffffff" opacity="0.12" />
            ))}
          </g>
        )}

        {!night && (
          <g className="scene-birds" fill="none" stroke={time.land} strokeWidth="1.4" strokeLinecap="round">
            <path d="M60 230 q5 -5 10 0 q5 -5 10 0" />
            <path d="M88 214 q4 -4 8 0 q4 -4 8 0" />
            <path d="M40 250 q4 -4 8 0 q4 -4 8 0" />
          </g>
        )}
      </svg>

      {/* Arada geçen hayvan: gündüz kıyıda martı, karada kedi, gece baykuş */}
      <SceneAnimal kind={pickAnimal({ night, water: region.water })} />
    </div>
  );
}
