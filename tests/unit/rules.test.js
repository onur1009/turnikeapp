import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classifyWord, wrongWordCostsLife, vaultOutcome, levelRewards, dropsLostItem, showsBonusLockers, FLAWLESS_BONUS, STATION_BONUS } from '../../src/game/rules.js';

const ctx = { gridWords: ['KÖY', 'KAYIK'], foundWords: ['KÖY'], vaultWords: ['DAİ'], dictionary: new Set(['KÖY', 'KAYIK', 'AYI', 'DAİ']) };

test('classifyWord: bulunan ve kasadaki kelime tekrar sayılmaz', () => {
  assert.equal(classifyWord('KÖY', ctx), 'duplicate');
  assert.equal(classifyWord('DAİ', ctx), 'duplicate');
});

test('classifyWord: ızgara, ekstra ve bilinmeyen', () => {
  assert.equal(classifyWord('KAYIK', ctx), 'grid');
  assert.equal(classifyWord('AYI', ctx), 'extra');
  assert.equal(classifyWord('XYZ', ctx), 'unknown');
});

test('ilk 5 seviyede yanlış kelime can götürmez', () => {
  assert.equal(wrongWordCostsLife(0), false);
  assert.equal(wrongWordCostsLife(4), false);
  assert.equal(wrongWordCostsLife(5), true);
});

test('vaultOutcome: 10. kelime kasayı boşaltır', () => {
  assert.equal(vaultOutcome(9, 0), 'jackpot');
  assert.equal(vaultOutcome(3, 4), 'added');
  assert.equal(vaultOutcome(4, 4), 'none');
});

test('levelRewards: sade bölüm yalnızca kelime puanı dışında bir şey vermez', () => {
  const r = levelRewards({ sessionScore: 100, expressRemaining: 0, isFlawless: false, isLastLeg: false });
  assert.deepEqual(r, { perfectBonus: 0, expressBonus: 0, setBonus: 0, stationBonus: 0, eventBonus: 0, lostBonus: 0, total: 0 });
});

test('levelRewards: hatasız, ekspres, durak sonu, etkinlik ve set çarpanı', () => {
  const r = levelRewards({ sessionScore: 100, expressRemaining: 10, isFlawless: true, earningsMultiplier: 1.5, isLastLeg: true, eventMultiplier: 2, lostItemIsDaily: true });
  assert.equal(r.perfectBonus, FLAWLESS_BONUS);
  assert.equal(r.expressBonus, 4); // 10 sn * 5 * 0,08
  assert.equal(r.setBonus, Math.round((100 + FLAWLESS_BONUS + 4) * 0.5));
  assert.equal(r.stationBonus, STATION_BONUS);
  assert.equal(r.eventBonus, 100);
  assert.equal(r.lostBonus, 150);
  assert.equal(r.total, r.perfectBonus + r.expressBonus + r.setBonus + r.stationBonus + r.eventBonus + r.lostBonus);
});

test('kayıp eşya: durak sonunda kesin, diğerlerinde %15', () => {
  assert.equal(dropsLostItem(true, () => 0.99), true);
  assert.equal(dropsLostItem(false, () => 0.10), true);
  assert.equal(dropsLostItem(false, () => 0.20), false);
});

test('emanet dolapları: her 10. seviye kesin, ilk 3 seviyede sürpriz yok', () => {
  assert.equal(showsBonusLockers(9, () => 0.99), true);
  assert.equal(showsBonusLockers(2, () => 0), false);
  assert.equal(showsBonusLockers(3, () => 0.1), true);
  assert.equal(showsBonusLockers(3, () => 0.2), false);
});
