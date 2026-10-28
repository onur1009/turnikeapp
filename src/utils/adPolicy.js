// Geçiş reklamı kuralları ve A/B grubu.
// Oyuncular ilk açılışta rastgele A (geçiş reklamı yok) ya da B (ölçülü geçiş reklamı) grubuna
// girer; grup analitik olaylarına eklenir ki 7. gün bağlılığı iki grupta karşılaştırılabilsin.
// B grubunda: 20. seviyeden sonra, en az 3 bölümde bir, son ödüllü reklamdan 2 dk sonra;
// düello, Günün Seferi ve ilk oturumda asla.
import { useGameStore } from '../store/gameStore';

export const INTERSTITIAL_MIN_LEVEL = 20;
export const INTERSTITIAL_EVERY = 3;
const REWARDED_COOLDOWN_MS = 120000;
let sessionLevels = 0;

export const adGroup = () => {
  let g = useGameStore.getState().adGroup;
  if (!g) { g = Math.random() < 0.5 ? 'A' : 'B'; useGameStore.setState({ adGroup: g }); }
  return g;
};

export const noteRewardedShown = () => useGameStore.setState({ lastRewardedAt: Date.now() });

// Her bölüm sonunda çağrılır; reklam gösterilmeli mi
export const shouldShowInterstitial = (levelIndex) => {
  sessionLevels += 1;
  const s = useGameStore.getState();
  const since = (s.levelsSinceInterstitial || 0) + 1;
  useGameStore.setState({ levelsSinceInterstitial: since });
  if (adGroup() !== 'B') return false;
  if (levelIndex + 1 < INTERSTITIAL_MIN_LEVEL || sessionLevels < 2) return false;
  if (since < INTERSTITIAL_EVERY) return false;
  if (Date.now() - (s.lastRewardedAt || 0) < REWARDED_COOLDOWN_MS) return false;
  return true;
};

export const noteInterstitialShown = () => useGameStore.setState({ levelsSinceInterstitial: 0 });
