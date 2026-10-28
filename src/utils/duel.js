// Arkadaş düellosu (sunucusuz): bulmacanın seed'i ve skorlar bir bağlantıya gömülür.
// Akış: A çözer → bağlantıyı paylaşır → B aynı bulmacayı çözer → B'nin cevap bağlantısı
// iki skoru da taşır → A açınca sonucu görür. Kazanan: daha çok kelime, eşitse daha kısa süre.
import { Capacitor } from '@capacitor/core';

export const DUEL_SECONDS = 120;
export const DUEL_WIN_REWARD = 100; // kuruş
const PUBLIC_ORIGIN = 'https://turnikeapp.vercel.app';

const toB64Url = (str) => btoa(unescape(encodeURIComponent(str))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fromB64Url = (b64) => decodeURIComponent(escape(atob(b64.replace(/-/g, '+').replace(/_/g, '/'))));

const cleanName = (n) => String(n || 'Yolcu').replace(/[<>]/g, '').slice(0, 16) || 'Yolcu';
const cleanScore = (r) => r && Number.isFinite(r.w) && Number.isFinite(r.t)
  ? { w: Math.max(0, Math.min(20, Math.round(r.w))), t: Math.max(0, Math.min(DUEL_SECONDS, Math.round(r.t))) }
  : null;

export const newDuelSeed = () => Math.floor(Math.random() * 2000000000) + 1;

// duel: { seed, from, fromScore: {w,t}, to?, toScore?, fromRun?, toRun? }
// fromRun/toRun: sunucuda doğrulanmış tur id'leri (Supabase varsa). Açan taraf skoru
// bağlantıdan değil sunucudan okur; böylece bağlantıdaki sayıyı değiştirmek işe yaramaz.
export const encodeDuel = (duel) => toB64Url(JSON.stringify({
  v: 1, s: duel.seed, a: duel.from, as: duel.fromScore, b: duel.to, bs: duel.toScore, ar: duel.fromRun, br: duel.toRun,
}));

export const decodeDuel = (code) => {
  try {
    const raw = String(code).trim();
    const param = raw.includes('duel=') ? new URLSearchParams(raw.slice(raw.indexOf('?'))).get('duel') : raw;
    const d = JSON.parse(fromB64Url(param));
    if (d.v !== 1 || !Number.isInteger(d.s) || d.s <= 0) return null;
    const fromScore = cleanScore(d.as);
    if (!fromScore) return null;
    return {
      seed: d.s,
      from: cleanName(d.a),
      fromScore,
      to: d.b ? cleanName(d.b) : null,
      toScore: cleanScore(d.bs),
      fromRun: typeof d.ar === 'string' ? d.ar.slice(0, 40) : null,
      toRun: typeof d.br === 'string' ? d.br.slice(0, 40) : null,
    };
  } catch {
    return null;
  }
};

export const duelLink = (duel) => {
  const origin = Capacitor.isNativePlatform() ? PUBLIC_ORIGIN : window.location.origin;
  return `${origin}/?duel=${encodeDuel(duel)}`;
};

// 1: a kazandı, -1: b kazandı, 0: berabere
export const compareScores = (a, b) => {
  if (a.w !== b.w) return a.w > b.w ? 1 : -1;
  if (a.t !== b.t) return a.t < b.t ? 1 : -1;
  return 0;
};

export const shareDuel = async (duel, text) => {
  const url = duelLink(duel);
  if (navigator.share) {
    try { await navigator.share({ title: 'Turnike düellosu', text, url }); return 'shared'; } catch { return 'cancelled'; }
  }
  await navigator.clipboard?.writeText(`${text} ${url}`);
  return 'copied';
};

// Çevrimdışı hayalet rakip: bulmacadaki kelimelerin bir kısmını 25-110 sn arasında bulan bot.
// timeline: [{ w, t }] — oyun sırasında rakibin canlı ilerlemesi buradan okunur.
const GHOST_NAMES = ['Ayşe', 'Mert', 'Zeynep', 'Emir', 'Elif', 'Kerem', 'Defne', 'Arda', 'Selin', 'Baran', 'İrem', 'Kaan'];
export const botGhost = (words, seed) => {
  let s = seed >>> 0 || 7;
  const r = () => { s = (Math.imul(s ^ (s >>> 13), 1274126177) + 12345) >>> 0; return (s % 10000) / 10000; };
  const count = Math.max(2, Math.min(words.length, Math.round(words.length * (0.5 + r() * 0.5))));
  const picked = [...words].sort(() => r() - 0.5).slice(0, count);
  const end = Math.round(45 + r() * 65);
  const timeline = picked.map((w, i) => ({ w, t: Math.round(((i + 1) / count) * end * (0.85 + r() * 0.15)) })).sort((a, b) => a.t - b.t);
  return { name: GHOST_NAMES[Math.floor(r() * GHOST_NAMES.length)], score: { w: count, t: Math.min(DUEL_SECONDS, timeline[timeline.length - 1].t) }, timeline, bot: true };
};
