import React, { useEffect, useMemo, useRef, useState } from 'react';
import Grid from './Grid';
import Wheel from './Wheel';
import { generateDuelLevel } from '../utils/gameLogic';
import { DUEL_SECONDS } from '../utils/duel';


// Düello turu: seed'den gelen aynı bulmaca, 120 saniye. Tüm kelimeler bulununca ya da süre
// bitince (veya "Bitir") sonuç {w: kelime, t: geçen saniye} ile bildirilir.
export default function DuelGame({ seed, opponent, onFinish, onQuit }) {
  const level = useMemo(() => generateDuelLevel(seed), [seed]);
  const [letters, setLetters] = useState(level.wheelLetters);
  const [found, setFound] = useState([]);
  const [left, setLeft] = useState(DUEL_SECONDS);
  const [wrong, setWrong] = useState(0);
  const startRef = useRef(Date.now());
  const doneRef = useRef(false);
  const foundRef = useRef(found);
  foundRef.current = found;

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    const t = Math.min(DUEL_SECONDS, Math.round((Date.now() - startRef.current) / 1000));
    onFinish({ w: foundRef.current.length, t });
  };

  useEffect(() => {
    const id = setInterval(() => {
      const remaining = DUEL_SECONDS - Math.floor((Date.now() - startRef.current) / 1000);
      setLeft(Math.max(0, remaining));
      if (remaining <= 0) { clearInterval(id); finish(); }
    }, 250);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (found.length === level.words.length) setTimeout(finish, 400);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [found.length]);

  const onWordSubmit = async (word) => {
    if (level.words.some(w => w.word === word) && !foundRef.current.includes(word)) {
      setFound(f => [...f, word]);
      return true;
    }
    setWrong(n => n + 1);
    return false;
  };

  const pct = left / DUEL_SECONDS;

  return (
    <div className="flex-1 min-h-0 flex flex-col" style={{ '--accent': '#e11d48' }}>
      <div className="flex items-center gap-3 px-4 pb-2 shrink-0">
        <button className="icon-btn" onClick={onQuit} aria-label="Düellodan çık">
          <span aria-hidden="true" className="material-symbols-outlined text-[20px]">close</span>
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-white font-extrabold text-[15px] leading-tight truncate">{opponent ? `${opponent.name} ile düello` : 'Yeni düello'}</p>
          <p className="text-white/60 text-[12px] font-semibold">
            {opponent ? `Rakip: ${opponent.score.w} kelime · ${opponent.score.t} sn` : 'Bitirince bağlantıyı arkadaşına gönder'}
          </p>
        </div>
        <span className="status-chip tabular-nums">{found.length}/{level.words.length}</span>
      </div>
      <div className="px-4 shrink-0">
        <div className="h-2 rounded-full bg-white/15 overflow-hidden">
          <div className="h-full rounded-full transition-[width] duration-300" style={{ width: `${pct * 100}%`, background: pct > 0.25 ? '#22c55e' : '#ef4444' }} />
        </div>
        <p className="text-right text-white/70 text-[12px] font-bold mt-1 tabular-nums">{left} sn</p>
      </div>

      <main className="flex-1 min-h-0 w-full px-3 pt-1 pb-6">
        <Grid words={level.words} foundWords={found} />
      </main>

      <div className="shrink-0 flex flex-col items-center pb-5">
        <div className="relative" style={{ width: 'min(280px, calc(100vw - 48px), 38dvh)', minWidth: 200, aspectRatio: '1 / 1' }}>
          <div className="absolute inset-0 rounded-full pointer-events-none wheel-plate" />
          <div className="absolute inset-0">
            <Wheel letters={letters} onWordSubmit={onWordSubmit} onShuffle={() => setLetters(l => [...l].sort(() => Math.random() - 0.5))} wrongWordTrigger={wrong} />
          </div>
        </div>
        <button onClick={finish} className="mt-3 px-6 py-2.5 rounded-full bg-white/10 border border-white/20 text-white font-extrabold text-[13px] active:scale-95 transition-transform">
          Bitir ve gönder
        </button>
      </div>
    </div>
  );
}
