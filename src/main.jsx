import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { useGameStore, GAME_STORAGE_KEY } from './store/gameStore'
import { restoreFromBackup } from './utils/persistStorage'
import { initAnalytics, track } from './utils/analytics'

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
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  )
};
start();
