// Hafta sonu hat etkinliği: cuma 00:00 – pazar 23:59 (yerel saat), 72 saat.
// Her hafta sonu farklı bir temayla gelir (tema haftaya göre döner); etkinlik süresince
// bölüm kelime puanı 2 katına çıkar ve bitirilen bölüm sayısına göre basamaklı ödüller açılır.
// Herkes için aynı kurallar: oyuncunun hangi hatta olduğu ödülü değiştirmez.

export const EVENT_THEMES = [
  { key: 'vapur', name: 'Vapur Hafta Sonu', icon: 'directions_boat', color: '#2563eb', tagline: 'Martılar eşliğinde 2 kat kazanç' },
  { key: 'gece', name: 'Gece Seferi', icon: 'dark_mode', color: '#7c3aed', tagline: 'Şehir uyurken 2 kat kazanç' },
  { key: 'tramvay', name: 'Nostaljik Tramvay', icon: 'tram', color: '#dc2626', tagline: 'Taksim–Tünel ruhuyla 2 kat kazanç' },
  { key: 'marmaray', name: 'Kıtalararası Hafta Sonu', icon: 'directions_railway', color: '#0d9488', tagline: 'İki yakada 2 kat kazanç' },
];

// Basamaklar: [bitirilen bölüm, ödül (kuruş)]
export const EVENT_TIERS = [[5, 100], [15, 300], [30, 750]];
export const EVENT_MULTIPLIER = 2;

// Geliştirme sırasında hafta içi denemek için: localStorage.turnike_event_preview = '1'
const previewOn = () => {
  if (!import.meta.env?.DEV) return false;
  try { return localStorage.getItem('turnike_event_preview') === '1'; } catch { return false; }
};

const fridayOf = (d) => {
  const day = d.getDay(); // 0 pazar … 5 cuma, 6 cumartesi
  const back = day === 0 ? 2 : day === 6 ? 1 : day === 5 ? 0 : null;
  if (back === null) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - back);
};

// Etkin etkinlik ya da null. id hafta sonuna özgü (ilerleme her hafta sonu sıfırlanır).
export const currentEvent = (now = new Date()) => {
  let friday = fridayOf(now);
  if (!friday && previewOn()) friday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (!friday) return null;
  const weekIndex = Math.floor(friday.getTime() / (7 * 86400000));
  const theme = EVENT_THEMES[((weekIndex % EVENT_THEMES.length) + EVENT_THEMES.length) % EVENT_THEMES.length];
  const endsAt = new Date(friday.getFullYear(), friday.getMonth(), friday.getDate() + 3);
  const id = `${friday.getFullYear()}-${friday.getMonth() + 1}-${friday.getDate()}`;
  return { ...theme, id, endsAt };
};

export const timeLeft = (endsAt, now = new Date()) => {
  const s = Math.max(0, Math.floor((endsAt - now) / 1000));
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
  return d > 0 ? `${d} g ${h} sa` : `${h} sa ${m} dk`;
};
