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

let initPromise = null;
const loadAdMob = async () => {
  const { AdMob } = await import('@capacitor-community/admob');
  if (!initPromise) initPromise = AdMob.initialize({ initializeForTesting: IS_TESTING });
  await initPromise;
  return AdMob;
};
const ids = () => AD_IDS[Capacitor.getPlatform()] || AD_IDS.android;
const simulate = () => new Promise(r => setTimeout(() => r(true), 1500));

export const isRewardedAdSupported = () => Capacitor.isNativePlatform() || DEV_SIMULATE;

// Reklam sonuna kadar izlenirse true, kapatılır/yüklenemezse false döner
export const showRewardedAd = async () => {
  if (DEV_SIMULATE) return simulate();
  if (!Capacitor.isNativePlatform()) return false;
  try {
    const AdMob = await loadAdMob();
    await AdMob.prepareRewardVideoAd({ adId: ids().rewarded, isTesting: IS_TESTING });
    const reward = await AdMob.showRewardVideoAd();
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
    const AdMob = await loadAdMob();
    await AdMob.prepareInterstitial({ adId: ids().interstitial, isTesting: IS_TESTING });
    await AdMob.showInterstitial();
    return true;
  } catch {
    return false;
  }
};
