# Graph Report - TurnikeApp  (2026-10-27)

## Corpus Check
- 80 files · ~88,729 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 23 file(s) not represented in the graph (top: .xml 10, (none) 5, .properties 2)

## Summary
- 448 nodes · 994 edges · 34 communities (20 shown, 14 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9a36930b`
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
- DuelsScreen.jsx
- scripts
- vercel.json
- eslint.config.js
- persistStorage.js
- MainActivity.java
- Turnike mobil testleri (Artemis)
- React + Vite
- puppeteer
- vite.config.js
- VehicleSprite.jsx

## God Nodes (most connected - your core abstractions)
1. `GameContainer()` - 37 edges
2. `useGameStore` - 35 edges
3. `react` - 31 edges
4. `useTranslation()` - 26 edges
5. `NavigationContainer()` - 21 edges
6. `formatKurus()` - 20 edges
7. `ScreenHeader()` - 18 edges
8. `AkbilScreen()` - 14 edges
9. `playTone()` - 14 edges
10. `getStationForLevel()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `App()` --calls--> `DailySpinScreen()`  [EXTRACTED]
  src/App.jsx → src/components/DailySpinScreen.jsx
- `App()` --calls--> `GameContainer()`  [EXTRACTED]
  src/App.jsx → src/components/GameContainer.jsx
- `App()` --calls--> `playBadgeUnlock()`  [EXTRACTED]
  src/App.jsx → src/utils/soundManager.js
- `start()` --calls--> `App()`  [EXTRACTED]
  src/main.jsx → src/App.jsx
- `AkbilScreen()` --calls--> `getNetworkProgress()`  [EXTRACTED]
  src/components/AkbilScreen.jsx → src/utils/transitNetwork.js

## Import Cycles
- None detected.

## Communities (34 total, 14 thin omitted)

### Community 0 - "NavigationContainer.jsx"
Cohesion: 0.10
Nodes (46): react, App(), AD_DAILY_LIMIT, AD_REWARD, AkbilScreen(), CARD_COLORS, CardPattern(), DAILY_TOP_UP (+38 more)

### Community 1 - "GameContainer.jsx"
Cohesion: 0.10
Nodes (46): @capacitor/app, @capacitor/haptics, @capacitor/status-bar, BonusLockers(), generateLockerContents(), REWARD_TYPES, DailySpinScreen(), PRIZES (+38 more)

### Community 2 - "gameLogic.js"
Cohesion: 0.06
Nodes (48): PROVIDER_THEMES, COMMON_WORDS_EN, COMMON_WORDS_TR, PROVIDERS_EN, PROVIDERS_TR, TERMS_EN, TERMS_TR, TRANSIT_MEANINGS_EN (+40 more)

### Community 3 - "run.cjs"
Cohesion: 0.08
Nodes (18): content, fs, filesToInclude, fs, outputFile, path, filesToInclude, fs (+10 more)

### Community 4 - "run_artemis.py"
Cohesion: 0.13
Nodes (5): adb(), find_adb(), main(), parse_verdict(), Scenario

### Community 5 - "package.json"
Cohesion: 0.12
Nodes (16): name, private, type, version, autoprefixer, @capacitor/android, @capacitor/cli, @capacitor-community/admob (+8 more)

### Community 6 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, autoprefixer, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, postcss (+7 more)

### Community 7 - "dependencies"
Cohesion: 0.13
Nodes (15): dependencies, @capacitor/android, @capacitor/app, @capacitor/cli, @capacitor-community/admob, @capacitor/core, @capacitor/haptics, @capacitor/ios (+7 more)

### Community 9 - "transitNetwork.js"
Cohesion: 0.13
Nodes (25): MapScreen(), NetworkMap(), ZOOMS, NetworkScreen(), EXTRA_STATION_NAMES, LINE_DEFS, MODE_GROUPS, MODE_META (+17 more)

### Community 10 - "main.jsx"
Cohesion: 0.31
Nodes (5): react-dom, ErrorBoundary, start(), GAME_STORAGE_KEY, restoreFromBackup()

### Community 12 - "SceneBackground.jsx"
Cohesion: 0.11
Nodes (14): Cat(), Gull(), Owl(), pickAnimal(), SceneAnimal(), FarCity(), LANDMARKS, rng() (+6 more)

### Community 13 - "DuelsScreen.jsx"
Cohesion: 0.17
Nodes (20): DuelGame(), Avatar(), DuelsScreen(), initials(), Score(), VsBadge(), Grid(), Wheel() (+12 more)

### Community 14 - "scripts"
Cohesion: 0.29
Nodes (7): scripts, android:apk, build, dev, lint, preview, test:mobile

### Community 15 - "vercel.json"
Cohesion: 0.40
Nodes (4): buildCommand, framework, outputDirectory, rewrites

### Community 17 - "eslint.config.js"
Cohesion: 0.33
Nodes (5): eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals

### Community 18 - "persistStorage.js"
Cohesion: 0.40
Nodes (4): @capacitor/core, @capacitor/preferences, backedUpStorage, isNative

### Community 29 - "Turnike mobil testleri (Artemis)"
Cohesion: 0.40
Nodes (4): Senaryolar (`scenarios.py`), Turnike mobil testleri (Artemis), Yeni senaryo eklerken, Çalıştırma

### Community 30 - "React + Vite"
Cohesion: 0.50
Nodes (3): Expanding the ESLint configuration, React Compiler, React + Vite

### Community 32 - "vite.config.js"
Cohesion: 0.50
Nodes (3): vite, vite-plugin-pwa, @vitejs/plugin-react

### Community 33 - "VehicleSprite.jsx"
Cohesion: 0.29
Nodes (9): Bogie(), Funicular(), Marmaray(), Metro(), Metrobus(), RailCar(), SPRITES, Tram() (+1 more)

## Knowledge Gaps
- **124 isolated node(s):** `fs`, `content`, `fs`, `path`, `outputFile` (+119 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 169 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `NavigationContainer.jsx` to `GameContainer.jsx`, `gameLogic.js`, `VehicleSprite.jsx`, `package.json`, `transitNetwork.js`, `main.jsx`, `SceneBackground.jsx`, `DuelsScreen.jsx`?**
  _High betweenness centrality (0.182) - this node is a cross-community bridge._
- **What connects `fs`, `content`, `fs` to the rest of the system?**
  _124 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `NavigationContainer.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10312075983717775 - nodes in this community are weakly interconnected._
- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Should `GameContainer.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09962406015037593 - nodes in this community are weakly interconnected._
- **Why does `devDependencies` connect `devDependencies` to `package.json`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Should `gameLogic.js` be split into smaller, more focused modules?**
  _Cohesion score 0.06429070580013976 - nodes in this community are weakly interconnected._