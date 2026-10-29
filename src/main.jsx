import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { useGameStore, GAME_STORAGE_KEY } from './store/gameStore'
import { restoreFromBackup } from './utils/persistStorage'
import { initAnalytics, track } from './utils/analytics'
import { Capacitor } from '@capacitor/core'
import { registerSW } from 'virtual:pwa-register'
import { initMusic } from './utils/soundManager'

// Çevrimdışı önbellek (PWA) yalnızca web'de. Android uygulamasında dosyalar zaten APK'nın
// içinde; servis çalışanı orada eski sürümün kodunu sunup yeni APK'yı bozuyordu
// (eski kod, yeni pakette olmayan dosyaları istiyordu). Önceki sürümlerden kalan kayıt ve
// önbellekler silinir, temizlik olduysa sayfa bir kez yeniden yüklenir.
const setupServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) return;
  if (!Capacitor.isNativePlatform()) { registerSW({ immediate: true }); return; }
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map(r => r.unregister()));
    if (window.caches) { const keys = await caches.keys(); await Promise.all(keys.map(k => caches.delete(k))); }
    if (regs.length && !sessionStorage.getItem('turnike_sw_cleaned')) {
      sessionStorage.setItem('turnike_sw_cleaned', '1');
      window.location.reload();
    }
  } catch { /* önbellek temizlenemezse oyun yine açılır */ }
};
setupServiceWorker();

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    track('crash', { message: String(error?.message || error).slice(0, 200), component: String(info?.componentStack || '').trim().split('\n')[0]?.slice(0, 120) });
  }
  render() {
    // Oyuncuya teknik ayrıntı değil, kurtarma yolu gösterilir; ayrıntı rıza varsa ölçüme gider
    if (this.state.hasError) {
      return <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24, background: '#0e2546', color: '#fff', textAlign: 'center', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
        <h2 style={{ margin: 0, fontSize: 22 }}>Bir şeyler ters gitti</h2>
        <p style={{ margin: 0, opacity: 0.75, maxWidth: 320 }}>İlerlemen kayıtlı. Oyunu yeniden yükleyince kaldığın yerden devam edersin.</p>
        <button onClick={() => window.location.reload()} style={{ padding: '12px 28px', borderRadius: 999, border: 0, background: '#22a04b', color: '#fff', fontWeight: 800, fontSize: 15 }}>Yeniden yükle</button>
      </div>;
    }
    return this.props.children; 
  }
}

// Native'de WebView verisi silindiyse kaydı Preferences yedeğinden geri yükle, sonra store'u yeniden oku
const start = async () => {
  await restoreFromBackup([GAME_STORAGE_KEY]);
  await useGameStore.persist.rehydrate();
  initAnalytics();
  initMusic();
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  )
};
start();
