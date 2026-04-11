# Design Spec: Stock Market Kids — Curriculum Expansion

**Date:** 2026-04-11  
**Project:** `stock-market-kids/`  
**Status:** Approved

---

## Overview

Expand the stock-market-kids learning app so that Medium and Hard difficulty levels have matching lesson content, larger randomized question banks, and shuffled answer positions. Easy completion remains the only gate to advance between modules.

---

## Goals

1. Add Medium/Hard lesson cards to all 5 quiz modules so students have content to study before attempting harder quiz levels.
2. Expand question banks from 3 → 5 questions per module per difficulty tier (75 total).
3. Randomize which 3 questions are shown each quiz session (sampled from the pool of 5).
4. Shuffle answer order so the correct answer is never always in a fixed position.
5. Medium/Hard lessons and quizzes remain **optional** — Easy completion is still the only gate to unlock the next module.

---

## Section 1 — Lesson Content (HTML)

### Approach

Add new `content-card` and `dyk-card` blocks to each of the 5 module sections in `stock-market-kids/index.html`. Cards sit below the existing Easy content. No JS gating — always visible.

### Visual treatment

Each Medium or Hard card gets a small difficulty badge in the card `<h3>`:

```html
<span class="diff-badge medium">⭐⭐ Medium</span>
<span class="diff-badge hard">⭐⭐⭐ Hard</span>
```

Badges are inline pills styled in `style.css`:
- Medium: amber background (`#f59e0b`) with white text
- Hard: purple background (`#8b5cf6`) with white text
- Small font, border-radius, padding — sits right of the heading text

### Content per module

| Module | Medium topics | Hard topics |
|--------|--------------|-------------|
| 1 — What Are Stocks? | Market cap, dividends | Share dilution, bonds vs stocks, IPO lock-up |
| 2 — The Stock Market | Bid-ask spread, why news moves prices, after-hours trading | Circuit breakers, short selling, stock indices |
| 3 — Understanding Companies | P/E ratio, gross profit margin, balance sheet | Growth investing (loss-making startups), ROE, competitive moat |
| 4 — Intro to Evaluation | Dollar-cost averaging, compound interest, risk tolerance | Diversification math, defensive stocks, high-P/E justification |
| 5 — How Trading Works | Account types, market vs limit orders, capital gains tax | Wash-sale rule, slippage, trimming concentrated positions |

Each topic gets one `content-card` (concept explanation) and one `dyk-card` (Did You Know fact) where a memorable fact exists.

---

## Section 2 — Question Bank & Randomization

### Question bank expansion

File: `stock-market-kids/js/data.js`

Each `QUIZ_DATA` module entry expands from 3 to **5 questions** per difficulty tier:
- 5 modules × 3 tiers × 5 questions = **75 questions** total (up from 45)

New questions must align with the lesson content above so students can find answers in the reading material.

### Randomization — question selection

File: `stock-market-kids/js/app.js`

New helper `sampleQuestions(pool, n)`:
```js
function sampleQuestions(pool, n) {
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.min(n, shuffled.length));
}
```

Called when building a fresh quiz state (n = 3). The sampled set is stored in `quizState[moduleKey].questions` so mid-quiz resume is stable and doesn't re-roll.

On "Try Again" (`_resetDifficultyQuiz`), the full pool is re-sampled → different 3 questions appear.

### Randomization — answer shuffling

New helper `shuffleOptions(q)` (non-mutating):
```js
function shuffleOptions(q) {
  const indices = q.options.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return {
    ...q,
    options: indices.map(i => q.options[i]),
    correct: indices.indexOf(q.correct),
  };
}
```

Applied at the call site (in `initQuiz()` and `_resetDifficultyQuiz()`) via `.map(shuffleOptions)` chained after `sampleQuestions()`. The shuffled form (with updated `correct` index) is what gets stored in `quizState.questions`, so answer positions are stable across a session resume. `sampleQuestions` and `shuffleOptions` are kept as separate single-responsibility helpers.

### Where these helpers plug in

| Location | Change |
|----------|--------|
| `initQuiz()` fresh-quiz branch | Replace `getQuestionsForDifficulty(...)` with `sampleQuestions(getQuestionsForDifficulty(...), 3).map(shuffleOptions)` |
| `_resetDifficultyQuiz()` | Same replacement — re-samples and re-shuffles on retry |
| `getQuestionsForDifficulty()` | No change — continues to return full pool |

---

## What Does NOT Change

- Module progression gate: Easy completion → next module. Medium/Hard are always optional.
- The difficulty unlock sequence (Easy → unlocks Medium → unlocks Hard) is unchanged.
- Mastery badge logic (all 3 tiers complete) is unchanged.
- The simulator (Module 6) is untouched.
- Mid-quiz resume behavior is preserved (sampled questions stored in state).

---

## Files Changed

| File | Change type |
|------|-------------|
| `stock-market-kids/index.html` | Add Medium/Hard content cards + DYK cards to all 5 modules; add `.diff-badge` CSS |
| `stock-market-kids/js/data.js` | Expand each QUIZ_DATA module from 3 → 5 questions per tier |
| `stock-market-kids/js/app.js` | Add `sampleQuestions()` + `shuffleOptions()` helpers; update `initQuiz()` and `_resetDifficultyQuiz()` |
| `stock-market-kids/css/style.css` | Add `.diff-badge` styles |
