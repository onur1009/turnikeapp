import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { playStationAnnouncement } from '../utils/soundManager';

// Durak anonsu: bir durağın ilk bölümü açılırken metro tabelası gibi bir şerit iner,
// "ding-dong" çalar ve (destekleniyorsa) sesli anons okunur. Ayarlar'dan kapatılabilir.
// Yalnızca durağın 1. ayağında gösterilir ki her bölümde oyunu bölmesin.
export default function StationAnnouncement({ station, levelKey }) {
  const announceEnabled = useGameStore(s => s.announceEnabled);
  const soundEnabled = useGameStore(s => s.soundEnabled);
  const language = useGameStore(s => s.language);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!announceEnabled || station.leg !== 1) return undefined;
    setVisible(true);
    if (soundEnabled) playStationAnnouncement(station.displayName, language);
    const id = setTimeout(() => setVisible(false), 2600);
    return () => clearTimeout(id);
    // Yalnızca yeni bölüm yüklenince
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelKey]);

  if (!visible) return null;
  return (
    <div className="station-announce" role="status" aria-live="polite" onClick={() => setVisible(false)}>
      <span className="line-badge" style={{ background: station.color }}>{station.code}</span>
      <span className="flex flex-col min-w-0">
        <span className="station-announce-label">{station.isLineChange ? 'AKTARMA · SIRADAKİ DURAK' : 'SIRADAKİ DURAK'}</span>
        <span className="station-announce-name">{station.displayName}</span>
      </span>
    </div>
  );
}
