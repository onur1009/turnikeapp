// Geçiş reklamı kuralları. Herkese: 12. seviyeden sonra, en az 3 bölümde bir, oturumun ilk iki
// bölümünde değil, son ödüllü reklamdan 2 dk sonra; düello ve Günün Seferi'nde asla.
// (Eskiden yalnızca B grubuna ve 20. seviyeden sonra gösteriliyordu; oyuncuların çoğu 20'ye varmadan
// ayrıldığı için neredeyse hiç gelir getirmiyordu.) adGroup analitikte kalır: A grubu artık yalnızca
// etiket, ileride başka bir deney için kullanılabilir.
import { useGameStore } from '../store/gameStore';

export const INTERSTITIAL_MIN_LEVEL = 12;
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
  if (levelIndex + 1 < INTERSTITIAL_MIN_LEVEL || sessionLevels < 2) return false;
  if (since < INTERSTITIAL_EVERY) return false;
  if (Date.now() - (s.lastRewardedAt || 0) < REWARDED_COOLDOWN_MS) return false;
  return true;
};

export const noteInterstitialShown = () => useGameStore.setState({ levelsSinceInterstitial: 0 });
