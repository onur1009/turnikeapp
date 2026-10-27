// Anonim kullanım ölçümü ve hata takibi (KVKK: yalnızca oyuncu açık rıza verdiyse).
// Olaylar her zaman cihazda son 300 kayıtlık bir tamponda tutulur (rıza varsa); VITE_POSTHOG_KEY
// tanımlıysa PostHog'a toplu gönderilir. Anahtar yoksa hiçbir şey cihazdan çıkmaz.
// Kişisel veri gönderilmez: rastgele bir cihaz kimliği, olay adı ve oyunla ilgili sayılar.
import { useGameStore } from '../store/gameStore';

const KEY = import.meta.env.VITE_POSTHOG_KEY;
const HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://eu.i.posthog.com';
const BUFFER_KEY = 'turnike_events';
const ID_KEY = 'turnike_anon_id';
const MAX_BUFFER = 300;

const safeGet = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const safeSet = (k, v) => { try { localStorage.setItem(k, v); } catch { /* özel pencere / dolu depo */ } };

const anonId = () => {
  let id = safeGet(ID_KEY);
  if (!id) {
    id = (crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`);
    safeSet(ID_KEY, id);
  }
  return id;
};

const sessionId = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
let queue = [];

const hasConsent = () => useGameStore.getState().analyticsConsent === true;

export const track = (event, props = {}) => {
  if (!hasConsent()) return;
  const item = { event, props, ts: new Date().toISOString(), session: sessionId };
  try {
    const buf = JSON.parse(safeGet(BUFFER_KEY) || '[]');
    buf.push(item);
    safeSet(BUFFER_KEY, JSON.stringify(buf.slice(-MAX_BUFFER)));
  } catch { /* bozuk tampon: yeniden başlar */ safeSet(BUFFER_KEY, JSON.stringify([item])); }
  if (KEY) queue.push(item);
};

// Cihazdaki son olaylar (Ayarlar > Veri ekranı ve hata ayıklama için)
export const getLocalEvents = () => { try { return JSON.parse(safeGet(BUFFER_KEY) || '[]'); } catch { return []; } };
export const clearLocalEvents = () => safeSet(BUFFER_KEY, '[]');

const payload = () => JSON.stringify({
  api_key: KEY,
  batch: queue.map(e => ({ event: e.event, timestamp: e.ts, properties: { distinct_id: anonId(), $session_id: e.session, ...e.props } })),
});

const flush = (useBeacon = false) => {
  if (!KEY || !queue.length || !hasConsent()) return;
  const body = payload();
  queue = [];
  const url = `${HOST}/batch/`;
  if (useBeacon && navigator.sendBeacon) {
    navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }));
    return;
  }
  fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {});
};

let started = false;
export const initAnalytics = () => {
  if (started) return;
  started = true;
  setInterval(() => flush(), 20000);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(true); });

  // Hata takibi: yakalanmamış hatalar ve reddedilen promise'ler
  window.addEventListener('error', (e) => track('error', { message: String(e.message).slice(0, 200), source: `${e.filename || ''}:${e.lineno || ''}` }));
  window.addEventListener('unhandledrejection', (e) => track('error', { message: String(e.reason?.message || e.reason).slice(0, 200), source: 'promise' }));

  track('app_open', { platform: navigator.userAgent.includes('Android') ? 'android' : 'web' });
};

// Rıza verilir verilmez açılış olayını kaydet; geri çekilirse cihazdaki tampon silinir
export const setAnalyticsConsent = (value) => {
  useGameStore.setState({ analyticsConsent: value });
  if (value) track('consent_given');
  else { queue = []; clearLocalEvents(); }
};
