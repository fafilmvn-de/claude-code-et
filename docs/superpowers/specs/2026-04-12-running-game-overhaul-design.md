# Cat Hero's Backyard Survival — Overhaul Design Spec

**Date:** 2026-04-12  
**Project:** `running-game/`  
**Approach:** Feature Overhaul (Approach 1) — keep entity classes, split GameEngine, add new systems  
**Target audience:** Kids 8–14  
**Design objectives:** Fun, mediocre difficulty, high replayability

---

## 1. Concept

Cat Hero's Backyard Survival is a top-down endless wave survival game. The player controls a cat hero defending their backyard from increasingly dangerous animal invaders. Waves never end — you survive as long as you can, build a combo to multiply coins, spend coins in a shop between waves, and compete for a high score on the local leaderboard.

**Core loop:**  
Fight wave → build combo → earn coins → clear wave → shop (every 5 waves) → fight harder wave → die → see score → play again.

---

## 2. Architecture

### 2.1 GameEngine Split

The existing `GameEngine.js` (853 lines, God Object) is split into 5 focused files:

```
js/
  core/
    GameEngine.js         ← ~250 lines: game loop, collision detection, render pipeline, manager wiring
    WaveManager.js        ← NEW: wave progression, enemy spawning, boss scheduling
    ComboSystem.js        ← NEW: combo counter, multiplier tiers, timing window, miss detection
    ShopManager.js        ← NEW: coin economy, upgrade catalogue, shop UI trigger/close
    LeaderboardManager.js ← NEW: localStorage read/write, score calculation, display
  entities/
    CatHero.js            ← unchanged
    WildBoar.js           ← unchanged
    DireWolf.js           ← unchanged
    Collectible.js        ← unchanged (repurposed as coin drop)
    EnvironmentItem.js    ← unchanged
    Raccoon.js            ← NEW
    Fox.js                ← NEW
    GiantBug.js           ← NEW
    AngryBear.js          ← NEW boss
  utils/
    ImageLoader.js        ← unchanged
    SpriteProcessor.js    ← unchanged
    Particle.js           ← unchanged
    WeaponBlast.js        ← unchanged
    SoundManager.js       ← NEW: Web Audio API, pooled sound effects
```

### 2.2 Manager Communication

Managers communicate back to GameEngine via callbacks — no circular imports. Example: `WaveManager` calls `onWaveCleared(waveNumber)` → GameEngine triggers `ShopManager.open()` if `waveNumber % 5 === 0`.

---

## 3. Core Gameplay Loop

### 3.1 Wave Structure

- Each wave lasts until all spawned enemies are killed.
- Wave 1: 3 boars, slow spawn rate.
- Each subsequent wave adds 1–2 more enemies and increases base speed by 3% (caps at wave 30).
- **Every 5 waves:** Shop phase — arena clears, shop overlay appears. Exception: shop is skipped on boss waves (waves 10, 20, 30…); the next shop appears at the wave after the boss wave instead (e.g. wave 11, 21…).
- **Every 10 waves:** Boss wave — Angry Bear spawns alongside 4 normal enemies.

### 3.2 Enemy Roster by Wave Range

| Waves | Enemy types active |
|---|---|
| 1–4 | Wild Boar only |
| 5–9 | Boar + Raccoon |
| 10–14 | Boar + Raccoon + Fox |
| 15–19 | Boar + Fox + Dire Wolf |
| 20+ | All types including Giant Bug |

### 3.3 Difficulty Tuning (mediocre = forgiving but escalating)

- Player starts with **6 HP** (up from 5).
- Invulnerability frames after hit: **2.5s** (up from 2s).
- Enemy speed scaling: **+3% per wave** (uniform, not per-type).
- **Free revive once per run** if player dies on wave ≤ 5 (safety net for younger players).

### 3.4 Run End

Player death → score calculation → name entry → leaderboard display → "Play Again" screen.

---

## 4. Combo System

Replaces the current kill-streak mechanic (10 kills → AOE blast).

### 4.1 Mechanics

- Every successful attack increments the combo counter.
- A **2-second timing window** resets on each hit. Missing the window (no hit for 2s) drops combo to 0.
- Combo multiplier applies to coins earned per kill.

### 4.2 Multiplier Tiers

| Combo | Multiplier | Visual |
|---|---|---|
| 0–4 | ×1 | Grey counter |
| 5–9 | ×2 | Blue glow |
| 10–19 | ×3 | Orange flame |
| 20+ | ×4 (cap) | Purple lightning |

### 4.3 AOE Blast (preserved)

At combo ×3 or higher, the Sword Blast (Space bar) becomes available. Using it does **not** reset the combo counter — it counts as an attack hit, resetting the 2-second timing window and keeping the streak alive.

### 4.4 Feedback

- Combo counter (top-left HUD) bounces/scales on each hit, colour changes per tier.
- Timing bar depletes in real time below the counter.
- Hit sound pitch rises with combo tier.
- Screen shake intensity scales with combo tier.

---

## 5. Shop System

### 5.1 Coin Economy

- Enemies drop **1 coin on death** (base), multiplied by current combo tier.
- Coins persist through the run, reset on death.
- Boss kill: **15 coins** guaranteed drop.

### 5.2 Shop Trigger

After every 5th wave, the arena freezes and a shop overlay appears over the canvas. No time pressure.

### 5.3 Upgrade Catalogue

8 upgrades, max 3 purchases each:

| Upgrade | Cost | Effect |
|---|---|---|
| Sharpened Claws | 10 | Attack cooldown −15% |
| Long Paws | 8 | Attack range +20% |
| Cat Nap | 12 | Restore 2 HP |
| Fluffy Armour | 15 | +2 max HP |
| Quick Paws | 10 | Movement speed +15% |
| Yarn Magnet | 8 | Coin pickup radius ×2 |
| Catnip Frenzy | 20 | Combo window +0.5s |
| Iron Whiskers | 18 | Invulnerability frames +0.5s |

### 5.4 Shop UI

- 4 random upgrades shown per visit, weighted toward unpurchased upgrades. If fewer than 4 upgrades remain purchasable (not yet maxed), all remaining are shown.
- Each card: icon, name, description, cost, purchase counter (×0/3).
- Greyed out if unaffordable or maxed.
- "Back to battle!" button resumes next wave.

---

## 6. Leaderboard

### 6.1 Storage

`localStorage` — no backend. Scores persist across sessions on the same device. Top 10 scores stored.

### 6.2 Score Formula

```
score = (waves_survived × 100) + (total_kills × 10) + (coins_spent × 5) + (max_combo × 20)
```

### 6.3 Score Entry

On death: name input (max 12 chars, pre-filled with last used name) before leaderboard is shown.

### 6.4 Display

- Shown on main menu and after every run.
- Top 10 ranked table with wave count and max combo as secondary stats.
- Current run highlighted if it makes the board.
- Personal best shown even if outside top 10: "Your best: wave 7, score 1,240."

---

## 7. New Enemies & Boss

All new enemies use emoji fallbacks with sprite slots reserved for future art.

### Raccoon (waves 5+)
- HP: 1 | Speed: 2.2 | Damage: 0
- Special: **steals 2 coins on contact** instead of dealing HP damage. Teaches target prioritisation. Killing a raccoon still drops 1 base coin (multiplied by combo tier) — the steal only triggers while it's alive and touching the player.

### Fox (waves 10+)
- HP: 2 | Speed: 2.8 | Damage: 1
- Special: **dashes toward player every 4s** (orange flash telegraph before dash). Forces player movement.

### Giant Bug (waves 20+)
- HP: 3 | Speed: 1.2 | Damage: 2
- Special: slow and tanky, deals 2 damage on contact. Spawns in pairs.

### Angry Bear — Boss (waves 10, 20, 30…)
- HP: 20 | Speed: 1.0 → 2.0 at 50% HP | Damage: 3
- Size: 3× normal enemy
- Phase 2 (≤10 HP): charges in straight lines with red screen-edge flash telegraph.
- Death: 15 coins + screen-wide celebration particles + wave cleared.
- Boss wave spawns only 4 normal enemies alongside the bear.

---

## 8. Sound & Visual Feedback

### 8.1 Sound Effects (Web Audio API — no audio files required)

| Event | Sound |
|---|---|
| Basic attack hit | Short punch thud, pitch rises with combo tier |
| Combo milestone (×2/×3/×4) | Ascending chime burst |
| Combo break | Low descending tone |
| Coin collected | Bright ping |
| Player hit | Low thud + brief bass drop |
| Boss spawn | Deep reverb roar |
| Boss death | Ascending fanfare |
| Shop open/close | Soft whoosh |
| Wave clear | Cheerful 3-note jingle |

### 8.2 Visual Feedback Additions

- **Screen shake:** on player hit (medium), boss hit (light), boss death (heavy, 0.5s).
- **Enemy hit flash:** white flash on damage (extends existing player flash to enemies).
- **Coin pop:** floating "+1" / "+2" / "+3" text rises from enemy on death, colour matches combo tier.
- **Boss health bar:** dedicated bar below main HUD, visible only during boss waves.
- **Wave clear banner:** full-width banner slides in ("Wave 7 — Survived!") then fades.

### 8.3 Background Music

Single looping track via Web Audio API oscillators. Cheerful and upbeat for waves 1–9; tension rises from wave 10+. Volume ducked during shop.

---

## 9. HUD Layout

```
┌─────────────────────────────────────────────┐
│ ❤️❤️❤️❤️❤️❤️  HP │  WAVE 7 [████░░] │ 🪙 38 coins │  ← top bar
├──────────────────────────────────────────────┤
│ ┌─COMBO──┐                    ┌──SCORE──────┐│
│ │   12   │                    │   4,820     ││ ← overlay panels
│ │  ×3 🔥 │                    │ BEST 7,310  ││
│ │ [████░] │                    └─────────────┘│
│ └────────┘                                   │
│                                              │
│           [ game canvas ]                   │
│                                              │
├──────────────────────────────────────────────┤
│ 🐻 ANGRY BEAR        12 / 20 HP [████████░░] │  ← boss bar (boss waves only)
├──────────────────────────────────────────────┤
│  SPACE — Blast (combo ×3+)            ⏸ ESC  │  ← bottom hint bar
└──────────────────────────────────────────────┘
```

**Changes from current UI:**
- Combo box (top-left) with timing bar replaces kill-streak counter.
- Score + personal best (top-right) always visible.
- Boss HP bar slides in from bottom only during boss waves.
- Coins in top bar (was buried in item panel).
- Wave progress bar replaces text-only kill counter.
- Control hint at bottom replaces always-on item inventory.

---

## 10. Mobile & Tablet Touch Controls

The existing on-screen directional buttons are kept but fully overhauled for touch-first play. The canvas resizes to fill the viewport on any screen size.

### 10.1 Layout

```
┌──────────────────────────────────────┐
│            HUD (top bar)             │
├──────────────────────────────────────┤
│                                      │
│          [ game canvas ]             │
│                                      │
├──────────────────────────────────────┤
│  ┌──────────┐          ┌──────────┐  │
│  │  D-PAD   │          │  ATTACK  │  │
│  │  (left)  │          │ (right)  │  │
│  └──────────┘          └──────────┘  │
└──────────────────────────────────────┘
```

- **D-pad (bottom-left):** Virtual joystick — touch and drag in any direction for 8-directional movement. Larger hit area than current buttons (min 120px diameter).
- **Attack button (bottom-right):** Large circular tap target (min 80px diameter). Triggers the same attack as Space / mouse click.
- **Blast button:** Appears overlaid on the attack button (glowing ring) when combo ×3+ is active; a second tap fires the AOE blast.
- **Shop cards:** Full tap targets — each upgrade card fills at least 44×44px per WCAG touch target guidelines.
- **Pause:** Tap the wave indicator in the top bar to pause (no dedicated button needed on small screens).

### 10.2 Responsive Canvas

- Canvas scales to `min(window.innerWidth, window.innerHeight * 4/3)` maintaining the 4:3 aspect ratio.
- On portrait phones, the canvas occupies the top ~65% of the screen; controls occupy the bottom ~35%.
- On landscape tablets, the canvas fills the full width with controls overlaid at the bottom corners (semi-transparent).
- `viewport` meta tag set to `width=device-width, initial-scale=1, user-scalable=no` to prevent pinch-zoom during play.

### 10.3 Touch Event Handling

- All existing `mousedown` / `click` listeners get companion `touchstart` / `touchend` listeners.
- Multi-touch: movement and attack can be held simultaneously (left thumb moves, right thumb attacks).
- Touch inputs on the canvas are translated to the same world-space coordinates as mouse clicks for attack targeting.

---

## 11. Out of Scope

- Multiplayer / online leaderboard
- New sprite art (emoji fallbacks used for all new entities)
- Save/resume mid-run
- Difficulty settings menu
