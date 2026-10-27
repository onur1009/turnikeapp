# Graph Report - TurnikeApp  (2026-10-27)

## Corpus Check
- 84 files · ~91,975 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 24 file(s) not represented in the graph (top: .xml 10, (none) 5, .properties 2)

## Summary
- 469 nodes · 1067 edges · 30 communities (17 shown, 13 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d9633b36`
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
- analytics.js
- CLAUDE.md
- SceneBackground.jsx
- DuelsScreen.jsx
- vercel.json
- AkbilScreen.jsx
- MainActivity.java
- Turnike mobil testleri (Artemis)
- React + Vite
- VehicleSprite.jsx

## God Nodes (most connected - your core abstractions)
1. `useGameStore` - 40 edges
2. `GameContainer()` - 39 edges
3. `react` - 33 edges
4. `useTranslation()` - 26 edges
5. `NavigationContainer()` - 21 edges
6. `formatKurus()` - 20 edges
7. `ScreenHeader()` - 18 edges
8. `AkbilScreen()` - 15 edges
9. `DuelsScreen()` - 14 edges
10. `track()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `App()` --calls--> `HomeScreen()`  [EXTRACTED]
  src/App.jsx → src/components/HomeScreen.jsx
- `App()` --calls--> `NavigationContainer()`  [EXTRACTED]
  src/App.jsx → src/components/NavigationContainer.jsx
- `App()` --calls--> `getMaxLives()`  [EXTRACTED]
  src/App.jsx → src/store/gameStore.js
- `App()` --calls--> `useGameStore`  [EXTRACTED]
  src/App.jsx → src/store/gameStore.js
- `App()` --calls--> `useTranslation()`  [EXTRACTED]
  src/App.jsx → src/utils/i18n.js

## Import Cycles
- None detected.

## Communities (30 total, 13 thin omitted)

### Community 0 - "NavigationContainer.jsx"
Cohesion: 0.14
Nodes (33): react, AnimatedBalance(), BadgesScreen(), ConsentSheet(), DictionaryScreen(), PROVIDER_THEMES, HomeScreen(), TABS (+25 more)

### Community 1 - "GameContainer.jsx"
Cohesion: 0.10
Nodes (47): @capacitor/app, @capacitor/haptics, @capacitor/status-bar, App(), BonusLockers(), generateLockerContents(), REWARD_TYPES, DailySpinScreen() (+39 more)

### Community 2 - "gameLogic.js"
Cohesion: 0.06
Nodes (49): COMMON_WORDS_EN, COMMON_WORDS_TR, PROVIDERS_EN, PROVIDERS_TR, TERMS_EN, TERMS_TR, TRANSIT_MEANINGS_EN, TRANSIT_MEANINGS_TR (+41 more)

### Community 3 - "run.cjs"
Cohesion: 0.08
Nodes (18): content, fs, filesToInclude, fs, outputFile, path, filesToInclude, fs (+10 more)

### Community 4 - "run_artemis.py"
Cohesion: 0.13
Nodes (5): adb(), find_adb(), main(), parse_verdict(), Scenario

### Community 5 - "package.json"
Cohesion: 0.06
Nodes (32): name, private, scripts, android:apk, build, dev, lint, preview (+24 more)

### Community 6 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, autoprefixer, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, postcss (+7 more)

### Community 7 - "dependencies"
Cohesion: 0.13
Nodes (15): dependencies, @capacitor/android, @capacitor/app, @capacitor/cli, @capacitor-community/admob, @capacitor/core, @capacitor/haptics, @capacitor/ios (+7 more)

### Community 9 - "transitNetwork.js"
Cohesion: 0.13
Nodes (24): MapScreen(), NetworkMap(), ZOOMS, EXTRA_STATION_NAMES, LINE_DEFS, MODE_GROUPS, MODE_META, getStationPoints() (+16 more)

### Community 10 - "analytics.js"
Cohesion: 0.14
Nodes (20): @capacitor/preferences, react-dom, ErrorBoundary, start(), GAME_STORAGE_KEY, anonId(), clearLocalEvents(), flush() (+12 more)

### Community 12 - "SceneBackground.jsx"
Cohesion: 0.11
Nodes (14): Cat(), Gull(), Owl(), pickAnimal(), SceneAnimal(), FarCity(), LANDMARKS, rng() (+6 more)

### Community 13 - "DuelsScreen.jsx"
Cohesion: 0.17
Nodes (20): DuelGame(), Avatar(), DuelsScreen(), initials(), Score(), VsBadge(), Grid(), Wheel() (+12 more)

### Community 15 - "vercel.json"
Cohesion: 0.40
Nodes (4): buildCommand, framework, outputDirectory, rewrites

### Community 18 - "AkbilScreen.jsx"
Cohesion: 0.14
Nodes (18): @capacitor-community/admob, @capacitor/core, AD_DAILY_LIMIT, AD_REWARD, AkbilScreen(), CARD_COLORS, CardPattern(), DAILY_TOP_UP (+10 more)

### Community 29 - "Turnike mobil testleri (Artemis)"
Cohesion: 0.40
Nodes (4): Senaryolar (`scenarios.py`), Turnike mobil testleri (Artemis), Yeni senaryo eklerken, Çalıştırma

### Community 30 - "React + Vite"
Cohesion: 0.50
Nodes (3): Expanding the ESLint configuration, React Compiler, React + Vite

### Community 33 - "VehicleSprite.jsx"
Cohesion: 0.29
Nodes (9): Bogie(), Funicular(), Marmaray(), Metro(), Metrobus(), RailCar(), SPRITES, Tram() (+1 more)

## Knowledge Gaps
- **125 isolated node(s):** `fs`, `content`, `fs`, `path`, `outputFile` (+120 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 170 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `NavigationContainer.jsx` to `GameContainer.jsx`, `VehicleSprite.jsx`, `package.json`, `transitNetwork.js`, `analytics.js`, `SceneBackground.jsx`, `DuelsScreen.jsx`, `AkbilScreen.jsx`?**
  _High betweenness centrality (0.176) - this node is a cross-community bridge._
- **What connects `fs`, `content`, `fs` to the rest of the system?**
  _125 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `NavigationContainer.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1376659678546471 - nodes in this community are weakly interconnected._
- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Should `GameContainer.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10087719298245613 - nodes in this community are weakly interconnected._
- **Why does `devDependencies` connect `devDependencies` to `package.json`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Should `gameLogic.js` be split into smaller, more focused modules?**
  _Cohesion score 0.06262626262626263 - nodes in this community are weakly interconnected._