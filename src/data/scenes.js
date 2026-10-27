// Oyun sahneleri: her durağın 5 ayağı günün farklı bir saatinde geçer, ufuktaki simgeler
// hattın/durağın bulunduğu semte göre seçilir. SceneBackground bu tabloları çizer.

// Ayak 1..5 → günün saati
export const TIMES = [
  { id: 'dawn', sky: ['#28345f', '#8e6f9a', '#f2b38a'], sun: { y: 500, r: 26, color: '#ffd9a0' }, haze: '#7a6a8f', land: '#3a3d63', water: ['#6f7fa6', '#2f4470'], cloud: '#f6c9b4' },
  { id: 'morning', sky: ['#3a7cc0', '#79b4e2', '#cfe7f5'], sun: { y: 300, r: 22, color: '#fff6d6' }, haze: '#8fb1cf', land: '#4c6f8f', water: ['#5d9bd0', '#245d93'], cloud: '#ffffff' },
  { id: 'noon', sky: ['#1f6fc4', '#4f9ee0', '#a6d5f3'], sun: { y: 130, r: 20, color: '#fffbe6' }, haze: '#86b6dc', land: '#3f6f97', water: ['#3f8fd0', '#1b5a96'], cloud: '#ffffff' },
  { id: 'sunset', sky: ['#1d2556', '#a64f6f', '#f5a25d'], sun: { y: 470, r: 30, color: '#ffb36b' }, haze: '#8a4f6c', land: '#3b2a4c', water: ['#c77a6a', '#3a3463'], cloud: '#f7a98a' },
  { id: 'night', sky: ['#040a1c', '#0b1a3a', '#1b2f5c'], moon: { y: 150, r: 16 }, haze: '#14234a', land: '#0d1733', water: ['#14305a', '#071530'], cloud: '#2a3a63', night: true },
];

// Semt → ufuktaki simgeler (soldan sağa sırayla yerleştirilir)
export const REGIONS = {
  historic: { landmarks: ['mosque', 'galata', 'mosque2'], water: true },
  beyoglu: { landmarks: ['galata', 'skyscrapers'], water: true },
  bosphorus: { landmarks: ['bridge', 'maiden', 'mosque'], water: true },
  marmaray: { landmarks: ['mosque', 'maiden', 'bridge'], water: true },
  anadolu: { landmarks: ['camlica', 'towers', 'maiden'], water: true },
  business: { landmarks: ['skyscrapers', 'camlica'], water: false },
  airport: { landmarks: ['airport', 'towers'], water: false },
  islands: { landmarks: ['islands', 'maiden'], water: true },
  goldenhorn: { landmarks: ['mosque', 'cable', 'galata'], water: true },
  west: { landmarks: ['towers', 'bridge'], water: false },
};

export const LINE_REGION = {
  M2: 'beyoglu', MARMARAY: 'marmaray', METROBUS: 'west', VAPUR: 'bosphorus', T1: 'historic',
  M1A: 'historic', M1B: 'west', M3: 'west', M4: 'anadolu', M5: 'anadolu', M6: 'business',
  M7: 'business', M8: 'anadolu', M9: 'west', M11: 'airport', T4: 'historic', T5: 'goldenhorn',
  F1: 'beyoglu', F2: 'beyoglu', TF1: 'beyoglu', TF2: 'goldenhorn', ADALAR: 'islands', HALIC: 'goldenhorn',
};

// Durak adına göre özel semt (hattın genel semtini ezer)
const KEYWORDS = [
  [/havaliman/i, 'airport'],
  [/(^| )ada|büyükada|heybeli|burgaz|kınalı/i, 'islands'],
  [/üsküdar|kadıköy|harem|ayrılık/i, 'anadolu'],
  [/taksim|karaköy|beyoğlu|kabataş|şişhane/i, 'beyoglu'],
  [/eminönü|sirkeci|aksaray|yenikapı|vezneciler|sultanahmet|beyazıt|gülhane/i, 'historic'],
  [/levent|gayrettepe|maslak|mecidiyeköy|şişli/i, 'business'],
  [/eyüp|piyer|balat|fener|haliç|sütlüce|hasköy/i, 'goldenhorn'],
  [/boğaz|bebek|sarıyer|rumeli/i, 'bosphorus'],
];

export const getSceneFor = (station) => {
  const time = TIMES[Math.min(4, Math.max(0, (station.leg || 1) - 1))];
  const name = station.displayName || station.name || '';
  const override = KEYWORDS.find(([re]) => re.test(name));
  const regionId = override ? override[1] : (LINE_REGION[station.id] || 'historic');
  return { time, regionId, region: REGIONS[regionId], seed: station.stationIndex ?? 0 };
};
