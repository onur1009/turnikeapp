import React, { useEffect, useMemo, useRef, useState } from 'react';
import Grid from './Grid';
import Wheel from './Wheel';
import { useGameStore } from '../store/gameStore';
import { generateDuelLevel } from '../utils/gameLogic';
import { formatKurus } from '../utils/format';
import { track } from '../utils/analytics';
import { addLeaguePoints } from '../utils/league';
import { todayKey, yesterdayKey, dayNumber, dailySeed, buildShareText, DAILY_REWARD } from '../utils/daily';

// Günün Seferi: herkese aynı gün aynı bulmaca, günde bir kez. Süre baskısı yok, süre ölçülür.
// Bitince cevabı vermeyen paylaşım kartı (🟩 bulunan kelime, 🟥 yanlış deneme) ve seri.

const mmss = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

// Arka arkaya çözülen gün sayısı (bugün çözülmediyse dünden geriye sayar)
const dailyStreak = (results) => {
  let key = results[todayKey()] ? todayKey() : yesterdayKey();
  let n = 0;
  while (results[key]) { n++; key = yesterdayKey(key); }
  return n;
};

const untilMidnight = () => {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const s = Math.max(0, Math.floor((next - now) / 1000));
  return `${Math.floor(s / 3600)} sa ${Math.floor((s % 3600) / 60)} dk`;
};

const Play = ({ onDone }) => {
  const level = useMemo(() => generateDuelLevel(dailySeed()), []);
  const [letters, setLetters] = useState(level.wheelLetters);
  const [found, setFound] = useState([]);
  const [wrong, setWrong] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const startRef = useRef(Date.now());
  const trailRef = useRef([]);
  const foundRef = useRef(found);
  foundRef.current = found;

  useEffect(() => {
    const id = setInterval(() => setSeconds(Math.floor((Date.now() - startRef.current) / 1000)), 500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (found.length && found.length === level.words.length) {
      const t = Math.round((Date.now() - startRef.current) / 1000);
      setTimeout(() => onDone({ date: todayKey(), seconds: t, words: found.length, wrong: trailRef.current.filter(x => x === 'x').length, trail: trailRef.current }), 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [found.length]);

  const onWordSubmit = async (word) => {
    if (level.words.some(w => w.word === word) && !foundRef.current.includes(word)) {
      trailRef.current = [...trailRef.current, 'ok'];
      setFound(f => [...f, word]);
      return true;
    }
    if (!level.words.some(w => w.word === word)) {
      trailRef.current = [...trailRef.current, 'x'];
      setWrong(n => n + 1);
    }
    return false;
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col" style={{ '--accent': '#d97706' }}>
      <div className="flex items-center justify-center gap-3 px-4 pb-2 shrink-0">
        <span className="status-chip tabular-nums">⏱️ {mmss(seconds)}</span>
        <span className="status-chip tabular-nums">{found.length}/{level.words.length}</span>
      </div>
      <main className="flex-1 min-h-0 w-full px-3 pt-1 pb-4">
        <Grid words={level.words} foundWords={found} accent="#d97706" />
      </main>
      <div className="shrink-0 flex flex-col items-center pb-6">
        <div className="relative" style={{ width: 'min(280px, calc(100vw - 48px), 38dvh)', minWidth: 200, aspectRatio: '1 / 1' }}>
          <div className="absolute inset-0 rounded-full pointer-events-none wheel-plate" />
          <div className="absolute inset-0">
            <Wheel letters={letters} onWordSubmit={onWordSubmit} onShuffle={() => setLetters(l => [...l].sort(() => Math.random() - 0.5))} wrongWordTrigger={wrong} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function DailyScreen({ onBack }) {
  const results = useGameStore(s => s.dailyResults);
  const saveDailyResult = useGameStore(s => s.saveDailyResult);
  const recordTopUp = useGameStore(s => s.recordTopUp);
  const bumpDaily = useGameStore(s => s.bumpDaily);
  const [playing, setPlaying] = useState(false);
  const [note, setNote] = useState(null);

  const today = results[todayKey()];
  const streak = dailyStreak(results);

  const onDone = (result) => {
    if (!useGameStore.getState().dailyResults[result.date]) {
      saveDailyResult(result);
      recordTopUp('puzzle', DAILY_REWARD);
      bumpDaily('daily');
      addLeaguePoints('daily');
      track('daily_complete', { day: dayNumber(result.date), seconds: result.seconds, wrong: result.wrong });
    }
    setPlaying(false);
  };

  const share = async () => {
    const text = buildShareText(today);
    track('daily_share');
    if (navigator.share) {
      try { await navigator.share({ title: 'Turnike · Günün Seferi', text: `${text}\nhttps://turnikeapp.vercel.app` }); } catch { /* vazgeçildi */ }
      return;
    }
    try { await navigator.clipboard.writeText(`${text}\nhttps://turnikeapp.vercel.app`); setNote('Kopyalandı! WhatsApp\'ta yapıştır.'); } catch { setNote(text); }
  };

  return (
    <div className="daily-bg flex-1 min-h-0 flex flex-col">
      <header className="flex items-center gap-3 px-4 pt-4 pb-3 shrink-0">
        <button className="icon-btn" onClick={playing ? () => setPlaying(false) : onBack} aria-label="Geri">
          <span aria-hidden="true" className="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-white font-black text-[18px] leading-tight">Günün Seferi #{dayNumber()}</p>
          <p className="text-white/60 text-[12px] font-semibold">Herkese aynı bulmaca · gece yarısı yenilenir</p>
        </div>
        <span className="status-chip">🔥 {streak}</span>
      </header>

      {playing ? <Play onDone={onDone} /> : (
        <main className="flex-1 flex flex-col justify-center gap-5 w-full max-w-sm mx-auto px-5 pb-10">
          {today ? (
            <>
              <p className="text-center text-white font-black text-[30px]">Bugünkü seferi tamamladın!</p>
              <div className="card-panel !rounded-2xl p-5 flex flex-col items-center gap-2">
                <p className="text-white/60 text-[13px] font-bold">Süre</p>
                <p className="text-white font-black text-[40px] leading-none tabular-nums">{mmss(today.seconds)}</p>
                <p className="text-[22px] tracking-[2px] leading-relaxed text-center break-all">{today.trail.map(c => (c === 'ok' ? '🟩' : '🟥')).join('')}</p>
                <p className="text-white/60 text-[13px] font-semibold">{today.words} kelime · {today.wrong} yanlış deneme</p>
              </div>
              <button onClick={share} className="daily-btn w-full flex items-center justify-center gap-2">
                <span aria-hidden="true" className="material-symbols-outlined text-[22px]">share</span>SONUCUNU PAYLAŞ
              </button>
              {note && <p role="status" className="text-center text-white/75 text-[13px] font-semibold whitespace-pre-line">{note}</p>}
              <p className="text-center text-white/55 text-[13px] font-semibold">Yeni sefer {untilMidnight()} sonra</p>
            </>
          ) : (
            <>
              <div className="flex flex-col items-center gap-3">
                <span aria-hidden="true" className="material-symbols-outlined text-amber-300 text-[64px]" style={{ fontVariationSettings: "'FILL' 1" }}>today</span>
                <p className="text-center text-white font-black text-[26px] leading-tight">Bugünün bulmacası hazır</p>
                <p className="text-center text-white/70 text-[14px] font-semibold">Herkes aynı bulmacayı çözüyor. Süre sınırı yok; ne kadar hızlı, o kadar iyi. Sonucunu cevabı vermeden paylaşabilirsin.</p>
              </div>
              <button onClick={() => { track('daily_start', { day: dayNumber() }); setPlaying(true); }} className="daily-btn w-full flex items-center justify-center gap-2">
                <span aria-hidden="true" className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>BAŞLA
              </button>
              <p className="text-center text-white/55 text-[12px] font-semibold">Ödül: {formatKurus(DAILY_REWARD)} · seriyi sürdür</p>
            </>
          )}
        </main>
      )}
    </div>
  );
}
