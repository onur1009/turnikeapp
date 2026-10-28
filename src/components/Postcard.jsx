import React from 'react';
import SceneBackground from './SceneBackground';
import { LINES, STATION_INFO } from '../utils/transitNetwork';

// Durak kartpostalı: o semtin gün batımı sahnesi + "Selamlar, …!" yazısı + hat rozeti.
// Sahne SceneBackground ile aynı çizim dili; kart kendi içinde izole (sahne -z-10 ile arkada).
export default function Postcard({ card, large = false }) {
  const line = LINES.find(l => l.id === card.lineId) || LINES[0];
  const station = { id: line.id, mode: line.mode, color: line.color, displayName: card.name, leg: 4, stationIndex: card.stationIndex };
  return (
    <figure className={`postcard ${large ? 'is-large' : ''}`}>
      <div className="postcard-scene">
        <SceneBackground station={station} />
      </div>
      <figcaption className="postcard-caption">
        <span className="line-badge" style={{ background: line.color }}>{line.code}</span>
        <span className="postcard-hello">Selamlar,<br /><b>{card.name}!</b></span>
      </figcaption>
      {large && STATION_INFO[card.name] && <p className="postcard-info">{STATION_INFO[card.name]}</p>}
      <span className="postcard-stamp" aria-hidden="true">TURNİKE<br />{new Date(card.at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</span>
    </figure>
  );
}
