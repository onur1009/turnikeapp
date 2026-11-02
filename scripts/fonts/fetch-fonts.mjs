// Google Fonts'tan woff2 dosyalarını indirip public/fonts'a koyar, yerel @font-face CSS'i yazar
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
const root = process.argv[2] || '.';
const icons = readFileSync(process.argv[3], 'utf8').trim().split(',').filter(n => !['s', 'true', 'white'].includes(n)).sort();
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const dir = join(root, 'public', 'fonts');
mkdirSync(dir, { recursive: true });
const sources = [
  ['jakarta', 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'],
  ['symbols', `https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&icon_names=${icons.join(',')}&display=block`],
];
let css = '/* Yerel fontlar: Google Fonts bağlantısının yerine (internetsiz açılışta simgeler yazıya dönmesin).\n   Simge fontu yalnızca kullanılan simgeleri içerir; yeni simge ekleyince npm run fonts çalıştırılmalı. */\n';
let total = 0;
for (const [name, url] of sources) {
  const r = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!r.ok) throw new Error(`${name}: ${r.status}`);
  let text = await r.text();
  // Türkçe için latin ve latin-ext yeter; aynı adres tek dosya
  if (name === 'jakarta') text = text.split(/(?=\/\* [a-z-]+ \*\/)/).filter(b => /^\/\* latin(-ext)? \*\//.test(b)).join('');
  const seen = new Map();
  let i = 0;
  for (const m of [...text.matchAll(/url\((https:[^)]+)\)/g)]) {
    if (!seen.has(m[1])) {
      const file = `${name}-${i++}.woff2`;
      const buf = Buffer.from(await (await fetch(m[1], { headers: { 'User-Agent': UA } })).arrayBuffer());
      writeFileSync(join(dir, file), buf);
      total += buf.length;
      seen.set(m[1], file);
    }
    text = text.replace(m[1], `/fonts/${seen.get(m[1])}`);
  }
  css += `
/* ${name} */
` + text;
  console.log(name, i, 'dosya');
}
writeFileSync(join(root, 'src', 'fonts.css'), css);
console.log('toplam', Math.round(total / 1024), 'KB', '| simge', icons.length);
