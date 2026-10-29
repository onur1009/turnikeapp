import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { playStationAnnouncement } from '../utils/soundManager';
import { getStationData } from '../utils/transitNetwork';

// Durak tabelası her bölüm açılışında iner (hangi durakta, kaçıncı bölümde olduğun görünsün).
// Yeni bir durağa gelindiğinde (1. bölüm) ding-dong ve sesli anons da çalar; aktarmada
// "Aktarma istasyonu" denir. Ayarlar'daki "Durak anonsu" kapatılırsa tabela ve ses birlikte susar.
export default function StationAnnouncement({ station, levelKey }) {
  const announceEnabled = useGameStore(s => s.announceEnabled);
  const language = useGameStore(s => s.language);
  const [visible, setVisible] = useState(false);
  const arrival = station.leg === 1;
  const transfer = arrival && station.stationIndex > 0 && getStationData(station.stationIndex - 1).id !== station.id;

  useEffect(() => {
    if (!announceEnabled) return undefined;
    setVisible(true);
    if (arrival) playStationAnnouncement(station.displayName, language, { lineChange: transfer });
    const id = setTimeout(() => setVisible(false), arrival ? 3200 : 2000);
    return () => clearTimeout(id);
    // Yalnızca yeni bölüm yüklenince
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelKey]);

  if (!visible) return null;
  return (
    <div className={`station-announce ${arrival ? '' : 'is-leg'}`} role="status" aria-live="polite" onClick={() => setVisible(false)}>
      <span className="line-badge" style={{ background: station.color }}>{station.code}</span>
      <span className="flex flex-col min-w-0">
        <span className="station-announce-label">
          {arrival ? (transfer ? 'AKTARMA · SIRADAKİ DURAK' : 'SIRADAKİ DURAK') : `BÖLÜM ${station.leg}/${station.legsPerStation}`}
        </span>
        <span className="station-announce-name">{station.displayName}</span>
      </span>
    </div>
  );
}
