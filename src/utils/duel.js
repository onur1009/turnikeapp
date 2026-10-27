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

// duel: { seed, from, fromScore: {w,t}, to?, toScore? }
export const encodeDuel = (duel) => toB64Url(JSON.stringify({
  v: 1, s: duel.seed, a: duel.from, as: duel.fromScore, b: duel.to, bs: duel.toScore,
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
