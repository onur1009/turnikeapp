// Statik tanıtım sitesi: src/ → dist/, alan adları ortam değişkeninden gelir.
// Vercel'de: Root Directory = website, Build Command = node build.mjs, Output = dist,
// Environment Variables: SITE_URL (ör. https://turnikeapp.com.tr), INSTAGRAM_URL,
// ANDROID_CERT_SHA256 (isteğe bağlı: Play Console > Uygulama imzalama > SHA-256; düello bağlantıları uygulamayı açsın).
import { cpSync, readdirSync, readFileSync, writeFileSync, rmSync, statSync, mkdirSync } from 'node:fs';
import { join, extname } from 'node:path';

const env = (k, fallback) => {
  const v = (process.env[k] || fallback || '').replace(/\/$/, '');
  if (!v) throw new Error(`${k} tanımlı değil`);
  if (!/^https:\/\//.test(v)) throw new Error(`${k} https:// ile başlamalı`);
  return v;
};
const vars = {
  '%SITE%': env('SITE_URL'),
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
// Android App Links: turnikeapp.com.tr/duello bağlantıları yüklü uygulamayı doğrudan açar
const certs = (process.env.ANDROID_CERT_SHA256 || '').split(',').map(x => x.trim().toUpperCase()).filter(Boolean);
if (certs.some(c => !/^([0-9A-F]{2}:){31}[0-9A-F]{2}$/.test(c))) throw new Error('ANDROID_CERT_SHA256 biçimi AA:BB:… (32 bayt) olmalı');
if (certs.length) {
  mkdirSync('dist/.well-known', { recursive: true });
  writeFileSync('dist/.well-known/assetlinks.json', JSON.stringify([{ relation: ['delegate_permission/common.handle_all_urls'],
    target: { namespace: 'android_app', package_name: 'com.turnike.app', sha256_cert_fingerprints: certs } }], null, 2));
}
// AdMob app-ads.txt: Play kaydındaki web sitesinin kökünde olmalı
const pub = (process.env.ADMOB_PUBLISHER_ID || '').trim();
if (pub && !/^pub-\d{16}$/.test(pub)) throw new Error('ADMOB_PUBLISHER_ID biçimi pub-1234567890123456 olmalı');
if (pub) writeFileSync('dist/app-ads.txt', `google.com, ${pub}, DIRECT, f08c47fec0942fa0
`);
console.log('site hazır →', vars['%SITE%'], certs.length ? '(assetlinks.json var)' : '(assetlinks.json yok: ANDROID_CERT_SHA256 tanımsız)');
