// Ödüllü video reklam (AdMob). Yalnızca Android/iOS uygulamasında çalışır; web'de reklam yok.
// Şimdilik Google'ın herkese açık TEST kimlikleri kullanılıyor: gerçek gelir getirmez ama akışı
// uçtan uca dener. Yayına çıkmadan önce kendi AdMob kimliklerini buraya ve
// android/app/src/main/AndroidManifest.xml içindeki APPLICATION_ID'ye yaz, IS_TESTING'i false yap.
import { Capacitor } from '@capacitor/core';

const REWARDED_AD_ID = {
  android: 'ca-app-pub-3940256099942544/5224354917', // Google test: ödüllü video
  ios: 'ca-app-pub-3940256099942544/1712485313',
};
const IS_TESTING = true;

let initPromise = null;
const loadAdMob = async () => {
  const { AdMob } = await import('@capacitor-community/admob');
  if (!initPromise) initPromise = AdMob.initialize({ initializeForTesting: IS_TESTING });
  await initPromise;
  return AdMob;
};

export const isRewardedAdSupported = () => Capacitor.isNativePlatform();

// Reklam sonuna kadar izlenirse true, kapatılır/yüklenemezse false döner
export const showRewardedAd = async () => {
  if (!isRewardedAdSupported()) return false;
  try {
    const AdMob = await loadAdMob();
    await AdMob.prepareRewardVideoAd({ adId: REWARDED_AD_ID[Capacitor.getPlatform()] || REWARDED_AD_ID.android, isTesting: IS_TESTING });
    const reward = await AdMob.showRewardVideoAd();
    return !!reward;
  } catch {
    return false;
  }
};
