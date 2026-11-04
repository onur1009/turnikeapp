// Reklamlar (AdMob): ödüllü video ve geçiş reklamı. Yalnızca Android/iOS uygulamasında çalışır.
// Kimlikler derleme sırasında ortam değişkenlerinden okunur (.env.local ya da CI):
//   VITE_ADMOB_REWARDED_ANDROID, VITE_ADMOB_INTERSTITIAL_ANDROID
// Verilmezse Google'ın herkese açık TEST kimlikleri ve test modu kullanılır (gelir getirmez).
// AdMob uygulama kimliği ayrıca android/gradle.properties ya da ADMOB_APP_ID ortam değişkeniyle
// manifest'e yazılır (android/app/build.gradle).
// Geliştirme sunucusunda (npm run dev) web'de 1,5 sn'lik sahte bir "test reklamı" çalışır ki
// reklam akışları geliştirme sırasında tarayıcıda denenebilsin; oyunun web sürümü yayında değildir.
import { Capacitor } from '@capacitor/core';
import { useGameStore } from '../store/gameStore';

const env = import.meta.env;
const TEST_IDS = {
  android: { rewarded: 'ca-app-pub-3940256099942544/5224354917', interstitial: 'ca-app-pub-3940256099942544/1033173712' },
  ios: { rewarded: 'ca-app-pub-3940256099942544/1712485313', interstitial: 'ca-app-pub-3940256099942544/4411468910' },
};
const LIVE_IDS = {
  android: { rewarded: env.VITE_ADMOB_REWARDED_ANDROID, interstitial: env.VITE_ADMOB_INTERSTITIAL_ANDROID },
  ios: { rewarded: env.VITE_ADMOB_REWARDED_IOS, interstitial: env.VITE_ADMOB_INTERSTITIAL_IOS },
};
const platform = () => (Capacitor.getPlatform() === 'ios' ? 'ios' : 'android');
// Gerçek kimlikler yalnızca ikisi birden verilmişse kullanılır; eksikse test moduna düşülür
const live = () => !!(LIVE_IDS[platform()].rewarded && LIVE_IDS[platform()].interstitial);
export const IS_TESTING = !live();
const ids = () => (live() ? LIVE_IDS : TEST_IDS)[platform()];
const DEV_SIMULATE = env.DEV && !Capacitor.isNativePlatform();
// KVKK: kişiselleştirilmiş reklam için açık rıza yoksa kişiselleştirilmemiş reklam istenir (npa)
const npa = () => useGameStore.getState().adsConsent !== true;

// Dikkat: Capacitor eklenti nesnesi bir Promise'ten döndürülmemeli. Döndürülürse JS onu
// "thenable" sanıp AdMob.then() çağırır; Android'de bu "not implemented" hatası verir ve
// Promise hiç sonuçlanmaz (düğme sonsuza kadar "…" kalıyordu). Eklenti modül değişkeninde tutulur.
let AdMob = null;
let initPromise = null;
let canRequestAds = false;
let privacyOptionsRequired = false;

// Google'ın onay akışı (UMP): her açılışta onay bilgisi istenir, AB/BK/İsviçre'deki oyuncuya gerekirse
// form gösterilir, ancak izin varsa SDK başlatılır. Form AdMob > Gizlilik ve mesajlaşma'da
// yayımlanmış bir GDPR mesajından gelir; mesaj yoksa form çıkmaz, reklamlar sınırlı sunulur.
const startAds = async () => {
  if (!AdMob) AdMob = (await import('@capacitor-community/admob')).AdMob;
  try {
    let info = await AdMob.requestConsentInfo();
    if (info.isConsentFormAvailable && info.status === 'REQUIRED') info = await AdMob.showConsentForm();
    canRequestAds = info.canRequestAds !== false;
    privacyOptionsRequired = info.privacyOptionsRequirementStatus === 'REQUIRED';
  } catch {
    // Onay bilgisi alınamazsa (ağ yok, mesaj tanımlı değil) önceki oturumun kararı geçerlidir
    canRequestAds = true;
  }
  if (canRequestAds) await AdMob.initialize({ initializeForTesting: IS_TESTING });
};
const ensureAdMob = () => {
  if (!initPromise) initPromise = startAds();
  return initPromise;
};

// Uygulama açılışında çağrılır (main.jsx): onay formu oyuncu reklama gelmeden çıksın
export const initAds = () => { if (Capacitor.isNativePlatform()) ensureAdMob().catch(() => {}); };

// Ayarlar'daki "Reklam gizlilik seçenekleri": GDPR onayı geri alınabilmeli
export const isPrivacyOptionsRequired = () => privacyOptionsRequired;
export const showPrivacyOptions = async () => {
  await ensureAdMob();
  try { await AdMob.showPrivacyOptionsForm(); } catch { /* form yok */ }
};

// Reklam akışı hiçbir durumda oyunu kilitlemesin: 45 sn'de sonuçlanmazsa vazgeç
const withTimeout = (p, ms = 45000) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('ad_timeout')), ms))]);
const simulate = () => new Promise(r => setTimeout(() => r(true), 1500));

export const isRewardedAdSupported = () => Capacitor.isNativePlatform() || DEV_SIMULATE;

// Reklam sonuna kadar izlenirse true, kapatılır/yüklenemezse false döner
export const showRewardedAd = async () => {
  if (DEV_SIMULATE) return simulate();
  if (!Capacitor.isNativePlatform()) return false;
  try {
    await withTimeout(ensureAdMob());
    if (!canRequestAds) return false;
    await withTimeout(AdMob.prepareRewardVideoAd({ adId: ids().rewarded, isTesting: IS_TESTING, npa: npa() }));
    const reward = await withTimeout(AdMob.showRewardVideoAd(), 180000);
    return !!reward;
  } catch {
    return false;
  }
};

// Geçiş reklamı: gösterildiyse true. Hata ya da web'de sessizce false (oyunu asla bloklamaz).
export const showInterstitialAd = async () => {
  if (DEV_SIMULATE) return simulate();
  if (!Capacitor.isNativePlatform()) return false;
  try {
    await withTimeout(ensureAdMob());
    if (!canRequestAds) return false;
    await withTimeout(AdMob.prepareInterstitial({ adId: ids().interstitial, isTesting: IS_TESTING, npa: npa() }));
    await withTimeout(AdMob.showInterstitial(), 180000);
    return true;
  } catch {
    return false;
  }
};
