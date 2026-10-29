// Tüm seviyeleri üretip doğrular. scripts/check-levels.mjs bunu paketleyip Node'da çalıştırır.
import { generateLevel, generateDuelLevel } from '../src/utils/gameLogic.js';
import { dailySeed, todayKey } from '../src/utils/daily.js';

const N = Number(globalThis.process?.argv[2]) || 10000;
const issues = {};
const add = (k, lv, d) => {
  issues[k] ||= { count: 0, samples: [] };
  issues[k].count++;
  if (issues[k].samples.length < 5) issues[k].samples.push(`${typeof lv === 'number' ? 'L' + (lv + 1) : lv}${d ? ' ' + d : ''}`);
};
const tally = (s) => [...s].reduce((m, c) => ((m[c] = (m[c] || 0) + 1), m), {});
const cellsOf = (w) => [...w.word].map((_, i) => (w.isHorizontal ? `${w.startX + i},${w.startY}` : `${w.startX},${w.startY + i}`));

// Izgara kuralları: kelimeler çarktan kurulur, sözlükte var, hücreler çakışmaz, tek parça, sınırlar içinde
function checkPuzzle(L, lv) {
  const have = tally(L.wheelLetters.join(''));
  const words = L.words;
  if (words.length < 2) add('lt2-words', lv);
  if (new Set(words.map(w => w.word)).size !== words.length) add('duplicate-word', lv);
  const grid = new Map();
  for (const w of words) {
    if (Object.entries(tally(w.word)).some(([k, v]) => (have[k] || 0) < v)) add('word-not-formable', lv, w.word);
    if (!L.validWordsSet.has(w.word)) add('word-not-in-dictionary', lv, w.word);
    cellsOf(w).forEach((k, i) => {
      if (grid.has(k) && grid.get(k) !== w.word[i]) add('cell-conflict', lv, w.word);
      grid.set(k, w.word[i]);
    });
  }
  const seen = new Set([0]);
  for (let grew = true; grew;) {
    grew = false;
    words.forEach((w, i) => {
      if (!seen.has(i) && [...seen].some(j => cellsOf(words[j]).some(c => cellsOf(w).includes(c)))) { seen.add(i); grew = true; }
    });
  }
  if (seen.size !== words.length) add('disconnected-grid', lv);
  // Izgaradaki her yatay/dikey harf dizisi (2+) tam olarak bir kelime olmalı: iç içe ya da
  // bitişik kelimeler (AYI'nın KAYIK içinde kalması gibi) burada yakalanır
  const runsOk = (horizontal) => {
    const placed = new Set(words.filter(w => w.isHorizontal === horizontal).map(w => cellsOf(w).join('|')));
    const found = new Set();
    for (const k of grid.keys()) {
      const [x, y] = k.split(',').map(Number);
      const prev = horizontal ? `${x - 1},${y}` : `${x},${y - 1}`;
      if (grid.has(prev)) continue;
      const run = [];
      for (let i = 0; ; i++) { const c = horizontal ? `${x + i},${y}` : `${x},${y + i}`; if (!grid.has(c)) break; run.push(c); }
      if (run.length >= 2) found.add(run.join('|'));
    }
    return found.size === placed.size && [...found].every(r => placed.has(r));
  };
  if (!runsOk(true) || !runsOk(false)) add('overlapping-or-touching-words', lv);
  const xs = [...grid.keys()].map(k => +k.split(',')[0]);
  const ys = [...grid.keys()].map(k => +k.split(',')[1]);
  if (Math.max(...xs) - Math.min(...xs) >= 9) add('grid-too-wide', lv);
  if (Math.max(...ys) - Math.min(...ys) >= 10) add('grid-too-tall', lv);
}

const first = JSON.stringify(generateLevel(N - 1, 'tr').words);
if (JSON.stringify(generateLevel(N - 1, 'tr').words) !== first) add('not-deterministic', N - 1);

const lastSeen = new Map();
let twoWord = 0, shortGap = 0;
for (let lv = 0; lv < N; lv++) {
  let L;
  try { L = generateLevel(lv, 'tr'); } catch (e) { add('exception', lv, e.message); continue; }
  checkPuzzle(L, lv);
  if (L.words.length === 2) twoWord++;
  if (lv >= 30 && lastSeen.has(L.technicalTerm) && lv - lastSeen.get(L.technicalTerm) < 8) add('root-repeats-within-8', lv, L.technicalTerm);
  if (lastSeen.has(L.technicalTerm) && lv - lastSeen.get(L.technicalTerm) < 25) shortGap++;
  lastSeen.set(L.technicalTerm, lv);
}
// Günün Seferi (önümüzdeki/geçen 2 yıl) ve düello bulmacaları aynı yerleştiriciyi kullanır
const today = new Date(todayKey());
for (let d = -730; d <= 730; d++) {
  const key = todayKey(new Date(today.getFullYear(), today.getMonth(), today.getDate() + d));
  checkPuzzle(generateDuelLevel(dailySeed(key)), `günlük ${key}`);
}
for (let i = 1; i <= 3000; i++) checkPuzzle(generateDuelLevel(i * 7919), `düello ${i * 7919}`);

// Birkaç iki kelimelik ve kısa aralıklı tekrar kabul edilir (havuz küçükken son çare)
if (twoWord > N * 0.005) add('too-many-2-word-levels', 0, String(twoWord));

console.log(JSON.stringify({ levels: N, twoWordLevels: twoWord, repeatsUnder25: shortGap, issues }, null, 1));
globalThis.process.exitCode = Object.keys(issues).length ? 1 : 0;
