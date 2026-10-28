// Günün Seferi ve günlük görevler: tarih tabanlı, sunucusuz.
// Bulmaca tarihten türeyen seed ile generateDuelLevel'den gelir: aynı gün herkes aynı ızgarayı görür.
// Görevler de tarihten seçilir; ilerleme store'daki dailyStats sayaçlarından okunur.

export const DAILY_REWARD = 50; // kuruş
const LAUNCH = Date.UTC(2026, 9, 1); // Günün Seferi #1 = 1 Ekim 2026

// Yerel takvim günü (gece yarısı yeni bulmaca)
export const todayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const dayNumber = (key = todayKey()) => {
  const [y, m, d] = key.split('-').map(Number);
  return Math.floor((Date.UTC(y, m - 1, d) - LAUNCH) / 86400000) + 1;
};

export const dailySeed = (key = todayKey()) => {
  let h = 2166136261;
  for (const c of `turnike-${key}`) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
  return (Math.abs(h) % 2000000000) + 1;
};

export const yesterdayKey = (key = todayKey()) => {
  const [y, m, d] = key.split('-').map(Number);
  return todayKey(new Date(y, m - 1, d - 1));
};

const mmss = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

// Paylaşım kartı: cevabı vermez. Her bulunan kelime bir 🟩, her yanlış deneme araya 🟥.
export const buildShareText = (result) => {
  const row = result.trail.map(c => (c === 'ok' ? '🟩' : '🟥')).join('');
  return `🚇 Turnike · Günün Seferi #${dayNumber(result.date)}\n⏱️ ${mmss(result.seconds)} · ${result.words} kelime\n${row}`;
};

// --- Günlük görevler ---
// stat: dailyStats içindeki sayaç, goal: hedef, reward: kuruş
export const MISSION_POOL = [
  { id: 'levels3', stat: 'levels', goal: 3, reward: 30, title: '3 bölüm bitir', icon: 'flag' },
  { id: 'levels5', stat: 'levels', goal: 5, reward: 50, title: '5 bölüm bitir', icon: 'flag' },
  { id: 'extra3', stat: 'extraWords', goal: 3, reward: 30, title: 'Kavanoza 3 ekstra kelime at', icon: 'savings' },
  { id: 'flawless1', stat: 'flawless', goal: 1, reward: 40, title: 'Hatasız bir bölüm bitir', icon: 'verified' },
  { id: 'duel1', stat: 'duels', goal: 1, reward: 40, title: 'Bir arkadaşına meydan oku', icon: 'swords' },
  { id: 'daily1', stat: 'daily', goal: 1, reward: 30, title: 'Günün Seferi\'ni çöz', icon: 'today' },
  { id: 'words15', stat: 'words', goal: 15, reward: 40, title: '15 kelime bul', icon: 'spellcheck' },
];

// Günün 3 görevi: Günün Seferi her gün var, diğer ikisi tarihe göre değişir
export const missionsFor = (key = todayKey()) => {
  const seed = dailySeed(key);
  const rest = MISSION_POOL.filter(m => m.id !== 'daily1');
  const a = seed % rest.length;
  let b = Math.floor(seed / 7) % rest.length;
  if (rest[b].stat === rest[a].stat) b = (b + 1) % rest.length;
  if (rest[b].stat === rest[a].stat) b = (b + 1) % rest.length;
  return [MISSION_POOL.find(m => m.id === 'daily1'), rest[a], rest[b]];
};

// Seri ödülleri (giriş serisi): gün → kuruş
export const STREAK_MILESTONES = [[3, 50], [7, 150], [14, 300], [30, 750], [100, 2500]];
