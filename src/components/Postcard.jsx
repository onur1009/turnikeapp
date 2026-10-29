import React from 'react';
import { LINES, STATION_INFO } from '../utils/transitNetwork';
import { getSceneFor } from '../data/scenes';
import { PHOTO_CREDITS, photoFor } from '../data/postcardPhotos';

// Durak kartpostalı: semtin gerçek fotoğrafı (Wikimedia Commons, açık lisans) + "Selamlar, …!",
// hat rozeti ve tarihli pul. Aynı semtteki duraklar farklı fotoğraflar alır. Büyük görünümde
// durağın tarih notu ve fotoğrafçı/lisans bilgisi yazar (CC BY/BY-SA atıf şartı).
export default function Postcard({ card, large = false }) {
  const line = LINES.find(l => l.id === card.lineId) || LINES[0];
  const { regionId } = getSceneFor({ id: line.id, displayName: card.name, leg: 4, stationIndex: card.stationIndex });
  const photo = photoFor(regionId, card.stationIndex);
  const credit = PHOTO_CREDITS[photo];
  // Kartın eğimi ve pul rengi durağa göre değişir (aynı görünmesin)
  const tilt = ((card.stationIndex * 37) % 7) - 3;
  return (
    <figure className={`postcard ${large ? 'is-large' : ''}`} style={{ '--tilt': `${large ? 0 : tilt}deg`, '--stamp': line.color }}>
      <div className="postcard-media">
        <img className="postcard-photo" src={`/postcards/${photo}.webp`} alt="" loading="lazy" decoding="async" />
        <figcaption className="postcard-caption">
          <span className="line-badge" style={{ background: line.color }}>{line.code}</span>
          <span className="postcard-hello">Selamlar,<br /><b>{card.name}!</b></span>
        </figcaption>
      </div>
      {large && (
        <div className="postcard-info">
          {STATION_INFO[card.name] && <p className="m-0 mb-1.5">{STATION_INFO[card.name]}</p>}
          {credit && (
            <p className="m-0 text-[11px] opacity-70">
              Fotoğraf: {credit.artist} · {credit.license} · <a href={credit.source} target="_blank" rel="noreferrer" className="underline">Wikimedia Commons</a>
            </p>
          )}
        </div>
      )}
      <span className="postcard-stamp" aria-hidden="true">TURNİKE<br />{new Date(card.at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</span>
    </figure>
  );
}
