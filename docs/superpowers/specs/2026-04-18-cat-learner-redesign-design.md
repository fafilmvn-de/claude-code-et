# CatLearner — Deep Space Redesign (Approach B)

**Date:** 2026-04-18
**Scope:** `cat-learner/client/` — visual redesign only, no UX structure changes
**Stack:** React + Vite + Tailwind CSS v3

---

## Goals

Transform the warm orange-themed app into a sleek, elegant, somewhat futuristic "Deep Space" aesthetic without altering any existing UX flows, routes, or component APIs. The redesign is purely visual: new tokens, new component skins, new typography accents, and subtle micro-animations.

---

## Decisions Made

| Question | Decision |
|---|---|
| Aesthetic direction | Deep Space — near-black bg, violet/indigo accents |
| Cat mascot | Custom SVG (`public/miu-avatar.svg`) — replaces all emoji usage of 🐱 and 🐾 |
| UI chrome font | Space Mono (Google Fonts) — wordmark, stats, code chips, labels |
| Vietnamese body text | Noto Sans — unchanged |
| Approach | B — component refresh + CSS token system |

---

## 1. CSS Token System

Add a `:root` block to `src/index.css` (or a new `src/styles/tokens.css` imported there):

```css
:root {
  /* Backgrounds */
  --ds-bg:           #08090f;
  --ds-surface:      #0f0e1a;
  --ds-surface-hi:   #1a1040;

  /* Accent */
  --ds-accent:       #6c63ff;
  --ds-accent-lt:    #a78bfa;
  --ds-accent-sub:   rgba(108, 99, 255, 0.15);
  --ds-border:       rgba(108, 99, 255, 0.3);

  /* Text */
  --ds-text:         #e2e8ff;
  --ds-text-muted:   #94a3b8;
  --ds-text-ghost:   #374151;

  /* Semantic */
  --ds-correct:      #22c55e;
  --ds-error:        #f87171;
  --ds-warn:         #fbbf24;
}
```

Register all tokens as Tailwind color aliases in `tailwind.config.js` so they work as first-class utility classes (`bg-ds-bg`, `text-ds-accent-lt`, etc.):

```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      'ds-bg':          'var(--ds-bg)',
      'ds-surface':     'var(--ds-surface)',
      'ds-surface-hi':  'var(--ds-surface-hi)',
      'ds-accent':      'var(--ds-accent)',
      'ds-accent-lt':   'var(--ds-accent-lt)',
      'ds-accent-sub':  'var(--ds-accent-sub)',
      'ds-border':      'var(--ds-border)',
      'ds-text':        'var(--ds-text)',
      'ds-text-muted':  'var(--ds-text-muted)',
      'ds-text-ghost':  'var(--ds-text-ghost)',
      'ds-correct':     'var(--ds-correct)',
      'ds-error':       'var(--ds-error)',
      'ds-warn':        'var(--ds-warn)',
    },
  },
}
```

All Tailwind `bg-orange-*`, `text-orange-*`, `border-orange-*` classes are then replaced with the `ds-*` aliases above.

---

## 2. Typography

**Add Space Mono** to `index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Noto+Sans:wght@400;700&display=swap" rel="stylesheet">
```

**Register in `tailwind.config.js`:**
```js
fontFamily: {
  vi:   ['"Noto Sans"', 'sans-serif'],   // unchanged
  mono: ['"Space Mono"', 'monospace'],   // new — UI chrome
}
```

**Usage rules:**
- `font-mono` — wordmark, stat numbers (WPM / ACC / TIME), code chips, session-complete label
- `font-vi` — all Vietnamese body text, hints, instructions (unchanged)
- Default sans — tab labels, button text, card labels

---

## 3. Miu Avatar SVG

**Already created:** `src/assets/miu-avatar.svg`

Create a thin React wrapper for convenient reuse:

```jsx
// src/components/ui/MiuAvatar.jsx
export function MiuAvatar({ size = 32, className = '' }) {
  return (
    <img
      src="/miu-avatar.svg"
      width={size}
      height={size}
      alt="Miu"
      className={className}
      draggable={false}
    />
  );
}
```

Move `miu-avatar.svg` to `public/miu-avatar.svg` so Vite serves it at `/miu-avatar.svg`.

**Replacements:**
- `App.jsx` header `🐾` → `<MiuAvatar size={32} />`
- `AITutor.jsx` `🐱` → `<MiuAvatar size={44} />`

---

## 4. Component Changes

### 4a. `App.jsx` — Header & tab bar

**Before:** `bg-orange-400` header, plain `bg-white text-orange-500` active tab pill.

**After:**
- Header: `style` gradient `linear-gradient(180deg, #0f0e1a, #08090f)` + bottom border `border-b border-ds-border`
- Wordmark: Space Mono, `tracking-widest`, `text-ds-text`
- Tab container: `bg-ds-surface/40 border border-ds-border rounded-xl p-1`
- Active tab: gradient bg `from-accent/30 to-accent/10`, `border border-ds-border`, glow `shadow-[0_0_12px_rgba(108,99,255,0.2)]`
- Inactive tab: `text-ds-text-muted hover:text-ds-text hover:bg-white/5`
- Page bg: `bg-ds-bg` replaces `bg-orange-50`

### 4b. `TypingSession.jsx` — Stats & progress

- Stats wrapper: remove `text-orange-500` / `text-blue-500` / `text-green-500`; use `text-ds-accent-lt` for WPM/time, `text-ds-correct` for accuracy
- Stat labels: `font-mono tracking-widest text-ds-text-ghost text-[9px] uppercase`
- Stat card: `bg-ds-surface border border-ds-border rounded-xl`
- Progress bar: `h-[3px] bg-ds-accent` with `shadow-[0_0_6px_var(--ds-accent)]`, track `bg-white/5`
- Progress counter: `font-mono text-ds-text-ghost text-[10px]`
- Loading spinner: replace `border-orange-300/border-t-orange-500` with `border-ds-accent-sub border-t-ds-accent`
- Loading text: `text-ds-text-muted`

### 4c. `TypingLane.jsx` — Grapheme boxes

**Boxes variant slot states:**

| State | Before | After |
|---|---|---|
| idle | `bg-white border-gray-200 text-gray-400` | `bg-ds-surface border-ds-border/50 text-ds-text-ghost` |
| current | `bg-orange-100 border-orange-400 text-orange-700 scale-110` | `bg-ds-accent-sub border-ds-accent text-ds-accent-lt scale-110 shadow-[0_0_14px_rgba(108,99,255,0.35)]` |
| correct | `bg-green-100 border-green-400 text-green-700` | `bg-ds-correct/10 border-ds-correct text-ds-correct` |
| error | `bg-red-100 border-red-400 text-red-700` | `bg-ds-error/10 border-ds-error text-ds-error` |
| tentative | `bg-amber-50 border-amber-300 text-amber-600` | `bg-ds-warn/10 border-ds-warn text-ds-warn` |

**Line variant:** Replace `bg-white border-orange-200` sentence container with `bg-ds-surface border border-ds-border`.

**"Tap to type" hint** (mobile fix already applied): change `text-orange-400` → `text-ds-accent-lt`.

**Awaiting-tone hint:** `text-amber-500` → `text-ds-warn`.

### 4d. `AITutor.jsx`

**Before:** `bg-orange-50 border-orange-200`, `text-orange-600` label, `text-gray-700` body.

**After:**
- Container: `bg-ds-accent-sub border border-ds-border rounded-2xl`
- Replace `🐱` with `<MiuAvatar size={44} />` inside a relative wrapper with glow status dot
- Label "Miu nói:" → "Miu · AI Tutor" in `font-mono text-ds-accent-lt text-[10px] tracking-widest uppercase`
- Body text: `text-ds-accent-lt/80` (lavender-ish)
- Loading pulse: `text-ds-text-muted`
- Error: `text-ds-error`

### 4e. `HowToUse.jsx`

- Page bg (inherited): already covered by `App.jsx` `bg-ds-bg`
- Section heading `text-orange-500` → `text-ds-accent-lt`
- Cards: `bg-white border-orange-100` → `bg-ds-surface border-ds-border`
- Level cards (beginner/intermediate/etc.): replace color-coded `bg-green-50`, `bg-blue-50`, etc. with uniform `bg-ds-surface-hi border border-ds-border` — level color moves to the emoji + label only
- Code `<code>` chips: `bg-gray-100` → `bg-ds-accent-sub text-ds-accent-lt border border-ds-border font-mono`
- Example `text-orange-500` → `text-ds-accent-lt`

### 4f. `LessonPicker.jsx` — Lesson cards

- Unselected: `bg-ds-surface border-ds-border rounded-2xl`
- Selected/hover: `bg-ds-accent-sub border-ds-accent shadow-[0_0_18px_rgba(108,99,255,0.15)]`
- Level badge colors: keep emoji, restyle text to `text-ds-text`

### 4g. `SessionResults.jsx`

- Container bg: `bg-ds-bg`
- Add `// SESSION_COMPLETE` label in `font-mono text-ds-accent text-[10px] tracking-[3px] uppercase` above title
- WPM / elapsed: `font-mono text-ds-accent-lt`
- Accuracy: `font-mono text-ds-correct`
- Stars: `text-ds-warn`
- Dividers between stats: `bg-ds-border w-px`
- Buttons: primary gradient, ghost secondary (per button spec above)

### 4h. `StoryStudio.jsx`

- Textarea: `bg-ds-surface border-ds-border text-ds-text placeholder:text-ds-text-ghost focus:border-ds-accent focus:ring-ds-accent/20`
- Submit button: primary gradient
- Char count: `font-mono text-ds-text-ghost`

---

## 5. Animations

All added via Tailwind `transition-*` utilities and one new keyframe — no external animation library.

| Element | Animation |
|---|---|
| Tab switch | `transition-colors duration-200` on tab buttons |
| Active tab glow | CSS `box-shadow` already present, transitions with `transition-shadow duration-200` |
| Grapheme box — current | `scale-110` + glow, transitions with `transition-all duration-150` |
| Grapheme box — correct | Color flash via `transition-colors duration-100` |
| Page content | `animate-fadeIn` on main panel swap (new keyframe: `0%→opacity:0,translateY(6px)` to `100%→opacity:1,translateY(0)`) |
| AITutor panel | `animate-fadeIn` on mount |
| Loading spinner | Existing `animate-spin` restyled |

**New keyframe in `tailwind.config.js`:**
```js
keyframes: {
  shake: { /* existing */ },
  fadeIn: {
    '0%':   { opacity: '0', transform: 'translateY(6px)' },
    '100%': { opacity: '1', transform: 'translateY(0)' },
  },
},
animation: {
  shake:  'shake 0.5s ease-in-out',
  fadeIn: 'fadeIn 0.2s ease-out',
},
```

---

## 6. Files to Change

| File | Change type |
|---|---|
| `index.html` | Add Space Mono font link |
| `src/index.css` | Add `:root` token block, replace `@tailwind` directives |
| `tailwind.config.js` | Add `mono` font family, add `fadeIn` keyframe/animation |
| `src/App.jsx` | Header bg, tab bar, page bg, MiuAvatar |
| `src/components/AITutor.jsx` | Full reskin, MiuAvatar |
| `src/components/TypingLane.jsx` | Slot state classes, line variant container, hint colors |
| `src/components/TypingSession.jsx` | Stats, progress bar, loading state |
| `src/components/HowToUse.jsx` | Cards, headings, code chips |
| `src/components/LessonPicker.jsx` | Card states |
| `src/components/SessionResults.jsx` | Full reskin, monospace stats |
| `src/components/StoryStudio.jsx` | Textarea, button |
| `src/components/WordCard.jsx` | Text colors |
| `public/miu-avatar.svg` | **New** — move from `src/assets/` |
| `src/components/ui/MiuAvatar.jsx` | **New** — SVG wrapper component |

---

## 7. Out of Scope

- No routing or UX flow changes
- No new features
- No backend changes
- No test changes (Playwright tests in `running-game/` are unrelated)
- No layout restructuring (tabs stay as tabs, same three panels)
