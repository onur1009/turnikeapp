import React, { useState } from 'react';
import { useGameStore, VAULT_SIZE, VAULT_REWARD } from '../store/gameStore';
import { useTranslation } from '../utils/i18n';
import ScreenHeader from './ScreenHeader';
import { formatKurus } from '../utils/format';
import { LINES, getStationForLevel, getNetworkProgress } from '../utils/transitNetwork';
import { isRewardedAdSupported, showRewardedAd } from '../utils/adService';
import { track } from '../utils/analytics';

// İstanbulkart: kart görünümü + kişiselleştirme + bakiye yükleme modülleri + işlem geçmişi.
// Bakiye oyun parasıdır; gerçek para alınmaz. Kaynaklar: ödüllü reklam, günlük yükleme,
// ekstra kelime kavanozu ve durak ödülleri (son ikisi oyunda kazanılır, burada gösterilir).

export const AD_REWARD = 50; // kuruş
export const AD_DAILY_LIMIT = 5;
export const DAILY_TOP_UP = 30;

const CARD_COLORS = ['#1d4ed8', '#dc2626', '#16a34a', '#ea580c', '#7c3aed', '#0f172a', '#0e7490', '#be185d'];

const PATTERNS = [
  { id: 'plain', label: 'Düz' },
  { id: 'lines', label: 'Hatlar' },
  { id: 'bosphorus', label: 'Boğaz' },
  { id: 'mosaic', label: 'Çini' },
  { id: 'night', label: 'Gece' },
];

const TOP_UP_LABELS = { ad: 'Reklam ödülü', daily: 'Günlük yükleme', duel: 'Düello ödülü', puzzle: 'Günün Seferi', mission: 'Günlük görev', streak: 'Seri ödülü', event: 'Hafta sonu etkinliği' };

const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Kart üstü desen katmanı (SVG, kartın rengine bindirilir)
const CardPattern = ({ pattern }) => {
  if (pattern === 'lines') return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 200" preserveAspectRatio="none" aria-hidden="true">
      {['#16a34a', '#dc2626', '#eab308', '#0ea5e9', '#db2777'].map((c, i) => (
        <path key={c} d={`M-20 ${150 - i * 14} C 80 ${120 - i * 14}, 160 ${190 - i * 14}, 340 ${60 - i * 10}`} stroke={c} strokeWidth="5" fill="none" opacity="0.55" />
      ))}
    </svg>
  );
  if (pattern === 'bosphorus') return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 200" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 150 Q80 135 160 150 T320 145 V200 H0 Z" fill="#ffffff" opacity="0.14" />
      <path d="M40 150 V110 M200 150 V110" stroke="#ffffff" strokeWidth="4" opacity="0.35" />
      <path d="M0 140 Q40 120 40 110 Q120 150 200 110 Q240 120 320 135" stroke="#ffffff" strokeWidth="2" fill="none" opacity="0.35" />
      <path d="M250 150 V95 l6 -14 l6 14 V150 Z M235 150 V125 h45 V150 Z" fill="#ffffff" opacity="0.2" />
    </svg>
  );
  if (pattern === 'mosaic') return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <pattern id="cini" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M20 2 L38 20 L20 38 L2 20 Z" fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.28" />
          <circle cx="20" cy="20" r="5" fill="#ffffff" opacity="0.18" />
        </pattern>
      </defs>
      <rect width="320" height="200" fill="url(#cini)" />
    </svg>
  );
  if (pattern === 'night') return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 200" preserveAspectRatio="none" aria-hidden="true">
      <rect width="320" height="200" fill="#020617" opacity="0.45" />
      {Array.from({ length: 24 }, (_, i) => <circle key={i} cx={(i * 47) % 320} cy={(i * 29) % 110} r="1.2" fill="#ffffff" opacity="0.7" />)}
      <circle cx="270" cy="40" r="14" fill="#fde68a" opacity="0.85" />
      <path d="M0 200 V160 h20 v-15 h18 v20 h25 v-30 l8 -12 l8 12 v30 h30 v-18 h22 v33 h40 v-25 h20 v25 h40 v-10 h30 v10 h59 V200 Z" fill="#020617" opacity="0.7" />
    </svg>
  );
  return (
    <>
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
      <div className="absolute -bottom-12 -left-8 w-36 h-36 rounded-full bg-white/5" />
    </>
  );
};

export const IstanbulCard = ({ color, pattern, name, sticker, balance, onClick }) => {
  const stickerLine = LINES.find(l => l.id === sticker);
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full aspect-[1.586/1] rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden text-left active:scale-[0.98] transition-transform"
      style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)`, boxShadow: '0 18px 36px rgba(0,0,0,0.35)' }}
      aria-label="Kartı kişiselleştir"
    >
      <CardPattern pattern={pattern} />
      <div className="flex justify-between items-start relative">
        <span className="text-white font-black text-[18px] tracking-tight">İstanbul<span className="font-semibold">kart</span></span>
        {stickerLine && <span className="line-badge" style={{ background: stickerLine.color }}>{stickerLine.code}</span>}
      </div>
      {/* Temassız çip */}
      <div className="relative w-10 h-7 rounded-md bg-gradient-to-br from-amber-200 to-amber-500 opacity-90" />
      <div className="relative flex items-end justify-between gap-2">
        <div className="min-w-0">
          <p className="text-white/70 text-[11px] font-bold uppercase tracking-wider">Bakiye</p>
          <p className="text-white text-[34px] leading-none font-black tracking-tight tabular-nums">{formatKurus(balance)}</p>
        </div>
        <p className="text-white/85 text-[12px] font-bold uppercase tracking-widest truncate max-w-[45%]">{name || 'YOLCU'}</p>
      </div>
    </button>
  );
};

const Module = ({ icon, iconColor, title, subtitle, action, disabled, onClick, progress }) => (
  <div className="card-panel !rounded-2xl p-4 flex items-center gap-3">
    <span aria-hidden="true" className="material-symbols-outlined text-[26px] shrink-0" style={{ color: iconColor, fontVariationSettings: "'FILL' 1" }}>{icon}</span>
    <div className="flex-1 min-w-0">
      <p className="text-white font-extrabold text-[14px] leading-tight">{title}</p>
      <p className="text-white/60 text-[12px] font-semibold mt-0.5">{subtitle}</p>
      {progress != null && (
        <div className="h-1.5 rounded-full bg-white/10 mt-2 overflow-hidden">
          <div className="h-full rounded-full bg-amber-400" style={{ width: `${Math.min(100, progress * 100)}%` }} />
        </div>
      )}
    </div>
    {action && (
      <button onClick={onClick} disabled={disabled}
        className="shrink-0 px-4 py-2.5 rounded-full font-black text-[13px] text-white bg-green-600 active:scale-95 transition-transform disabled:opacity-40 disabled:active:scale-100">
        {action}
      </button>
    )}
  </div>
);

const AkbilScreen = ({ onBack }) => {
  const { t } = useTranslation();
  const balance = useGameStore(s => s.balance);
  const cardColor = useGameStore(s => s.cardColor);
  const cardPattern = useGameStore(s => s.cardPattern);
  const cardName = useGameStore(s => s.cardName);
  const cardSticker = useGameStore(s => s.cardSticker);
  const topUpHistory = useGameStore(s => s.topUpHistory);
  const adRewardDate = useGameStore(s => s.adRewardDate);
  const adRewardCount = useGameStore(s => s.adRewardCount);
  const dailyTopUpDate = useGameStore(s => s.dailyTopUpDate);
  const vaultCount = useGameStore(s => s.vaultWords.length);
  const maxUnlockedLevel = useGameStore(s => s.maxUnlockedLevel);
  const setSettings = useGameStore(s => s.setSettings);
  const recordTopUp = useGameStore(s => s.recordTopUp);
  const registerAdReward = useGameStore(s => s.registerAdReward);

  const [customizing, setCustomizing] = useState(false);
  const [adState, setAdState] = useState('idle'); // idle | loading | failed
  const [toast, setToast] = useState(null);

  const today = todayKey();
  const adsLeft = AD_DAILY_LIMIT - (adRewardDate === today ? adRewardCount : 0);
  const dailyClaimed = dailyTopUpDate === today;
  const adsSupported = isRewardedAdSupported();
  const station = getStationForLevel(maxUnlockedLevel);
  const progress = getNetworkProgress(maxUnlockedLevel + 1);
  // Kart rozeti: oyuncunun girdiği (kilidi açık) hatlar
  const stickerLines = LINES.filter(l => !progress.lines[l.id].locked);

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2200); };

  const watchAd = async () => {
    setAdState('loading');
    const rewarded = await showRewardedAd();
    track('ad_rewarded', { completed: rewarded });
    if (rewarded) {
      registerAdReward(today);
      recordTopUp('ad', AD_REWARD);
      flash(`+${formatKurus(AD_REWARD)} yüklendi`);
      setAdState('idle');
    } else {
      setAdState('failed');
    }
  };

  const claimDaily = () => {
    setSettings({ dailyTopUpDate: today });
    recordTopUp('daily', DAILY_TOP_UP);
    track('top_up_daily');
    flash(`+${formatKurus(DAILY_TOP_UP)} yüklendi`);
  };

  return (
    <main className="flex-1 w-full flex flex-col relative z-10 fade-in overflow-y-auto" style={{ overscrollBehavior: 'contain' }}>
      <div className="w-full max-w-sm mx-auto px-4 pb-8">
        <ScreenHeader title={t('akbil')} onBack={onBack} className="px-0" />

        <IstanbulCard color={cardColor} pattern={cardPattern} name={cardName} sticker={cardSticker} balance={balance}
          onClick={() => setCustomizing(c => !c)} />
        <p className="text-center text-white/50 text-[12px] font-semibold mt-2 mb-4">
          {customizing ? 'Kartını düzenliyorsun' : 'Kartına dokunarak kişiselleştir'}
        </p>

        {customizing && (
          <section className="card-panel !rounded-2xl p-4 mb-4 flex flex-col gap-4 fade-in">
            <div>
              <h3 className="kart-label">Renk</h3>
              <div className="flex gap-2 flex-wrap">
                {CARD_COLORS.map(c => (
                  <button key={c} aria-label={`Renk ${c}`} aria-pressed={cardColor === c} onClick={() => setSettings({ cardColor: c })}
                    className={`w-9 h-9 rounded-full transition-transform ${cardColor === c ? 'ring-2 ring-white scale-110' : ''}`} style={{ background: c }} />
                ))}
              </div>
            </div>
            <div>
              <h3 className="kart-label">Desen</h3>
              <div className="flex gap-2 flex-wrap">
                {PATTERNS.map(p => (
                  <button key={p.id} aria-pressed={cardPattern === p.id} onClick={() => setSettings({ cardPattern: p.id })}
                    className={`kart-chip ${cardPattern === p.id ? 'is-on' : ''}`}>{p.label}</button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="kart-label">Hat rozeti</h3>
              <div className="flex gap-1.5 flex-wrap">
                <button aria-pressed={!cardSticker} onClick={() => setSettings({ cardSticker: null })} className={`kart-chip ${!cardSticker ? 'is-on' : ''}`}>Yok</button>
                {stickerLines.map(l => (
                  <button key={l.id} aria-pressed={cardSticker === l.id} onClick={() => setSettings({ cardSticker: l.id })}
                    className={`line-badge transition-transform ${cardSticker === l.id ? 'ring-2 ring-white scale-110' : 'opacity-80'}`} style={{ background: l.color }}>{l.code}</button>
                ))}
              </div>
            </div>
            <label className="block">
              <span className="kart-label block">Kart üstündeki isim</span>
              <input value={cardName} maxLength={16} placeholder="YOLCU"
                onChange={e => setSettings({ cardName: e.target.value.toLocaleUpperCase('tr-TR') })}
                className="w-full rounded-xl bg-white/10 border border-white/15 px-3 py-2.5 text-white font-bold tracking-widest uppercase placeholder:text-white/30 outline-none focus:border-white/40" />
            </label>
          </section>
        )}

        {toast && (
          <div role="status" className="mb-3 p-3 rounded-xl text-center bg-green-600/25 border border-green-500/40 text-green-300 font-bold text-[14px] fade-in">✓ {toast}</div>
        )}

        <h2 className="kart-label mt-1">Bakiye yükle</h2>
        <div className="flex flex-col gap-2.5">
          <Module
            icon="smart_display" iconColor="#60a5fa"
            title={`Reklam izle, ${formatKurus(AD_REWARD)} yükle`}
            subtitle={!adsSupported
              ? 'Yalnızca Android uygulamasında'
              : adState === 'failed'
                ? 'Reklam yüklenemedi, biraz sonra tekrar dene'
                : `Bugün ${Math.max(0, adsLeft)}/${AD_DAILY_LIMIT} hak kaldı`}
            action={adState === 'loading' ? '...' : 'İzle'}
            disabled={!adsSupported || adsLeft <= 0 || adState === 'loading'}
            onClick={watchAd}
          />
          <Module
            icon="calendar_today" iconColor="#34d399"
            title={`Günlük yükleme ${formatKurus(DAILY_TOP_UP)}`}
            subtitle={dailyClaimed ? 'Bugün alındı, yarın yine gel' : 'Her gün bir kez ücretsiz'}
            action={dailyClaimed ? 'Alındı' : 'Al'}
            disabled={dailyClaimed}
            onClick={claimDaily}
          />
          <Module
            icon="savings" iconColor="#fbbf24"
            title={`Kelime kavanozu: ${vaultCount}/${VAULT_SIZE}`}
            subtitle={`Izgarada olmayan ${VAULT_SIZE} kelime bul, ${formatKurus(VAULT_REWARD)} kazan`}
            progress={vaultCount / VAULT_SIZE}
          />
          <Module
            icon="flag" iconColor={station.color}
            title={`Durak ödülü: ${station.displayName}`}
            subtitle={`Bölüm ${station.leg}/${station.legsPerStation} · durağı bitirince ${formatKurus(100)}`}
            progress={(station.leg - 1) / station.legsPerStation}
          />
        </div>

        <h2 className="kart-label mt-5">Son işlemler</h2>
        {topUpHistory.length === 0 ? (
          <p className="text-white/45 text-[13px] font-semibold">Henüz yükleme yok.</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {topUpHistory.slice(0, 10).map((h, i) => (
              <li key={i} className="flex items-center justify-between rounded-xl px-3 py-2.5 bg-white/5">
                <span>
                  <span className="block text-white/90 text-[13px] font-bold">{TOP_UP_LABELS[h.type] || h.type}</span>
                  <span className="block text-white/45 text-[11px] font-semibold">{new Date(h.at).toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                </span>
                <span className="text-green-400 font-black text-[14px] tabular-nums">+{formatKurus(h.amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
};

export default AkbilScreen;
