import React from 'react';
import VehicleSprite from './VehicleSprite';

// Ana ekranın ortası: şehrin üstünden geçen ayaklı bir hat; bulunulan hattın aracı soldan gelip
// perona yanaşır ve bekler. Sahneyle aynı çizim dili (siluet renkleri), aracı hat renginde.
export default function HomeTrain({ station }) {
  return (
    <div className="home-train" aria-hidden="true">
      <div className="home-train-stop">
        <span className="line-badge" style={{ background: station.color }}>{station.code}</span>
        <span className="home-train-pole" />
      </div>
      <div className="home-train-vehicle">
        <VehicleSprite mode={station.mode} color={station.color} width={230} facing="right" />
      </div>
      <div className="home-train-deck" />
      <div className="home-train-pillars">
        {Array.from({ length: 7 }, (_, i) => <span key={i} />)}
      </div>
    </div>
  );
}
