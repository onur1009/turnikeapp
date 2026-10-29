import React from 'react';
import { setAnalyticsConsent } from '../utils/analytics';
import { useGameStore } from '../store/gameStore';
import { useTranslation } from '../utils/i18n';
import ScreenHeader from './ScreenHeader';

// Ayar satırı ve anahtar: bileşen dışında tanımlı ki her çizimde yeniden oluşup odak kaybolmasın
// Anahtar 48x24 görünür; before: katmanı dokunma alanını 56x48'e genişletir
const Toggle = ({ on, onClick, label }) => (
  <button aria-pressed={on} aria-label={label} onClick={onClick}
    className={`w-12 h-6 shrink-0 rounded-full transition-colors relative before:content-[''] before:absolute before:-inset-x-1 before:-inset-y-3 ${on ? 'bg-green-500' : 'bg-gray-600'}`}>
    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${on ? 'translate-x-7' : 'translate-x-1'}`} />
  </button>
);
const Row = ({ icon, color, title, hint, on, onClick }) => (
  <div className="flex justify-between items-center mt-4 gap-3">
    <span className="text-white font-bold flex items-center gap-2 min-w-0">
      <span aria-hidden="true" className={`material-symbols-outlined ${color}`}>{icon}</span>
      <span className="flex flex-col"><span>{title}</span><span className="text-white/50 text-[11px] font-semibold">{hint}</span></span>
    </span>
    <Toggle on={on} onClick={onClick} label={title} />
  </div>
);

const SettingsScreen = ({ onBack }) => {
  const soundEnabled = useGameStore(state => state.soundEnabled);
  const analyticsConsent = useGameStore(state => state.analyticsConsent);
  const announceEnabled = useGameStore(state => state.announceEnabled);
  const musicEnabled = useGameStore(state => state.musicEnabled);
  const musicVolume = useGameStore(state => state.musicVolume);
  const largeText = useGameStore(state => state.largeText);
  const highContrast = useGameStore(state => state.highContrast);
  const hapticEnabled = useGameStore(state => state.hapticEnabled);
  const theme = useGameStore(state => state.theme);
  const language = useGameStore(state => state.language);
  const setSettings = useGameStore(state => state.setSettings);
  const { t } = useTranslation();

  return (
    <main className="flex-1 w-full flex flex-col p-6 pb-20 relative z-10 fade-in items-center">
      <div className="w-full max-w-sm">
        <ScreenHeader title={t('settings')} onBack={onBack} className="px-0 pt-0 mb-5" />

        <div className="flex flex-col gap-6">
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="flex justify-between items-center mb-4">
              <span className="text-white font-bold flex items-center gap-2">
                <span aria-hidden="true" className="material-symbols-outlined text-blue-400">volume_up</span>
                Ses efektleri
              </span>
              <Toggle on={soundEnabled} onClick={() => setSettings({ soundEnabled: !soundEnabled })} label="Ses efektleri" />
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-white font-bold flex items-center gap-2">
                <span aria-hidden="true" className="material-symbols-outlined text-orange-400">vibration</span>
                {t('haptic')}
              </span>
              <Toggle on={hapticEnabled} onClick={() => setSettings({ hapticEnabled: !hapticEnabled })} label={t('haptic')} />
            </div>

            <Row icon="music_note" color="text-pink-300" title="Müzik" hint="Arka plan müziği"
              on={musicEnabled} onClick={() => setSettings({ musicEnabled: !musicEnabled })} />
            {musicEnabled && (
              <label className="flex items-center gap-3 mt-3 text-white/70 text-[12px] font-bold">
                <span className="shrink-0">Müzik seviyesi</span>
                <input type="range" min="0" max="1" step="0.05" value={musicVolume ?? 0.5} aria-label="Müzik seviyesi"
                  onChange={e => setSettings({ musicVolume: Number(e.target.value) })} className="flex-1 accent-pink-400" />
              </label>
            )}
            <Row icon="campaign" color="text-amber-300" title="Durak anonsu" hint="Yeni durakta tabela ve sesli anons"
              on={announceEnabled} onClick={() => setSettings({ announceEnabled: !announceEnabled })} />
            <Row icon="format_size" color="text-sky-300" title="Büyük harfler" hint="Izgara ve çarktaki harfler büyür"
              on={largeText} onClick={() => setSettings({ largeText: !largeText })} />
            <Row icon="contrast" color="text-white" title="Yüksek kontrast" hint="Taşlar ve yazılar daha belirgin"
              on={highContrast} onClick={() => setSettings({ highContrast: !highContrast })} />

            {/* KVKK: anonim kullanım verisi rızası */}
            <div className="flex justify-between items-center mt-4 gap-3">
              <span className="text-white font-bold flex items-center gap-2 min-w-0">
                <span aria-hidden="true" className="material-symbols-outlined text-teal-400">insights</span>
                <span className="flex flex-col"><span>Anonim kullanım verisi</span><span className="text-white/50 text-[11px] font-semibold">Ad, e-posta, konum toplanmaz</span></span>
              </span>
              <Toggle on={analyticsConsent === true} onClick={() => setAnalyticsConsent(analyticsConsent !== true)} label="Anonim kullanım verisi" />
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <h3 className="text-white/50 text-sm font-bold mb-3 uppercase tracking-wider">{t('theme')}</h3>
            <div className="flex flex-col gap-2">
              {['dark', 'light', 'retro'].map((themeOption) => (
                <button
                  key={themeOption}
                  onClick={() => setSettings({ theme: themeOption })}
                  className={`w-full py-3 rounded-xl font-bold text-sm tracking-wide transition-colors flex items-center justify-between px-4 ${theme === themeOption ? 'bg-blue-600 text-white' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
                >
                  {t(`${themeOption}_theme`)}
                  {theme === themeOption && <span aria-hidden="true" className="material-symbols-outlined">check_circle</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <h3 className="text-white/50 text-sm font-bold mb-3 uppercase tracking-wider">{t('lang')}</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setSettings({ language: 'tr' })}
                className={`flex-1 py-3 rounded-xl font-bold text-sm tracking-wide transition-colors ${language === 'tr' ? 'bg-red-600 text-white' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
              >
                Türkçe
              </button>
              <button
                onClick={() => setSettings({ language: 'en' })}
                className={`flex-1 py-3 rounded-xl font-bold text-sm tracking-wide transition-colors ${language === 'en' ? 'bg-blue-600 text-white' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
              >
                English
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default SettingsScreen;
