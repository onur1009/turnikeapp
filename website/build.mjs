// Statik tanıtım sitesi: src/ → dist/, alan adları ortam değişkeninden gelir.
// Vercel'de: Root Directory = website, Build Command = node build.mjs, Output = dist,
// Environment Variables: SITE_URL (ör. https://turnikeoyun.com), GAME_URL, INSTAGRAM_URL.
import { cpSync, readdirSync, readFileSync, writeFileSync, rmSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const env = (k, fallback) => {
  const v = (process.env[k] || fallback || '').replace(/\/$/, '');
  if (!v) throw new Error(`${k} tanımlı değil`);
  if (!/^https:\/\//.test(v)) throw new Error(`${k} https:// ile başlamalı`);
  return v;
};
const vars = {
  '%SITE%': env('SITE_URL'),
  '%GAME%': env('GAME_URL', 'https://turnikeapp.vercel.app'),
  '%INSTAGRAM%': env('INSTAGRAM_URL', 'https://www.instagram.com/'),
  '%DATE%': new Date().toISOString().slice(0, 10),
};

rmSync('dist', { recursive: true, force: true });
cpSync('src', 'dist', { recursive: true });
const walk = (d) => readdirSync(d).flatMap(f => statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]);
for (const f of walk('dist').filter(f => ['.html', '.xml', '.txt'].includes(extname(f)))) {
  let s = readFileSync(f, 'utf8');
  for (const [k, v] of Object.entries(vars)) s = s.replaceAll(k, v);
  if (/%[A-Z]+%/.test(s)) throw new Error(`${f}: doldurulmamış yer tutucu`);
  writeFileSync(f, s);
}
console.log('site hazır →', vars['%SITE%']);
