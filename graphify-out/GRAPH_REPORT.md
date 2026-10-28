# Graph Report - TurnikeApp  (2026-10-28)

## Corpus Check
- 98 files · ~101,554 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 24 file(s) not represented in the graph (top: .xml 10, (none) 5, .properties 2)

## Summary
- 567 nodes · 1432 edges · 34 communities (20 shown, 14 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `56e1c20b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- useGameStore
- GameContainer.jsx
- gameLogic.js
- run.cjs
- run_artemis.py
- package.json
- devDependencies
- dependencies
- ExampleInstrumentedTest.java
- adService.js
- league.js
- CLAUDE.md
- SceneBackground.jsx
- analytics.js
- formatKurus
- vercel.json
- scripts
- eslint.config.js
- MainActivity.java
- Turnike mobil testleri (Artemis)
- React + Vite
- puppeteer
- vite.config.js
- VehicleSprite.jsx

## God Nodes (most connected - your core abstractions)
1. `useGameStore` - 57 edges
2. `GameContainer()` - 47 edges
3. `react` - 40 edges
4. `formatKurus()` - 30 edges
5. `useTranslation()` - 26 edges
6. `NavigationContainer()` - 25 edges
7. `track()` - 24 edges
8. `ScreenHeader()` - 22 edges
9. `DuelsScreen()` - 20 edges
10. `HomeScreen()` - 17 edges

## Surprising Connections (you probably didn't know these)
- `App()` --calls--> `HomeScreen()`  [EXTRACTED]
  src/App.jsx → src/components/HomeScreen.jsx
- `App()` --calls--> `NavigationContainer()`  [EXTRACTED]
  src/App.jsx → src/components/NavigationContainer.jsx
- `App()` --calls--> `useGameStore`  [EXTRACTED]
  src/App.jsx → src/store/gameStore.js
- `App()` --calls--> `useTranslation()`  [EXTRACTED]
  src/App.jsx → src/utils/i18n.js
- `start()` --calls--> `App()`  [EXTRACTED]
  src/main.jsx → src/App.jsx

## Import Cycles
- None detected.

## Communities (34 total, 14 thin omitted)

### Community 0 - "useGameStore"
Cohesion: 0.07
Nodes (63): react, AD_DAILY_LIMIT, AD_REWARD, AkbilScreen(), CARD_COLORS, CardPattern(), DAILY_TOP_UP, IstanbulCard() (+55 more)

### Community 1 - "GameContainer.jsx"
Cohesion: 0.08
Nodes (56): @capacitor/app, @capacitor/haptics, @capacitor/status-bar, App(), BonusLockers(), generateLockerContents(), REWARD_TYPES, DailySpinScreen() (+48 more)

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
Cohesion: 0.12
Nodes (15): name, private, type, version, autoprefixer, @capacitor/android, @capacitor/cli, @capacitor/ios (+7 more)

### Community 6 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, autoprefixer, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, postcss (+7 more)

### Community 7 - "dependencies"
Cohesion: 0.13
Nodes (15): dependencies, @capacitor/android, @capacitor/app, @capacitor/cli, @capacitor-community/admob, @capacitor/core, @capacitor/haptics, @capacitor/ios (+7 more)

### Community 9 - "adService.js"
Cohesion: 0.38
Nodes (8): @capacitor-community/admob, AD_IDS, ensureAdMob(), ids(), showInterstitialAd(), showRewardedAd(), simulate(), withTimeout()

### Community 10 - "league.js"
Cohesion: 0.08
Nodes (49): DuelGame(), Avatar(), DuelsScreen(), initials(), Score(), VsBadge(), Grid(), LeagueScreen() (+41 more)

### Community 12 - "SceneBackground.jsx"
Cohesion: 0.11
Nodes (14): Cat(), Gull(), Owl(), pickAnimal(), SceneAnimal(), FarCity(), LANDMARKS, rng() (+6 more)

### Community 13 - "analytics.js"
Cohesion: 0.11
Nodes (22): @capacitor/core, @capacitor/preferences, react-dom, ConsentSheet(), ErrorBoundary, start(), GAME_STORAGE_KEY, anonId() (+14 more)

### Community 14 - "formatKurus"
Cohesion: 0.09
Nodes (46): AnimatedBalance(), DailyScreen(), dailyStreak(), mmss(), Play(), untilMidnight(), EventSheet(), HomeScreen() (+38 more)

### Community 15 - "vercel.json"
Cohesion: 0.40
Nodes (4): buildCommand, framework, outputDirectory, rewrites

### Community 17 - "scripts"
Cohesion: 0.29
Nodes (7): scripts, android:apk, build, dev, lint, preview, test:mobile

### Community 18 - "eslint.config.js"
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

### Community 33 - "VehicleSprite.jsx"
Cohesion: 0.29
Nodes (9): Bogie(), Funicular(), Marmaray(), Metro(), Metrobus(), RailCar(), SPRITES, Tram() (+1 more)

## Knowledge Gaps
- **133 isolated node(s):** `fs`, `content`, `fs`, `path`, `outputFile` (+128 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 181 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `useGameStore` to `GameContainer.jsx`, `VehicleSprite.jsx`, `package.json`, `league.js`, `SceneBackground.jsx`, `analytics.js`, `formatKurus`?**
  _High betweenness centrality (0.172) - this node is a cross-community bridge._
- **What connects `fs`, `content`, `fs` to the rest of the system?**
  _133 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `useGameStore` be split into smaller, more focused modules?**
  _Cohesion score 0.07350975674953221 - nodes in this community are weakly interconnected._
- **Why does `useGameStore` connect `useGameStore` to `GameContainer.jsx`, `league.js`, `analytics.js`, `formatKurus`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Should `GameContainer.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08165057067603161 - nodes in this community are weakly interconnected._
- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Should `gameLogic.js` be split into smaller, more focused modules?**
  _Cohesion score 0.06262626262626263 - nodes in this community are weakly interconnected._