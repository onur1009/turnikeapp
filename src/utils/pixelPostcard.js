// Durak kartpostalı: 120×80 piksellik sahne, durağa göre deterministik üretilir.
// Aynı durak her zaman aynı kartı verir; komşu duraklar bile farklı görünür.
// Katmanlar: gökyüzü (saat) → güneş/ay/yıldız → bulut → tepe → semt simgeleri → şehir →
// su (varsa) → durak adına özel öğeler → hattın aracı ve yolu.
import { getSceneFor } from '../data/scenes';

export const W = 120;
export const H = 80;

const hash = (s) => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const rng = (seed) => () => { seed = (seed + 0x6d2b79f5) >>> 0; let t = seed; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

// Hex rengi koyulaştır/aç (k<1 koyu, k>1 açık)
const shade = (hex, k) => {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v) => Math.max(0, Math.min(255, Math.round(k < 1 ? v * k : v + (255 - v) * (k - 1))));
  return `#${[n >> 16, (n >> 8) & 255, n & 255].map(v => ch(v).toString(16).padStart(2, '0')).join('')}`;
};

const PALETTES = {
  dawn: { sky: ['#2a3566', '#6a5a8e', '#c47f95', '#f2b38a'], sun: '#ffd9a0', haze: '#7a6a8f', far: '#4b4870', city: '#3a3a5e', win: '#f7c97b', water: ['#8a86b0', '#4f5b8c'], cloud: '#f6c9b4', ground: '#3b3555' },
  morning: { sky: ['#3a7cc0', '#5c9bd6', '#8fc0e8', '#cfe7f5'], sun: '#fff6d6', haze: '#9dbcd8', far: '#6f93b4', city: '#4c6f8f', win: '#cfe3f1', water: ['#5d9bd0', '#2c6aa3'], cloud: '#ffffff', ground: '#55707f' },
  noon: { sky: ['#1f6fc4', '#3d8ad6', '#6fb0e8', '#a6d5f3'], sun: '#fffbe6', haze: '#8bbadf', far: '#5f8fb8', city: '#3f6f97', win: '#d9ecf8', water: ['#3f8fd0', '#1f5f9c'], cloud: '#ffffff', ground: '#4d6a73' },
  sunset: { sky: ['#1d2556', '#5d3769', '#b0566c', '#f5a25d'], sun: '#ffb36b', haze: '#8a4f6c', far: '#5b3858', city: '#3b2a4c', win: '#ffcf7a', water: ['#c77a6a', '#4a3a6a'], cloud: '#f7a98a', ground: '#33243f' },
  night: { sky: ['#040a1c', '#0a1631', '#112349', '#1b2f5c'], sun: '#f3f0d8', haze: '#1a2a52', far: '#14204a', city: '#0d1733', win: '#ffd56b', water: ['#16305a', '#081732'], cloud: '#26365e', ground: '#0b1328', night: true },
};
const TIME_IDS = ['dawn', 'morning', 'noon', 'sunset', 'night'];

// Durak adındaki ipuçları → ön planda ek öğe
const FEATURES = [
  [/havaliman/i, 'plane'], // önce: "Havalimanı" içinde "liman" geçiyor
  [/park|orman|bahçe|koru|çiftlik|çamlık|fidanlık|çınar|ağaç/i, 'trees'],
  [/plaj|sahil|yalı|iskele|liman|marina|akvaryum|kıyı|deniz/i, 'pier'],
  [/stad|olimpiyat|arena/i, 'stadium'],
  [/sanayi|oto|organize|tersane|fabrika/i, 'factory'],
  [/çarşı|pazar|bazaar|kapalı/i, 'market'],
  [/üniversite|itü|boğaziçi|kampüs|okmeydanı/i, 'campus'],
  [/hastane|tıp/i, 'hospital'],
  [/kule|tower/i, 'tower'],
  [/cami|camii|sultan|mescid|külliye/i, 'mosque'],
  [/köprü/i, 'bridge'],
  [/otogar|garaj/i, 'bus'],
  [/çeşme/i, 'fountain'],
];

export function buildPostcard({ name, lineId, mode, color, stationIndex = 0 }) {
  const seed = hash(`${lineId}|${name}`);
  const r = rng(seed);
  const pick = (a) => a[Math.floor(r() * a.length)];
  const rects = [];
  // Tuvale kırpılır: kenardan taşan sprite parçaları boşa <rect> üretmesin
  const R = (x, y, w, h, c) => {
    const x0 = Math.max(0, Math.round(x)), y0 = Math.max(0, Math.round(y));
    const x1 = Math.min(W, Math.round(x + w)), y1 = Math.min(H, Math.round(y + h));
    if (x1 > x0 && y1 > y0) rects.push([x0, y0, x1 - x0, y1 - y0, c]);
  };
  const P = (x, y, c) => R(x, y, 1, 1, c);

  const scene = getSceneFor({ id: lineId, displayName: name, leg: 1, stationIndex });
  const region = scene.region;
  const time = TIME_IDS[(seed >>> 3) % TIME_IDS.length];
  const pal = PALETTES[time];
  const feature = (FEATURES.find(([re]) => re.test(name)) || [])[1];
  const water = mode === 'ferry' || feature === 'pier' || region.water;
  const horizon = water ? 52 : 58;      // şehrin oturduğu çizgi
  const groundY = water ? 66 : 64;      // ön plan başlangıcı

  // 1) Gökyüzü: 4 bant, aralarında damalı geçiş
  const bands = pal.sky;
  const bh = Math.ceil(horizon / bands.length);
  bands.forEach((c, i) => R(0, i * bh, W, bh + 1, c));
  for (let i = 1; i < bands.length; i++) {
    const y = i * bh;
    for (let x = 0; x < W; x += 2) { P(x + (y % 2), y - 1, bands[i]); P(x + ((y + 1) % 2), y, bands[i - 1]); }
  }

  // 2) Güneş / ay ve yıldızlar
  const sx = 14 + Math.floor(r() * 90), sy = time === 'noon' ? 8 : time === 'night' ? 10 : horizon - 16;
  const disc = (cx, cy, rad, c) => { for (let y = -rad; y <= rad; y++) { const w = Math.round(Math.sqrt(rad * rad - y * y)); R(cx - w, cy + y, w * 2 + 1, 1, c); } };
  if (pal.night) {
    disc(sx, sy, 4, pal.sun); disc(sx + 2, sy - 1, 3, bands[0]); // hilal
    for (let i = 0; i < 28; i++) P(Math.floor(r() * W), Math.floor(r() * (horizon - 14)), r() > 0.7 ? '#ffffff' : '#9fb3d9');
  } else {
    disc(sx, sy, time === 'noon' ? 4 : 6, pal.sun);
  }

  // 3) Bulutlar
  const cloud = (x, y, w) => { R(x, y, w, 2, pal.cloud); R(x + 2, y - 2, w - 5, 2, pal.cloud); R(x + 4, y - 3, Math.max(2, w - 10), 1, pal.cloud); };
  for (let i = 0, n = pal.night ? 1 : 2 + Math.floor(r() * 2); i < n; i++) cloud(Math.floor(r() * 100), 8 + Math.floor(r() * 18), 12 + Math.floor(r() * 10));

  // 4) Uzak tepe silueti
  let hy = horizon - 8 - r() * 6;
  for (let x = 0; x < W; x += 2) { hy = Math.max(horizon - 18, Math.min(horizon - 3, hy + (r() - 0.5) * 3)); R(x, hy, 2, horizon - hy, pal.haze); }

  // 5) Semt simgeleri (uzakta, tek renk siluet; gece pencereleri yanar)
  // Simgeler pustan belirgin ayrılsın diye bir ton koyu: kartın odak noktası bunlar
  const far = shade(pal.far, 0.78);
  const lit = (x, y) => { if (pal.night && r() > 0.45) P(x, y, pal.win); };
  const SPRITES = {
    mosque: (x) => { const b = horizon; R(x, b - 7, 18, 7, far); disc(x + 9, b - 8, 5, far); R(x + 9, b - 16, 1, 3, far);
      R(x - 2, b - 20, 2, 20, far); R(x + 18, b - 20, 2, 20, far); P(x - 2, b - 21, far); P(x + 19, b - 21, far);
      disc(x + 3, b - 7, 2, far); disc(x + 15, b - 7, 2, far); for (let i = 0; i < 4; i++) lit(x + 3 + i * 4, b - 3); return 24; },
    mosque2: (x) => { const b = horizon; R(x, b - 6, 14, 6, far); disc(x + 7, b - 7, 4, far); R(x - 2, b - 16, 2, 16, far); P(x - 2, b - 17, far); return 18; },
    galata: (x) => { const b = horizon; R(x, b - 22, 6, 22, far); R(x - 1, b - 23, 8, 2, far); R(x + 1, b - 27, 4, 4, far); P(x + 2, b - 29, far); P(x + 3, b - 29, far);
      for (let y = b - 18; y < b - 2; y += 4) lit(x + 2, y); return 12; },
    maiden: (x) => { const b = horizon + 2; R(x - 3, b - 3, 14, 3, far); R(x + 1, b - 13, 6, 10, far); R(x + 2, b - 17, 4, 4, far); P(x + 3, b - 19, far); P(x + 4, b - 19, far); lit(x + 3, b - 9); return 16; },
    bridge: (x) => { const b = horizon - 2; const L = 46; R(x, b, L, 1, far); R(x + 8, b - 16, 2, 17, far); R(x + L - 10, b - 16, 2, 17, far);
      for (let i = 0; i <= 8; i++) { const t = i / 8; P(x + 9 - 9 * t, b - 15 + 15 * t * t, far); P(x + 9 + (L - 19) * t / 2, b - 15 + 10 * Math.sin(Math.PI * t / 2) * 1.3 * t, far); }
      for (let i = 0; i <= 16; i++) { const t = i / 16; P(x + 9 + (L - 19) * t, b - 15 + 12 * 4 * t * (1 - t) * 0.6 + 3, far); }
      if (pal.night) for (let i = 2; i < L; i += 4) P(x + i, b - 1, pal.win); return L + 4; },
    skyscrapers: (x) => { let cx = x; for (let i = 0; i < 4; i++) { const w = 5 + Math.floor(r() * 4), h = 18 + Math.floor(r() * 16); R(cx, horizon - h, w, h, far);
      if (i === 1) R(cx + Math.floor(w / 2), horizon - h - 4, 1, 4, far); for (let y = horizon - h + 2; y < horizon - 1; y += 3) for (let k = 1; k < w - 1; k += 2) lit(cx + k, y); cx += w + 1; } return cx - x + 2; },
    camlica: (x) => { const b = horizon - 4; R(x + 3, b - 26, 3, 26, far); R(x + 1, b - 18, 7, 4, far); R(x + 4, b - 34, 1, 8, far); R(x - 4, b, 18, 4, far); lit(x + 4, b - 16); return 16; },
    towers: (x) => { let cx = x; for (let i = 0; i < 3; i++) { const w = 6, h = 10 + Math.floor(r() * 10); R(cx, horizon - h, w, h, far); for (let y = horizon - h + 2; y < horizon - 1; y += 3) { lit(cx + 1, y); lit(cx + 4, y); } cx += w + 2; } return cx - x; },
    airport: (x) => { const b = horizon; R(x, b - 4, 26, 4, far); R(x + 20, b - 18, 3, 14, far); R(x + 18, b - 21, 7, 3, far); if (pal.night) P(x + 21, b - 22, '#ff5a5a'); return 30; },
    islands: (x) => { const b = horizon + 2; for (let i = 0; i < 3; i++) { const w = 12 + i * 4; R(x + i * 18, b - 3 - i, w, 3 + i, far); R(x + i * 18 + 3, b - 5 - i, w - 6, 2, far); } return 64; },
    cable: (x) => { for (let i = 0; i < 40; i++) P(x + i, horizon - 22 + Math.floor(i / 3), far); R(x + 18, horizon - 15, 4, 4, far); return 44; },
  };
  let lx = 2 + Math.floor(r() * 10);
  for (const id of region.landmarks) { if (lx > W - 10) break; lx += SPRITES[id](lx) + 4 + Math.floor(r() * 8); }

  // 6) Yakın şehir sırası: renkli cepheler, pencereler
  const facade = [pal.city, shade(pal.city, 1.12), shade(pal.city, 0.85)];
  for (let x = -2; x < W;) {
    const w = 6 + Math.floor(r() * 8), h = 4 + Math.floor(r() * (water ? 7 : 11));
    const c = pick(facade);
    R(x, horizon + (water ? 0 : 2) - h, w, h + 4, c);
    if (r() > 0.5) R(x + 1, horizon + (water ? 0 : 2) - h - 1, w - 2, 1, shade(c, 0.8)); // çatı
    for (let y = horizon + (water ? 0 : 2) - h + 2; y < horizon + (water ? 0 : 2); y += 3) for (let k = 1; k < w - 1; k += 2) if (r() > (pal.night ? 0.35 : 0.7)) P(x + k, y, pal.night ? pal.win : shade(c, 1.3));
    x += w;
  }

  // 7) Su: bantlar, dalga parıltısı, güneş/ay yansıması
  if (water) {
    R(0, horizon + 2, W, groundY - horizon - 2, pal.water[0]);
    R(0, horizon + 8, W, groundY - horizon - 8, pal.water[1]);
    for (let i = 0; i < 40; i++) R(Math.floor(r() * W), horizon + 3 + Math.floor(r() * (groundY - horizon - 4)), 2 + Math.floor(r() * 3), 1, shade(pal.water[0], 1.25));
    for (let y = horizon + 3; y < groundY; y += 2) R(sx - 2 + Math.floor(r() * 3), y, 3 + Math.floor(r() * 3), 1, pal.sun);
    // Uzakta küçük tekne
    const bx = Math.floor(r() * 90) + 10; R(bx, horizon + 5, 7, 2, '#f1f1f1'); R(bx + 2, horizon + 3, 3, 2, '#e8e8e8'); R(bx + 1, horizon + 7, 5, 1, shade(pal.water[1], 0.8));
  }

  // 8) Ön plan zemini (hat türüne göre)
  const rail = '#2b2f38', ground = pal.ground;
  if (mode === 'ferry') {
    R(0, groundY, W, H - groundY, pal.water[1]);
    for (let i = 0; i < 30; i++) R(Math.floor(r() * W), groundY + 2 + Math.floor(r() * 12), 3, 1, shade(pal.water[1], 1.35));
  } else if (mode === 'metrobus' || mode === 'tram') {
    R(0, groundY, W, H - groundY, ground);
    R(0, groundY + 4, W, 10, '#3a3f48');
    for (let x = 2; x < W; x += 10) R(x, groundY + 9, 5, 1, '#e9e3c9');
    if (mode === 'tram') { R(0, groundY + 6, W, 1, '#9aa3ad'); R(0, groundY + 12, W, 1, '#9aa3ad'); }
  } else if (mode === 'cablecar') {
    R(0, groundY, W, H - groundY, shade(ground, 1.15));
    for (let x = 0; x < W; x += 3) R(x, groundY - 1 - Math.floor(r() * 3), 3, 4, shade(ground, 1.3)); // tepe yamacı
  } else { // metro, marmaray, füniküler: viyadük ya da peron
    R(0, groundY, W, H - groundY, ground);
    R(0, groundY + 3, W, 3, '#5b6470'); R(0, groundY + 6, W, 1, rail);
    for (let x = 4; x < W; x += 16) R(x, groundY + 7, 3, H - groundY - 7, '#4a525d');
  }

  // 9) Durak adına özel öğe (ön planın üstünde)
  const fx = 6 + Math.floor(r() * 14);
  const tree = (x, b) => { R(x + 2, b - 3, 1, 3, '#5a3b22'); disc(x + 2, b - 6, 3, pal.night ? '#123a2a' : '#2f7a3f'); P(x + 1, b - 8, pal.night ? '#1d5a40' : '#4fa35a'); };
  const F = {
    trees: () => { for (let i = 0; i < 4; i++) tree(fx + i * 7 + Math.floor(r() * 3), groundY + 1); },
    pier: () => { R(fx, groundY - 2, 26, 2, '#8a6a4a'); for (let i = 0; i < 26; i += 5) R(fx + i, groundY, 1, 4, '#5a4330'); },
    stadium: () => { R(fx, groundY - 8, 30, 8, '#c8ccd2'); R(fx + 2, groundY - 10, 26, 2, '#e2e5ea'); R(fx + 4, groundY - 6, 22, 4, '#2f8a4a'); for (let i = 0; i < 4; i++) R(fx + 3 + i * 8, groundY - 14, 1, 4, '#9aa3ad'); },
    factory: () => { R(fx, groundY - 9, 22, 9, '#6b5b4b'); for (let i = 0; i < 3; i++) R(fx + 2 + i * 7, groundY - 16, 3, 7, '#5a4b3d'); for (let i = 0; i < 3; i++) R(fx + 1 + i * 7, groundY - 19 - i, 4, 2, '#b8b8b8'); },
    market: () => { const cs = ['#d94a3a', '#f0c24b', '#3a8fd9']; for (let i = 0; i < 3; i++) { R(fx + i * 9, groundY - 7, 8, 7, '#e8dcc0'); for (let k = 0; k < 8; k += 2) R(fx + i * 9 + k, groundY - 9, 2, 2, cs[i]); } },
    campus: () => { R(fx, groundY - 12, 28, 12, '#d8cbb2'); R(fx + 10, groundY - 18, 8, 6, '#cbbd9f'); disc(fx + 14, groundY - 15, 2, '#f5f0e0'); for (let i = 2; i < 28; i += 4) R(fx + i, groundY - 9, 2, 3, '#7a8aa0'); },
    hospital: () => { R(fx, groundY - 14, 18, 14, '#eef1f4'); R(fx + 7, groundY - 12, 4, 10, '#e04848'); R(fx + 5, groundY - 9, 8, 4, '#e04848'); },
    tower: () => { R(fx + 4, groundY - 22, 5, 22, '#c9b79a'); R(fx + 3, groundY - 24, 7, 2, '#a8957a'); R(fx + 5, groundY - 28, 3, 4, '#8a4a3a'); },
    mosque: () => { R(fx, groundY - 6, 16, 6, '#ece4d2'); disc(fx + 8, groundY - 7, 4, '#d9cfba'); R(fx - 2, groundY - 16, 2, 16, '#ece4d2'); P(fx - 2, groundY - 17, '#d9cfba'); },
    bridge: () => { for (let x = 0; x < W; x++) P(x, groundY - 12 + Math.round(4 * Math.sin(x / 19)), '#c0392b'); },
    plane: () => { const y = 16 + Math.floor(r() * 10), x = 30 + Math.floor(r() * 50); R(x, y, 14, 2, '#f4f6f8'); R(x + 5, y - 3, 3, 3, '#dfe3e8'); R(x + 5, y + 2, 3, 2, '#dfe3e8'); R(x + 12, y - 2, 2, 2, color); },
    bus: () => { R(fx, groundY - 7, 20, 6, '#f4f4f4'); R(fx + 1, groundY - 6, 18, 2, '#7ab6e0'); R(fx + 3, groundY - 1, 3, 2, '#222222'); R(fx + 14, groundY - 1, 3, 2, '#222222'); },
    fountain: () => { R(fx, groundY - 6, 12, 6, '#d8cfbd'); R(fx + 2, groundY - 9, 8, 3, '#c9bfa9'); disc(fx + 6, groundY - 10, 2, '#c9bfa9'); R(fx + 5, groundY - 4, 2, 3, '#6fb6e0'); },
  };
  if (feature && F[feature]) F[feature]();
  else if (r() > 0.4 && mode !== 'ferry') for (let i = 0; i < 2; i++) tree(W - 22 + i * 7, groundY + 1);

  // 10) Hattın aracı, hat renginde
  const glass = pal.night ? pal.win : '#bfe0f2';
  const dark = shade(color, 0.55);
  const vx = 30 + Math.floor(r() * 40);
  if (mode === 'ferry') { // vapur: beyaz gövde, hat renginde şerit, baca
    const y = groundY + 2;
    R(vx, y + 4, 44, 5, '#f5f5f2'); R(vx + 2, y + 9, 40, 2, '#2b2f38'); R(vx, y + 6, 44, 1, color);
    R(vx + 6, y, 28, 4, '#ecebe6'); for (let i = 8; i < 32; i += 4) R(vx + i, y + 1, 2, 2, glass);
    R(vx + 18, y - 5, 4, 5, '#f2c230'); R(vx + 18, y - 5, 4, 1, '#222222'); R(vx - 4, y + 10, 8, 1, '#e6f2fa');
  } else if (mode === 'cablecar') {
    for (let x = 0; x < W; x++) P(x, 18 + Math.floor(x / 5), '#3a3f48');
    const gx = vx, gy = 18 + Math.floor(gx / 5);
    R(gx + 4, gy, 1, 5, '#3a3f48'); R(gx, gy + 5, 10, 8, color); R(gx + 1, gy + 6, 8, 3, glass); R(gx, gy + 13, 10, 1, dark);
  } else if (mode === 'metrobus') {
    const y = groundY - 1;
    R(vx, y - 8, 46, 9, color); R(vx, y - 8, 46, 1, shade(color, 1.2)); R(vx + 22, y - 8, 2, 9, dark); // körük
    for (let i = 2; i < 44; i += 5) if (i < 21 || i > 25) R(vx + i, y - 6, 4, 3, glass);
    R(vx + 6, y + 1, 4, 2, '#1f2228'); R(vx + 34, y + 1, 4, 2, '#1f2228'); P(vx + 45, y - 2, '#fff2a8');
  } else if (mode === 'tram') {
    const y = groundY + 5;
    R(vx, y - 9, 40, 9, color); R(vx + 2, y - 7, 36, 3, glass); for (let i = 7; i < 40; i += 8) R(vx + i, y - 7, 1, 3, dark);
    R(vx + 18, y - 13, 1, 4, '#3a3f48'); R(vx + 14, y - 13, 9, 1, '#3a3f48'); R(0, y - 14, W, 1, '#3a3f48'); // pantograf ve tel
    R(vx + 4, y, 3, 1, '#1f2228'); R(vx + 32, y, 3, 1, '#1f2228');
  } else { // metro / marmaray / füniküler
    const y = groundY + 2;
    const cars = mode === 'funicular' ? 1 : mode === 'marmaray' ? 4 : 3;
    const body = mode === 'marmaray' ? '#eef1f4' : '#e6e9ee';
    let cx = Math.min(vx, W - cars * 17);
    for (let i = 0; i < cars; i++) {
      R(cx, y - 8, 16, 8, body); R(cx, y - 3, 16, 1, color); R(cx, y - 8, 16, 1, shade(body, 0.9));
      for (let k = 2; k < 14; k += 4) R(cx + k, y - 6, 3, 2, glass);
      R(cx + 2, y, 2, 1, '#1f2228'); R(cx + 12, y, 2, 1, '#1f2228');
      cx += 17;
    }
    P(cx - 2, y - 4, '#fff2a8');
    if (mode === 'marmaray') { R(0, y - 12, W, 1, '#3a3f48'); R(cx - 30, y - 11, 1, 3, '#3a3f48'); }
  }

  // 11) Durak tabelası: hat renginde kare levha
  const px = W - 10;
  R(px + 3, groundY - 12, 1, 12, '#3a3f48'); R(px, groundY - 17, 7, 6, color); R(px + 1, groundY - 16, 5, 1, '#ffffff'); R(px + 1, groundY - 14, 3, 1, '#ffffff');

  return { rects, time, feature: feature || null };
}
