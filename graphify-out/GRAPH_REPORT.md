# Graph Report - TurnikeApp  (2026-10-26)

## Corpus Check
- 69 files · ~79,005 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 23 file(s) not represented in the graph (top: .xml 10, (none) 5, .properties 2)

## Summary
- 350 nodes · 769 edges · 30 communities (16 shown, 14 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7b83fbd4`
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
- scripts
- vercel.json
- eslint.config.js
- MainActivity.java
- Turnike mobil testleri (Artemis)
- React + Vite
- puppeteer
- vite.config.js

## God Nodes (most connected - your core abstractions)
1. `GameContainer()` - 35 edges
2. `useGameStore` - 35 edges
3. `useTranslation()` - 26 edges
4. `react` - 25 edges
5. `NavigationContainer()` - 19 edges
6. `ScreenHeader()` - 18 edges
7. `formatKurus()` - 17 edges
8. `playTone()` - 14 edges
9. `generateLevel()` - 13 edges
10. `App()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `App()` --calls--> `DailySpinScreen()`  [EXTRACTED]
  src/App.jsx → src/components/DailySpinScreen.jsx
- `App()` --calls--> `GameContainer()`  [EXTRACTED]
  src/App.jsx → src/components/GameContainer.jsx
- `App()` --calls--> `HomeScreen()`  [EXTRACTED]
  src/App.jsx → src/components/HomeScreen.jsx
- `App()` --calls--> `NavigationContainer()`  [EXTRACTED]
  src/App.jsx → src/components/NavigationContainer.jsx
- `App()` --calls--> `getMaxLives()`  [EXTRACTED]
  src/App.jsx → src/store/gameStore.js

## Import Cycles
- None detected.

## Communities (30 total, 14 thin omitted)

### Community 0 - "NavigationContainer.jsx"
Cohesion: 0.14
Nodes (35): react, @supabase/supabase-js, AkbilScreen(), BALANCE_PACKS, CARD_COLORS, AnimatedBalance(), BadgesScreen(), DictionaryScreen() (+27 more)

### Community 1 - "GameContainer.jsx"
Cohesion: 0.10
Nodes (46): @capacitor/app, @capacitor/haptics, @capacitor/status-bar, BonusLockers(), generateLockerContents(), REWARD_TYPES, DailySpinScreen(), PRIZES (+38 more)

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
Cohesion: 0.13
Nodes (14): name, private, type, version, autoprefixer, @capacitor/android, @capacitor/cli, @capacitor/ios (+6 more)

### Community 6 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, autoprefixer, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, postcss (+7 more)

### Community 7 - "dependencies"
Cohesion: 0.14
Nodes (14): dependencies, @capacitor/android, @capacitor/app, @capacitor/cli, @capacitor/core, @capacitor/haptics, @capacitor/ios, @capacitor/preferences (+6 more)

### Community 9 - "transitNetwork.js"
Cohesion: 0.31
Nodes (9): MapScreen(), BASE_STATION_LIST, getStationData(), getStationXPosition(), LEVELS_PER_STATION, LINES, STATION_INFO, STATION_NAMES (+1 more)

### Community 10 - "main.jsx"
Cohesion: 0.18
Nodes (10): @capacitor/core, @capacitor/preferences, react-dom, App(), ErrorBoundary, start(), GAME_STORAGE_KEY, backedUpStorage (+2 more)

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
- **109 isolated node(s):** `fs`, `content`, `fs`, `path`, `outputFile` (+104 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 141 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `NavigationContainer.jsx` to `GameContainer.jsx`, `gameLogic.js`, `package.json`, `transitNetwork.js`, `main.jsx`?**
  _High betweenness centrality (0.112) - this node is a cross-community bridge._
- **What connects `fs`, `content`, `fs` to the rest of the system?**
  _109 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `NavigationContainer.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1367003367003367 - nodes in this community are weakly interconnected._
- **Why does `devDependencies` connect `devDependencies` to `package.json`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Should `GameContainer.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09679370840895342 - nodes in this community are weakly interconnected._
- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Should `gameLogic.js` be split into smaller, more focused modules?**
  _Cohesion score 0.06334841628959276 - nodes in this community are weakly interconnected._