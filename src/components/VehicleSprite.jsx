import React from 'react';

// Süre çubuğunda ilerleyen araç: bulunulan hattın ulaşım moduna göre çizilir.
// 60x18 kutuya sığar; araç sola doğru gider (ön taraf solda). `color` hat rengidir.
const WINDOW = '#bfdbfe';

const Metro = ({ color }) => (
  <>
    <path d="M2 4a2 2 0 0 1 2-2h14v11H4a2 2 0 0 1-2-2V4z" fill={color} />
    <path d="M2.5 5h4v4h-4z" fill={WINDOW} />
    {[20, 33, 46].map(x => (
      <g key={x}>
        <rect x={x - 2} y="7" width="2" height="2" fill="#475569" />
        <rect x={x} y="2" width="11" height="11" rx="1.5" fill="#4b5563" />
        <rect x={x} y="6" width="11" height="1.5" fill={color} />
        <rect x={x + 2} y="3.5" width="3" height="2.5" rx="0.5" fill={WINDOW} />
        <rect x={x + 6} y="3.5" width="3" height="2.5" rx="0.5" fill={WINDOW} />
      </g>
    ))}
    <circle cx="3.5" cy="11" r="0.8" fill="#facc15" />
  </>
);

// Marmaray: uzun beyaz banliyö seti, kırmızı şerit
const Marmaray = () => (
  <>
    <path d="M1 6c0-2 1.5-4 4-4h12v11H3a2 2 0 0 1-2-2V6z" fill="#f8fafc" />
    <path d="M1.6 5h4.5v3.5H1.6z" fill="#1e293b" />
    {[18, 32, 46].map(x => (
      <g key={x}>
        <rect x={x - 1} y="7" width="1.5" height="2" fill="#94a3b8" />
        <rect x={x} y="2" width="13" height="11" rx="1" fill="#f8fafc" />
        <rect x={x + 1.5} y="4" width="10" height="2.5" rx="0.5" fill="#334155" />
      </g>
    ))}
    <rect x="1" y="9" width="58" height="1.6" fill="#dc2626" />
    <circle cx="2.5" cy="11.5" r="0.8" fill="#facc15" />
  </>
);

// Tramvay: tek parça alçak taban, tepede pantograf
const Tram = ({ color }) => (
  <>
    <path d="M14 1.5l4-1.5M18 0l4 1.5" stroke="#94a3b8" strokeWidth="0.8" />
    <path d="M4 3h44a3 3 0 0 1 3 3v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5a2 2 0 0 1 2-2z" fill={color} />
    {[7, 15, 23, 31, 39].map(x => <rect key={x} x={x} y="5" width="6" height="3.5" rx="0.6" fill={WINDOW} />)}
    <rect x="2" y="10" width="49" height="1" fill="#f8fafc" opacity="0.7" />
    <circle cx="3.5" cy="11.5" r="0.8" fill="#facc15" />
  </>
);

// Füniküler: eğimli rayda basamaklı kabin
const Funicular = ({ color }) => (
  <>
    <path d="M6 13h40l6-9H12z" fill={color} />
    <rect x="15" y="6" width="6" height="4" fill={WINDOW} />
    <rect x="24" y="6" width="6" height="4" fill={WINDOW} />
    <rect x="33" y="6" width="6" height="4" fill={WINDOW} />
    <circle cx="14" cy="14" r="1.6" fill="#334155" />
    <circle cx="40" cy="14" r="1.6" fill="#334155" />
  </>
);

// Teleferik: halata asılı kabin
const CableCar = ({ color }) => (
  <>
    <path d="M0 1.5h60" stroke="#94a3b8" strokeWidth="0.8" />
    <path d="M30 1.5v4" stroke="#64748b" strokeWidth="1" />
    <rect x="22" y="5.5" width="16" height="11" rx="2.5" fill={color} />
    <rect x="24" y="7.5" width="5" height="4" rx="0.8" fill={WINDOW} />
    <rect x="31" y="7.5" width="5" height="4" rx="0.8" fill={WINDOW} />
  </>
);

// Metrobüs: körüklü (iki gövdeli) otobüs
const Metrobus = ({ color }) => (
  <>
    <path d="M2 5a3 3 0 0 1 3-3h22v10H2V5z" fill={color} />
    <rect x="27" y="3" width="3" height="8" fill="#1f2937" />
    <path d="M30 2h24a3 3 0 0 1 3 3v7H30z" fill={color} />
    <rect x="2.5" y="4" width="4" height="4" rx="0.6" fill={WINDOW} />
    {[9, 15, 21, 33, 39, 45, 51].map(x => <rect key={x} x={x} y="4" width="4.5" height="3.5" rx="0.5" fill={WINDOW} />)}
    {[8, 22, 36, 50].map(x => <circle key={x} cx={x} cy="13" r="2" fill="#111827" />)}
    <circle cx="3" cy="10.5" r="0.8" fill="#facc15" />
  </>
);

// Vapur: Şehir Hatları gövdesi, beyaz üst yapı ve siyah-sarı baca
const Ferry = () => (
  <>
    <path d="M1 10h56l-4 5H6z" fill="#1e3a8a" />
    <rect x="9" y="6" width="38" height="4" fill="#f8fafc" />
    <rect x="16" y="3" width="22" height="3" fill="#f8fafc" />
    {[11, 16, 21, 26, 31, 36, 41].map(x => <rect key={x} x={x} y="7" width="2.5" height="2" fill="#334155" />)}
    <rect x="25" y="0.5" width="4" height="3" fill="#facc15" />
    <rect x="25" y="0" width="4" height="1" fill="#111827" />
    <path d="M0 16.5c3-1.2 5 1.2 8 0s5 1.2 8 0 5 1.2 8 0 5 1.2 8 0 5 1.2 8 0 5 1.2 8 0" stroke="#60a5fa" strokeWidth="0.8" fill="none" />
  </>
);

const SPRITES = { metro: Metro, marmaray: Marmaray, tram: Tram, funicular: Funicular, cablecar: CableCar, metrobus: Metrobus, ferry: Ferry };

export default function VehicleSprite({ mode = 'metro', color = '#3b82f6' }) {
  const Sprite = SPRITES[mode] || Metro;
  return (
    <svg width="60" height="18" viewBox="0 0 60 18" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ transform: 'translateY(-5px)', overflow: 'visible' }} aria-hidden="true">
      <Sprite color={color} />
    </svg>
  );
}
