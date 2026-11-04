import { useState } from 'react';
import { deleteMyData } from '../utils/cloudGame';
import { KVKK_URL, PRIVACY_URL } from '../utils/legal';
import { setAnalyticsConsent } from '../utils/analytics';
import { isPrivacyOptionsRequired, showPrivacyOptions } from '../utils/adService';
import { useGameStore } from '../store/gameStore';
import { useTranslation, L } from '../utils/i18n';
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
  const adsConsent = useGameStore(state => state.adsConsent);
  const [deleteState, setDeleteState] = useState(null); // null | 'confirm' | 'busy' | 'done' | 'error'
  const deleteNow = async () => {
    setDeleteState('busy');
    try {
      await deleteMyData();
      // Sunucu kaydına bağlı yerel bilgiler de sıfırlanır; ilerleme ve bakiye cihazda kalır
      useGameStore.setState(s => ({ username: '', duels: [], leagueState: { ...s.leagueState, groupNo: null, cachedGroup: [], userId: null, points: 0 } }));
      setDeleteState('done');
    } catch {
      setDeleteState('error');
    }
  };
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
                <span aria-hidden="true" className="material-symbols-outlined text-blue-400">volume_up</span>{L("Ses efektleri")}</span>
              <Toggle on={soundEnabled} onClick={() => setSettings({ soundEnabled: !soundEnabled })} label={L("Ses efektleri")} />
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-white font-bold flex items-center gap-2">
                <span aria-hidden="true" className="material-symbols-outlined text-orange-400">vibration</span>
                {t('haptic')}
              </span>
              <Toggle on={hapticEnabled} onClick={() => setSettings({ hapticEnabled: !hapticEnabled })} label={t('haptic')} />
            </div>

            <Row icon="music_note" color="text-pink-300" title={L("Müzik")} hint={L("Arka plan müziği")}
              on={musicEnabled} onClick={() => setSettings({ musicEnabled: !musicEnabled })} />
            {musicEnabled && (
              <label className="flex items-center gap-3 mt-3 text-white/70 text-[12px] font-bold">
                <span className="shrink-0">{L("Müzik seviyesi")}</span>
                <input type="range" min="0" max="1" step="0.05" value={musicVolume ?? 0.5} aria-label={L("Müzik seviyesi")}
                  onChange={e => setSettings({ musicVolume: Number(e.target.value) })} className="flex-1 accent-pink-400" />
              </label>
            )}
            <Row icon="campaign" color="text-amber-300" title={L("Durak anonsu")} hint={L("Yeni durakta tabela ve sesli anons")}
              on={announceEnabled} onClick={() => setSettings({ announceEnabled: !announceEnabled })} />
            <Row icon="format_size" color="text-sky-300" title={L("Büyük harfler")} hint={L("Izgara ve çarktaki harfler büyür")}
              on={largeText} onClick={() => setSettings({ largeText: !largeText })} />
            <Row icon="contrast" color="text-white" title={L("Yüksek kontrast")} hint={L("Taşlar ve yazılar daha belirgin")}
              on={highContrast} onClick={() => setSettings({ highContrast: !highContrast })} />

            {/* KVKK: anonim kullanım verisi rızası */}
            <div className="flex justify-between items-center mt-4 gap-3">
              <span className="text-white font-bold flex items-center gap-2 min-w-0">
                <span aria-hidden="true" className="material-symbols-outlined text-teal-400">insights</span>
                <span className="flex flex-col"><span>{L("Anonim kullanım verisi")}</span><span className="text-white/50 text-[11px] font-semibold">{L("Ad, e-posta, konum toplanmaz")}</span></span>
              </span>
              <Toggle on={analyticsConsent === true} onClick={() => setAnalyticsConsent(analyticsConsent !== true)} label={L("Anonim kullanım verisi")} />
            </div>
            <Row icon="ads_click" color="text-amber-300" title={L("Kişiselleştirilmiş reklam")} hint={L("Kapalıyken reklamlar ilgi alanına göre seçilmez")}
              on={adsConsent === true} onClick={() => useGameStore.setState({ adsConsent: adsConsent !== true })} />
            {/* GDPR: AB/BK'daki oyuncu reklam onayını her zaman değiştirebilmeli (yalnızca gerekince görünür) */}
            {isPrivacyOptionsRequired() && (
              <button onClick={showPrivacyOptions} className="mt-4 w-full flex items-center gap-2 text-white font-bold text-left">
                <span aria-hidden="true" className="material-symbols-outlined text-amber-300">shield</span>
                {L("Reklam gizlilik seçenekleri")}
              </button>
            )}
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[13px] font-bold">
              <a href={KVKK_URL} target="_blank" rel="noopener noreferrer" className="text-white/80 underline">{L("Aydınlatma metni")} <span aria-hidden="true">↗</span></a>
              <a href={PRIVACY_URL} target="_blank" rel="noopener noreferrer" className="text-white/80 underline">{L("Gizlilik politikası")} <span aria-hidden="true">↗</span></a>
            </div>
            {/* KVKK m.7 / Play: sunucudaki veriyi silme; iki adımlı onay (confirm() WebView'da güvenilmez) */}
            <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-2">
              {deleteState === 'done' ? (
                <p className="text-green-300 text-[13px] font-bold" role="status">{L("Sunucudaki verilerin silindi.")}</p>
              ) : deleteState === 'confirm' ? (
                <>
                  <p className="text-white/80 text-[13px]">{L("Kullanıcı adın, skorların, düello ve lig kayıtların sunucudan kalıcı olarak silinir. Cihazdaki ilerlemen kalır.")}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setDeleteState(null)} className="py-2.5 rounded-full bg-white/10 text-white font-bold text-[13px]">{L("Vazgeç")}</button>
                    <button onClick={deleteNow} className="py-2.5 rounded-full bg-red-600 text-white font-black text-[13px]">{L("Evet, sil")}</button>
                  </div>
                </>
              ) : (
                <button onClick={() => setDeleteState('confirm')} disabled={deleteState === 'busy'} className="w-full flex items-center gap-2 text-red-300 font-bold text-left text-[14px]">
                  <span aria-hidden="true" className="material-symbols-outlined">delete</span>
                  {deleteState === 'busy' ? L("Siliniyor…") : deleteState === 'error' ? L("Silinemedi, internet bağlantını kontrol edip tekrar dene") : L("Sunucudaki verilerimi sil")}
                </button>
              )}
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <h3 className="text-white/50 text-sm font-bold mb-3 uppercase tracking-wider">{t('theme')}</h3>
            <div className="flex flex-col gap-2">
              {['dark', 'light', 'retro'].map((themeOption) => (
                <button
                  key={themeOption}
                  onClick={() => setSettings({ theme: themeOption })}
                  aria-pressed={theme === themeOption}
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
              >{L("Türkçe")}</button>
              <button
                onClick={() => setSettings({ language: 'en' })}
                className={`flex-1 py-3 rounded-xl font-bold text-sm tracking-wide transition-colors ${language === 'en' ? 'bg-blue-600 text-white' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
              >{L("English")}</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default SettingsScreen;
