// Haftalık Hat Ligi: 30 kişilik gruplar, pazartesi başlar, pazar biter.
// İlk 5 bir üst lige çıkar, son 5 bir alt lige düşer. Puan: bölüm 10, Günün Seferi 20,
// kazanılan düello 15. Supabase varsa gerçek oyuncular gruba yerleşir; grup 30'a kadar
// isimli botlarla doldurulur (botların puanı haftanın ilerleyişine göre deterministik artar).
// Supabase yoksa grup tamamen botlardan oluşur ve lig cihazda çalışır.
import { useGameStore } from '../store/gameStore';
import { leagueJoin, leagueAddPoints, leagueGroup, currentUserId } from './cloudGame';
import { track } from './analytics';
import { addPassXp } from './pass';

export const TIERS = [
  { id: 1, name: 'Tramvay Ligi', color: '#dc2626', icon: 'tram' },
  { id: 2, name: 'Metrobüs Ligi', color: '#ca8a04', icon: 'directions_bus' },
  { id: 3, name: 'Marmaray Ligi', color: '#0d9488', icon: 'directions_railway' },
  { id: 4, name: 'Metro Ligi', color: '#16a34a', icon: 'subway' },
  { id: 5, name: 'Boğaz Ligi', color: '#2563eb', icon: 'directions_boat' },
];
export const LEAGUE_POINTS = { level: 10, daily: 20, duelWin: 15 };
export const GROUP_SIZE = 30;
export const PROMOTE = 5;
export const DEMOTE = 5;
export const RANK_REWARDS = [[1, 500], [3, 250], [5, 100]]; // sıra ≤ n → kuruş

// ISO hafta anahtarı, ör. 2026-W44 (pazartesi başlar)
export const weekKey = (d = new Date()) => {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((t - yearStart) / 86400000 + 1) / 7);
  return `${t.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
};

// Haftanın ne kadarı geçti (0..1), pazartesi 00:00'dan itibaren
export const weekProgress = (d = new Date()) => {
  const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate() - ((d.getDay() + 6) % 7));
  return Math.min(1, Math.max(0, (d - monday) / (7 * 86400000)));
};

export const weekEndsIn = (d = new Date()) => {
  const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate() - ((d.getDay() + 6) % 7));
  const end = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 7);
  const s = Math.max(0, Math.floor((end - d) / 1000));
  const days = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600);
  return days > 0 ? `${days} g ${h} sa` : `${h} sa ${Math.floor((s % 3600) / 60)} dk`;
};

const BOT_NAMES = ['Ayşe', 'Mert', 'Zeynep', 'Emir', 'Elif', 'Can', 'Defne', 'Kerem', 'Ece', 'Baran', 'Selin', 'Yusuf',
  'İrem', 'Arda', 'Nehir', 'Ömer', 'Duru', 'Efe', 'Su', 'Kaan', 'Lara', 'Tuna', 'Asya', 'Deniz', 'Melis', 'Onur', 'Ada',
  'Poyraz', 'Naz', 'Doruk', 'Ela', 'Batu', 'Beren', 'Alp', 'Sude', 'Eren'];
const SUFFIX = ['', '', ' K.', ' Y.', ' A.', ' T.', '34', '_ist', ' Ş.', '06'];

const rng = (seed) => {
  let s = seed >>> 0 || 1;
  return () => { s = (Math.imul(s ^ (s >>> 15), 2246822507) + 0x9e3779b9) >>> 0; return (s % 100000) / 100000; };
};
const hash = (str) => { let h = 2166136261; for (const c of str) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };

// Gruptaki botlar: haftaya, lige ve gruba göre sabit; puanları hafta ilerledikçe artar
export const botsFor = (week, tier, groupKey, count, progress = weekProgress()) => {
  const r = rng(hash(`${week}|${tier}|${groupKey}`));
  // Her ad grupta bir kez: aynı ismin iki kez görünmesi botları ele veriyordu (36 ad ≥ 29 bot)
  const pool = [...BOT_NAMES];
  return Array.from({ length: count }, (_, i) => {
    const base = pool.length ? pool.splice(Math.floor(r() * pool.length), 1)[0] : BOT_NAMES[i % BOT_NAMES.length];
    const name = base + SUFFIX[Math.floor(r() * SUFFIX.length)];
    const target = Math.round((60 + r() * 380) * (0.8 + tier * 0.15)); // üst liglerde daha güçlü
    const pace = 0.7 + r() * 0.6; // kimi hafta başında, kimi sonunda hızlanır
    return { id: `bot-${i}`, name, points: Math.round(target * Math.min(1, Math.pow(progress, pace))), bot: true };
  });
};

// Sıralama: ben + gerçek oyuncular + bot doldurma
export const standings = (state, myName, progress = weekProgress()) => {
  const real = (state.cachedGroup || []).filter(p => p.user_id !== state.userId);
  const me = { id: 'me', name: myName, points: state.points, me: true };
  const bots = botsFor(state.week, state.tier, state.groupNo ?? 'local', Math.max(0, GROUP_SIZE - 1 - real.length), progress);
  return [me, ...real.map(p => ({ id: p.user_id, name: p.name, points: p.points })), ...bots]
    .sort((a, b) => b.points - a.points || (a.me ? -1 : b.me ? 1 : 0))
    .map((p, i) => ({ ...p, rank: i + 1 }));
};

const playerName = () => {
  const s = useGameStore.getState();
  return (s.username || s.cardName || 'Yolcu').slice(0, 16);
};

// Hafta değiştiyse geçen haftayı kapat (sıra, terfi/düşme, ödül) ve yeni haftaya geç
export const ensureLeagueWeek = () => {
  const store = useGameStore.getState();
  const state = store.leagueState;
  const week = weekKey();
  if (state.week === week) return state;
  let tier = state.tier;
  let lastResult = state.lastResult;
  if (state.week && state.points > 0) {
    const table = standings(state, playerName(), 1);
    const rank = table.find(p => p.me).rank;
    const move = rank <= PROMOTE ? 1 : rank > GROUP_SIZE - DEMOTE ? -1 : 0;
    tier = Math.max(1, Math.min(5, tier + move));
    const reward = (RANK_REWARDS.find(([n]) => rank <= n) || [0, 0])[1];
    if (reward) store.recordTopUp('league', reward);
    lastResult = { week: state.week, rank, fromTier: state.tier, toTier: tier, reward };
    track('league_week_end', { rank, tier: state.tier, move });
  }
  const next = { week, tier, points: 0, groupNo: null, cachedGroup: [], userId: state.userId || null, lastResult, seenResult: false };
  useGameStore.setState({ leagueState: next });
  return next;
};

// Sunucuya katıl ve grubu çek (Supabase yoksa sessizce bot grubunda kalır)
export const syncLeague = async () => {
  const state = ensureLeagueWeek();
  const joined = await leagueJoin(state.week, playerName(), state.tier);
  if (!joined) return useGameStore.getState().leagueState;
  const userId = await currentUserId();
  const group = await leagueGroup(state.week, joined.tier, joined.group_no);
  const cur = useGameStore.getState().leagueState;
  const merged = { ...cur, tier: joined.tier, groupNo: joined.group_no, userId, points: Math.max(cur.points, joined.points || 0), cachedGroup: group || cur.cachedGroup };
  useGameStore.setState({ leagueState: merged });
  return merged;
};

// Puan ekle (yerelde hemen, sunucuya arka planda)
// Aynı eylemler Hat Pasosu XP'si de kazandırır
export const addLeaguePoints = (kind) => {
  addPassXp(kind);
  const pts = LEAGUE_POINTS[kind] || 0;
  if (!pts) return;
  const state = ensureLeagueWeek();
  useGameStore.setState({ leagueState: { ...state, points: state.points + pts } });
  leagueAddPoints(state.week, pts);
};
