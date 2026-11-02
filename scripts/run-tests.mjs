// npm test — tests/unit/*.test.js dosyalarını tek pakette toplayıp Node'un yerleşik
// test çalıştırıcısıyla (node:test) koşar. Kaynak Vite'a özgü (import.meta.env, uzantısız import)
// olduğu için önce rolldown ile paketlenir; ek test kütüphanesi gerekmez.
import { build } from 'rolldown';
import { readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const dir = fileURLToPath(new URL('../tests/unit/', import.meta.url));
const files = readdirSync(dir).filter(f => f.endsWith('.test.js'));
const entry = join(tmpdir(), `turnike-tests-entry-${process.pid}.mjs`);
writeFileSync(entry, files.map(f => `import ${JSON.stringify(pathToFileURL(join(dir, f)).href)};`).join('\n'));

const out = join(tmpdir(), `turnike-tests-${process.pid}.mjs`);
await build({
  input: entry,
  platform: 'node',
  transform: { define: { 'import.meta.env': '{}' } },
  external: [/^node:/],
  output: { file: out, format: 'esm', codeSplitting: false },
  logLevel: 'silent',
});
await import(pathToFileURL(out).href);
