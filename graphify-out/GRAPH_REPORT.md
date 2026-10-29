# Graph Report - TurnikeApp  (2026-10-29)

## Corpus Check
- 105 files · ~128,243 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 24 file(s) not represented in the graph (top: .xml 10, (none) 5, .properties 2)

## Summary
- 624 nodes · 1650 edges · 34 communities (20 shown, 14 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 24 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `89de1e0c`
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
- transitNetwork.js
- league.js
- CLAUDE.md
- SceneBackground.jsx
- main.jsx
- DailyScreen.jsx
- vercel.json
- scripts
- VehicleSprite.jsx
- MainActivity.java
- Turnike mobil testleri (Artemis)
- React + Vite
- puppeteer
- vite.config.js
- Google Play mağaza sayfası (Türkçe)

## God Nodes (most connected - your core abstractions)
1. `useGameStore` - 64 edges
2. `GameContainer()` - 49 edges
3. `react` - 45 edges
4. `formatKurus()` - 34 edges
5. `track()` - 26 edges
6. `useTranslation()` - 26 edges
7. `playTone()` - 26 edges
8. `NavigationContainer()` - 25 edges
9. `ScreenHeader()` - 22 edges
10. `DuelsScreen()` - 21 edges

## Surprising Connections (you probably didn't know these)
- `App()` --calls--> `DailySpinScreen()`  [EXTRACTED]
  src/App.jsx → src/components/DailySpinScreen.jsx
- `App()` --calls--> `GameContainer()`  [EXTRACTED]
  src/App.jsx → src/components/GameContainer.jsx
- `App()` --calls--> `HomeScreen()`  [EXTRACTED]
  src/App.jsx → src/components/HomeScreen.jsx
- `App()` --calls--> `IntroScreen()`  [EXTRACTED]
  src/App.jsx → src/components/IntroScreen.jsx
- `App()` --calls--> `playBadgeUnlock()`  [EXTRACTED]
  src/App.jsx → src/utils/soundManager.js

## Import Cycles
- None detected.

## Communities (34 total, 14 thin omitted)

### Community 0 - "useGameStore"
Cohesion: 0.10
Nodes (46): react, App(), AD_DAILY_LIMIT, AD_REWARD, AkbilScreen(), CARD_COLORS, CardPattern(), DAILY_TOP_UP (+38 more)

### Community 1 - "GameContainer.jsx"
Cohesion: 0.06
Nodes (86): @capacitor/app, @capacitor-community/text-to-speech, @capacitor/haptics, @capacitor/status-bar, BonusLockers(), generateLockerContents(), REWARD_TYPES, arcPath() (+78 more)

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
Cohesion: 0.11
Nodes (20): name, private, type, version, autoprefixer, @capacitor/android, @capacitor/cli, @capacitor/ios (+12 more)

### Community 6 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, autoprefixer, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, postcss (+7 more)

### Community 7 - "dependencies"
Cohesion: 0.12
Nodes (16): dependencies, @capacitor/android, @capacitor/app, @capacitor/cli, @capacitor-community/admob, @capacitor-community/text-to-speech, @capacitor/core, @capacitor/haptics (+8 more)

### Community 9 - "transitNetwork.js"
Cohesion: 0.14
Nodes (23): MapScreen(), NetworkMap(), ZOOMS, EXTRA_STATION_NAMES, LINE_DEFS, MODE_GROUPS, MODE_META, getStationPoints() (+15 more)

### Community 10 - "league.js"
Cohesion: 0.08
Nodes (51): DuelResult(), gapText(), initials(), Avatar(), DuelsScreen(), initials(), Score(), VsBadge() (+43 more)

### Community 12 - "SceneBackground.jsx"
Cohesion: 0.09
Nodes (19): Postcard(), Cat(), Gull(), Owl(), pickAnimal(), SceneAnimal(), FarCity(), LANDMARKS (+11 more)

### Community 13 - "main.jsx"
Cohesion: 0.11
Nodes (17): @capacitor-community/admob, @capacitor/core, @capacitor/preferences, react-dom, ErrorBoundary, start(), GAME_STORAGE_KEY, AD_IDS (+9 more)

### Community 14 - "DailyScreen.jsx"
Cohesion: 0.08
Nodes (56): ConsentSheet(), DailyScreen(), dailyStreak(), mmss(), Play(), untilMidnight(), EventSheet(), HomeScreen() (+48 more)

### Community 15 - "vercel.json"
Cohesion: 0.40
Nodes (4): buildCommand, framework, outputDirectory, rewrites

### Community 17 - "scripts"
Cohesion: 0.29
Nodes (7): scripts, android:apk, build, dev, lint, preview, test:mobile

### Community 18 - "VehicleSprite.jsx"
Cohesion: 0.29
Nodes (9): Bogie(), Funicular(), Marmaray(), Metro(), Metrobus(), RailCar(), SPRITES, Tram() (+1 more)

### Community 29 - "Turnike mobil testleri (Artemis)"
Cohesion: 0.40
Nodes (4): Senaryolar (`scenarios.py`), Turnike mobil testleri (Artemis), Yeni senaryo eklerken, Çalıştırma

### Community 30 - "React + Vite"
Cohesion: 0.50
Nodes (3): Expanding the ESLint configuration, React Compiler, React + Vite

### Community 32 - "vite.config.js"
Cohesion: 0.50
Nodes (3): vite, vite-plugin-pwa, @vitejs/plugin-react

### Community 34 - "Google Play mağaza sayfası (Türkçe)"
Cohesion: 0.22
Nodes (8): Anahtar kelimeler (açıklamada doğal geçenler), Ekran görüntüsü sırası ve üst yazıları, Google Play mağaza sayfası (Türkçe), Kategori ve etiketler, Kısa açıklama (en fazla 80 karakter), Uygulama adı (en fazla 30 karakter), Uzun açıklama (en fazla 4000 karakter), Yayın öncesi kontrol listesi

## Knowledge Gaps
- **145 isolated node(s):** `fs`, `content`, `fs`, `path`, `outputFile` (+140 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 195 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `useGameStore` to `GameContainer.jsx`, `package.json`, `transitNetwork.js`, `league.js`, `SceneBackground.jsx`, `main.jsx`, `DailyScreen.jsx`, `VehicleSprite.jsx`?**
  _High betweenness centrality (0.166) - this node is a cross-community bridge._
- **What connects `fs`, `content`, `fs` to the rest of the system?**
  _145 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `useGameStore` be split into smaller, more focused modules?**
  _Cohesion score 0.1044776119402985 - nodes in this community are weakly interconnected._
- **Why does `useGameStore` connect `useGameStore` to `GameContainer.jsx`, `league.js`, `main.jsx`, `DailyScreen.jsx`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Should `GameContainer.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0563487530934704 - nodes in this community are weakly interconnected._
- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Should `gameLogic.js` be split into smaller, more focused modules?**
  _Cohesion score 0.06262626262626263 - nodes in this community are weakly interconnected._