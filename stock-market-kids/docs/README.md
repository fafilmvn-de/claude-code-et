# Stock Market Learning Guide for Kids

**Last Updated:** 2026-03-31
**Owner:** Vietnam Analytics & AI Team
**Domain:** Learning / Education

---

## 1. Overview

An interactive, web-based stock market learning guide designed for **14-year-old beginners** with no prior finance knowledge. The guide teaches fundamental concepts through simple analogies, visual examples, interactive exercises, and a paper trading simulator — all using fictional companies and fake money.

**⚠️ Educational purposes only. This is not financial advice.**

### Key Features

| Feature | Description |
|---------|-------------|
| 📚 6 Progressive Modules | Builds understanding from "What is a stock?" to simulated trading |
| 🎮 Paper Trading Simulator | Trade 5 fictional companies over 8 weeks with $10,000 fake cash |
| 🧪 Interactive Quizzes | 3 questions per module with instant feedback |
| 🏅 Badge & XP System | Achievement badges and XP progress bar for engagement |
| 🌙 Dark/Light Mode | Toggle between themes |
| 📱 Mobile-Friendly | Responsive layout with touch fallback for drag-and-drop |
| 📊 Portfolio Chart | Canvas-based line chart tracking portfolio value |

### How to Run

1. Navigate to `stock-market-kids/`
2. **Double-click `index.html`** in any modern web browser
3. No server, no dependencies, no installation needed

**Works in:** Chrome, Firefox, Safari, Edge (any version from 2020+)

---

## 2. Module Summary

| # | Module | Key Concepts | Interactive Element |
|---|--------|-------------|---------------------|
| 1 | 🍕 What Are Stocks? | Ownership, shares, IPO, market cap | "Did You Know?" cards, quiz |
| 2 | 📈 The Stock Market | Exchanges, supply & demand, price movement | Supply/demand slider, quiz |
| 3 | 🏪 Understanding Companies | Revenue vs. profit, brand, products | Company ranking (drag/tap), quiz |
| 4 | 💡 Intro to Evaluation | Long-term vs. short-term, growth indicators | "Spot the Better Investment", quiz |
| 5 | 🛒 How Trading Works | Buy/sell, orders, gains/losses, portfolio | Mini trade walkthrough, quiz |
| 6 | 🎮 Practice Zone | Paper trading, news events, diversification | Full trading simulator |

---

## 3. File Structure

```
stock-market-kids/
  index.html              ← Main HTML (module sections, layout)
  css/
    style.css             ← Themes, layout, animations, responsive
    uplot.min.css         ← Chart base styles
  js/
    data.js               ← Companies, news pools, quiz data, config
    minichart.js          ← Lightweight canvas chart library
    app.js                ← Navigation, quizzes, sliders, badges, XP
    simulator.js          ← Paper trading game logic
    touch-fallback.js     ← Mobile tap-to-select interaction
  docs/
    README.md             ← This file
    DOC.md                ← File-level YAML metadata
    learning-stocks-for-kids.md  ← Full written Markdown guide
```

---

## 4. Technical Notes

- **No external dependencies** — everything runs locally from static files
- **Chart library:** Custom `MiniChart` class (canvas-based, ~230 lines) instead of a full charting library
- **State persistence:** Progress, badges, and theme preference saved to `localStorage`
- **Touch support:** Automatic detection; drag-and-drop replaced with tap-to-select on mobile/tablet
- **Script load order:** `data.js` → `minichart.js` → `app.js` → `simulator.js` → `touch-fallback.js`

---

## 5. Fictional Companies

All companies in this guide are **entirely fictional** and do not represent real businesses:

| Company | Emoji | Sector | Starting Price |
|---------|-------|--------|---------------|
| SnackCo | 🍿 | Food & Beverage | ~$45 |
| GameWorld | 🎮 | Gaming & Entertainment | ~$62 |
| GreenRide | 🚲 | Green Transportation | ~$33 |
| CloudLearn | 📚 | Education Technology | ~$55 |
| PetPals | 🐾 | Pet Care | ~$28 |

---

## 6. Disclaimer

> **⚠️ This is an educational tool only — NOT financial advice.**
> - All companies, prices, and scenarios are fictional
> - No real money is involved
> - Do NOT use this guide to make real investment decisions
> - Always consult a qualified adult before considering real investments
> - Designed for learning purposes for teenagers

---

## 7. Future Enhancements

<!-- FUTURE: Vietnamese i18n — all user-facing strings are in JS/HTML, ready for t() wrapping -->

- 🇻🇳 Vietnamese language support (placeholder ready)
- 📊 More chart types (candlestick preview, pie chart for portfolio allocation)
- 🎲 More simulation scenarios (market crash event, earnings season)
- 📝 Printable certificate of completion
- 🏆 Leaderboard for classroom use
