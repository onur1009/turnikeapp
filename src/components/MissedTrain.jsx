import React, { useEffect } from 'react';
import VehicleSprite from './VehicleSprite';
import { playTrainDepart } from '../utils/soundManager';

// "Treni kaçırdın" sahnesi: peronda bekleyen tren, kapı uyarısı (ışık yanıp söner), kapılar
// kapanır, tren hızlanarak peronu terk eder; yolcu peronda geride kalır.
// Kapı ve kalkış sesleri (playTrainDepart) animasyon zamanlamasına göre çalar.
export default function MissedTrain({ color = '#16a34a', mode = 'metro' }) {
  useEffect(() => { playTrainDepart(); }, []);
  return (
    <div className="missed-scene" aria-hidden="true">
      <div className="missed-sign">
        <span className="missed-led" />
        KAPILAR KAPANIYOR
      </div>
      <div className="missed-track">
        <div className="missed-train">
          <VehicleSprite mode={mode} color={color} width={260} night />
          <span className="missed-door d1" />
          <span className="missed-door d2" />
        </div>
      </div>
      <div className="missed-platform">
        <span className="missed-edge" />
        {/* Peronda kalan yolcu */}
        <svg className="missed-person" viewBox="0 0 24 48" width="26" height="52">
          <circle cx="12" cy="7" r="6" fill="#fde68a" />
          <path d="M5 16 Q12 12 19 16 L18 34 H6 Z" fill="#f97316" />
          <rect x="6" y="34" width="4.5" height="13" rx="2" fill="#1e293b" />
          <rect x="13.5" y="34" width="4.5" height="13" rx="2" fill="#1e293b" />
          <path d="M19 18 L23 8" stroke="#fde68a" strokeWidth="3" strokeLinecap="round" className="missed-arm" />
        </svg>
      </div>
    </div>
  );
}
