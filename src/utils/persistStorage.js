import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

// Oyun kaydı localStorage'da senkron kalır (async depolama hidrasyon sırasında state'i sıfırlıyordu).
// Native uygulamada her yazım Capacitor Preferences'a da yedeklenir: Android depolama sıkışınca
// WebView verisini silebilir; açılışta restoreFromBackup kaydı yedekten geri yükler.
const isNative = Capacitor.isNativePlatform();

export const backedUpStorage = {
  getItem: (name) => localStorage.getItem(name),
  setItem: (name, value) => {
    localStorage.setItem(name, value);
    if (isNative) Preferences.set({ key: name, value }).catch(() => {});
  },
  removeItem: (name) => {
    localStorage.removeItem(name);
    if (isNative) Preferences.remove({ key: name }).catch(() => {});
  },
};

// localStorage boşsa yedekten geri yükler; yedek yoksa mevcut kaydı yedeğe alır.
export const restoreFromBackup = async (keys) => {
  if (!isNative) return;
  for (const key of keys) {
    try {
      const local = localStorage.getItem(key);
      const { value: backup } = await Preferences.get({ key });
      if (local === null && backup !== null) localStorage.setItem(key, backup);
      else if (local !== null && backup === null) await Preferences.set({ key, value: local });
    } catch {
      // Yedek okunamazsa oyun localStorage ile devam eder
    }
  }
};
