import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateDuelLevel } from '../../src/utils/gameLogic.js';
import { weekKey } from '../../src/utils/league.js';

// supabase/migrations/0004_security_hardening.sql ile aynı kurallar: istemci bunlara uymazsa
// sunucu turu reddeder (invalid_puzzle) ve düellolar sessizce bozulur.
const SERVER_WORD = /^[A-ZÇĞİÖŞÜ]{2,10}$/;

test('düello bulmacaları sunucunun kelime kuralına uyar', () => {
  for (const lang of ['tr', 'en']) {
    for (let seed = 1; seed <= 400; seed++) {
      const words = generateDuelLevel(seed * 7919, lang).words.map(w => w.word);
      assert.ok(words.length >= 2 && words.length <= 12, `${lang} ${seed}: ${words.length} kelime`);
      for (const w of words) assert.match(w, SERVER_WORD, `${lang} ${seed}: ${w}`);
    }
  }
});

test('lig hafta anahtarı sunucu biçiminde (IYYY-"W"IW)', () => {
  assert.equal(weekKey(new Date(2026, 0, 1)), '2026-W01');
  assert.equal(weekKey(new Date(2027, 0, 1)), '2026-W53');
  assert.match(weekKey(), /^\d{4}-W\d{2}$/);
});
