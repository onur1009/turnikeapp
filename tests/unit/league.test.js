import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chunkPoints, addLeaguePoints, LEAGUE_POINTS, weekKey } from '../../src/utils/league.js';
import { useGameStore } from '../../src/store/gameStore.js';

// Node'da tarayıcı deposu yok: store'un kalıcı kaydı için bellek içi yedek
if (!globalThis.localStorage) {
  const m = new Map();
  globalThis.localStorage = { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k), clear: () => m.clear() };
}

test('chunkPoints: sunucunun 50 puan sınırına göre böler', () => {
  assert.deepEqual(chunkPoints(0), []);
  assert.deepEqual(chunkPoints(30), [30]);
  assert.deepEqual(chunkPoints(120), [50, 50, 20]);
});

test('lige katılmamış oyuncunun puanı cihazda bekler (sunucuya gitmez)', () => {
  useGameStore.setState({ leagueState: { week: weekKey(), tier: 1, points: 0, pending: 0, groupNo: null, cachedGroup: [], userId: null, lastResult: null, seenResult: true } });
  addLeaguePoints('level');
  addLeaguePoints('level');
  const s = useGameStore.getState().leagueState;
  assert.equal(s.points, LEAGUE_POINTS.level * 2);
  assert.equal(s.pending, LEAGUE_POINTS.level * 2);
});

test('eski kayıtta pending alanı yoksa 0 sayılır', () => {
  useGameStore.setState({ leagueState: { week: weekKey(), tier: 1, points: 5, groupNo: null, cachedGroup: [], userId: null, lastResult: null, seenResult: true } });
  addLeaguePoints('level');
  assert.equal(useGameStore.getState().leagueState.pending, LEAGUE_POINTS.level);
});
