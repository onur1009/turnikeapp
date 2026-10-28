import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import ScreenHeader from './ScreenHeader';
import Postcard from './Postcard';
import { LINES, STATION_NAMES } from '../utils/transitNetwork';

// Kartpostal albümü: her tamamlanan durak bir kartpostal. Hatta göre gruplanır, hat ilerlemesiyle.
export default function PostcardsScreen({ onBack }) {
  const postcards = useGameStore(s => s.postcards);
  const [open, setOpen] = useState(null);

  const byLine = LINES.map(line => ({ line, cards: postcards.filter(p => p.lineId === line.id) })).filter(g => g.cards.length);

  return (
    <main className="flex-1 w-full overflow-y-auto" style={{ overscrollBehavior: 'contain' }}>
      <div className="w-full max-w-md mx-auto px-4 pb-10">
        <ScreenHeader title="Kartpostallarım" onBack={onBack} className="px-0" />
        {postcards.length === 0 ? (
          <div className="card-panel !rounded-2xl p-6 text-center flex flex-col items-center gap-3 mt-6">
            <span aria-hidden="true" className="material-symbols-outlined text-[48px] text-amber-300" style={{ fontVariationSettings: "'FILL' 1" }}>mail</span>
            <p className="text-white font-black text-[18px]">Henüz kartpostal yok</p>
            <p className="text-white/65 text-[14px] font-semibold">Bir durağın 5 bölümünü bitirince o semtten bir kartpostal gelir.</p>
          </div>
        ) : byLine.map(({ line, cards }) => (
          <section key={line.id} className="mb-6">
            <h2 className="flex items-center gap-2 mb-2">
              <span className="line-badge" style={{ background: line.color }}>{line.code}</span>
              <span className="text-white font-extrabold text-[14px] truncate">{line.name}</span>
              <span className="ml-auto text-white/55 text-[12px] font-bold tabular-nums shrink-0">{cards.length}/{STATION_NAMES[line.id].length}</span>
            </h2>
            <div className="grid grid-cols-2 gap-2.5">
              {cards.map(c => (
                <button key={c.stationIndex} onClick={() => setOpen(c)} className="text-left active:scale-[0.98] transition-transform" aria-label={`${c.name} kartpostalı`}>
                  <Postcard card={c} />
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-[160] bg-black/75 flex items-center justify-center p-5 fade-in" onClick={() => setOpen(null)} role="dialog" aria-label={`${open.name} kartpostalı`}>
          <div className="w-full max-w-sm scale-in" onClick={e => e.stopPropagation()}>
            <Postcard card={open} large />
            <button onClick={() => setOpen(null)} className="mt-4 w-full py-3 rounded-full bg-white text-[#10263f] font-black text-[14px]">Kapat</button>
          </div>
        </div>
      )}
    </main>
  );
}
