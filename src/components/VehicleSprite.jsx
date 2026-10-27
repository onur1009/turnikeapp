import React from 'react';

// Hat aracı: bulunulan hattın ulaşım moduna göre yan görünüş çizimi.
// 96x28 çizim alanı, araç sola gider (ön taraf solda), zemin çizgisi y=26.
// `color` hat rengi (şerit/boya), `night` pencereleri yakar, `animated` tekerlek/sallanma.
const GLASS = '#1e293b';
const LIT = '#fde68a';
const STEEL = '#e2e8f0';
const SHADE = '#94a3b8';

const Wheel = ({ cx, cy = 24.5, r = 2 }) => (
  <g className="veh-wheel">
    <circle cx={cx} cy={cy} r={r} fill="#334155" />
    <circle cx={cx} cy={cy} r={r * 0.45} fill="#cbd5e1" />
    <rect x={cx - 0.25} y={cy - r} width="0.5" height={r * 2} fill="#cbd5e1" />
  </g>
);

const Bogie = ({ x }) => (
  <g>
    <rect x={x - 4} y="22.5" width="8" height="1.6" rx="0.8" fill="#475569" />
    <Wheel cx={x - 2.4} r={1.6} />
    <Wheel cx={x + 2.4} r={1.6} />
  </g>
);

// Raylı araç gövdesi: üstte çatı gölgesi, ortada pencere bandı, altta hat renginde şerit
const RailCar = ({ x, w, color, win, front = false, body = STEEL }) => (
  <g>
    <path
      d={front
        ? `M${x + 5} 7 H${x + w} V22 H${x + 1.5} Q${x} 22 ${x} 20 V13 Q${x} 8 ${x + 5} 7 Z`
        : `M${x} 7 H${x + w} V22 H${x} Z`}
      fill={body}
    />
    <rect x={x + (front ? 3 : 0)} y="7" width={w - (front ? 3 : 0)} height="1.6" fill={SHADE} />
    {Array.from({ length: Math.floor((w - (front ? 8 : 3)) / 6) }, (_, i) => (
      <rect key={i} x={x + (front ? 8 : 2) + i * 6} y="10" width="4" height="4.5" rx="0.8" fill={win} />
    ))}
    <rect x={x + (front ? 1 : 0)} y="17" width={w - (front ? 1 : 0)} height="2.4" fill={color} />
    {front && (
      <>
        <path d={`M${x + 1.2} 13 Q${x + 1.5} 9 ${x + 5} 9 V14.5 H${x + 1.2} Z`} fill={win} />
        <circle cx={x + 1.6} cy="19.6" r="0.9" fill="#fef08a" />
      </>
    )}
  </g>
);

const Metro = ({ color, win }) => (
  <g className="veh-body">
    <RailCar x={2} w={30} color={color} win={win} front />
    <rect x="32" y="9" width="1.5" height="12" fill="#475569" />
    <RailCar x={33.5} w={29} color={color} win={win} />
    <rect x="62.5" y="9" width="1.5" height="12" fill="#475569" />
    <RailCar x={64} w={30} color={color} win={win} />
    {[12, 26, 42, 56, 72, 87].map(x => <Bogie key={x} x={x} />)}
  </g>
);

// Marmaray: beyaz banliyö seti, kırmızı şerit, çatıda pantograf ve katener teli
const Marmaray = ({ color, win }) => (
  <>
    <line x1="-4" y1="1" x2="100" y2="1" stroke="#64748b" strokeWidth="0.4" />
    <g className="veh-body">
      <path d="M40 7 L44 2.5 L49 2.5 L46 7" stroke="#475569" strokeWidth="0.7" fill="none" />
      <path d="M44 2.5 L49 1.2" stroke="#475569" strokeWidth="0.7" />
      <RailCar x={2} w={46} color="#dc2626" win={win} front body="#f8fafc" />
      <rect x="48" y="9" width="1.5" height="12" fill="#475569" />
      <RailCar x={49.5} w={45} color="#dc2626" win={win} body="#f8fafc" />
      <rect x="3" y="20" width="91" height="1" fill={color} opacity="0.6" />
      {[12, 38, 60, 86].map(x => <Bogie key={x} x={x} />)}
    </g>
  </>
);

// Tramvay: alçak tabanlı, eklemli, kavisli burun, çatıda pantograf
const Tram = ({ color, win }) => (
  <>
    <line x1="-4" y1="1" x2="100" y2="1" stroke="#64748b" strokeWidth="0.4" />
    <g className="veh-body">
      <path d="M30 7 L34 2 L39 2 L36 7" stroke="#475569" strokeWidth="0.7" fill="none" />
      <path d="M34 2 L39 1" stroke="#475569" strokeWidth="0.7" />
      <path d="M8 7 H44 V23 H3 Q1 23 1 21 V15 Q1 7 8 7 Z" fill={color} />
      <path d="M2.4 15 Q2.6 9 8 9 V15 Z" fill={win} />
      {[10, 16, 22, 28, 34].map(x => <rect key={x} x={x} y="10" width="4" height="7" rx="0.8" fill={win} />)}
      <rect x="44" y="9" width="2" height="13" fill="#334155" />
      <path d="M46 7 H86 Q94 7 94 15 V21 Q94 23 92 23 H46 Z" fill={color} />
      {[49, 55, 61, 67, 73, 79, 85].map(x => <rect key={x} x={x} y="10" width="4" height="7" rx="0.8" fill={win} />)}
      <rect x="1" y="19" width="93" height="1.2" fill="#ffffff" opacity="0.7" />
      <circle cx="2.2" cy="20.5" r="0.9" fill="#fef08a" />
      {[10, 36, 56, 84].map(x => <Wheel key={x} cx={x} r={1.8} />)}
    </g>
  </>
);

// Metrobüs: körüklü uzun otobüs, büyük tekerler
const Metrobus = ({ color, win }) => (
  <g className="veh-body">
    <path d="M6 6 H50 V22 H3 Q1 22 1 20 V10 Q1 6 6 6 Z" fill="#f8fafc" />
    <path d="M2.2 10 Q2.4 8 6 8 V15 H2.2 Z" fill={win} />
    {[9, 16, 23, 30, 37, 44].map(x => <rect key={x} x={x} y="8.5" width="5" height="6" rx="0.6" fill={win} />)}
    <rect x="50" y="7" width="3" height="14" fill="#334155" />
    {[50.8, 51.8, 52.8].map(x => <rect key={x} x={x} y="7" width="0.3" height="14" fill="#64748b" />)}
    <path d="M53 6 H92 Q95 6 95 9 V22 H53 Z" fill="#f8fafc" />
    {[56, 63, 70, 77, 84].map(x => <rect key={x} x={x} y="8.5" width="5" height="6" rx="0.6" fill={win} />)}
    <rect x="1" y="16.5" width="94" height="2.5" fill={color} />
    <circle cx="2" cy="19.8" r="0.9" fill="#fef08a" />
    {[12, 42, 66, 88].map(x => <Wheel key={x} cx={x} cy={23.5} r={2.8} />)}
  </g>
);

// Vapur: koyu gövde, beyaz üst yapı, siyah-sarı baca; dalgada yavaşça iner kalkar
const Ferry = ({ color, win }) => (
  <>
    <g className="veh-float">
      <path d="M2 17 H94 L88 24 H9 Z" fill="#1e293b" />
      <rect x="4" y="16" width="89" height="1.4" fill={color} />
      <rect x="12" y="10" width="68" height="6" fill="#f8fafc" />
      <rect x="22" y="5.5" width="44" height="4.5" fill="#f8fafc" />
      {[14, 19, 24, 29, 34, 39, 44, 49, 54, 59, 64, 69, 74].map(x => <rect key={x} x={x} y="11.5" width="2.8" height="2.6" rx="0.5" fill={win} />)}
      {[25, 31, 37, 43, 49, 55, 61].map(x => <rect key={x} x={x} y="6.6" width="3.2" height="2" rx="0.5" fill={win} />)}
      <rect x="42" y="0.5" width="5" height="5" fill="#facc15" />
      <rect x="42" y="0" width="5" height="1.4" fill="#111827" />
      <line x1="20" y1="5.5" x2="20" y2="1" stroke="#475569" strokeWidth="0.6" />
    </g>
    <path className="veh-wave" d="M-6 25.5 q3 -1.6 6 0 t6 0 t6 0 t6 0 t6 0 t6 0 t6 0 t6 0 t6 0 t6 0 t6 0 t6 0 t6 0 t6 0 t6 0 t6 0 t6 0 t6 0" stroke="#bfdbfe" strokeWidth="1" fill="none" />
    <path d="M94 21 q4 1 8 0" stroke="#ffffff" strokeWidth="1" fill="none" opacity="0.7" />
  </>
);

// Füniküler: eğimli rayda kademeli kabin
const Funicular = ({ color, win }) => (
  <>
    <line x1="-2" y1="26" x2="98" y2="14" stroke="#64748b" strokeWidth="1" />
    <g className="veh-body" transform="rotate(-7 48 20)">
      <path d="M14 8 H82 V22 H10 Q8 22 8 20 V13 Q8 8 14 8 Z" fill={color} />
      <path d="M9.4 14 Q9.6 10 14 10 V15 H9.4 Z" fill={win} />
      {[17, 25, 33, 41, 49, 57, 65, 73].map(x => <rect key={x} x={x} y="10.5" width="5.5" height="6" rx="0.8" fill={win} />)}
      <rect x="8" y="18.5" width="74" height="1.2" fill="#ffffff" opacity="0.7" />
      {[20, 70].map(x => <Wheel key={x} cx={x} cy={23.5} r={1.8} />)}
    </g>
  </>
);

// Teleferik: halata asılı kabin, hafif salınım
const CableCar = ({ color, win }) => (
  <>
    <line x1="-4" y1="2" x2="100" y2="4" stroke="#475569" strokeWidth="0.8" />
    <g className="veh-sway">
      <rect x="44" y="2" width="8" height="2" rx="1" fill="#334155" />
      <line x1="48" y1="4" x2="48" y2="9" stroke="#334155" strokeWidth="1" />
      <path d="M34 9 H62 Q66 9 66 13 V22 Q66 25 62 25 H34 Q30 25 30 22 V13 Q30 9 34 9 Z" fill={color} />
      <rect x="33" y="11.5" width="30" height="7" rx="1.5" fill={win} />
      <line x1="48" y1="11.5" x2="48" y2="18.5" stroke={color} strokeWidth="1.2" />
      <rect x="30" y="21" width="36" height="1.2" fill="#ffffff" opacity="0.7" />
    </g>
  </>
);

const SPRITES = { metro: Metro, marmaray: Marmaray, tram: Tram, funicular: Funicular, cablecar: CableCar, metrobus: Metrobus, ferry: Ferry };

export default function VehicleSprite({ mode = 'metro', color = '#3b82f6', width = 96, night = false, animated = true }) {
  const Sprite = SPRITES[mode] || Metro;
  return (
    <svg width={width} height={width * 28 / 96} viewBox="0 0 96 28" fill="none" xmlns="http://www.w3.org/2000/svg"
      className={animated ? 'vehicle-anim' : undefined} style={{ overflow: 'visible' }} aria-hidden="true">
      <Sprite color={color} win={night ? LIT : GLASS} />
    </svg>
  );
}
