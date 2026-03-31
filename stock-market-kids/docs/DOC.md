# Technical Documentation — Stock Market Learning Guide for Kids

> **Parent Folder:** `stock-market-kids/`
> **Last Updated:** 2026-03-31
> **Maintainer:** Vietnam Analytics & AI Team

---

## Files

### index.html

```yaml
name: index.html
description: >
  Main HTML file for the stock market learning guide web app. Contains all 6
  learning module sections, header with XP bar, sidebar navigation, company
  ranking zone, mini trade walkthrough, simulator container, badge popup,
  and educational disclaimer footer. Links to all CSS and JS files.
metadata:
  languages: "HTML5"
  platform: Browser (static, no server required)
  versions: "1.0.0"
  revision: 1
  updated-on: "2026-03-31"
  source:
    - "css/style.css"
    - "css/uplot.min.css"
    - "js/data.js"
    - "js/minichart.js"
    - "js/app.js"
    - "js/simulator.js"
    - "js/touch-fallback.js"
  output:
    - "Interactive web-based learning guide (opens in browser)"
  lines: ~320
  change-log:
    - date: "2026-03-31"
      version: "1.0.0"
      description: "Initial creation with 6 learning modules, quizzes, and simulator container."
```

### css/style.css

```yaml
name: css/style.css
description: >
  Main stylesheet for the learning guide. Includes CSS custom properties
  for light/dark theming, layout grid, sidebar navigation, XP bar, quiz
  styles, company cards, ranking zone, simulator table, badge popup
  animations, confetti, and responsive breakpoints (768px, 480px).
metadata:
  languages: "CSS3"
  versions: "1.0.0"
  revision: 1
  updated-on: "2026-03-31"
  lines: ~560
  change-log:
    - date: "2026-03-31"
      version: "1.0.0"
      description: "Initial creation with full theme, layout, and animation system."
```

### css/uplot.min.css

```yaml
name: css/uplot.min.css
description: >
  Minimal CSS subset derived from uPlot v1.6.32 for chart base styles.
  Used by minichart.js tooltip and layout.
metadata:
  languages: "CSS3"
  versions: "1.0.0"
  revision: 1
  updated-on: "2026-03-31"
  lines: ~100
  change-log:
    - date: "2026-03-31"
      version: "1.0.0"
      description: "Initial minimal CSS subset."
```

### js/data.js

```yaml
name: js/data.js
description: >
  Content data layer for the learning guide. Contains: CONFIG constants
  (starting cash, weeks, XP), COMPANIES array (5 fictional companies with
  backstories), NEWS_POOL (12 headlines per company with sentiment and
  impact multipliers), QUIZ_DATA (3 questions per module × 5 modules),
  and BADGES definitions (6 achievement badges).
metadata:
  languages: "JavaScript (ES6+)"
  versions: "1.0.0"
  revision: 1
  updated-on: "2026-03-31"
  lines: ~210
  change-log:
    - date: "2026-03-31"
      version: "1.0.0"
      description: "Initial content data with 5 companies, 60 news headlines, 15 quiz questions, 6 badges."
```

### js/minichart.js

```yaml
name: js/minichart.js
description: >
  Lightweight canvas-based line chart library purpose-built for this project.
  Supports multiple series, Y-axis labels, grid lines, hover tooltips,
  area fill, responsive sizing, and dark/light theme awareness. Used by
  simulator.js to display portfolio value over time.
metadata:
  languages: "JavaScript (ES6+)"
  versions: "1.0.0"
  revision: 1
  updated-on: "2026-03-31"
  lines: ~230
  change-log:
    - date: "2026-03-31"
      version: "1.0.0"
      description: "Initial creation — replaces full uPlot library with a purpose-built 230-line alternative."
```

### js/app.js

```yaml
name: js/app.js
description: >
  Core application logic. Manages: module navigation (sidebar + in-page),
  theme toggle (dark/light with localStorage persistence), XP bar and
  progress tracking, quiz engine (renders questions from QUIZ_DATA, handles
  answers, shows feedback), supply & demand slider (Module 2), HTML5
  drag-and-drop company ranking (Module 3), investment pick exercise
  (Module 4), mini trade walkthrough (Module 5), badge popup with confetti,
  and localStorage state persistence.
metadata:
  languages: "JavaScript (ES6+)"
  versions: "1.0.0"
  revision: 1
  updated-on: "2026-03-31"
  lines: ~310
  change-log:
    - date: "2026-03-31"
      version: "1.0.0"
      description: "Initial creation with full navigation, quiz engine, interactive exercises, and badge system."
```

### js/simulator.js

```yaml
name: js/simulator.js
description: >
  Paper trading simulator for Module 6. Features: 5 fictional companies
  with randomized starting prices, 8-week simulation with 1-2 news events
  per week from NEWS_POOL, buy/sell share mechanics, portfolio value tracking,
  MiniChart rendering, end screen with stats and reflection prompt.
  All prices and events are entirely fictional.
metadata:
  languages: "JavaScript (ES6+)"
  versions: "1.0.0"
  revision: 1
  updated-on: "2026-03-31"
  lines: ~260
  change-log:
    - date: "2026-03-31"
      version: "1.0.0"
      description: "Initial creation with full trading simulator, news system, and portfolio chart."
```

### js/touch-fallback.js

```yaml
name: js/touch-fallback.js
description: >
  Mobile/tablet touch interaction layer. Detects touch capability and
  provides: tap-to-select + tap-to-place as a fallback for drag-and-drop
  in the company ranking exercise (Module 3), enhanced touch targets
  (48px+ for buttons), and visual hint text for touch users.
metadata:
  languages: "JavaScript (ES6+)"
  versions: "1.0.0"
  revision: 1
  updated-on: "2026-03-31"
  lines: ~150
  change-log:
    - date: "2026-03-31"
      version: "1.0.0"
      description: "Initial creation with tap-to-select ranking and enhanced touch targets."
```

### docs/learning-stocks-for-kids.md

```yaml
name: docs/learning-stocks-for-kids.md
description: >
  Full written Markdown companion guide mirroring all 6 learning modules.
  Readable standalone (printable for offline use). Contains analogies,
  examples, exercises, key vocabulary, and educational disclaimer.
  Structured progressively from basic concepts to simulated trading.
metadata:
  languages: "Markdown"
  versions: "1.0.0"
  revision: 1
  updated-on: "2026-03-31"
  lines: ~400
  change-log:
    - date: "2026-03-31"
      version: "1.0.0"
      description: "Initial creation — full written guide covering all 6 modules."
```
