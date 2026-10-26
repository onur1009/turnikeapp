// npm run test:mobile -> Artemis'in kendi Python ortamıyla run_artemis.py'yi çalıştırır.
// Artemis'in yeri ARTEMIS_HOME ile değiştirilebilir (varsayılan C:\artemis).
const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const artemisHome = process.env.ARTEMIS_HOME || 'C:\\artemis';
const venvPython = process.platform === 'win32'
  ? path.join(artemisHome, '.venv', 'Scripts', 'python.exe')
  : path.join(artemisHome, '.venv', 'bin', 'python');
const python = fs.existsSync(venvPython) ? venvPython : 'python';

const result = spawnSync(python, [path.join(__dirname, 'run_artemis.py'), ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: { ...process.env, ARTEMIS_HOME: artemisHome, PYTHONIOENCODING: 'utf-8' },
});
process.exit(result.status ?? 1);
