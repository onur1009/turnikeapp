# Graph Report - TurnikeApp  (2026-10-26)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 339 nodes · 761 edges · 29 communities (16 shown, 13 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a273439d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 14
- Community 15
- Community 17
- Community 18
- Community 19

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
- `App()` --calls--> `GameContainer()`  [EXTRACTED]
  src/App.jsx → src/components/GameContainer.jsx
- `App()` --calls--> `playBadgeUnlock()`  [EXTRACTED]
  src/App.jsx → src/utils/soundManager.js
- `start()` --calls--> `App()`  [EXTRACTED]
  src/main.jsx → src/App.jsx
- `GameContainer()` --calls--> `AnimatedBalance()`  [EXTRACTED]
  src/components/GameContainer.jsx → src/components/AnimatedBalance.jsx
- `GameContainer()` --calls--> `LevelComplete()`  [EXTRACTED]
  src/components/GameContainer.jsx → src/components/LevelComplete.jsx

## Import Cycles
- None detected.

## Communities (29 total, 13 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.11
Nodes (41): react, @supabase/supabase-js, App(), AkbilScreen(), BALANCE_PACKS, CARD_COLORS, AnimatedBalance(), BadgesScreen() (+33 more)

### Community 1 - "Community 1"
Cohesion: 0.11
Nodes (41): @capacitor/app, @capacitor/haptics, @capacitor/status-bar, BonusLockers(), generateLockerContents(), REWARD_TYPES, GameContainer(), ToolButton() (+33 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (40): PROVIDER_THEMES, COMMON_WORDS_EN, COMMON_WORDS_TR, PROVIDERS_EN, PROVIDERS_TR, TERMS_EN, TERMS_TR, TRANSIT_MEANINGS_EN (+32 more)

### Community 3 - "Community 3"
Cohesion: 0.08
Nodes (18): content, fs, filesToInclude, fs, outputFile, path, filesToInclude, fs (+10 more)

### Community 4 - "Community 4"
Cohesion: 0.13
Nodes (5): adb(), find_adb(), main(), parse_verdict(), Scenario

### Community 5 - "Community 5"
Cohesion: 0.13
Nodes (14): name, private, type, version, autoprefixer, @capacitor/android, @capacitor/cli, @capacitor/ios (+6 more)

### Community 6 - "Community 6"
Cohesion: 0.13
Nodes (15): devDependencies, autoprefixer, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, postcss (+7 more)

### Community 7 - "Community 7"
Cohesion: 0.14
Nodes (14): dependencies, @capacitor/android, @capacitor/app, @capacitor/cli, @capacitor/core, @capacitor/haptics, @capacitor/ios, @capacitor/preferences (+6 more)

### Community 9 - "Community 9"
Cohesion: 0.31
Nodes (9): MapScreen(), BASE_STATION_LIST, getStationData(), getStationXPosition(), LEVELS_PER_STATION, LINES, STATION_INFO, STATION_NAMES (+1 more)

### Community 10 - "Community 10"
Cohesion: 0.31
Nodes (5): react-dom, ErrorBoundary, start(), GAME_STORAGE_KEY, restoreFromBackup()

### Community 11 - "Community 11"
Cohesion: 0.29
Nodes (7): scripts, android:apk, build, dev, lint, preview, test:mobile

### Community 12 - "Community 12"
Cohesion: 0.52
Nodes (6): applyDDA(), detectVolatility(), mean(), runsTestZ(), trendSlope(), variance()

### Community 13 - "Community 13"
Cohesion: 0.33
Nodes (5): eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals

### Community 14 - "Community 14"
Cohesion: 0.40
Nodes (4): @capacitor/core, @capacitor/preferences, backedUpStorage, isNative

### Community 15 - "Community 15"
Cohesion: 0.40
Nodes (4): buildCommand, framework, outputDirectory, rewrites

### Community 18 - "Community 18"
Cohesion: 0.50
Nodes (3): vite, vite-plugin-pwa, @vitejs/plugin-react

## Knowledge Gaps
- **103 isolated node(s):** `Scenario`, `BALANCE_PACKS`, `CARD_COLORS`, `PRIZES`, `TABS` (+98 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 132 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Community 0` to `Community 1`, `Community 2`, `Community 5`, `Community 9`, `Community 10`?**
  _High betweenness centrality (0.119) - this node is a cross-community bridge._
- **What connects `Scenario`, `BALANCE_PACKS`, `CARD_COLORS` to the rest of the system?**
  _103 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.11418330773169483 - nodes in this community are weakly interconnected._
- **Why does `devDependencies` connect `Community 6` to `Community 5`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.11372549019607843 - nodes in this community are weakly interconnected._
- **Why does `dependencies` connect `Community 7` to `Community 5`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.0707070707070707 - nodes in this community are weakly interconnected._