import React from 'react';
import { LINES, STATION_NAMES, MODE_META, MODE_GROUPS, LEVELS_PER_STATION } from '../utils/transitNetwork';

// Hat başlangıç durak indeksleri (yolculuk sırasıyla, ilk tur)
const LINE_START = (() => {
  let offset = 0;
  return Object.fromEntries(LINES.map(line => {
    const start = offset;
    offset += STATION_NAMES[line.id].length;
    return [line.id, start];
  }));
})();
const TOTAL_STATIONS = Object.values(STATION_NAMES).flat().length;

// Tüm İstanbul ağı: hatlar ulaşım moduna göre gruplu; ilerleme ve kilit durumu ile.
export default function NetworkScreen({ currentLevel, onSelectLine }) {
  const currentStationIndex = Math.floor((currentLevel - 1) / LEVELS_PER_STATION);
  const loop = Math.floor(currentStationIndex / TOTAL_STATIONS);
  const indexInLoop = currentStationIndex % TOTAL_STATIONS;

  const lineState = (line) => {
    const count = STATION_NAMES[line.id].length;
    if (loop > 0) return { done: count, count, locked: false, current: false };
    const start = LINE_START[line.id];
    const done = Math.max(0, Math.min(count, indexInLoop - start));
    const current = indexInLoop >= start && indexInLoop < start + count;
    return { done, count, current, locked: indexInLoop < start };
  };

  return (
    <main className="flex-1 min-h-0 w-full overflow-y-auto px-4 pb-6" style={{ overscrollBehavior: 'contain' }}>
      {MODE_GROUPS.map(mode => {
        const lines = LINES.filter(l => l.mode === mode);
        if (!lines.length) return null;
        return (
          <section key={mode} className="mb-5">
            <h3 className="flex items-center gap-2 text-white/60 text-[12px] font-black tracking-[2px] uppercase mb-2 px-1">
              <span aria-hidden="true" className="material-symbols-outlined text-[18px]">{MODE_META[mode].icon}</span>
              {MODE_META[mode].label}
            </h3>
            <div className="flex flex-col gap-2">
              {lines.map(line => {
                const s = lineState(line);
                return (
                  <button
                    key={line.id}
                    onClick={() => onSelectLine(line.id)}
                    className={`w-full flex items-center gap-3 rounded-2xl px-3 py-3 text-left active:scale-[0.98] transition-transform ${s.locked ? 'opacity-55' : ''}`}
                    style={{
                      background: s.current ? `${line.color}22` : 'var(--surface)',
                      border: `1px solid ${s.current ? line.color : 'var(--border)'}`,
                    }}
                  >
                    <span className="line-badge" style={{ background: line.color }}>{line.code}</span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-white font-bold text-[14px] leading-tight truncate">{line.name}</span>
                      <span className="flex items-center gap-2 mt-1.5">
                        <span className="h-1.5 flex-1 rounded-full bg-white/10 overflow-hidden">
                          <span className="block h-full rounded-full" style={{ width: `${(s.done / s.count) * 100}%`, background: line.color }} />
                        </span>
                        <span className="text-white/55 text-[11px] font-bold tabular-nums shrink-0">{s.done}/{s.count} durak</span>
                      </span>
                    </span>
                    <span aria-hidden="true" className="material-symbols-outlined text-[20px] text-white/40">
                      {s.locked ? 'lock' : s.current ? 'my_location' : 'chevron_right'}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </main>
  );
}
