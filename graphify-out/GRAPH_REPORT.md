# Graph Report - TurnikeApp  (2026-10-27)

## Corpus Check
- 72 files · ~80,694 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 23 file(s) not represented in the graph (top: .xml 10, (none) 5, .properties 2)

## Summary
- 369 nodes · 809 edges · 32 communities (17 shown, 15 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 10 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `fe503ae0`
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
- VehicleSprite.jsx
- persistStorage.js
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
3. `react` - 27 edges
4. `useTranslation()` - 26 edges
5. `NavigationContainer()` - 20 edges
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

## Communities (32 total, 15 thin omitted)

### Community 0 - "NavigationContainer.jsx"
Cohesion: 0.11
Nodes (41): react, App(), AkbilScreen(), BALANCE_PACKS, CARD_COLORS, AnimatedBalance(), BadgesScreen(), DailySpinScreen() (+33 more)

### Community 1 - "GameContainer.jsx"
Cohesion: 0.11
Nodes (43): @capacitor/app, @capacitor/haptics, @capacitor/status-bar, BonusLockers(), generateLockerContents(), REWARD_TYPES, GameContainer(), gridRows() (+35 more)

### Community 2 - "gameLogic.js"
Cohesion: 0.06
Nodes (46): PROVIDER_THEMES, COMMON_WORDS_EN, COMMON_WORDS_TR, PROVIDERS_EN, PROVIDERS_TR, TERMS_EN, TERMS_TR, TRANSIT_MEANINGS_EN (+38 more)

### Community 3 - "run.cjs"
Cohesion: 0.08
Nodes (18): content, fs, filesToInclude, fs, outputFile, path, filesToInclude, fs (+10 more)

### Community 4 - "run_artemis.py"
Cohesion: 0.13
Nodes (5): adb(), find_adb(), main(), parse_verdict(), Scenario

### Community 5 - "package.json"
Cohesion: 0.12
Nodes (15): name, private, type, version, autoprefixer, @capacitor/android, @capacitor/cli, @capacitor/ios (+7 more)

### Community 6 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, autoprefixer, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, postcss (+7 more)

### Community 7 - "dependencies"
Cohesion: 0.14
Nodes (14): dependencies, @capacitor/android, @capacitor/app, @capacitor/cli, @capacitor/core, @capacitor/haptics, @capacitor/ios, @capacitor/preferences (+6 more)

### Community 9 - "transitNetwork.js"
Cohesion: 0.22
Nodes (14): MapScreen(), LINE_START, EXTRA_STATION_NAMES, LINE_DEFS, MODE_GROUPS, MODE_META, BASE_STATION_LIST, getStationData() (+6 more)

### Community 10 - "main.jsx"
Cohesion: 0.31
Nodes (5): react-dom, ErrorBoundary, start(), GAME_STORAGE_KEY, restoreFromBackup()

### Community 13 - "persistStorage.js"
Cohesion: 0.40
Nodes (4): @capacitor/core, @capacitor/preferences, backedUpStorage, isNative

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
- **111 isolated node(s):** `fs`, `content`, `fs`, `path`, `outputFile` (+106 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 150 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `NavigationContainer.jsx` to `GameContainer.jsx`, `gameLogic.js`, `package.json`, `transitNetwork.js`, `main.jsx`, `VehicleSprite.jsx`?**
  _High betweenness centrality (0.127) - this node is a cross-community bridge._
- **What connects `fs`, `content`, `fs` to the rest of the system?**
  _111 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `NavigationContainer.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11469534050179211 - nodes in this community are weakly interconnected._
- **Why does `devDependencies` connect `devDependencies` to `package.json`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **Should `GameContainer.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1081277213352685 - nodes in this community are weakly interconnected._
- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Should `gameLogic.js` be split into smaller, more focused modules?**
  _Cohesion score 0.06334841628959276 - nodes in this community are weakly interconnected._