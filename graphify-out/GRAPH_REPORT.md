# Graph Report - TurnikeApp  (2026-10-28)

## Corpus Check
- 101 files · ~102,877 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 24 file(s) not represented in the graph (top: .xml 10, (none) 5, .properties 2)

## Summary
- 587 nodes · 1488 edges · 35 communities (21 shown, 14 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `622e669b`
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
- adService.js
- Google Play mağaza sayfası (Türkçe)

## God Nodes (most connected - your core abstractions)
1. `useGameStore` - 63 edges
2. `GameContainer()` - 48 edges
3. `react` - 42 edges
4. `formatKurus()` - 32 edges
5. `track()` - 26 edges
6. `useTranslation()` - 26 edges
7. `NavigationContainer()` - 25 edges
8. `ScreenHeader()` - 22 edges
9. `DuelsScreen()` - 20 edges
10. `HomeScreen()` - 17 edges

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

## Communities (35 total, 14 thin omitted)

### Community 0 - "useGameStore"
Cohesion: 0.12
Nodes (40): react, App(), AD_DAILY_LIMIT, AD_REWARD, AkbilScreen(), CARD_COLORS, CardPattern(), DAILY_TOP_UP (+32 more)

### Community 1 - "GameContainer.jsx"
Cohesion: 0.08
Nodes (57): @capacitor/haptics, BonusLockers(), generateLockerContents(), REWARD_TYPES, arcPath(), DailySpinScreen(), pickIndex(), PRIZES (+49 more)

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
Cohesion: 0.11
Nodes (17): name, private, type, version, autoprefixer, @capacitor/android, @capacitor/app, @capacitor/cli (+9 more)

### Community 6 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, autoprefixer, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, postcss (+7 more)

### Community 7 - "dependencies"
Cohesion: 0.13
Nodes (15): dependencies, @capacitor/android, @capacitor/app, @capacitor/cli, @capacitor-community/admob, @capacitor/core, @capacitor/haptics, @capacitor/ios (+7 more)

### Community 9 - "transitNetwork.js"
Cohesion: 0.12
Nodes (25): MapScreen(), NetworkMap(), ZOOMS, NetworkScreen(), EXTRA_STATION_NAMES, LINE_DEFS, MODE_GROUPS, MODE_META (+17 more)

### Community 10 - "league.js"
Cohesion: 0.08
Nodes (50): DuelGame(), Avatar(), DuelsScreen(), initials(), Score(), VsBadge(), Grid(), LeagueScreen() (+42 more)

### Community 12 - "SceneBackground.jsx"
Cohesion: 0.07
Nodes (28): IntroScreen(), LETTERS, LINE_COLORS, NIGHT, Cat(), Gull(), Owl(), pickAnimal() (+20 more)

### Community 13 - "analytics.js"
Cohesion: 0.11
Nodes (21): @capacitor/core, @capacitor/preferences, react-dom, ErrorBoundary, start(), GAME_STORAGE_KEY, anonId(), clearLocalEvents() (+13 more)

### Community 14 - "formatKurus"
Cohesion: 0.09
Nodes (46): AnimatedBalance(), ConsentSheet(), DailyScreen(), dailyStreak(), mmss(), Play(), untilMidnight(), EventSheet() (+38 more)

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

### Community 33 - "adService.js"
Cohesion: 0.38
Nodes (8): @capacitor-community/admob, AD_IDS, ensureAdMob(), ids(), showInterstitialAd(), showRewardedAd(), simulate(), withTimeout()

### Community 34 - "Google Play mağaza sayfası (Türkçe)"
Cohesion: 0.22
Nodes (8): Anahtar kelimeler (açıklamada doğal geçenler), Ekran görüntüsü sırası ve üst yazıları, Google Play mağaza sayfası (Türkçe), Kategori ve etiketler, Kısa açıklama (en fazla 80 karakter), Uygulama adı (en fazla 30 karakter), Uzun açıklama (en fazla 4000 karakter), Yayın öncesi kontrol listesi

## Knowledge Gaps
- **143 isolated node(s):** `fs`, `content`, `fs`, `path`, `outputFile` (+138 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 192 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `useGameStore` to `GameContainer.jsx`, `gameLogic.js`, `package.json`, `transitNetwork.js`, `league.js`, `SceneBackground.jsx`, `analytics.js`, `formatKurus`?**
  _High betweenness centrality (0.169) - this node is a cross-community bridge._
- **What connects `fs`, `content`, `fs` to the rest of the system?**
  _143 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `useGameStore` be split into smaller, more focused modules?**
  _Cohesion score 0.12272727272727273 - nodes in this community are weakly interconnected._
- **Why does `useGameStore` connect `useGameStore` to `GameContainer.jsx`, `league.js`, `analytics.js`, `formatKurus`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Should `GameContainer.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08074534161490683 - nodes in this community are weakly interconnected._
- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Should `gameLogic.js` be split into smaller, more focused modules?**
  _Cohesion score 0.06219426974143955 - nodes in this community are weakly interconnected._