// Aylık Hat Pasosu (ücretsiz şerit): oynadıkça XP kazanılır, 20 basamakta ödül açılır.
// Sezon takvim ayıdır; ay değişince XP ve alınan ödüller sıfırlanır, açılan kart desenleri kalır.
// XP: bölüm 10, Günün Seferi 30, günlük görev 20, kazanılan düello 15.
import { useGameStore } from '../store/gameStore';

export const PASS_XP = { level: 10, daily: 30, mission: 20, duelWin: 15 };
export const XP_PER_TIER = 100;

// Basamak ödülleri: coin (kuruş) | hint (adet) | pattern | color (İstanbulkart'a özel)
export const PASS_REWARDS = [
  { type: 'coin', value: 50 }, { type: 'hint', value: 1 }, { type: 'coin', value: 100 }, { type: 'pattern', value: 'lale', label: 'Lale deseni' },
  { type: 'hint', value: 2 }, { type: 'coin', value: 150 }, { type: 'color', value: '#a16207', label: 'Altın kart rengi' }, { type: 'coin', value: 200 },
  { type: 'hint', value: 3 }, { type: 'pattern', value: 'vapur', label: 'Vapur deseni' }, { type: 'coin', value: 250 }, { type: 'hint', value: 3 },
  { type: 'color', value: '#0891b2', label: 'Turkuaz kart rengi' }, { type: 'coin', value: 300 }, { type: 'hint', value: 4 }, { type: 'pattern', value: 'altin', label: 'Altın varak deseni' },
  { type: 'coin', value: 400 }, { type: 'hint', value: 5 }, { type: 'coin', value: 500 }, { type: 'pattern', value: 'kupa', label: 'Şampiyon deseni' },
];

const MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
export const seasonKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
export const seasonName = (key = seasonKey()) => `${MONTHS[Number(key.slice(5)) - 1]} Pasosu`;
export const seasonEndsIn = (d = new Date()) => {
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
  const days = Math.ceil((end - d) / 86400000);
  return `${days} gün`;
};

const current = () => {
  const s = useGameStore.getState().passState;
  return s.season === seasonKey() ? s : { season: seasonKey(), xp: 0, claimed: [] };
};

export const passProgress = () => {
  const s = current();
  return { ...s, tier: Math.min(PASS_REWARDS.length, Math.floor(s.xp / XP_PER_TIER)), intoTier: s.xp % XP_PER_TIER };
};

export const addPassXp = (kind) => {
  const xp = PASS_XP[kind] || 0;
  if (!xp) return;
  const s = current();
  useGameStore.setState({ passState: { ...s, xp: s.xp + xp } });
};

// Basamak ödülünü al (basamak 1'den başlar)
export const claimPassTier = (tierNo) => {
  const s = current();
  const reward = PASS_REWARDS[tierNo - 1];
  if (!reward || s.claimed.includes(tierNo) || Math.floor(s.xp / XP_PER_TIER) < tierNo) return false;
  const store = useGameStore.getState();
  if (reward.type === 'coin') store.recordTopUp('pass', reward.value);
  if (reward.type === 'hint') store.addHints(reward.value);
  if (reward.type === 'pattern' || reward.type === 'color') {
    useGameStore.setState(st => ({ cardUnlocks: st.cardUnlocks.includes(reward.value) ? st.cardUnlocks : [...st.cardUnlocks, reward.value] }));
  }
  useGameStore.setState({ passState: { ...s, claimed: [...s.claimed, tierNo] } });
  return true;
};
