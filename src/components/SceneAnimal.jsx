import React from 'react';

// Sahneden arada geçen hayvan: gündüz kıyıda martı, karada sokak kedisi, gece baykuş.
// Hepsi sağdan sola (kedi soldan sağa yürür); kanat/bacak hareketi CSS ile.

const Gull = () => (
  <svg width="54" height="30" viewBox="0 0 54 30" aria-hidden="true">
    <g className="animal-wing-l"><path d="M26 15 Q16 4 3 8 Q14 10 22 17 Z" fill="#e2e8f0" stroke="#475569" strokeWidth="0.8" /><path d="M3 8 Q7 7 10 8" stroke="#334155" strokeWidth="1.6" /></g>
    <ellipse cx="28" cy="17" rx="10" ry="4.2" fill="#ffffff" stroke="#64748b" strokeWidth="0.6" />
    <circle cx="19" cy="15.5" r="3.4" fill="#ffffff" stroke="#64748b" strokeWidth="0.6" />
    <path d="M15.8 15.6 L12 16.6 L15.8 17" fill="#f59e0b" />
    <circle cx="18.4" cy="14.8" r="0.7" fill="#0f172a" />
    <path d="M37 16 L44 14 L43 18 Z" fill="#cbd5e1" />
    <g className="animal-wing-r"><path d="M28 15 Q38 3 51 6 Q40 9 32 17 Z" fill="#f1f5f9" stroke="#475569" strokeWidth="0.8" /><path d="M51 6 Q47 5.5 44 6.5" stroke="#334155" strokeWidth="1.6" /></g>
  </svg>
);

const Owl = () => (
  <svg width="50" height="36" viewBox="0 0 50 36" aria-hidden="true">
    <g className="animal-wing-l"><path d="M22 18 Q10 6 1 12 Q10 16 18 24 Z" fill="#7c5a3c" /></g>
    <g className="animal-wing-r"><path d="M28 18 Q40 6 49 12 Q40 16 32 24 Z" fill="#6b4b30" /></g>
    <ellipse cx="25" cy="21" rx="9" ry="11" fill="#8b6844" />
    <ellipse cx="25" cy="24" rx="5.5" ry="6.5" fill="#d6b88a" />
    <path d="M17 12 L19 6 L22 11 Z M33 12 L31 6 L28 11 Z" fill="#8b6844" />
    <circle cx="21.5" cy="15" r="3.6" fill="#fde68a" />
    <circle cx="28.5" cy="15" r="3.6" fill="#fde68a" />
    <circle cx="21.5" cy="15" r="1.6" fill="#0f172a" />
    <circle cx="28.5" cy="15" r="1.6" fill="#0f172a" />
    <path d="M24 17.5 L25 20 L26 17.5 Z" fill="#f59e0b" />
  </svg>
);

const Cat = () => (
  <svg width="58" height="34" viewBox="0 0 58 34" aria-hidden="true">
    <path className="animal-tail" d="M8 16 Q0 12 3 3" stroke="#e8964a" strokeWidth="3.4" fill="none" strokeLinecap="round" />
    <g className="animal-leg-a"><rect x="12" y="20" width="3.4" height="11" rx="1.6" fill="#d9822f" /><rect x="35" y="20" width="3.4" height="11" rx="1.6" fill="#d9822f" /></g>
    <g className="animal-leg-b"><rect x="17" y="20" width="3.4" height="11" rx="1.6" fill="#e8964a" /><rect x="40" y="20" width="3.4" height="11" rx="1.6" fill="#e8964a" /></g>
    <path d="M8 15 Q9 9 18 9 H38 Q44 9 44 15 V20 Q44 23 40 23 H12 Q8 23 8 19 Z" fill="#f2a65a" />
    <path d="M18 11 h4 M26 10.5 h4 M33 11 h3" stroke="#c96f22" strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="48" cy="11" r="7" fill="#f2a65a" />
    <path d="M42.5 7 L43.5 0.5 L47.5 5 Z M49 4.5 L53 0.5 L53.6 7 Z" fill="#f2a65a" />
    <path d="M44 5 L44.5 2.5 L46 4.4 Z M50.5 4.2 L52.4 2.4 L52.6 5 Z" fill="#f9c9d4" />
    <ellipse cx="46" cy="10" rx="1" ry="1.5" fill="#1e293b" />
    <ellipse cx="51" cy="10" rx="1" ry="1.5" fill="#1e293b" />
    <path d="M48.5 12.6 l-0.9 0.9 h1.8 Z" fill="#e26a8a" />
    <path d="M52 13 h5 M52 14.4 l5 1" stroke="#ffffff" strokeWidth="0.5" />
  </svg>
);

// Sahneye göre hayvan seçimi (scenes.js zamanı + semtin deniz/kara bilgisi)
export const pickAnimal = ({ night, water }) => (night ? 'owl' : water ? 'gull' : 'cat');

export default function SceneAnimal({ kind }) {
  if (kind === 'cat') {
    return (
      <div className="scene-animal scene-animal-walk absolute" style={{ top: 'calc(65% - 6px)' }}>
        <Cat />
      </div>
    );
  }
  return (
    <div className={`scene-animal scene-animal-fly absolute ${kind === 'owl' ? 'is-owl' : ''}`} style={{ top: kind === 'owl' ? '30%' : '40%' }}>
      {kind === 'owl' ? <Owl /> : <Gull />}
    </div>
  );
}
