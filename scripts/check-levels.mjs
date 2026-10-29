// npm run check:levels [seviye sayısı] — oyun mantığını paketleyip tüm seviyeleri doğrular
import { build } from 'rolldown';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const out = join(tmpdir(), `turnike-check-levels-${process.pid}.cjs`);
await build({
  input: fileURLToPath(new URL('./check-levels.entry.js', import.meta.url)),
  platform: 'node',
  transform: { define: { 'import.meta.env': '{}' } },
  output: { file: out, format: 'cjs' },
  logLevel: 'silent',
});
createRequire(import.meta.url)(out);
