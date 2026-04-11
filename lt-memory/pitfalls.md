# Pitfalls

Known gotchas per project. Add entries as they're discovered.

---

## running-game

- `package.json` names the project `cat-runner-game` but the folder is `running-game` — don't confuse them.
- Playwright config has two files: `playwright.config.js` and `playwright.test.config.js` — check which one a test command uses before editing.
- Backup files (`game.js.backup`, `hero-adventure-game.js.backup`) are in the repo root of the folder; don't accidentally edit them thinking they're active.

---

## trading-platforms

- Scripts require the local `venv` to be activated — running bare `python3` may use system Python without required packages.
- Multiple crawler variants exist (`btc_6months.py`, `btc_ALL_AGGRESSIVE.py`, etc.) — `run_full_crawl.py` is the canonical entry point for a full fetch.
- CSV output files (`btcusdt_*.csv`) are committed to the repo; large crawls can produce big files.

---

## expense-tracker

- Build uses `--turbopack` flag for both dev and build — remove it if Turbopack causes issues.

---

## stock-market-kids

- Pure static site — no bundler. All JS/CSS are in `css/` and `js/` subdirectories relative to `index.html`.
