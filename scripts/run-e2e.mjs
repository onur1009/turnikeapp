// npm run test:e2e — Vite sunucusunu açar, tests/e2e/*.test.js dosyalarını paketleyip (puppeteer
// harici) node:test ile koşar, sunucuyu kapatır. Tarayıcı: PUPPETEER_EXECUTABLE_PATH, yoksa Windows'ta
// Edge, yoksa puppeteer'ın kendi Chrome'u.
import { build } from 'rolldown';
import { spawn } from 'node:child_process';
import { readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const PORT = 5174;
const root = fileURLToPath(new URL('..', import.meta.url));
const dir = join(root, 'tests', 'e2e');
const files = readdirSync(dir).filter(f => f.endsWith('.test.js'));
const entry = join(tmpdir(), `turnike-e2e-entry-${process.pid}.mjs`);
writeFileSync(entry, files.map(f => `import ${JSON.stringify(pathToFileURL(join(dir, f)).href)};`).join('\n'));
// Proje içine yazılır: ESM, 'puppeteer' adını paketin bulunduğu klasörden çözer
const out = join(root, 'node_modules', '.cache', 'turnike-e2e.mjs');
await build({
  input: entry,
  platform: 'node',
  transform: { define: { 'import.meta.env': '{}' } },
  external: [/^node:/, 'puppeteer'],
  output: { file: out, format: 'esm', codeSplitting: false },
  logLevel: 'silent',
});

const server = spawn(`npx vite --port ${PORT} --strictPort`, { cwd: root, shell: true, stdio: 'ignore' });
const ready = async () => {
  for (let i = 0; i < 60; i++) {
    try { if ((await fetch(`http://localhost:${PORT}/`)).ok) return; } catch { /* henüz açılmadı */ }
    await new Promise(r => setTimeout(r, 500));
  }
  throw new Error('Vite sunucusu 30 sn içinde açılmadı');
};
let code = 1;
try {
  await ready();
  code = await new Promise(res => {
    const child = spawn(process.execPath, [out], { cwd: root, stdio: 'inherit', env: { ...process.env, E2E_URL: `http://localhost:${PORT}/` } });
    child.on('exit', res);
  });
} finally {
  // Windows'ta npx alt süreçleri ağaç olarak kapatılmalı
  if (process.platform === 'win32') spawn('taskkill', ['/pid', String(server.pid), '/T', '/F'], { stdio: 'ignore' });
  else server.kill('SIGTERM');
}
process.exitCode = code;
