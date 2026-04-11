# CLAUDE.md

## Commands

### expense-tracker (Next.js)
```bash
cd expense-tracker
npm run dev        # dev server with Turbopack
npm run build      # production build
npm run lint       # ESLint
```

### running-game (vanilla JS, Playwright)
```bash
cd running-game
npm run dev        # python3 -m http.server 8000
npm test           # Playwright headless
npm run test:headed
```

### stock-market-kids (static HTML)
```bash
# Open directly in browser — no build step
open stock-market-kids/index.html
```

### trading-platforms (Python scripts)
```bash
cd trading-platforms
source venv/bin/activate
python3 btc_crawler.py   # fetch BTCUSDT hourly OHLCV from Binance → CSV
python3 run_full_crawl.py
```

---

## Architecture

This repo is a **collection of independent mini-projects** — no shared build or monorepo tooling:

| Project | Stack | Purpose |
|---------|-------|---------|
| `expense-tracker/` | Next.js 15, React, Recharts, Tailwind, date-fns | Personal finance tracker |
| `running-game/` | Vanilla JS, HTML5 Canvas, Playwright tests | Cat Hero browser game |
| `stock-market-kids/` | Static HTML/CSS/JS | Stock market learning guide for teens |
| `trading-platforms/` | Python 3, Binance REST API, vnstock | BTC/FPT price crawler & backtesting data |
| `.claude/agents/` | Markdown agent files | Agency Agents collection (~178 files, 14 domains) |

Each project is self-contained with its own `node_modules` or `venv`.

---

## Key Conventions

- Each sub-project lives in its own folder; work inside that folder, not at root.
- `running-game` serves via `python3 -m http.server 8000`, not a Node dev server.
- `trading-platforms` uses a local `venv` — activate before running Python scripts.
- Agent files in `.claude/agents/` are organized by domain subdirectory (engineering/, design/, etc.).

---

## Pitfalls

Read [lt-memory/pitfalls.md](lt-memory/pitfalls.md) before modifying tricky areas.

---

## Long-Term Memory

`lt-memory/` uses progressive disclosure — this file stays short, detail files are read on-demand:

- [lt-memory/pitfalls.md](lt-memory/pitfalls.md) — Known gotchas per project; populated as discovered
- [lt-memory/agents.md](lt-memory/agents.md) — Agency Agents setup, structure, and usage notes
