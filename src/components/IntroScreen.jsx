import React, { useEffect, useRef } from 'react';
import SceneBackground from './SceneBackground';
import VehicleSprite from './VehicleSprite';
import { useGameStore } from '../store/gameStore';
import { getStationForLevel } from '../utils/transitNetwork';
import { playTrainWhoosh, playGateClick, playTileDrop, playIntroChord } from '../utils/soundManager';

// Açılış tanıtımı (~4 sn, dokununca geçilir):
// 1) Gece İstanbul silueti belirir  2) Metro treni hızla geçer
// 3) Turnike kolları döner, kapı açılır  4) Harf taşları tek tek düşüp TURNİKE'yi yazar,
// taşlar hat renklerine boyanır  5) "Sözcük Seferi" ve hat çizgileri, sonra oyun.
// Hareket azaltma açıksa son kare hemen gösterilir ve kısa sürede geçilir.
const LETTERS = ['T', 'U', 'R', 'N', 'İ', 'K', 'E'];
const LINE_COLORS = ['#16a34a', '#dc2626', '#eab308', '#2563eb', '#7e22ce', '#0d9488', '#ea580c'];
const NIGHT = { id: 'VAPUR', mode: 'ferry', color: '#2563eb', displayName: 'Karaköy', leg: 5, stationIndex: 3 };

export default function IntroScreen({ onDone }) {
  // Açılışta oyuncunun bulunduğu hattın aracı geçer (metro, tramvay, vapur, Marmaray, metrobüs…)
  const line = getStationForLevel(useGameStore.getState().maxUnlockedLevel);
  const doneRef = useRef(false);
  const finish = () => { if (!doneRef.current) { doneRef.current = true; onDone(); } };

  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const id = setTimeout(finish, reduce ? 1200 : 4300);
    // Sesler animasyon anlarına bağlı (tren 0,45 sn, turnike 1,7 sn, taşlar 2,1 sn'den itibaren)
    const cues = reduce ? [] : [
      setTimeout(playTrainWhoosh, 450),
      setTimeout(playGateClick, 1750),
      ...LETTERS.map((_, i) => setTimeout(() => playTileDrop(i), 2150 + i * 90)),
      setTimeout(playIntroChord, 3000),
    ];
    return () => { clearTimeout(id); cues.forEach(clearTimeout); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="game-bg scenic intro-root h-full relative overflow-hidden" onClick={finish} role="button" tabIndex={0}
      aria-label="Tanıtımı geç" onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && finish()}>
      <SceneBackground station={NIGHT} />
      <div className="intro-vignette" aria-hidden="true" />

      {/* Hızla geçen tren */}
      <div className="intro-train" aria-hidden="true">
        <span className="intro-streak" />
        <VehicleSprite mode={line.mode} color={line.color} width={300} night facing="right" />
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 z-10">
        {/* Turnike: üç kollu kapı döner */}
        <svg className="intro-gate" viewBox="0 0 120 120" width="120" height="120" aria-hidden="true">
          <rect x="18" y="52" width="16" height="58" rx="5" fill="#cbd5e1" />
          <rect x="86" y="52" width="16" height="58" rx="5" fill="#cbd5e1" />
          <rect x="16" y="50" width="20" height="8" rx="3" fill="#22c55e" className="intro-gate-led" />
          <g className="intro-gate-arms">
            <circle cx="60" cy="62" r="9" fill="#e2e8f0" />
            {[0, 120, 240].map(a => <rect key={a} x="58" y="20" width="4" height="42" rx="2" fill="#f8fafc" transform={`rotate(${a} 60 62)`} />)}
          </g>
        </svg>

        {/* Harf taşları */}
        <div className="flex gap-1.5 mt-4" aria-label="Turnike">
          {LETTERS.map((ch, i) => (
            <span key={i} className="intro-tile" style={{ '--i': i, '--c': LINE_COLORS[i] }} aria-hidden="true">{ch}</span>
          ))}
        </div>
        <p className="intro-sub">Sözcük Seferi</p>
        <div className="intro-lines" aria-hidden="true">
          {LINE_COLORS.slice(0, 4).map((c, i) => <span key={c} style={{ background: c, '--i': i }} />)}
        </div>
      </div>

      <span className="intro-skip">Geçmek için dokun</span>
    </div>
  );
}
