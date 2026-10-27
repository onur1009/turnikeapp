# Graph Report - TurnikeApp  (2026-10-27)

## Corpus Check
- 76 files · ~85,440 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 23 file(s) not represented in the graph (top: .xml 10, (none) 5, .properties 2)

## Summary
- 406 nodes · 885 edges · 31 communities (17 shown, 14 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `69519297`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- NavigationContainer.jsx
- GameContainer.jsx
- gameLogic.js
- run.cjs
- run_artemis.py
- package.json
- devDependencies
- dependencies
- ExampleInstrumentedTest.java
- transitNetwork.js
- main.jsx
- CLAUDE.md
- SceneBackground.jsx
- scripts
- vercel.json
- eslint.config.js
- MainActivity.java
- Turnike mobil testleri (Artemis)
- React + Vite
- puppeteer
- vite.config.js

## God Nodes (most connected - your core abstractions)
1. `GameContainer()` - 37 edges
2. `useGameStore` - 35 edges
3. `react` - 29 edges
4. `useTranslation()` - 26 edges
5. `NavigationContainer()` - 21 edges
6. `ScreenHeader()` - 18 edges
7. `formatKurus()` - 17 edges
8. `playTone()` - 14 edges
9. `generateLevel()` - 13 edges
10. `getStationForLevel()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `App()` --calls--> `GameContainer()`  [EXTRACTED]
  src/App.jsx → src/components/GameContainer.jsx
- `App()` --calls--> `playBadgeUnlock()`  [EXTRACTED]
  src/App.jsx → src/utils/soundManager.js
- `start()` --calls--> `App()`  [EXTRACTED]
  src/main.jsx → src/App.jsx
- `GameContainer()` --calls--> `AnimatedBalance()`  [EXTRACTED]
  src/components/GameContainer.jsx → src/components/AnimatedBalance.jsx
- `BonusLockers()` --calls--> `useGameStore`  [EXTRACTED]
  src/components/BonusLockers.jsx → src/store/gameStore.js

## Import Cycles
- None detected.

## Communities (31 total, 14 thin omitted)

### Community 0 - "NavigationContainer.jsx"
Cohesion: 0.13
Nodes (38): react, @supabase/supabase-js, App(), AkbilScreen(), BALANCE_PACKS, CARD_COLORS, AnimatedBalance(), BadgesScreen() (+30 more)

### Community 1 - "GameContainer.jsx"
Cohesion: 0.10
Nodes (44): @capacitor/app, @capacitor/haptics, @capacitor/status-bar, BonusLockers(), generateLockerContents(), REWARD_TYPES, GameContainer(), gridRows() (+36 more)

### Community 2 - "gameLogic.js"
Cohesion: 0.06
Nodes (47): PROVIDER_THEMES, COMMON_WORDS_EN, COMMON_WORDS_TR, PROVIDERS_EN, PROVIDERS_TR, TERMS_EN, TERMS_TR, TRANSIT_MEANINGS_EN (+39 more)

### Community 3 - "run.cjs"
Cohesion: 0.08
Nodes (18): content, fs, filesToInclude, fs, outputFile, path, filesToInclude, fs (+10 more)

### Community 4 - "run_artemis.py"
Cohesion: 0.13
Nodes (5): adb(), find_adb(), main(), parse_verdict(), Scenario

### Community 5 - "package.json"
Cohesion: 0.13
Nodes (14): name, private, type, version, autoprefixer, @capacitor/android, @capacitor/cli, @capacitor/ios (+6 more)

### Community 6 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, autoprefixer, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, postcss (+7 more)

### Community 7 - "dependencies"
Cohesion: 0.14
Nodes (14): dependencies, @capacitor/android, @capacitor/app, @capacitor/cli, @capacitor/core, @capacitor/haptics, @capacitor/ios, @capacitor/preferences (+6 more)

### Community 9 - "transitNetwork.js"
Cohesion: 0.13
Nodes (25): MapScreen(), NetworkMap(), ZOOMS, NetworkScreen(), EXTRA_STATION_NAMES, LINE_DEFS, MODE_GROUPS, MODE_META (+17 more)

### Community 10 - "main.jsx"
Cohesion: 0.19
Nodes (9): @capacitor/core, @capacitor/preferences, react-dom, ErrorBoundary, start(), GAME_STORAGE_KEY, backedUpStorage, isNative (+1 more)

### Community 12 - "SceneBackground.jsx"
Cohesion: 0.09
Nodes (19): FarCity(), LANDMARKS, rng(), SceneBackground(), Bogie(), Funicular(), Marmaray(), Metro() (+11 more)

### Community 14 - "scripts"
Cohesion: 0.29
Nodes (7): scripts, android:apk, build, dev, lint, preview, test:mobile

### Community 15 - "vercel.json"
Cohesion: 0.40
Nodes (4): buildCommand, framework, outputDirectory, rewrites

### Community 17 - "eslint.config.js"
Cohesion: 0.33
Nodes (5): eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals

### Community 29 - "Turnike mobil testleri (Artemis)"
Cohesion: 0.40
Nodes (4): Senaryolar (`scenarios.py`), Turnike mobil testleri (Artemis), Yeni senaryo eklerken, Çalıştırma

### Community 30 - "React + Vite"
Cohesion: 0.50
Nodes (3): Expanding the ESLint configuration, React Compiler, React + Vite

### Community 32 - "vite.config.js"
Cohesion: 0.50
Nodes (3): vite, vite-plugin-pwa, @vitejs/plugin-react

## Knowledge Gaps
- **118 isolated node(s):** `fs`, `content`, `fs`, `path`, `outputFile` (+113 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 163 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `NavigationContainer.jsx` to `GameContainer.jsx`, `gameLogic.js`, `package.json`, `transitNetwork.js`, `main.jsx`, `SceneBackground.jsx`?**
  _High betweenness centrality (0.160) - this node is a cross-community bridge._
- **What connects `fs`, `content`, `fs` to the rest of the system?**
  _118 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `NavigationContainer.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1256575102279369 - nodes in this community are weakly interconnected._
- **Why does `devDependencies` connect `devDependencies` to `package.json`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **Should `GameContainer.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Should `gameLogic.js` be split into smaller, more focused modules?**
  _Cohesion score 0.062409288824383166 - nodes in this community are weakly interconnected._