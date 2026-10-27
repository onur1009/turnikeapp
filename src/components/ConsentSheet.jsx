import React from 'react';
import { useGameStore } from '../store/gameStore';
import { setAnalyticsConsent } from '../utils/analytics';

// KVKK açık rıza: anonim kullanım verisi yalnızca "İzin ver" seçilirse toplanır.
// Seçim Ayarlar'dan her zaman değiştirilebilir.
export default function ConsentSheet() {
  const consent = useGameStore(s => s.analyticsConsent);
  if (consent !== null) return null;
  return (
    <div className="fixed inset-0 z-[160] bg-black/55 flex items-end fade-in">
      <div role="dialog" aria-labelledby="consent-title" className="w-full rounded-t-3xl p-5 pb-8 flex flex-col gap-3" style={{ background: '#10263f', borderTop: '1px solid var(--border)' }}>
        <h2 id="consent-title" className="text-white font-black text-[18px]">Oyunu birlikte geliştirelim</h2>
        <p className="text-white/75 text-[14px] leading-relaxed">
          Hangi seviyede zorlandığın, hangi ipucunu kullandığın gibi <b>anonim</b> kullanım bilgilerini toplamamıza izin verir misin?
          Adın, e-postan ya da konumun toplanmaz. Bu seçimi Ayarlar'dan istediğin zaman değiştirebilirsin.
        </p>
        <div className="grid grid-cols-2 gap-2 mt-1">
          <button onClick={() => setAnalyticsConsent(false)} className="py-3 rounded-full bg-white/10 text-white font-bold text-[14px]">İzin verme</button>
          <button onClick={() => setAnalyticsConsent(true)} className="py-3 rounded-full bg-green-600 text-white font-black text-[14px]">İzin ver</button>
        </div>
      </div>
    </div>
  );
}
