import React, { useEffect, useMemo, useRef, useState } from 'react';
import Grid from './Grid';
import Wheel from './Wheel';
import { generateDuelLevel } from '../utils/gameLogic';
import { DUEL_SECONDS } from '../utils/duel';
import { playCountdown, playTick, playTimeUp, playVsSlam } from '../utils/soundManager';

// Düello turu: 3-2-1 sayımı, sonra seed'den gelen aynı bulmaca ve DUEL_SECONDS süre.
// Üstte skor tabelası (sen / rakip), süre çubuğunda rakibin bitirdiği an işaretli.
// Bitince {w: kelime, t: geçen saniye} bildirilir.
export default function DuelGame({ seed, me, opponent, onFinish, onQuit }) {
  const level = useMemo(() => generateDuelLevel(seed), [seed]);
  const [letters, setLetters] = useState(level.wheelLetters);
  const [found, setFound] = useState([]);
  const [countdown, setCountdown] = useState(4); // 4 = VS girişi, 3-2-1 sayım
  useEffect(() => { playVsSlam(); }, []);
  const [left, setLeft] = useState(DUEL_SECONDS);
  const [wrong, setWrong] = useState(0);
  const startRef = useRef(0);
  const doneRef = useRef(false);
  const foundRef = useRef(found);
  foundRef.current = found;
  const timelineRef = useRef([]);

  const finish = () => {
    if (doneRef.current || !startRef.current) return;
    doneRef.current = true;
    const t = Math.min(DUEL_SECONDS, Math.round((Date.now() - startRef.current) / 1000));
    onFinish({ w: foundRef.current.length, t, found: foundRef.current, timeline: timelineRef.current, puzzle: level.words.map(x => x.word) });
  };

  // 3-2-1, ardından süre
  useEffect(() => {
    if (countdown <= 3) playCountdown(countdown);
    if (countdown > 0) {
      const id = setTimeout(() => setCountdown(c => c - 1), countdown === 4 ? 1400 : 800);
      return () => clearTimeout(id);
    }
    startRef.current = Date.now();
    const id = setInterval(() => {
      const remaining = DUEL_SECONDS - Math.floor((Date.now() - startRef.current) / 1000);
      setLeft(prev => {
        const next = Math.max(0, remaining);
        if (next !== prev && next > 0 && next <= 10) playTick(next);
        if (next === 0 && prev > 0) playTimeUp();
        return next;
      });
      if (remaining <= 0) { clearInterval(id); finish(); }
    }, 250);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown]);

  useEffect(() => {
    if (found.length === level.words.length) setTimeout(finish, 400);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [found.length]);

  const onWordSubmit = async (word) => {
    if (countdown > 0) return false;
    if (level.words.some(w => w.word === word) && !foundRef.current.includes(word)) {
      timelineRef.current = [...timelineRef.current, { w: word, t: Math.round((Date.now() - startRef.current) / 1000) }];
      setFound(f => [...f, word]);
      return true;
    }
    setWrong(n => n + 1);
    return false;
  };

  const pct = left / DUEL_SECONDS;
  const total = level.words.length;
  const elapsed = DUEL_SECONDS - left;
  const rivalNow = !opponent ? 0 : opponent.timeline?.length && countdown === 0
    ? opponent.timeline.filter(e => e.t <= elapsed).length
    : opponent.timeline?.length ? 0 : opponent.score.w;
  const ahead = opponent ? found.length - rivalNow : 0;

  return (
    <div className="duel-bg flex-1 min-h-0 flex flex-col relative" style={{ '--accent': '#e11d48' }}>
      {/* Skor tabelası */}
      <div className="flex items-center gap-2 px-3 pt-3 pb-2 shrink-0">
        <button className="icon-btn" onClick={onQuit} aria-label="Düellodan çık">
          <span aria-hidden="true" className="material-symbols-outlined text-[20px]">close</span>
        </button>
        <div className="duel-scoreboard flex-1">
          <div className="duel-side is-me">
            <span className="truncate">{me}</span>
            <b className="tabular-nums">{found.length}/{total}</b>
          </div>
          <div className="duel-clock tabular-nums" style={{ color: pct > 0.25 ? '#ffffff' : '#fda4af' }}>{left}</div>
          <div className="duel-side is-them">
            <b className="tabular-nums">{opponent ? `${rivalNow}/${total}` : '?'}</b>
            <span className="truncate">{opponent ? opponent.name : 'Arkadaşın'}</span>
          </div>
        </div>
      </div>
      <div className="px-4 shrink-0">
        <div className="relative h-2.5 rounded-full bg-white/15">
          <div className="h-full rounded-full transition-[width] duration-300" style={{ width: `${pct * 100}%`, background: pct > 0.25 ? '#22c55e' : '#ef4444' }} />
          {/* Rakibin bitirdiği an */}
          {opponent && (
            <div className="absolute -top-1 w-1 h-[18px] rounded-full bg-rose-400" style={{ left: `${(1 - opponent.score.t / DUEL_SECONDS) * 100}%` }} title="Rakibin bitirdiği an" />
          )}
        </div>
        <p className="text-center text-[12px] font-bold mt-1.5" style={{ color: !opponent ? 'rgba(255,255,255,0.6)' : ahead > 0 ? '#86efac' : ahead < 0 ? '#fda4af' : '#fde047' }}>
          {!opponent ? 'Ne kadar çok kelime, o kadar iyi' : ahead > 0 ? `Öndesin (+${ahead})` : ahead < 0 ? `${-ahead} kelime gerisindesin` : 'Başa baş'}
        </p>
      </div>

      <main className="flex-1 min-h-0 w-full px-3 pt-1 pb-4">
        <Grid words={level.words} foundWords={found} accent="#e11d48" />
      </main>

      <div className="shrink-0 flex flex-col items-center pb-5">
        <div className="relative" style={{ width: 'min(280px, calc(100vw - 48px), 38dvh)', minWidth: 200, aspectRatio: '1 / 1' }}>
          <div className="absolute inset-0 rounded-full pointer-events-none wheel-plate" />
          <div className="absolute inset-0">
            <Wheel letters={letters} onWordSubmit={onWordSubmit} onShuffle={() => setLetters(l => [...l].sort(() => Math.random() - 0.5))} wrongWordTrigger={wrong} />
          </div>
        </div>
        <button onClick={finish} className="mt-3 text-white/60 font-bold text-[13px] underline underline-offset-4">Pes et, bu skorla bitir</button>
      </div>

      {countdown === 4 && (
        <div className="duel-intro" aria-hidden="true">
          <div className="duel-intro-half me"><span className="duel-intro-avatar">{(me || '?').slice(0, 1).toLocaleUpperCase('tr-TR')}</span><b>{me}</b></div>
          <div className="duel-intro-half them"><span className="duel-intro-avatar">{(opponent?.name || '?').slice(0, 1).toLocaleUpperCase('tr-TR')}</span><b>{opponent?.name || 'Rakip'}</b></div>
          <span className="duel-intro-vs">VS</span>
        </div>
      )}
      {countdown > 0 && countdown < 4 && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/55">
          <span key={countdown} className="duel-count text-white font-black text-[120px] leading-none">{countdown}</span>
          <span className="text-white/70 font-bold text-[14px] mt-2">{opponent ? `${opponent.name}: ${opponent.score.w} kelime` : 'Hazır ol'}</span>
        </div>
      )}
    </div>
  );
}
