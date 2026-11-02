// Ana oyun akışları gerçek tarayıcıda (412x833 telefon görünümü). Supabase ve TDK istekleri kesilir:
// testler veritabanını kirletmez, sözlükte olmayan kelime oyuncuyu cezalandırmaz.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import puppeteer from 'puppeteer';
import { generateLevel } from '../../src/utils/gameLogic.js';

const URL = process.env.E2E_URL || 'http://localhost:5174/';
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || (existsSync(EDGE) ? EDGE : undefined);
const DICT = generateLevel(0, 'tr').validWordsSet;
const wait = (ms) => new Promise(r => setTimeout(r, ms));

// Çarktaki harflerle kurulabilen tüm sözlük kelimeleri, uzundan kısaya
const solve = (letters) => {
  const tally = (s) => [...s].reduce((m, c) => ((m[c] = (m[c] || 0) + 1), m), {});
  const have = tally(letters.join(''));
  return [...DICT].filter(w => w.length >= 3 && w.length <= letters.length && Object.entries(tally(w)).every(([k, v]) => (have[k] || 0) >= v)).sort((a, b) => b.length - a.length);
};

let browser;
before(async () => { browser = await puppeteer.launch({ executablePath, headless: true }); });
after(async () => { await browser?.close(); });

// Kayıtlı oyuncu: istenen seviyede, günlük çark çevrilmiş, izin sorulmuş, ilk ipuçları görülmüş
const openGame = async ({ level = 0, spunToday = true } = {}) => {
  const p = await browser.newPage();
  await p.setViewport({ width: 412, height: 833, isMobile: true });
  await p.setRequestInterception(true);
  p.on('request', r => (/supabase\.co|sozluk\.gov\.tr/.test(r.url()) ? r.abort() : r.continue()));
  const errors = [];
  p.on('pageerror', e => errors.push(e.message));
  await p.goto(URL, { waitUntil: 'networkidle2' });
  await wait(1500);
  await p.evaluate(({ level, spunToday }) => {
    const k = 'turnike-game-storage';
    const j = JSON.parse(localStorage.getItem(k));
    Object.assign(j.state, { maxUnlockedLevel: level, analyticsConsent: false, lastSpinDate: spunToday ? new Date().toLocaleDateString() : '' });
    localStorage.setItem(k, JSON.stringify(j));
    localStorage.setItem('turnike_tutorial_seen', 'true');
  }, { level, spunToday });
  await p.goto(URL, { waitUntil: 'networkidle2' });
  await wait(4500);
  await p.mouse.click(5, 5); // açılış tanıtımını geç
  await wait(2000);
  return { p, errors };
};
const text = (p) => p.evaluate(() => document.body.innerText);
const click = (p, re) => p.evaluate((src) => {
  const r = new RegExp(src, 'i');
  const el = [...document.querySelectorAll('button,[role=button]')].find(x => x.offsetParent && r.test(`${x.getAttribute('aria-label') || ''} ${x.innerText}`.trim()));
  el?.click();
  return !!el;
}, re);
const playOut = async (p, doneRe) => {
  await p.waitForSelector('.wheel-letter', { timeout: 15000 });
  await wait(2500);
  const letters = await p.evaluate(() => [...document.querySelectorAll('.wheel-letter,.wheel-letter-active')].map(x => x.textContent));
  for (const w of solve(letters)) {
    await p.evaluate((w) => { for (const ch of w) window.dispatchEvent(new KeyboardEvent('keydown', { key: ch })); window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' })); }, w);
    await wait(450);
    if (doneRe.test(await text(p))) return true;
  }
  await wait(3000);
  return doneRe.test(await text(p));
};

test('ilk açılış: ana ekran ve devam düğmesi', async () => {
  const { p, errors } = await openGame({ level: 12 });
  assert.match(await text(p), /DEVAM ET/);
  assert.match(await text(p), /SEVİYE 13/);
  assert.deepEqual(errors, []);
  await p.close();
});

test('günlük çark oturumda bir kez açılır', async () => {
  const { p } = await openGame({ level: 12, spunToday: false });
  assert.match(await text(p), /Turnike Çarkı/);
  assert.ok(await click(p, '^Sonra$'));
  await wait(800);
  assert.ok(await click(p, 'AYARLAR'));
  await wait(1200);
  await click(p, '^(arrow_back )?(GERİ|Geri)$');
  await wait(1500);
  assert.doesNotMatch(await text(p), /Turnike Çarkı/);
  await p.close();
});

test('ara bölüm: oynanır, "Bölüm 2/5 tamamlandı" ve "DEVAM ET"', async () => {
  const { p, errors } = await openGame({ level: 41 }); // 41 → durağın 2. bölümü
  assert.ok(await click(p, 'DEVAM ET'));
  assert.ok(await playOut(p, /ANA MENÜ|HAKKIN KALDI/i), 'bölüm bitmedi');
  if (/HAKKIN KALDI/.test(await text(p))) { // %12,5 sürpriz dolap
    for (let i = 0; i < 3; i++) { await p.evaluate((i) => document.querySelectorAll('button[aria-label^="Dolap"]')[i].click(), i); await wait(900); }
    await click(p, '^DEVAM ET$');
    await wait(1500);
  }
  const t = await text(p);
  assert.match(t, /Bölüm 2\/5 tamamlandı/);
  assert.match(t, /SIRADAKİ BÖLÜM/i);
  assert.deepEqual(errors, []);
  await p.close();
});

test('durak sonu: emanet dolapları erişilebilir, devamla geçilir', async () => {
  const { p } = await openGame({ level: 49 }); // 50. seviye: durak sonu + kesin dolap
  assert.ok(await click(p, 'DEVAM ET'));
  assert.ok(await playOut(p, /HAKKIN KALDI/), 'dolaplar açılmadı');
  assert.equal(await p.evaluate(() => document.querySelectorAll('button[aria-label^="Dolap"]').length), 9);
  for (let i = 0; i < 3; i++) { await p.evaluate((i) => document.querySelectorAll('button[aria-label^="Dolap"]')[i * 4].click(), i); await wait(900); }
  assert.match(await p.evaluate(() => document.querySelector('button[aria-label^="Dolap 1:"]')?.getAttribute('aria-label') || ''), /Dolap 1: .+/);
  await wait(800);
  assert.ok(await click(p, '^DEVAM ET$'));
  await p.waitForFunction(() => /ANA MENÜ/i.test(document.body.innerText), { timeout: 5000 });
  assert.match(await text(p), /durağına vardın · Bölüm 5\/5/);
  await p.close();
});

test('çark: merkezden çapraz geçiş yalnızca iki uç harfi seçer', async () => {
  const { p } = await openGame({ level: 41 });
  await click(p, 'DEVAM ET');
  await p.waitForSelector('.wheel-letter', { timeout: 15000 });
  await wait(2500);
  const nodes = await p.evaluate(() => [...document.querySelectorAll('.wheel-letter')].map(n => { const r = n.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, ch: n.textContent }; }));
  const cx = nodes.reduce((s, q) => s + q.x, 0) / nodes.length, cy = nodes.reduce((s, q) => s + q.y, 0) / nodes.length;
  const far = nodes[Math.floor(nodes.length / 2)];
  await p.mouse.move(nodes[0].x, nodes[0].y);
  await p.mouse.down();
  await p.mouse.move(cx, cy, { steps: 8 });
  await p.mouse.move(far.x, far.y, { steps: 8 });
  const picked = await p.evaluate(() => document.querySelector('.-top-14 span')?.textContent || '');
  await p.mouse.up();
  assert.equal(picked, nodes[0].ch + far.ch);
  await p.close();
});

test('duraklatma: süre durur, devamla kaldığı yerden akar', async () => {
  const { p } = await openGame({ level: 41 });
  await click(p, 'DEVAM ET');
  await p.waitForSelector('.wheel-letter', { timeout: 15000 });
  await wait(3000);
  const sec = async () => Number((await text(p)).match(/(\d+)s\b/)?.[1]);
  const before = await sec();
  await p.click('button[aria-label="Duraklat"]');
  await wait(3000);
  assert.ok(await p.$('[aria-label="Oyun duraklatıldı"]'));
  assert.equal(await sec(), before);
  await p.evaluate(() => [...document.querySelectorAll('[role=dialog] button')].find(x => x.innerText.trim() === 'DEVAM ET').click());
  await wait(2500);
  assert.ok(await sec() < before);
  await p.close();
});
