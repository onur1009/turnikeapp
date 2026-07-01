const fs = require('fs');
const path = require('path');

const projectDir = 'C:\\Users\\onur1\\Desktop\\Anti\\TurnikeApp';
const outputFile = path.join(projectDir, 'turnike_manus_ai_ready.md');

// List of files to include
const filesToInclude = [
  'package.json',
  'vite.config.js',
  'src/main.jsx',
  'src/App.jsx',
  'src/index.css',
  'src/store/gameStore.js',
  'src/hooks/useGameTimer.js',
  'src/utils/gameLogic.js',
  'src/utils/i18n.js',
  'src/utils/soundManager.js',
  'src/utils/firebaseService.js',
  'src/components/AkbilScreen.jsx',
  'src/components/AnimatedBalance.jsx',
  'src/components/BadgesScreen.jsx',
  'src/components/BonusLockers.jsx',
  'src/components/DailySpinScreen.jsx',
  'src/components/DictionaryScreen.jsx',
  'src/components/Grid.jsx',
  'src/components/LeaderboardScreen.jsx',
  'src/components/LevelComplete.jsx',
  'src/components/MapScreen.jsx',
  'src/components/SettingsScreen.jsx',
  'src/components/StatsScreen.jsx',
  'src/components/TutorialModal.jsx',
  'src/components/VaultScreen.jsx',
  'src/components/Wheel.jsx'
];

let markdownContent = `# TURNİKE: SÖZCÜK SEFERİ - PROJECT SOURCE & DOCUMENTATION\n\n` +
`This document compiles the entire source code and development history of the "Turnike: Sözcük Seferi" project. It is structured to be easily read and parsed by an AI assistant (like Manus AI) to continue development, refactor, or debug.\n\n` +
`---\n\n` +
`## 1. PROJECT OVERVIEW & ARCHITECTURE\n\n` +
`**Turnike: Sözcük Seferi** is a Turkish/English word puzzle game built with **React**, **Vite**, and **TailwindCSS/Vanilla CSS**. It is designed as a Mobile-First Web App (PWA) and is wrapped using **Capacitor** for native mobile features (Haptics, StatusBar, etc.).\n\n` +
`### Key Architecture Components:\n` +
`1. **State Management (\`src/store/gameStore.js\`):**\n` +
`   * Powered by **Zustand** with \`persist\` middleware.\n` +
`   * Manages player balance (₺), hints, level index, lives, combos, streaks, spin wheel dates, unlocked badges, vault words, and general statistics.\n` +
`2. **Navigation/Routing (\`src/App.jsx\`):**\n` +
`   * Uses a simple state-based screen router (\`screen\` state: \`'loading' | 'home' | 'game' | 'levels' | 'dictionary' | 'vault' | 'leaderboard' | 'settings' | 'stats' | 'badges' | 'akbil'\`).\n` +
`3. **Core Gameplay Logic (\`src/utils/gameLogic.js\`):**\n` +
`   * Word generation, validation, grid layout calculations, and dynamic level timers.\n` +
`   * Features a TDK (Turkish Language Association) API check fallback for words not in the local dictionary. If a player submits a valid Turkish word not in the grid, it goes to the "Vault" (Kasa) and yields bonus balance.\n` +
`4. **Theme & Localization:**\n` +
`   * Custom themes: \`dark\`, \`light\`, \`retro\`.\n` +
`   * Localization helper: \`src/utils/i18n.js\`.\n\n` +
`---\n\n` +
`## 2. DEVELOPMENT HISTORY & IMPLEMENTED FEATURES\n` +
`- **Daily Spin Wheel:** Players can spin a wheel once a day to earn balance (₺) or hints.\n` +
`- **Locker Bonus Game (Kayıp Eşya Bürosu):** Every 10 levels completed (or level index multiple of 10), a bonus screen overlays the game board. Players choose from 9 lockers (representing lost items on Istanbul transit) to find rewards.\n` +
`- **Istanbulkart Theme:** Player balance is represented as Istanbulkart balance (₺). The Akbil screen allows custom card styling.\n` +
`- **Stats & Achievements (Badges):** Tracks streak days, total words, total games, and unlocks badges (e.g., "Speed Demon", "Flawless").\n` +
`- **Haptic Feedback:** Integrates \`@capacitor/haptics\` for tactile feedback on correct/wrong answers, time expiration, etc.\n\n` +
`---\n\n` +
`## 3. SOURCE CODES\n\n`;

filesToInclude.forEach(relPath => {
  const fullPath = path.join(projectDir, relPath);
  if (fs.existsSync(fullPath)) {
    console.log(`Adding ${relPath}...`);
    const content = fs.readFileSync(fullPath, 'utf8');
    const ext = path.extname(relPath).substring(1);
    const lang = ext === 'jsx' || ext === 'js' ? 'javascript' : ext;
    
    markdownContent += `\n### File: \`${relPath}\`\n\n\`\`\`${lang}\n${content}\n\`\`\`\n\n---\n`;
  } else {
    console.warn(`File not found: ${relPath}`);
  }
});

fs.writeFileSync(outputFile, markdownContent, 'utf8');
console.log(`Project source code compiled successfully to: ${outputFile}`);
