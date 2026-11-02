import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateWordScore, KURUS_PER_POINT } from '../../src/utils/scoring.js';
import { generateLevel, generateDuelLevel } from '../../src/utils/gameLogic.js';
import { formatKurus } from '../../src/utils/format.js';
import { encodeDuel, decodeDuel, compareScores, botGhost, DUEL_SECONDS } from '../../src/utils/duel.js';
import { dailySeed, dayNumber, yesterdayKey, todayKey } from '../../src/utils/daily.js';
import { botsFor } from '../../src/utils/league.js';

test('formatKurus: kuruşu TL biçiminde yazar', () => {
  assert.equal(formatKurus(0), '₺0,00');
  assert.equal(formatKurus(5), '₺0,05');
  assert.equal(formatKurus(27737), '₺277,37');
});

test('kelime puanı: uzun kelime, kombo ve hız daha çok kazandırır; en az 1 kuruş', () => {
  const base = calculateWordScore('KÖY', 0, 0, 30).points;
  assert.ok(base >= 1);
  assert.ok(calculateWordScore('KADIKÖY', 0, 0, 30).points > base);
  assert.ok(calculateWordScore('KÖY', 5, 0, 30).points > base);
  assert.ok(calculateWordScore('KÖY', 0, 30, 30).points > base);
  assert.equal(KURUS_PER_POINT, 0.08);
});

test('aynı seviye her zaman aynı bulmaca', () => {
  for (const lv of [0, 31, 450, 2999]) {
    assert.deepEqual(generateLevel(lv, 'tr').words, generateLevel(lv, 'tr').words);
  }
});

// Her yatay/dikey harf dizisi tam olarak bir kelime: iç içe/bitişik kelime yok (KAYIK-AYI hatası)
const assertCleanGrid = (words, label) => {
  const grid = new Map();
  const cells = (w) => [...w.word].map((_, i) => (w.isHorizontal ? `${w.startX + i},${w.startY}` : `${w.startX},${w.startY + i}`));
  words.forEach(w => cells(w).forEach((k, i) => {
    assert.ok(!grid.has(k) || grid.get(k) === w.word[i], `${label}: hücre çakışması`);
    grid.set(k, w.word[i]);
  }));
  for (const horizontal of [true, false]) {
    const placed = new Set(words.filter(w => w.isHorizontal === horizontal).map(w => cells(w).join('|')));
    for (const k of grid.keys()) {
      const [x, y] = k.split(',').map(Number);
      if (grid.has(horizontal ? `${x - 1},${y}` : `${x},${y - 1}`)) continue;
      const run = [];
      for (let i = 0; ; i++) { const c = horizontal ? `${x + i},${y}` : `${x},${y + i}`; if (!grid.has(c)) break; run.push(c); }
      if (run.length >= 2) assert.ok(placed.has(run.join('|')), `${label}: kelime olmayan harf dizisi ${run.join(' ')}`);
    }
  }
};

test('ızgara: normal seviyelerde iç içe ya da bitişik kelime yok', () => {
  for (let lv = 0; lv < 400; lv++) assertCleanGrid(generateLevel(lv, 'tr').words, `L${lv + 1}`);
});

test('ızgara: Günün Seferi 30 Ekim 2026 (KAYIK içinde AYI hatası) temiz', () => {
  const L = generateDuelLevel(dailySeed('2026-10-30'));
  assert.equal(L.technicalTerm, 'KADIKÖY');
  assertCleanGrid(L.words, 'günlük 2026-10-30');
});

test('günlük: tarih anahtarı ve seed kararlı', () => {
  assert.equal(dailySeed('2026-10-30'), dailySeed('2026-10-30'));
  assert.notEqual(dailySeed('2026-10-30'), dailySeed('2026-10-31'));
  assert.equal(yesterdayKey('2026-03-01'), '2026-02-28');
  assert.equal(dayNumber('2026-10-31') - dayNumber('2026-10-30'), 1);
  assert.match(todayKey(new Date(2026, 0, 5)), /^2026-01-05$/);
});

test('düello: bağlantı kodu gidip geliyor, bozuk kod reddediliyor, skor sınırlanıyor', () => {
  const duel = { seed: 12345, from: 'Onur', fromScore: { w: 6, t: 80 } };
  const back = decodeDuel(encodeDuel(duel));
  assert.equal(back.seed, 12345);
  assert.equal(back.from, 'Onur');
  assert.deepEqual(back.fromScore, { w: 6, t: 80 });
  assert.equal(decodeDuel('bozuk-kod'), null);
  const cheat = decodeDuel(encodeDuel({ seed: 1, from: '<b>x</b>', fromScore: { w: 999, t: -5 } }));
  assert.deepEqual(cheat.fromScore, { w: 20, t: 0 });
  assert.ok(!cheat.from.includes('<'));
});

test('düello: çok kelime kazanır, eşitlikte hızlı olan', () => {
  assert.ok(compareScores({ w: 6, t: 90 }, { w: 5, t: 30 }) > 0);
  assert.ok(compareScores({ w: 5, t: 30 }, { w: 5, t: 60 }) > 0);
});

test('hayalet rakip: belirli, süre sınırı içinde', () => {
  const words = ['KÖY', 'KÖK', 'AYI', 'YAK', 'KAYIK'];
  const a = botGhost(words, 77), b = botGhost(words, 77);
  assert.deepEqual(a, b);
  assert.ok(a.score.w >= 2 && a.score.t <= DUEL_SECONDS);
});

test('lig: bot isimleri grupta tekrar etmiyor', () => {
  for (let w = 0; w < 50; w++) {
    const names = botsFor(`2026-W${w}`, w % 4, `g${w}`, 29, 0.5).map(b => b.name.replace(/( [A-ZŞ]\.|34|_ist|06)$/, ''));
    assert.equal(new Set(names).size, names.length);
  }
});
