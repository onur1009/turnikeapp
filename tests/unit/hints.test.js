import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hiddenCells, pickRandom, hintPayment, maskTerm } from '../../src/game/hints.js';

const words = [
  { word: 'KÖY', startX: 0, startY: 0, isHorizontal: true },
  { word: 'KÖK', startX: 0, startY: 0, isHorizontal: false },
];

test('hiddenCells: bulunan kelimeler ve açılmış hücreler hariç', () => {
  assert.equal(hiddenCells(words, [], []).length, 6); // kesişim (0,0) iki kelimede de sayılır
  assert.deepEqual(hiddenCells(words, ['KÖY'], [{ x: 0, y: 1 }]).map(c => c.char), ['K', 'K']);
  assert.equal(hiddenCells(words, ['KÖY', 'KÖK'], []).length, 0);
});

test('pickRandom: boş listede null', () => {
  assert.equal(pickRandom([], () => 0), null);
  assert.equal(pickRandom(['a', 'b'], () => 0.9), 'b');
});

test('hintPayment: önce ipucu hakkı, sonra bakiye, yoksa null', () => {
  assert.equal(hintPayment({ hints: 1, balance: 0, cost: 25 }), 'hint');
  assert.equal(hintPayment({ hints: 0, balance: 25, cost: 25 }), 'balance');
  assert.equal(hintPayment({ hints: 0, balance: 24, cost: 25 }), null);
});

test('maskTerm: kök anlamın içinde gizlenir', () => {
  assert.equal(maskTerm('TRAMVAY raylı araçtır; TRAMVAY durağı', 'TRAMVAY'), '●●●●●●● raylı araçtır; ●●●●●●● durağı');
});
