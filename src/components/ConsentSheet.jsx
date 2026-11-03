import { useState } from 'react';
import { L } from '../utils/i18n';
import { useGameStore } from '../store/gameStore';
import { setAnalyticsConsent } from '../utils/analytics';
import { KVKK_URL } from '../utils/legal';


const Choice = ({ on, set, title, text }) => (
  <label className="flex items-start gap-3 rounded-2xl p-3 cursor-pointer" style={{ background: 'rgba(255,255,255,0.06)' }}>
    <input type="checkbox" checked={on} onChange={e => set(e.target.checked)} className="mt-1 w-5 h-5 shrink-0 accent-green-500" />
    <span className="flex flex-col gap-0.5">
      <span className="text-white font-bold text-[14px]">{title}</span>
      <span className="text-white/65 text-[12px] leading-snug">{text}</span>
    </span>
  </label>
);

// KVKK açık rıza: iki ayrı, varsayılanı kapalı seçim. Reddetmek kabul etmek kadar kolay; seçim
// Ayarlar'dan her zaman değiştirilebilir. AB/BK/İsviçre'de reklam onayını ayrıca Google'ın penceresi sorar.
export default function ConsentSheet() {
  const asked = useGameStore(s => s.analyticsConsent !== null && s.adsConsent !== null);
  const [analytics, setAnalytics] = useState(false);
  const [ads, setAds] = useState(false);
  if (asked) return null;
  const save = (a, d) => { setAnalyticsConsent(a); useGameStore.setState({ adsConsent: d }); };
  return (
    <div className="fixed inset-0 z-[160] bg-black/55 flex items-end fade-in">
      <div role="dialog" aria-labelledby="consent-title" className="w-full rounded-t-3xl p-5 pb-8 flex flex-col gap-3" style={{ background: '#10263f', borderTop: '1px solid var(--border)' }}>
        <h2 id="consent-title" className="text-white font-black text-[18px]">{L("Gizlilik tercihlerin")}</h2>
        <p className="text-white/75 text-[13px] leading-relaxed">
          {L("Oyunu oynamak için hiçbirine izin vermen gerekmez. Adın, e-postan ya da konumun toplanmaz.")}{' '}
          <a href={KVKK_URL} target="_blank" rel="noopener noreferrer" className="underline font-bold text-white">{L("Aydınlatma metni")}</a>
        </p>
        <Choice on={analytics} set={setAnalytics} title={L("Anonim kullanım verisi")}
          text={L("Hangi seviyede zorlandığın, hangi ipucunu kullandığın gibi bilgiler; oyunu geliştirmek için. PostHog (AB sunucuları) aracılığıyla işlenir.")} />
        <Choice on={ads} set={setAds} title={L("Kişiselleştirilmiş reklam")}
          text={L("Google AdMob reklam kimliğini kullanarak ilgi alanına göre reklam gösterir; veriler yurt dışında işlenir. İzin vermezsen yine reklam görürsün ama kişiselleştirilmez.")} />
        <div className="grid grid-cols-2 gap-2 mt-1">
          <button onClick={() => save(analytics, ads)} className="py-3 rounded-full bg-white/10 text-white font-bold text-[14px]">{L("Seçilenleri kaydet")}</button>
          <button onClick={() => save(true, true)} className="py-3 rounded-full bg-green-600 text-white font-black text-[14px]">{L("Tümüne izin ver")}</button>
        </div>
      </div>
    </div>
  );
}
