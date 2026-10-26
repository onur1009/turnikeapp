import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { useGameStore, GAME_STORAGE_KEY } from './store/gameStore'
import { restoreFromBackup } from './utils/persistStorage'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return <div style={{color:'red', background:'white', padding:'20px', zIndex:99999, position:'relative'}}>
        <h2>Something went wrong.</h2>
        <pre style={{whiteSpace:'pre-wrap'}}>{this.state.error.toString()}</pre>
        <pre style={{whiteSpace:'pre-wrap', fontSize:'10px'}}>{this.state.error.stack}</pre>
      </div>;
    }
    return this.props.children; 
  }
}

// Native'de WebView verisi silindiyse kaydı Preferences yedeğinden geri yükle, sonra store'u yeniden oku
const start = async () => {
  await restoreFromBackup([GAME_STORAGE_KEY]);
  await useGameStore.persist.rehydrate();
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  )
};
start();
