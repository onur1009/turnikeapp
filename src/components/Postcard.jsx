import { useMemo } from 'react';
import { L } from '../utils/i18n';
import { LINES, STATION_INFO } from '../utils/transitNetwork';
import { buildPostcard, W, H } from '../utils/pixelPostcard';

// Durak kartpostalı: durağa ve hatta göre üretilen piksel sanat sahne (her durak kendine özgü)
// + "Selamlar, …!", hat rozeti ve tarihli pul. Büyük görünümde durağın tarih notu yazar.
export function PixelScene({ name, line, stationIndex, className = '' }) {
  const { rects } = useMemo(
    () => buildPostcard({ name, lineId: line.id, mode: line.mode, color: line.color, stationIndex }),
    [name, line.id, line.mode, line.color, stationIndex],
  );
  return (
    <svg className={className} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" shapeRendering="crispEdges" aria-hidden="true">
      {rects.map(([x, y, w, h, c], i) => <rect key={i} x={x} y={y} width={w} height={h} fill={c} />)}
    </svg>
  );
}

export default function Postcard({ card, large = false }) {
  const line = LINES.find(l => l.id === card.lineId) || LINES[0];
  // Kartın eğimi durağa göre değişir (aynı görünmesin)
  const tilt = ((card.stationIndex * 37) % 7) - 3;
  return (
    <figure className={`postcard ${large ? 'is-large' : ''}`} style={{ '--tilt': `${large ? 0 : tilt}deg`, '--stamp': line.color }}>
      <div className="postcard-media">
        <PixelScene className="postcard-photo" name={card.name} line={line} stationIndex={card.stationIndex} />
        <figcaption className="postcard-caption">
          <span className="line-badge" style={{ background: line.color }}>{line.code}</span>
          <span className="postcard-hello">{L("Selamlar,")}<br /><b>{card.name}!</b></span>
        </figcaption>
      </div>
      {large && STATION_INFO[card.name] && (
        <div className="postcard-info">
          <p className="m-0 mb-1.5">{L(STATION_INFO[card.name])}</p>
        </div>
      )}
      <span className="postcard-stamp" aria-hidden="true">{L("TURNİKE")}<br />{new Date(card.at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</span>
    </figure>
  );
}
