// Reklamlar (AdMob): ödüllü video ve geçiş reklamı. Yalnızca Android/iOS uygulamasında çalışır.
// Şimdilik Google'ın herkese açık TEST kimlikleri kullanılıyor: gerçek gelir getirmez ama akışı
// uçtan uca dener. Yayına çıkmadan önce kendi AdMob kimliklerini buraya ve
// android/app/src/main/AndroidManifest.xml içindeki APPLICATION_ID'ye yaz, IS_TESTING'i false yap.
// Geliştirme sunucusunda (npm run dev) web'de 1,5 sn'lik sahte bir "test reklamı" çalışır ki
// reklam akışları tarayıcıda denenebilsin; üretim web sürümünde reklam yoktur.
import { Capacitor } from '@capacitor/core';

const AD_IDS = {
  android: { rewarded: 'ca-app-pub-3940256099942544/5224354917', interstitial: 'ca-app-pub-3940256099942544/1033173712' }, // Google test
  ios: { rewarded: 'ca-app-pub-3940256099942544/1712485313', interstitial: 'ca-app-pub-3940256099942544/4411468910' },
};
const IS_TESTING = true;
const DEV_SIMULATE = import.meta.env.DEV && !Capacitor.isNativePlatform();

// Dikkat: Capacitor eklenti nesnesi bir Promise'ten döndürülmemeli. Döndürülürse JS onu
// "thenable" sanıp AdMob.then() çağırır; Android'de bu "not implemented" hatası verir ve
// Promise hiç sonuçlanmaz (düğme sonsuza kadar "…" kalıyordu). Eklenti modül değişkeninde tutulur.
let AdMob = null;
let initPromise = null;
const ensureAdMob = async () => {
  if (!AdMob) AdMob = (await import('@capacitor-community/admob')).AdMob;
  if (!initPromise) initPromise = AdMob.initialize({ initializeForTesting: IS_TESTING });
  await initPromise;
};
// Reklam akışı hiçbir durumda oyunu kilitlemesin: 45 sn'de sonuçlanmazsa vazgeç
const withTimeout = (p, ms = 45000) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('ad_timeout')), ms))]);
const ids = () => AD_IDS[Capacitor.getPlatform()] || AD_IDS.android;
const simulate = () => new Promise(r => setTimeout(() => r(true), 1500));

export const isRewardedAdSupported = () => Capacitor.isNativePlatform() || DEV_SIMULATE;

// Reklam sonuna kadar izlenirse true, kapatılır/yüklenemezse false döner
export const showRewardedAd = async () => {
  if (DEV_SIMULATE) return simulate();
  if (!Capacitor.isNativePlatform()) return false;
  try {
    await withTimeout(ensureAdMob());
    await withTimeout(AdMob.prepareRewardVideoAd({ adId: ids().rewarded, isTesting: IS_TESTING }));
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
    await withTimeout(AdMob.prepareInterstitial({ adId: ids().interstitial, isTesting: IS_TESTING }));
    await withTimeout(AdMob.showInterstitial(), 180000);
    return true;
  } catch {
    return false;
  }
};
