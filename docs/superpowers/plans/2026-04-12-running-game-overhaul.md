# Cat Hero's Backyard Survival — Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the existing 3-level arena brawler into an endless wave survival game with combo multipliers, between-wave shop, localStorage leaderboard, 4 new enemies (including a boss), Web Audio sound, and canvas-native mobile touch controls.

**Architecture:** `GameEngine.js` (853 lines, God Object) is split into 5 focused managers (`WaveManager`, `ComboSystem`, `ShopManager`, `LeaderboardManager`, `SoundManager`) communicating back via constructor callbacks — no circular imports. Entity classes stay self-contained. All new UI is added to `index.html` as hidden overlays; canvas HUD elements are drawn directly on the canvas.

**Tech Stack:** Vanilla JS ES6 classes, HTML5 Canvas, Web Audio API, `localStorage`, Tailwind CSS (CDN), Playwright v1.55 (tests), Python http.server port 8000 (dev), port 8080 (Playwright auto-start)

---

## File Map

| File | Status | Role |
|---|---|---|
| `js/core/GameEngine.js` | Modify | Strip to ~250 lines; wire managers |
| `js/core/WaveManager.js` | **Create** | Wave progression, spawn schedule, boss scheduling |
| `js/core/ComboSystem.js` | **Create** | Combo counter, 2s timing window, multiplier tiers |
| `js/core/ShopManager.js` | **Create** | Coin economy, upgrade catalogue, shop HTML overlay |
| `js/core/LeaderboardManager.js` | **Create** | Score formula, localStorage top-10, name-entry flow |
| `js/utils/SoundManager.js` | **Create** | Web Audio API procedural sound effects |
| `js/entities/Raccoon.js` | **Create** | Steals 2 coins on contact; 1 HP; speed 2.2 |
| `js/entities/Fox.js` | **Create** | Dashes every 4s with telegraph; 2 HP; speed 2.8 |
| `js/entities/GiantBug.js` | **Create** | Tanky 3 HP; 2 damage; speed 1.2; spawns in pairs |
| `js/entities/AngryBear.js` | **Create** | Boss: 20 HP; size 3×; phase-2 charge at ≤10 HP |
| `index.html` | Modify | Replace HUD; add overlays; responsive canvas; remove D-pad |
| `tests/wave-manager.spec.js` | **Create** | Wave progression Playwright tests |
| `tests/combo-system.spec.js` | **Create** | Combo logic tests via `page.evaluate()` |
| `tests/shop-leaderboard.spec.js` | **Create** | Shop purchase + leaderboard save/retrieve tests |

---

## Task 1: Restructure index.html — responsive canvas, new HUD, overlays

**Files:**
- Modify: `running-game/index.html`

Replace the existing HTML with a version that:
- Drops the D-pad mobile buttons
- Makes the canvas fill the viewport responsively (CSS only — canvas `width`/`height` attributes stay 800×600)
- Replaces the yarn/butterfly/fish HUD bar with a compact top-bar showing HP, wave number + progress, and coin count
- Adds empty placeholder `<div>` elements for canvas overlays (combo box, score panel, boss bar) — these are shown/hidden by JS
- Adds the shop overlay, leaderboard panel on the main menu, and name-entry modal

- [ ] **Step 1: Add responsive canvas CSS and remove D-pad**

In the `<style>` block, add after the existing `.game-canvas` rule:

```css
#canvas-wrapper {
    position: relative;
    display: inline-block;
}
#game-canvas {
    display: block;
    touch-action: none;
}
/* Responsive: scale canvas via CSS, keep internal 800×600 resolution */
@media (max-width: 860px) {
    #game-canvas {
        width: 100vw;
        height: calc(100vw * 0.75);
    }
}
/* Combo overlay */
#combo-overlay {
    position: absolute;
    top: 8px; left: 8px;
    background: rgba(0,0,0,0.6);
    border-radius: 10px;
    padding: 6px 12px;
    color: white;
    font-family: 'Fredoka One', cursive;
    min-width: 80px;
    text-align: center;
    pointer-events: none;
}
#combo-overlay.hidden { display: none; }
#combo-count { font-size: 2rem; line-height: 1; }
#combo-tier { font-size: 0.85rem; }
#combo-bar-bg { background:#374151; border-radius:4px; height:4px; margin-top:4px; }
#combo-bar { background:#f97316; height:4px; border-radius:4px; width:100%; transition: width 0.1s; }
/* Score overlay */
#score-overlay {
    position: absolute;
    top: 8px; right: 8px;
    background: rgba(0,0,0,0.6);
    border-radius: 10px;
    padding: 6px 12px;
    color: white;
    font-family: 'Fredoka One', cursive;
    text-align: right;
    pointer-events: none;
}
#score-value { font-size: 1.4rem; color: #e0e7ff; }
#score-best { font-size: 0.75rem; color: #818cf8; }
/* Boss HP bar */
#boss-bar-wrapper {
    background: rgba(0,0,0,0.7);
    padding: 6px 14px;
    border-radius: 0 0 8px 8px;
}
#boss-bar-wrapper.hidden { display: none; }
#boss-bar-fill { background: linear-gradient(90deg,#ef4444,#f87171); height:8px; border-radius:4px; transition: width 0.3s; }
/* Wave banner */
#wave-banner {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%,-50%);
    background: rgba(0,0,0,0.75);
    color: #fbbf24;
    font-family: 'Fredoka One', cursive;
    font-size: 2rem;
    padding: 12px 32px;
    border-radius: 16px;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.4s;
}
#wave-banner.visible { opacity: 1; }
/* Screen shake */
@keyframes shake {
    0%,100%{transform:translate(0,0)}
    20%{transform:translate(-4px,2px)}
    40%{transform:translate(4px,-2px)}
    60%{transform:translate(-3px,3px)}
    80%{transform:translate(3px,-1px)}
}
.shake { animation: shake 0.3s ease; }
/* Shop overlay */
#shop-overlay {
    font-family: 'Nunito', sans-serif;
}
.shop-card { cursor:pointer; border:2px solid #374151; border-radius:12px; padding:12px; text-align:center; background:#1e293b; color:white; transition:border-color 0.2s; }
.shop-card:hover:not(.unaffordable) { border-color:#fbbf24; }
.shop-card.unaffordable { opacity:0.45; cursor:not-allowed; }
.shop-icon { font-size:2rem; }
.shop-name { font-weight:bold; margin:4px 0; }
.shop-cost { color:#fcd34d; }
.shop-count { font-size:0.75rem; color:#94a3b8; }
```

- [ ] **Step 2: Replace the game-container HUD bar**

Replace the entire `<div class="mb-4 flex justify-between ...">` top HUD block (lines ~182–218 in existing HTML) with:

```html
<!-- Compact HUD bar -->
<div id="hud-bar" class="mb-2 flex justify-between items-center bg-white rounded-2xl px-4 py-2 shadow-lg border-4 border-green-400">
    <!-- HP -->
    <div class="flex items-center gap-2">
        <div id="hp-hearts" class="flex gap-1 text-xl"></div>
    </div>
    <!-- Wave info -->
    <div class="text-center">
        <div id="wave-label" class="font-bold text-yellow-600 text-sm" style="font-family:'Fredoka One',cursive">WAVE 1</div>
        <div class="bg-gray-200 rounded-full h-2 w-24 mt-1">
            <div id="wave-progress-bar" class="bg-yellow-400 h-full rounded-full transition-all duration-300" style="width:0%"></div>
        </div>
    </div>
    <!-- Coins + pause -->
    <div class="flex items-center gap-3">
        <div class="flex items-center gap-1 text-yellow-600 font-bold">
            🪙 <span id="coin-display">0</span>
        </div>
        <button id="pause-btn" class="bg-orange-400 text-white px-3 py-1 rounded-xl font-bold hover:bg-orange-500 text-sm">⏸</button>
    </div>
</div>
```

- [ ] **Step 3: Wrap the canvas with overlay elements**

Replace `<canvas id="game-canvas" ...>` with:

```html
<div id="canvas-wrapper" class="relative">
    <!-- Combo overlay (top-left) -->
    <div id="combo-overlay" class="hidden">
        <div id="combo-tier" class="text-xs tracking-widest text-gray-400">COMBO</div>
        <div id="combo-count">0</div>
        <div id="combo-mult" class="text-sm">×1</div>
        <div id="combo-bar-bg"><div id="combo-bar"></div></div>
    </div>
    <!-- Score overlay (top-right) -->
    <div id="score-overlay">
        <div class="text-xs tracking-widest text-gray-400">SCORE</div>
        <div id="score-value">0</div>
        <div id="score-best"></div>
    </div>
    <!-- Wave clear banner -->
    <div id="wave-banner"></div>
    <!-- Canvas -->
    <canvas id="game-canvas" class="game-canvas" width="800" height="600"></canvas>
    <!-- Boss HP bar (below canvas, inside wrapper) -->
    <div id="boss-bar-wrapper" class="hidden">
        <div class="flex justify-between text-sm mb-1">
            <span id="boss-name" class="text-red-300 font-bold" style="font-family:'Fredoka One',cursive">🐻 ANGRY BEAR</span>
            <span id="boss-hp-text" class="text-red-300">20 / 20</span>
        </div>
        <div class="bg-gray-700 rounded-full h-3">
            <div id="boss-bar-fill" style="width:100%"></div>
        </div>
    </div>
</div>
```

- [ ] **Step 4: Remove the old mobile D-pad and progress bar sections**

Delete the entire `<div id="mobile-controls" ...>` block and the `<!-- Progress Bar -->` block beneath the canvas.

- [ ] **Step 5: Add the shop overlay before `</body>`**

```html
<!-- Shop Overlay -->
<div id="shop-overlay" class="hidden fixed inset-0 bg-black bg-opacity-85 flex items-center justify-center z-50">
    <div class="bg-gray-900 rounded-3xl p-8 max-w-xl w-full mx-4 border-4 border-yellow-400">
        <h2 class="text-3xl font-bold text-yellow-400 text-center mb-1" style="font-family:'Fredoka One',cursive">🛍️ Shop</h2>
        <p class="text-center text-gray-400 mb-5">🪙 <span id="shop-coin-count" class="text-yellow-400 font-bold text-lg">0</span> coins</p>
        <div id="shop-cards" class="grid grid-cols-2 gap-3"></div>
        <button id="shop-close-btn" class="mt-6 w-full bg-green-500 hover:bg-green-400 text-white font-bold py-3 rounded-2xl text-lg transition-all">
            ⚔️ Back to Battle!
        </button>
    </div>
</div>

<!-- Name Entry Modal (shown on death) -->
<div id="name-entry-modal" class="hidden fixed inset-0 bg-black bg-opacity-85 flex items-center justify-center z-50">
    <div class="bg-gray-900 rounded-3xl p-8 max-w-sm w-full mx-4 border-4 border-red-400 text-center">
        <div class="text-6xl mb-3">💀</div>
        <h2 class="text-3xl font-bold text-red-400 mb-1" style="font-family:'Fredoka One',cursive">Game Over!</h2>
        <div class="text-gray-300 mb-1">Wave <span id="death-wave" class="text-yellow-400 font-bold">0</span></div>
        <div class="text-2xl text-white font-bold mb-4">Score: <span id="death-score" class="text-yellow-400">0</span></div>
        <input id="player-name-input" maxlength="12" placeholder="Your name"
            class="w-full bg-gray-800 text-white text-center text-xl py-3 px-4 rounded-xl border-2 border-gray-600 mb-4 focus:border-yellow-400 outline-none" />
        <button id="save-score-btn" class="w-full bg-yellow-500 hover:bg-yellow-400 text-white font-bold py-3 rounded-2xl text-lg mb-3 transition-all">
            🏆 Save Score
        </button>
        <button id="skip-save-btn" class="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 py-2 rounded-xl text-sm transition-all">
            Skip
        </button>
    </div>
</div>

<!-- Leaderboard Modal -->
<div id="leaderboard-modal" class="hidden fixed inset-0 bg-black bg-opacity-85 flex items-center justify-center z-50">
    <div class="bg-gray-900 rounded-3xl p-8 max-w-lg w-full mx-4 border-4 border-purple-400">
        <h2 class="text-3xl font-bold text-purple-400 text-center mb-4" style="font-family:'Fredoka One',cursive">🏆 Leaderboard</h2>
        <div id="leaderboard-table" class="space-y-2 mb-4"></div>
        <div id="personal-best-line" class="text-center text-gray-400 text-sm mb-4"></div>
        <div class="flex gap-3">
            <button id="lb-play-again-btn" class="flex-1 bg-green-500 hover:bg-green-400 text-white font-bold py-3 rounded-2xl text-lg transition-all">🎮 Play Again!</button>
            <button id="lb-menu-btn" class="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-2xl transition-all">🏠 Menu</button>
        </div>
    </div>
</div>
```

- [ ] **Step 6: Add leaderboard button to main menu**

After the `instructions-btn`, add:

```html
<button id="leaderboard-btn" class="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-white py-4 px-8 rounded-2xl text-xl font-bold hover:from-yellow-500 hover:to-yellow-600 transition-all transform hover:scale-105 shadow-lg">
    🏆 Leaderboard
</button>
```

- [ ] **Step 7: Update title and remove old level-complete / victory modals**

Replace the `<title>` text with `Cat Hero's Backyard Survival`. Delete the `<!-- Level Complete Modal -->` and `<!-- Victory Modal -->` blocks in full — they will not be used in the endless format.

- [ ] **Step 8: Start dev server and verify the page loads without JS errors**

```bash
cd running-game && npm run dev
```

Open http://localhost:8000. The main menu should show. Starting a game should still work (old JS still runs). Check browser console — no errors expected at this stage since the new HTML elements exist but JS hasn't been wired up yet.

- [ ] **Step 9: Commit**

```bash
cd running-game
git add index.html
git commit -m "feat: restructure HTML for endless survival overhaul (canvas overlays, shop, leaderboard, responsive canvas)"
```

---

## Task 2: WaveManager

**Files:**
- Create: `running-game/js/core/WaveManager.js`
- Modify: `running-game/js/core/GameEngine.js`

`WaveManager` owns: current wave number, how many enemies remain alive in this wave, what enemy types to spawn, boss/shop scheduling, and when to fire the wave-cleared callback.

- [ ] **Step 1: Write the failing test**

Create `running-game/tests/wave-manager.spec.js`:

```javascript
import { test, expect } from '@playwright/test';

test('wave 1 spawns only boars', async ({ page }) => {
    await page.goto('http://localhost:8080');
    const types = await page.evaluate(() => {
        const wm = new window.__WaveManager({
            onWaveCleared: () => {},
            onSpawnEnemy: () => {},
            onBossWaveStart: () => {}
        });
        return wm.getEnemyTypesForWave(1);
    });
    expect(types).toContain('boar');
    expect(types).not.toContain('raccoon');
});

test('wave 5 includes raccoon', async ({ page }) => {
    await page.goto('http://localhost:8080');
    const types = await page.evaluate(() => {
        const wm = new window.__WaveManager({
            onWaveCleared: () => {},
            onSpawnEnemy: () => {},
            onBossWaveStart: () => {}
        });
        return wm.getEnemyTypesForWave(5);
    });
    expect(types).toContain('raccoon');
});

test('wave 10 is a boss wave', async ({ page }) => {
    await page.goto('http://localhost:8080');
    const isBoss = await page.evaluate(() => {
        const wm = new window.__WaveManager({
            onWaveCleared: () => {},
            onSpawnEnemy: () => {},
            onBossWaveStart: () => {}
        });
        return wm.isBossWave(10);
    });
    expect(isBoss).toBe(true);
});

test('wave 5 is a shop wave, wave 10 is not', async ({ page }) => {
    await page.goto('http://localhost:8080');
    const result = await page.evaluate(() => {
        const wm = new window.__WaveManager({
            onWaveCleared: () => {},
            onSpawnEnemy: () => {},
            onBossWaveStart: () => {}
        });
        return { wave5: wm.shouldOpenShop(5), wave10: wm.shouldOpenShop(10) };
    });
    expect(result.wave5).toBe(true);
    expect(result.wave10).toBe(false);
});

test('wave clears when all enemies killed', async ({ page }) => {
    await page.goto('http://localhost:8080');
    const cleared = await page.evaluate(() => {
        let waveClearedFired = false;
        const wm = new window.__WaveManager({
            onWaveCleared: () => { waveClearedFired = true; },
            onSpawnEnemy: () => {},
            onBossWaveStart: () => {}
        });
        wm.startWave();
        const count = wm.getRemainingCount();
        for (let i = 0; i < count; i++) wm.enemyKilled();
        return waveClearedFired;
    });
    expect(cleared).toBe(true);
});
```

- [ ] **Step 2: Run test — confirm it fails**

```bash
cd running-game && npx playwright test tests/wave-manager.spec.js
```

Expected: all 5 tests fail with `window.__WaveManager is not a constructor`.

- [ ] **Step 3: Create WaveManager.js**

Create `running-game/js/core/WaveManager.js`:

```javascript
// WaveManager — owns wave number, enemy spawn schedule, boss/shop triggers
export class WaveManager {
    #wave = 0;
    #remaining = 0;
    #onWaveCleared;
    #onSpawnEnemy;
    #onBossWaveStart;

    constructor({ onWaveCleared, onSpawnEnemy, onBossWaveStart }) {
        this.#onWaveCleared = onWaveCleared;
        this.#onSpawnEnemy = onSpawnEnemy;
        this.#onBossWaveStart = onBossWaveStart;
    }

    startWave() {
        this.#wave++;
        const config = this.#buildConfig(this.#wave);
        this.#remaining = config.total;

        if (this.isBossWave(this.#wave)) {
            this.#onBossWaveStart(this.#wave);
            this.#onSpawnEnemy('bear', 1);
            this.#onSpawnEnemy(this.#primaryTypeFor(this.#wave), 4);
        } else {
            const types = this.getEnemyTypesForWave(this.#wave);
            const perType = Math.ceil(config.total / types.length);
            types.forEach(type => this.#onSpawnEnemy(type, perType));
        }
    }

    enemyKilled() {
        this.#remaining = Math.max(0, this.#remaining - 1);
        if (this.#remaining === 0) {
            this.#onWaveCleared(this.#wave);
        }
    }

    getRemainingCount() { return this.#remaining; }
    getCurrentWave() { return this.#wave; }

    isBossWave(wave) { return wave > 0 && wave % 10 === 0; }

    shouldOpenShop(wave) { return wave % 5 === 0 && !this.isBossWave(wave); }

    getEnemyTypesForWave(wave) {
        const types = ['boar'];
        if (wave >= 5) types.push('raccoon');
        if (wave >= 10) types.push('fox');
        if (wave >= 15) types.push('wolf');
        if (wave >= 20) types.push('bug');
        return types;
    }

    #primaryTypeFor(wave) {
        if (wave >= 20) return 'bug';
        if (wave >= 15) return 'wolf';
        if (wave >= 10) return 'fox';
        if (wave >= 5) return 'raccoon';
        return 'boar';
    }

    #buildConfig(wave) {
        if (this.isBossWave(wave)) return { total: 5 }; // 1 bear + 4 normal
        const total = Math.min(3 + Math.floor(wave * 1.5), 30 + wave); // soft cap
        return { total };
    }
}
```

- [ ] **Step 4: Expose WaveManager to tests via main.js**

In `running-game/js/main.js`, add after the existing import:

```javascript
import { WaveManager } from './core/WaveManager.js';
// Expose for Playwright tests
window.__WaveManager = WaveManager;
```

- [ ] **Step 5: Run tests — confirm they pass**

```bash
cd running-game && npx playwright test tests/wave-manager.spec.js
```

Expected: 5 passed.

- [ ] **Step 6: Wire WaveManager into GameEngine**

In `GameEngine.js`, add the import at the top:

```javascript
import { WaveManager } from './WaveManager.js';
```

In the `constructor()`, add after the existing state declarations (replace the old `this.levels` array and `this.enemiesKilled` block):

```javascript
// Wave state (replaces old level/kill system)
this.currentWave = 0;
this.coins = 0;
this.totalKills = 0;
this.waveInProgress = false;

this.waveManager = new WaveManager({
    onWaveCleared: (waveNum) => this.#onWaveCleared(waveNum),
    onSpawnEnemy: (type, count) => this.#spawnEnemiesOfType(type, count),
    onBossWaveStart: (waveNum) => this.#onBossWaveStart(waveNum)
});
```

Add these private methods to `GameEngine`:

```javascript
#onWaveCleared(waveNum) {
    this.waveInProgress = false;
    // Show wave banner
    this.#showWaveBanner(`Wave ${waveNum} — Survived! 🎉`);

    // Delay before next wave / shop
    setTimeout(() => {
        if (this.waveManager.shouldOpenShop(waveNum)) {
            // Task 6 will wire shopManager here
            this.#startNextWave();
        } else {
            this.#startNextWave();
        }
    }, 2000);
}

#startNextWave() {
    if (this.gameState !== 'playing') return;
    this.waveInProgress = true;
    this.waveManager.startWave();
    const w = this.waveManager.getCurrentWave();
    document.getElementById('wave-label').textContent = `WAVE ${w}`;
}

#onBossWaveStart(waveNum) {
    document.getElementById('boss-bar-wrapper').classList.remove('hidden');
    document.getElementById('boss-name').textContent = '🐻 ANGRY BEAR';
    document.getElementById('boss-hp-text').textContent = '20 / 20';
    document.getElementById('boss-bar-fill').style.width = '100%';
}

#spawnEnemiesOfType(type, count) {
    for (let i = 0; i < count; i++) {
        const { x, y } = this.#randomEdgePosition();
        switch (type) {
            case 'boar': this.enemies.push(new WildBoar(x, y, this.images)); break;
            case 'wolf': this.enemies.push(new DireWolf(x, y, this.images)); break;
            // raccoon/fox/bug/bear added in Task 8
        }
    }
}

#randomEdgePosition() {
    const edge = Math.floor(Math.random() * 4);
    let x, y;
    switch (edge) {
        case 0: x = Math.random() * this.worldWidth; y = -50; break;
        case 1: x = this.worldWidth + 50; y = Math.random() * this.worldHeight; break;
        case 2: x = Math.random() * this.worldWidth; y = this.worldHeight + 50; break;
        default: x = -50; y = Math.random() * this.worldHeight;
    }
    return { x, y };
}

#showWaveBanner(text) {
    const el = document.getElementById('wave-banner');
    el.textContent = text;
    el.classList.add('visible');
    setTimeout(() => el.classList.remove('visible'), 2000);
}
```

Replace the old `startNewGame()` / `startLevel()` to start with wave 1:

```javascript
startNewGame() {
    this.totalKills = 0;
    this.coins = 0;
    this.currentHP = 6; // 6 HP per spec
    this.maxHP = 6;
    this.gameState = 'playing';
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('game-container').classList.remove('hidden');
    this.initializeWorld();
    // Start first wave after a short delay
    setTimeout(() => this.#startNextWave(), 1000);
}

initializeWorld() {
    this.player = new CatHero(this.worldWidth / 2, this.worldHeight / 2, this.images);
    this.enemies = [];
    this.collectibles = [];
    this.environment = [];
    this.particles = [];
    this.weaponEffects = [];
    this.createEnvironment('garden');
    this.updateCamera();
}
```

Delete the old `spawnEnemies()`, `checkLevelComplete()`, `completeLevel()`, `nextLevel()`, `showVictory()` methods — they are replaced by WaveManager.

- [ ] **Step 7: Update `onEnemyKilled()` to call `waveManager.enemyKilled()`**

Replace the old `onEnemyKilled()`:

```javascript
onEnemyKilled() {
    this.totalKills++;
    this.waveManager.enemyKilled();
    // ComboSystem.hit() wired in Task 3
    // coin drop wired in Task 6
    this.updateHUD();
}
```

- [ ] **Step 8: Update `updateUI()` → rename to `updateHUD()` and strip old elements**

```javascript
updateHUD() {
    // HP hearts
    const el = document.getElementById('hp-hearts');
    if (el) {
        el.innerHTML = Array.from({ length: this.maxHP }, (_, i) =>
            `<span>${i < this.currentHP ? '❤️' : '🤍'}</span>`
        ).join('');
    }
    // Coin display
    const coinEl = document.getElementById('coin-display');
    if (coinEl) coinEl.textContent = this.coins;
    // Wave progress
    const remaining = this.waveManager.getRemainingCount();
    const total = remaining + this.totalKills; // approximation
    const pct = total > 0 ? Math.min(100, ((total - remaining) / total) * 100) : 0;
    const bar = document.getElementById('wave-progress-bar');
    if (bar) bar.style.width = pct + '%';
}
```

- [ ] **Step 9: Start dev server and smoke-test**

```bash
cd running-game && npm run dev
```

Open http://localhost:8000. Start a game — the cat should appear, wave 1 should start after 1 second with boars spawning from edges. Kill all enemies → "Wave 1 — Survived!" banner → wave 2 starts. Console should have no errors.

- [ ] **Step 10: Commit**

```bash
cd running-game
git add js/core/WaveManager.js js/core/GameEngine.js js/main.js tests/wave-manager.spec.js
git commit -m "feat: extract WaveManager — endless wave progression replaces 3-level system"
```

---

## Task 3: ComboSystem

**Files:**
- Create: `running-game/js/core/ComboSystem.js`
- Modify: `running-game/js/core/GameEngine.js`
- Create: `running-game/tests/combo-system.spec.js`

Replaces `this.killStreak` + `this.weaponBlastReady`.

- [ ] **Step 1: Write the failing test**

Create `running-game/tests/combo-system.spec.js`:

```javascript
import { test, expect } from '@playwright/test';

test('combo starts at 0 with ×1 multiplier', async ({ page }) => {
    await page.goto('http://localhost:8080');
    const result = await page.evaluate(() => {
        const cs = new window.__ComboSystem({ onChanged: () => {}, onBreak: () => {}, onMilestone: () => {} });
        return { count: cs.getCount(), mult: cs.getMultiplier(), tier: cs.getTier() };
    });
    expect(result.count).toBe(0);
    expect(result.mult).toBe(1);
    expect(result.tier).toBe('grey');
});

test('5 hits → ×2 blue tier', async ({ page }) => {
    await page.goto('http://localhost:8080');
    const result = await page.evaluate(() => {
        const cs = new window.__ComboSystem({ onChanged: () => {}, onBreak: () => {}, onMilestone: () => {} });
        for (let i = 0; i < 5; i++) cs.hit();
        return { mult: cs.getMultiplier(), tier: cs.getTier() };
    });
    expect(result.mult).toBe(2);
    expect(result.tier).toBe('blue');
});

test('10 hits → ×3 orange, blast ready', async ({ page }) => {
    await page.goto('http://localhost:8080');
    const result = await page.evaluate(() => {
        const cs = new window.__ComboSystem({ onChanged: () => {}, onBreak: () => {}, onMilestone: () => {} });
        for (let i = 0; i < 10; i++) cs.hit();
        return { mult: cs.getMultiplier(), tier: cs.getTier(), blast: cs.isBlastReady() };
    });
    expect(result.mult).toBe(3);
    expect(result.tier).toBe('orange');
    expect(result.blast).toBe(true);
});

test('20 hits → ×4 purple (cap)', async ({ page }) => {
    await page.goto('http://localhost:8080');
    const mult = await page.evaluate(() => {
        const cs = new window.__ComboSystem({ onChanged: () => {}, onBreak: () => {}, onMilestone: () => {} });
        for (let i = 0; i < 25; i++) cs.hit();
        return cs.getMultiplier();
    });
    expect(mult).toBe(4);
});

test('combo breaks after 2s window expires', async ({ page }) => {
    await page.goto('http://localhost:8080');
    const result = await page.evaluate(async () => {
        let broke = false;
        const cs = new window.__ComboSystem({
            onChanged: () => {},
            onBreak: () => { broke = true; },
            onMilestone: () => {}
        });
        for (let i = 0; i < 5; i++) cs.hit();
        // Simulate 2100ms passing
        cs.update(2100);
        return { broke, count: cs.getCount() };
    });
    expect(result.broke).toBe(true);
    expect(result.count).toBe(0);
});

test('extendWindow increases timing', async ({ page }) => {
    await page.goto('http://localhost:8080');
    const result = await page.evaluate(() => {
        let broke = false;
        const cs = new window.__ComboSystem({
            onChanged: () => {},
            onBreak: () => { broke = true; },
            onMilestone: () => {}
        });
        cs.hit();
        cs.extendWindow(500); // now 2500ms window
        cs.update(2100);      // 2100ms < 2500ms — should NOT break
        return broke;
    });
    expect(result).toBe(false);
});
```

- [ ] **Step 2: Run test — confirm fail**

```bash
cd running-game && npx playwright test tests/combo-system.spec.js
```

Expected: all 6 fail with `window.__ComboSystem is not a constructor`.

- [ ] **Step 3: Create ComboSystem.js**

Create `running-game/js/core/ComboSystem.js`:

```javascript
export class ComboSystem {
    #count = 0;
    #windowMs = 2000;
    #timer = 0;
    #onChanged;
    #onBreak;
    #onMilestone;
    #prevMult = 1;

    constructor({ onChanged, onBreak, onMilestone }) {
        this.#onChanged = onChanged;
        this.#onBreak = onBreak;
        this.#onMilestone = onMilestone;
    }

    hit() {
        this.#count++;
        this.#timer = this.#windowMs;
        const mult = this.getMultiplier();
        this.#onChanged(this.#count, mult, this.getTier(), this.getTimerFraction());
        if (mult > this.#prevMult) {
            this.#onMilestone(mult, this.getTier());
            this.#prevMult = mult;
        }
    }

    update(deltaMs) {
        if (this.#count === 0) return;
        this.#timer -= deltaMs;
        if (this.#timer <= 0) {
            this.#count = 0;
            this.#timer = 0;
            this.#prevMult = 1;
            this.#onBreak();
        }
    }

    getCount() { return this.#count; }

    getMultiplier() {
        if (this.#count >= 20) return 4;
        if (this.#count >= 10) return 3;
        if (this.#count >= 5) return 2;
        return 1;
    }

    getTier() {
        if (this.#count >= 20) return 'purple';
        if (this.#count >= 10) return 'orange';
        if (this.#count >= 5) return 'blue';
        return 'grey';
    }

    isBlastReady() { return this.getMultiplier() >= 3; }

    getTimerFraction() {
        return this.#count > 0 ? Math.max(0, this.#timer / this.#windowMs) : 0;
    }

    extendWindow(ms) { this.#windowMs += ms; }

    reset() {
        this.#count = 0;
        this.#timer = 0;
        this.#prevMult = 1;
    }
}
```

- [ ] **Step 4: Expose ComboSystem via main.js**

```javascript
import { ComboSystem } from './core/ComboSystem.js';
window.__ComboSystem = ComboSystem;
```

- [ ] **Step 5: Run tests — confirm pass**

```bash
cd running-game && npx playwright test tests/combo-system.spec.js
```

Expected: 6 passed.

- [ ] **Step 6: Wire ComboSystem into GameEngine**

Add import: `import { ComboSystem } from './ComboSystem.js';`

In the constructor, after `this.waveManager = ...`:

```javascript
this.comboSystem = new ComboSystem({
    onChanged: (count, mult, tier, fraction) => this.#updateComboHUD(count, mult, tier, fraction),
    onBreak: () => this.#updateComboHUD(0, 1, 'grey', 0),
    onMilestone: (mult, tier) => { /* SoundManager wired in Task 11 */ }
});
this.maxCombo = 0; // track for leaderboard
```

In the `update()` method, add before the player update:

```javascript
this.comboSystem.update(16); // ~16ms per frame at 60fps
```

In `onEnemyKilled()`:

```javascript
onEnemyKilled() {
    this.totalKills++;
    this.waveManager.enemyKilled();
    this.comboSystem.hit();
    this.maxCombo = Math.max(this.maxCombo, this.comboSystem.getCount());
    this.updateHUD();
}
```

In `performAttack()`, replace the blast check:

```javascript
// Check for weapon blast
if (this.comboSystem.isBlastReady()) {
    this.performWeaponBlast();
    return;
}
```

In `performWeaponBlast()`, add at the top (blast resets nothing — it counts as a hit):

```javascript
performWeaponBlast() {
    // comboSystem.hit() is NOT called here — blast counts as keeping the combo alive
    // via the existing this.comboSystem.hit() in onEnemyKilled() for each enemy killed
    this.weaponEffects.push(new WeaponBlast(this.player.x, this.player.y));
    const blastRadius = 200;
    this.enemies.forEach(enemy => {
        if (enemy.isDead) return;
        const dx = enemy.x - this.player.x;
        const dy = enemy.y - this.player.y;
        if (Math.sqrt(dx*dx + dy*dy) <= blastRadius) {
            enemy.takeDamage(999);
            this.onEnemyKilled();
        }
    });
}
```

Remove the old `this.killStreak`, `this.weaponBlastReady` declarations from the constructor.

Add the combo HUD updater:

```javascript
#updateComboHUD(count, mult, tier, fraction) {
    const overlay = document.getElementById('combo-overlay');
    const tierColors = { grey: '#94a3b8', blue: '#60a5fa', orange: '#f97316', purple: '#a855f7' };
    const tierEmojis = { grey: '', blue: '💙', orange: '🔥', purple: '⚡' };

    if (count === 0) {
        overlay.classList.add('hidden');
        return;
    }
    overlay.classList.remove('hidden');
    overlay.style.borderColor = tierColors[tier];
    document.getElementById('combo-count').textContent = count;
    document.getElementById('combo-mult').textContent = `×${mult} ${tierEmojis[tier]}`;
    document.getElementById('combo-mult').style.color = tierColors[tier];
    document.getElementById('combo-bar').style.width = (fraction * 100) + '%';
    document.getElementById('combo-bar').style.background = tierColors[tier];
}
```

- [ ] **Step 7: Smoke test combo in browser**

```bash
cd running-game && npm run dev
```

Start a game. Kill enemies in quick succession — combo overlay should appear top-left and fill/drain. After 2 seconds without a kill it should hide. Console: no errors.

- [ ] **Step 8: Commit**

```bash
cd running-game
git add js/core/ComboSystem.js js/core/GameEngine.js js/main.js tests/combo-system.spec.js
git commit -m "feat: add ComboSystem — replaces kill-streak with 2s timing window and ×1–×4 multiplier tiers"
```

---

## Task 4: New Enemy Entities

**Files:**
- Create: `running-game/js/entities/Raccoon.js`
- Create: `running-game/js/entities/Fox.js`
- Create: `running-game/js/entities/GiantBug.js`
- Create: `running-game/js/entities/AngryBear.js`

All four follow the same `update(player) / render(ctx) / takeDamage(n) / isDead / shouldRemove / canAttackPlayer() / onPlayerContact()` interface as `WildBoar`.

- [ ] **Step 1: Read WildBoar.js to understand the interface**

```bash
cat running-game/js/entities/WildBoar.js
```

Note the exact property names (`isDead`, `shouldRemove`, `canAttackPlayer()`, `onPlayerContact()`). All four new entities must implement the same interface.

- [ ] **Step 2: Create Raccoon.js**

Create `running-game/js/entities/Raccoon.js`:

```javascript
// Raccoon — steals 2 coins on contact; deals no HP damage
export class Raccoon {
    constructor(x, y) {
        this.x = x; this.y = y;
        this.hp = 1; this.maxHp = 1;
        this.speed = 2.2; this.size = 28;
        this.isDead = false;
        this.shouldRemove = false;
        this.emoji = '🦝';
        this.stealCooldownMs = 0;
        this.deathTimer = 0;
        this.hitFlash = 0;
        this.attackCooldownMs = 2000;
        this._lastContactTime = 0;
    }

    canAttackPlayer() {
        return !this.isDead && Date.now() - this._lastContactTime > this.attackCooldownMs;
    }

    onPlayerContact() {
        this._lastContactTime = Date.now();
    }

    // Returns true if coins should be stolen this frame; caller deducts coins
    trySteaCoins() {
        if (this.stealCooldownMs > 0) return false;
        this.stealCooldownMs = 2000;
        return true;
    }

    takeDamage(amount) {
        if (this.isDead) return;
        this.hp -= amount;
        this.hitFlash = 6;
        if (this.hp <= 0) {
            this.isDead = true;
            this.deathTimer = 500;
        }
    }

    update(player) {
        if (this.isDead) {
            this.deathTimer -= 16;
            if (this.deathTimer <= 0) this.shouldRemove = true;
            return;
        }
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > this.size) {
            this.x += (dx / dist) * this.speed;
            this.y += (dy / dist) * this.speed;
        }
        if (this.stealCooldownMs > 0) this.stealCooldownMs -= 16;
        if (this.hitFlash > 0) this.hitFlash--;
    }

    render(ctx) {
        if (this.shouldRemove) return;
        const alpha = this.isDead ? Math.max(0, this.deathTimer / 500) : 1;
        ctx.save();
        ctx.globalAlpha = alpha;
        if (this.hitFlash > 0) ctx.filter = 'brightness(3)';
        ctx.font = `${this.size}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.emoji, this.x, this.y);
        ctx.restore();
    }
}
```

- [ ] **Step 3: Create Fox.js**

Create `running-game/js/entities/Fox.js`:

```javascript
// Fox — dashes toward player every 4s with 1s orange-flash telegraph
export class Fox {
    constructor(x, y) {
        this.x = x; this.y = y;
        this.hp = 2; this.maxHp = 2;
        this.speed = 2.8; this.size = 30;
        this.isDead = false;
        this.shouldRemove = false;
        this.emoji = '🦊';
        this.deathTimer = 0;
        this.hitFlash = 0;
        this.dashCooldown = 240; // frames until next dash attempt
        this.telegraphTimer = 0; // frames of orange-flash warning
        this.dashing = false;
        this.dashVx = 0; this.dashVy = 0;
        this.dashDuration = 0;
        this._lastContactTime = 0;
    }

    canAttackPlayer() {
        return !this.isDead && Date.now() - this._lastContactTime > 1500;
    }

    onPlayerContact() {
        this._lastContactTime = Date.now();
    }

    takeDamage(amount) {
        if (this.isDead) return;
        this.hp -= amount;
        this.hitFlash = 6;
        if (this.hp <= 0) {
            this.isDead = true;
            this.deathTimer = 500;
        }
    }

    update(player) {
        if (this.isDead) {
            this.deathTimer -= 16;
            if (this.deathTimer <= 0) this.shouldRemove = true;
            return;
        }

        if (this.dashing) {
            this.x += this.dashVx;
            this.y += this.dashVy;
            this.dashDuration--;
            if (this.dashDuration <= 0) this.dashing = false;
        } else if (this.telegraphTimer > 0) {
            // Flash and wait, then launch dash
            this.telegraphTimer--;
            if (this.telegraphTimer === 0) {
                const dx = player.x - this.x;
                const dy = player.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                this.dashVx = (dx / dist) * 14;
                this.dashVy = (dy / dist) * 14;
                this.dashing = true;
                this.dashDuration = 15;
                this.dashCooldown = 240;
            }
        } else {
            // Normal chase
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            if (dist > this.size) {
                this.x += (dx / dist) * this.speed;
                this.y += (dy / dist) * this.speed;
            }
            this.dashCooldown--;
            if (this.dashCooldown <= 0) {
                this.telegraphTimer = 60; // 1s warning at 60fps
            }
        }

        if (this.hitFlash > 0) this.hitFlash--;
    }

    render(ctx) {
        if (this.shouldRemove) return;
        const alpha = this.isDead ? Math.max(0, this.deathTimer / 500) : 1;
        ctx.save();
        ctx.globalAlpha = alpha;

        // Orange telegraph pulse
        if (this.telegraphTimer > 0) {
            ctx.globalAlpha = alpha * (0.4 + 0.6 * Math.abs(Math.sin(this.telegraphTimer * 0.3)));
            ctx.fillStyle = '#f97316';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size + 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = alpha;
        }

        if (this.hitFlash > 0) ctx.filter = 'brightness(3)';
        ctx.font = `${this.size}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.emoji, this.x, this.y);
        ctx.restore();
    }
}
```

- [ ] **Step 4: Create GiantBug.js**

Create `running-game/js/entities/GiantBug.js`:

```javascript
// GiantBug — slow (1.2), tanky (3 HP), deals 2 damage, spawns in pairs
export class GiantBug {
    constructor(x, y) {
        this.x = x; this.y = y;
        this.hp = 3; this.maxHp = 3;
        this.speed = 1.2; this.size = 40;
        this.isDead = false;
        this.shouldRemove = false;
        this.emoji = '🐛';
        this.deathTimer = 0;
        this.hitFlash = 0;
        this._lastContactTime = 0;
        this.damage = 2;
    }

    canAttackPlayer() {
        return !this.isDead && Date.now() - this._lastContactTime > 2000;
    }

    onPlayerContact() {
        this._lastContactTime = Date.now();
    }

    takeDamage(amount) {
        if (this.isDead) return;
        this.hp -= amount;
        this.hitFlash = 8;
        if (this.hp <= 0) {
            this.isDead = true;
            this.deathTimer = 500;
        }
    }

    update(player) {
        if (this.isDead) {
            this.deathTimer -= 16;
            if (this.deathTimer <= 0) this.shouldRemove = true;
            return;
        }
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        if (dist > this.size) {
            this.x += (dx / dist) * this.speed;
            this.y += (dy / dist) * this.speed;
        }
        if (this.hitFlash > 0) this.hitFlash--;
    }

    render(ctx) {
        if (this.shouldRemove) return;
        const alpha = this.isDead ? Math.max(0, this.deathTimer / 500) : 1;
        ctx.save();
        ctx.globalAlpha = alpha;
        if (this.hitFlash > 0) ctx.filter = 'brightness(3)';
        ctx.font = `${this.size}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.emoji, this.x, this.y);
        ctx.restore();

        // HP bar for tanky enemies
        if (!this.isDead) {
            const bw = 44, bh = 5;
            const bx = this.x - bw / 2, by = this.y - this.size - 12;
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(bx, by, bw, bh);
            ctx.fillStyle = '#16a34a';
            ctx.fillRect(bx, by, bw * (this.hp / this.maxHp), bh);
        }
    }
}
```

- [ ] **Step 5: Create AngryBear.js**

Create `running-game/js/entities/AngryBear.js`:

```javascript
// AngryBear — Boss: 20 HP, 3× size, phase-2 charge at ≤10 HP
export class AngryBear {
    constructor(x, y) {
        this.x = x; this.y = y;
        this.hp = 20; this.maxHp = 20;
        this.speed = 1.0; this.size = 72;
        this.isDead = false;
        this.shouldRemove = false;
        this.emoji = '🐻';
        this.deathTimer = 0;
        this.hitFlash = 0;
        this.phase = 1;
        this.chargeDir = null;
        this.chargeDuration = 0;
        this.chargeWindup = 0; // frames of red-edge telegraph
        this.attackCooldown = 180;
        this._lastContactTime = 0;
        this.damage = 3;
        this.onScreenEdgeFlash = null; // set by GameEngine after construction
    }

    canAttackPlayer() {
        return !this.isDead && Date.now() - this._lastContactTime > 1000;
    }

    onPlayerContact() {
        this._lastContactTime = Date.now();
    }

    takeDamage(amount) {
        if (this.isDead) return;
        this.hp -= amount;
        this.hitFlash = 8;
        if (this.hp <= 10 && this.phase === 1) {
            this.phase = 2;
            this.speed = 2.0;
        }
        if (this.hp <= 0) {
            this.isDead = true;
            this.deathTimer = 800;
            this.onScreenEdgeFlash && this.onScreenEdgeFlash(null); // clear flash
        }
    }

    update(player) {
        if (this.isDead) {
            this.deathTimer -= 16;
            if (this.deathTimer <= 0) this.shouldRemove = true;
            return;
        }

        if (this.chargeDuration > 0) {
            this.x += this.chargeDir.x * 10;
            this.y += this.chargeDir.y * 10;
            this.chargeDuration--;
        } else if (this.chargeWindup > 0) {
            this.chargeWindup--;
            if (this.chargeWindup === 0) {
                // Launch charge toward player's current position
                const dx = player.x - this.x;
                const dy = player.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                this.chargeDir = { x: dx / dist, y: dy / dist };
                this.chargeDuration = 20;
                this.attackCooldown = 180;
            }
        } else {
            // Normal chase
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            if (dist > this.size) {
                this.x += (dx / dist) * this.speed;
                this.y += (dy / dist) * this.speed;
            }

            if (this.phase === 2) {
                this.attackCooldown--;
                if (this.attackCooldown <= 0) {
                    this.chargeWindup = 50; // ~0.8s telegraph at 60fps
                    this.onScreenEdgeFlash && this.onScreenEdgeFlash('#dc2626');
                }
            }
        }

        if (this.hitFlash > 0) this.hitFlash--;
    }

    render(ctx) {
        if (this.shouldRemove) return;
        const alpha = this.isDead ? Math.max(0, this.deathTimer / 800) : 1;
        ctx.save();
        ctx.globalAlpha = alpha;
        if (this.hitFlash > 0) ctx.filter = 'brightness(3)';
        ctx.font = `${this.size}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.emoji, this.x, this.y);
        ctx.restore();
    }
}
```

- [ ] **Step 6: Commit new entities**

```bash
cd running-game
git add js/entities/Raccoon.js js/entities/Fox.js js/entities/GiantBug.js js/entities/AngryBear.js
git commit -m "feat: add Raccoon, Fox, GiantBug, AngryBear entity classes"
```

---

## Task 5: Wire New Enemies into WaveManager + GameEngine

**Files:**
- Modify: `running-game/js/core/GameEngine.js`

- [ ] **Step 1: Add imports to GameEngine.js**

```javascript
import { Raccoon } from '../entities/Raccoon.js';
import { Fox } from '../entities/Fox.js';
import { GiantBug } from '../entities/GiantBug.js';
import { AngryBear } from '../entities/AngryBear.js';
```

- [ ] **Step 2: Update `#spawnEnemiesOfType()` to handle all types**

```javascript
#spawnEnemiesOfType(type, count) {
    for (let i = 0; i < count; i++) {
        const { x, y } = this.#randomEdgePosition();
        let enemy;
        switch (type) {
            case 'boar':    enemy = new WildBoar(x, y, this.images); break;
            case 'wolf':    enemy = new DireWolf(x, y, this.images); break;
            case 'raccoon': enemy = new Raccoon(x, y); break;
            case 'fox':     enemy = new Fox(x, y); break;
            case 'bug': {
                // GiantBug spawns in pairs — spawn partner offset
                const bug = new GiantBug(x, y);
                this.enemies.push(bug);
                const bug2 = new GiantBug(x + 60, y + 60);
                this.enemies.push(bug2);
                // Already pushed both; skip the push below
                continue;
            }
            case 'bear': {
                const bear = new AngryBear(x, y);
                bear.onScreenEdgeFlash = (color) => this.#flashScreenEdge(color);
                this.bossBear = bear;
                this.enemies.push(bear);
                continue;
            }
            default: enemy = new WildBoar(x, y, this.images);
        }
        this.enemies.push(enemy);
    }
}
```

- [ ] **Step 3: Handle Raccoon's coin-steal in the collision loop**

In the `update()` method, inside the `this.enemies.forEach(enemy => { ... })` block, add after the existing collision check:

```javascript
// Raccoon coin steal
if (enemy instanceof Raccoon && !enemy.isDead) {
    const dx = enemy.x - this.player.x;
    const dy = enemy.y - this.player.y;
    if (Math.sqrt(dx*dx + dy*dy) < 40 && enemy.trySteaCoins()) {
        this.coins = Math.max(0, this.coins - 2);
        this.updateHUD();
        // coin-stolen particle (text pop) wired in Task 12
    }
}
```

- [ ] **Step 4: Handle GiantBug's 2-damage collision**

The existing collision check calls `this.takeDamage(1)`. Update it to use the enemy's `damage` property if present:

```javascript
if (!enemy.isDead && enemy.canAttackPlayer() && !this.playerInvulnerable) {
    const dx = enemy.x - this.player.x;
    const dy = enemy.y - this.player.y;
    if (Math.sqrt(dx*dx + dy*dy) < 35) {
        const dmg = enemy.damage ?? 1;
        this.takeDamage(dmg);
        enemy.onPlayerContact();
    }
}
```

- [ ] **Step 5: Update `#onBossWaveStart` to update the boss bar when bear takes damage**

Add to `#onBossWaveStart`:

```javascript
#onBossWaveStart(waveNum) {
    document.getElementById('boss-bar-wrapper').classList.remove('hidden');
    this.bossBear = null; // will be set in #spawnEnemiesOfType
}
```

Add a `#updateBossBar()` call in `update()` when `this.bossBear` exists:

```javascript
if (this.bossBear && !this.bossBear.isDead) {
    const pct = (this.bossBear.hp / this.bossBear.maxHp) * 100;
    document.getElementById('boss-bar-fill').style.width = pct + '%';
    document.getElementById('boss-hp-text').textContent =
        `${this.bossBear.hp} / ${this.bossBear.maxHp}`;
} else if (this.bossBear && this.bossBear.isDead) {
    document.getElementById('boss-bar-wrapper').classList.add('hidden');
    this.bossBear = null;
}
```

Add the screen-edge flash helper:

```javascript
#flashScreenEdge(color) {
    if (!color) {
        document.getElementById('canvas-wrapper').style.boxShadow = '';
        return;
    }
    document.getElementById('canvas-wrapper').style.boxShadow = `0 0 0 8px ${color}`;
    setTimeout(() => {
        if (document.getElementById('canvas-wrapper'))
            document.getElementById('canvas-wrapper').style.boxShadow = '';
    }, 600);
}
```

- [ ] **Step 6: Smoke test all enemy types**

```bash
cd running-game && npm run dev
```

Start a game and survive to wave 5 (raccoons appear), wave 10 (fox + boss). Verify:
- Raccoon steals coins on contact (coin display decreases)
- Fox flashes orange before dashing
- Boss bar appears on wave 10
- No console errors

- [ ] **Step 7: Commit**

```bash
cd running-game
git add js/core/GameEngine.js
git commit -m "feat: wire Raccoon, Fox, GiantBug, AngryBear into wave spawning and collision system"
```

---

## Task 6: Coin Economy + ShopManager

**Files:**
- Create: `running-game/js/core/ShopManager.js`
- Modify: `running-game/js/core/GameEngine.js`
- Create: `running-game/tests/shop-leaderboard.spec.js` (partial — rest in Task 7)

- [ ] **Step 1: Write failing shop tests**

Create `running-game/tests/shop-leaderboard.spec.js`:

```javascript
import { test, expect } from '@playwright/test';

test('purchasing an upgrade deducts coins', async ({ page }) => {
    await page.goto('http://localhost:8080');
    const result = await page.evaluate(() => {
        let appliedUpgrade = null;
        const sm = new window.__ShopManager({
            onPurchase: (u) => { appliedUpgrade = u.id; }
        });
        sm.addCoins(20);
        sm.purchase('sharpened_claws'); // costs 10
        return { coins: sm.getCoins(), upgrade: appliedUpgrade };
    });
    expect(result.coins).toBe(10);
    expect(result.upgrade).toBe('sharpened_claws');
});

test('cannot purchase when insufficient coins', async ({ page }) => {
    await page.goto('http://localhost:8080');
    const bought = await page.evaluate(() => {
        const sm = new window.__ShopManager({ onPurchase: () => {} });
        sm.addCoins(5);
        return sm.purchase('fluffy_armour'); // costs 15
    });
    expect(bought).toBe(false);
});

test('cannot purchase same upgrade more than 3 times', async ({ page }) => {
    await page.goto('http://localhost:8080');
    const result = await page.evaluate(() => {
        const sm = new window.__ShopManager({ onPurchase: () => {} });
        sm.addCoins(200);
        sm.purchase('long_paws');
        sm.purchase('long_paws');
        sm.purchase('long_paws');
        const fourth = sm.purchase('long_paws');
        return fourth;
    });
    expect(result).toBe(false);
});

test('getCoinsSpent returns total spent', async ({ page }) => {
    await page.goto('http://localhost:8080');
    const spent = await page.evaluate(() => {
        const sm = new window.__ShopManager({ onPurchase: () => {} });
        sm.addCoins(100);
        sm.purchase('sharpened_claws'); // 10
        sm.purchase('long_paws');       // 8
        return sm.getCoinsSpent();
    });
    expect(spent).toBe(18);
});
```

- [ ] **Step 2: Run tests — confirm fail**

```bash
cd running-game && npx playwright test tests/shop-leaderboard.spec.js --grep "coin|purchase|upgrade"
```

Expected: all 4 fail.

- [ ] **Step 3: Create ShopManager.js**

Create `running-game/js/core/ShopManager.js`:

```javascript
const CATALOGUE = [
    { id: 'sharpened_claws', name: 'Sharpened Claws', icon: '🐾', cost: 10, effect: 'attackCooldown', value: 0.85 },
    { id: 'long_paws',       name: 'Long Paws',        icon: '🦾', cost: 8,  effect: 'attackRange',   value: 1.20 },
    { id: 'cat_nap',         name: 'Cat Nap',          icon: '😴', cost: 12, effect: 'restoreHp',     value: 2    },
    { id: 'fluffy_armour',   name: 'Fluffy Armour',    icon: '🛡️', cost: 15, effect: 'maxHp',        value: 2    },
    { id: 'quick_paws',      name: 'Quick Paws',        icon: '💨', cost: 10, effect: 'speed',         value: 1.15 },
    { id: 'yarn_magnet',     name: 'Yarn Magnet',       icon: '🧶', cost: 8,  effect: 'coinRadius',    value: 2    },
    { id: 'catnip_frenzy',   name: 'Catnip Frenzy',    icon: '🌿', cost: 20, effect: 'comboWindow',   value: 500  },
    { id: 'iron_whiskers',   name: 'Iron Whiskers',    icon: '⚡', cost: 18, effect: 'invulnerability', value: 500 },
];
const MAX_PURCHASES = 3;

export class ShopManager {
    #coins = 0;
    #coinsSpent = 0;
    #purchases = {};
    #onPurchase;

    constructor({ onPurchase }) {
        this.#onPurchase = onPurchase;
        this.#purchases = Object.fromEntries(CATALOGUE.map(u => [u.id, 0]));
    }

    addCoins(amount) { this.#coins += amount; }
    getCoins() { return this.#coins; }
    getCoinsSpent() { return this.#coinsSpent; }

    purchase(upgradeId) {
        const upgrade = CATALOGUE.find(u => u.id === upgradeId);
        if (!upgrade) return false;
        if (this.#coins < upgrade.cost) return false;
        if (this.#purchases[upgradeId] >= MAX_PURCHASES) return false;
        this.#coins -= upgrade.cost;
        this.#coinsSpent += upgrade.cost;
        this.#purchases[upgradeId]++;
        this.#onPurchase(upgrade);
        return true;
    }

    getOffers() {
        const available = CATALOGUE.filter(u => this.#purchases[u.id] < MAX_PURCHASES);
        if (available.length <= 4) return available;
        return [...available].sort(() => Math.random() - 0.5).slice(0, 4);
    }

    renderShop() {
        const offers = this.getOffers();
        const container = document.getElementById('shop-cards');
        const coins = this.#coins;
        const purchases = this.#purchases;
        container.innerHTML = offers.map(u => `
            <div class="shop-card ${coins < u.cost ? 'unaffordable' : ''}"
                 onclick="window.__shopPurchase('${u.id}')">
                <div class="shop-icon">${u.icon}</div>
                <div class="shop-name">${u.name}</div>
                <div class="shop-cost">🪙 ${u.cost}</div>
                <div class="shop-count">${purchases[u.id]}/${MAX_PURCHASES}</div>
            </div>
        `).join('');
        document.getElementById('shop-coin-count').textContent = coins;
    }

    reset() {
        this.#coins = 0;
        this.#coinsSpent = 0;
        this.#purchases = Object.fromEntries(CATALOGUE.map(u => [u.id, 0]));
    }
}
```

- [ ] **Step 4: Expose ShopManager and run tests**

In `main.js`:

```javascript
import { ShopManager } from './core/ShopManager.js';
window.__ShopManager = ShopManager;
```

```bash
cd running-game && npx playwright test tests/shop-leaderboard.spec.js --grep "coin|purchase|upgrade"
```

Expected: 4 passed.

- [ ] **Step 5: Wire ShopManager into GameEngine**

Add import: `import { ShopManager } from './ShopManager.js';`

In constructor:

```javascript
this.shopManager = new ShopManager({
    onPurchase: (upgrade) => this.#applyUpgrade(upgrade)
});
// Expose purchase handler for shop HTML onclick
window.__shopPurchase = (id) => {
    const bought = this.shopManager.purchase(id);
    if (bought) this.shopManager.renderShop(); // refresh to show updated coins/counts
};
```

Add `#applyUpgrade()`:

```javascript
#applyUpgrade(upgrade) {
    switch (upgrade.effect) {
        case 'attackCooldown':
            this.attackCooldownBase = Math.floor((this.attackCooldownBase ?? 500) * upgrade.value);
            break;
        case 'attackRange':
            this.attackRange *= upgrade.value;
            break;
        case 'restoreHp':
            this.currentHP = Math.min(this.maxHP, this.currentHP + upgrade.value);
            break;
        case 'maxHp':
            this.maxHP += upgrade.value;
            this.currentHP += upgrade.value;
            break;
        case 'speed':
            if (this.player) this.player.speed = (this.player.speed ?? 3) * upgrade.value;
            break;
        case 'comboWindow':
            this.comboSystem.extendWindow(upgrade.value);
            break;
        case 'invulnerability':
            this.invulnerabilityDuration = (this.invulnerabilityDuration ?? 2500) + upgrade.value;
            break;
    }
    this.updateHUD();
}
```

Drop coins on enemy kill — in `onEnemyKilled()`:

```javascript
onEnemyKilled() {
    this.totalKills++;
    this.waveManager.enemyKilled();
    this.comboSystem.hit();
    this.maxCombo = Math.max(this.maxCombo, this.comboSystem.getCount());
    const coinDrop = this.comboSystem.getMultiplier(); // ×1 to ×4
    this.shopManager.addCoins(coinDrop);
    this.coins = this.shopManager.getCoins();
    this.updateHUD();
}
```

Open shop in `#onWaveCleared()` when appropriate:

```javascript
#onWaveCleared(waveNum) {
    this.waveInProgress = false;
    this.#showWaveBanner(`Wave ${waveNum} — Survived! 🎉`);
    setTimeout(() => {
        if (this.waveManager.shouldOpenShop(waveNum)) {
            this.#openShop();
        } else {
            this.#startNextWave();
        }
    }, 2000);
}

#openShop() {
    this.gameState = 'shop';
    this.shopManager.renderShop();
    document.getElementById('shop-overlay').classList.remove('hidden');
    document.getElementById('shop-close-btn').onclick = () => {
        document.getElementById('shop-overlay').classList.add('hidden');
        this.gameState = 'playing';
        this.#startNextWave();
    };
}
```

In `startNewGame()`, reset shop:

```javascript
this.shopManager.reset();
this.coins = 0;
```

- [ ] **Step 6: Smoke test shop in browser**

Start game, survive 5 waves — shop overlay should appear. Purchase an upgrade — coins deduct, card updates. Click "Back to Battle" — wave 6 starts.

- [ ] **Step 7: Commit**

```bash
cd running-game
git add js/core/ShopManager.js js/core/GameEngine.js js/main.js tests/shop-leaderboard.spec.js
git commit -m "feat: add ShopManager — coin economy and between-wave upgrade shop"
```

---

## Task 7: LeaderboardManager

**Files:**
- Create: `running-game/js/core/LeaderboardManager.js`
- Modify: `running-game/js/core/GameEngine.js`

Replaces the old 3-second-delay game-over with: name entry → save → top-10 leaderboard display.

- [ ] **Step 1: Add leaderboard tests to shop-leaderboard.spec.js**

Append to `running-game/tests/shop-leaderboard.spec.js`:

```javascript
test('saveScore stores entry and getTopTen returns it', async ({ page }) => {
    await page.goto('http://localhost:8080');
    const result = await page.evaluate(() => {
        const lm = new window.__LeaderboardManager();
        localStorage.removeItem('catHero_leaderboard');
        lm.saveScore({ name: 'TestKid', score: 1500, wavesSurvived: 7, maxCombo: 12 });
        const top = lm.getTopTen();
        return { name: top[0].name, score: top[0].score, wave: top[0].wavesSurvived };
    });
    expect(result.name).toBe('TestKid');
    expect(result.score).toBe(1500);
    expect(result.wave).toBe(7);
});

test('calculateScore uses correct formula', async ({ page }) => {
    await page.goto('http://localhost:8080');
    const score = await page.evaluate(() => {
        const lm = new window.__LeaderboardManager();
        // waves*100 + kills*10 + coinsSpent*5 + maxCombo*20
        return lm.calculateScore({ wavesSurvived: 5, totalKills: 30, coinsSpent: 20, maxCombo: 15 });
    });
    // 500 + 300 + 100 + 300 = 1200
    expect(score).toBe(1200);
});

test('top 10 capped at 10 entries', async ({ page }) => {
    await page.goto('http://localhost:8080');
    const count = await page.evaluate(() => {
        const lm = new window.__LeaderboardManager();
        localStorage.removeItem('catHero_leaderboard');
        for (let i = 0; i < 15; i++) {
            lm.saveScore({ name: `P${i}`, score: i * 100, wavesSurvived: i, maxCombo: i });
        }
        return lm.getTopTen().length;
    });
    expect(count).toBe(10);
});
```

- [ ] **Step 2: Run new tests — confirm fail**

```bash
cd running-game && npx playwright test tests/shop-leaderboard.spec.js --grep "leaderboard|score|top"
```

Expected: all 3 fail.

- [ ] **Step 3: Create LeaderboardManager.js**

Create `running-game/js/core/LeaderboardManager.js`:

```javascript
const STORAGE_KEY = 'catHero_leaderboard';
const MAX_ENTRIES = 10;

export class LeaderboardManager {
    calculateScore({ wavesSurvived, totalKills, coinsSpent, maxCombo }) {
        return (wavesSurvived * 100) + (totalKills * 10) + (coinsSpent * 5) + (maxCombo * 20);
    }

    saveScore({ name, score, wavesSurvived, maxCombo }) {
        const board = this.getTopTen();
        board.push({
            name: (name || 'Anonymous').trim().slice(0, 12),
            score,
            wavesSurvived,
            maxCombo,
            date: new Date().toLocaleDateString()
        });
        board.sort((a, b) => b.score - a.score);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(board.slice(0, MAX_ENTRIES)));
        localStorage.setItem('catHero_lastName', name || '');
    }

    getTopTen() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
        catch { return []; }
    }

    getPersonalBest() {
        const board = this.getTopTen();
        return board.length ? board[0] : null;
    }

    getLastName() {
        return localStorage.getItem('catHero_lastName') || '';
    }

    renderLeaderboard(currentScore) {
        const board = this.getTopTen();
        const container = document.getElementById('leaderboard-table');
        const medals = ['🥇', '🥈', '🥉'];

        container.innerHTML = board.length === 0
            ? '<p class="text-center text-gray-500">No scores yet — be the first!</p>'
            : board.map((entry, i) => `
                <div class="flex justify-between items-center bg-gray-800 rounded-xl px-4 py-2
                    ${entry.score === currentScore ? 'border-2 border-yellow-400' : ''}">
                    <span class="text-lg">${medals[i] || `${i + 1}.`}</span>
                    <span class="flex-1 ml-3 font-bold text-white">${entry.name}</span>
                    <span class="text-yellow-400 font-bold">${entry.score.toLocaleString()}</span>
                    <span class="text-gray-400 text-sm ml-3">Wave ${entry.wavesSurvived}</span>
                </div>
            `).join('');

        const pbLine = document.getElementById('personal-best-line');
        if (!board.find(e => e.score === currentScore) && currentScore > 0) {
            pbLine.textContent = `Your score this run: ${currentScore.toLocaleString()}`;
        } else {
            pbLine.textContent = '';
        }
    }
}
```

- [ ] **Step 4: Expose and run tests**

In `main.js`:

```javascript
import { LeaderboardManager } from './core/LeaderboardManager.js';
window.__LeaderboardManager = LeaderboardManager;
```

```bash
cd running-game && npx playwright test tests/shop-leaderboard.spec.js
```

Expected: all 7 tests passed.

- [ ] **Step 5: Wire LeaderboardManager into GameEngine**

Add import: `import { LeaderboardManager } from './LeaderboardManager.js';`

In constructor: `this.leaderboard = new LeaderboardManager();`

Wire `setupUI()` for leaderboard buttons:

```javascript
// In setupUI():
document.getElementById('leaderboard-btn').addEventListener('click', () => {
    this.leaderboard.renderLeaderboard(0);
    document.getElementById('leaderboard-modal').classList.remove('hidden');
});
document.getElementById('lb-menu-btn').addEventListener('click', () => {
    document.getElementById('leaderboard-modal').classList.add('hidden');
});
document.getElementById('lb-play-again-btn').addEventListener('click', () => {
    document.getElementById('leaderboard-modal').classList.add('hidden');
    this.startNewGame();
});
document.getElementById('save-score-btn').addEventListener('click', () => {
    const name = document.getElementById('player-name-input').value || 'Anonymous';
    this.leaderboard.saveScore({
        name,
        score: this._finalScore,
        wavesSurvived: this.waveManager.getCurrentWave(),
        maxCombo: this.maxCombo
    });
    document.getElementById('name-entry-modal').classList.add('hidden');
    this.leaderboard.renderLeaderboard(this._finalScore);
    document.getElementById('leaderboard-modal').classList.remove('hidden');
});
document.getElementById('skip-save-btn').addEventListener('click', () => {
    document.getElementById('name-entry-modal').classList.add('hidden');
    this.leaderboard.renderLeaderboard(0);
    document.getElementById('leaderboard-modal').classList.remove('hidden');
});
```

Replace `gameOver()`:

```javascript
gameOver() {
    this.gameState = 'gameOver';
    this.comboSystem.reset();

    const score = this.leaderboard.calculateScore({
        wavesSurvived: this.waveManager.getCurrentWave(),
        totalKills: this.totalKills,
        coinsSpent: this.shopManager.getCoinsSpent(),
        maxCombo: this.maxCombo
    });
    this._finalScore = score;

    document.getElementById('death-wave').textContent = this.waveManager.getCurrentWave();
    document.getElementById('death-score').textContent = score.toLocaleString();
    document.getElementById('player-name-input').value = this.leaderboard.getLastName();
    document.getElementById('name-entry-modal').classList.remove('hidden');
}
```

- [ ] **Step 6: Smoke test game-over flow**

Start game, die — name entry modal should appear with score. Enter a name, save — leaderboard shows with your entry highlighted. Click "Play Again" — new run starts.

- [ ] **Step 7: Commit**

```bash
cd running-game
git add js/core/LeaderboardManager.js js/core/GameEngine.js js/main.js tests/shop-leaderboard.spec.js
git commit -m "feat: add LeaderboardManager — score formula, localStorage top-10, name-entry flow"
```

---

## Task 8: SoundManager

**Files:**
- Create: `running-game/js/utils/SoundManager.js`
- Modify: `running-game/js/core/GameEngine.js`

All sounds are procedurally generated via Web Audio API — no audio files needed.

- [ ] **Step 1: Create SoundManager.js**

Create `running-game/js/utils/SoundManager.js`:

```javascript
export class SoundManager {
    #ctx = null;
    #enabled = true;

    #getCtx() {
        if (!this.#ctx) {
            this.#ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        // Resume if suspended (browser autoplay policy)
        if (this.#ctx.state === 'suspended') this.#ctx.resume();
        return this.#ctx;
    }

    #tone({ freq = 440, type = 'sine', duration = 0.1, vol = 0.25, attack = 0.01, delay = 0 }) {
        if (!this.#enabled) return;
        try {
            const ctx = this.#getCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
            gain.gain.setValueAtTime(0, ctx.currentTime + delay);
            gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + delay + attack);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
            osc.start(ctx.currentTime + delay);
            osc.stop(ctx.currentTime + delay + duration + 0.05);
        } catch (_) { /* AudioContext may not be available in test env */ }
    }

    playHit(tier = 'grey') {
        const freqs = { grey: 200, blue: 280, orange: 380, purple: 520 };
        this.#tone({ freq: freqs[tier] || 200, type: 'square', duration: 0.08, vol: 0.22 });
    }

    playComboMilestone() {
        [440, 550, 660].forEach((freq, i) =>
            this.#tone({ freq, duration: 0.12, vol: 0.28, delay: i * 0.08 })
        );
    }

    playComboBreak() {
        this.#tone({ freq: 150, type: 'sawtooth', duration: 0.2, vol: 0.18 });
    }

    playCoinCollect() {
        this.#tone({ freq: 880, duration: 0.06, vol: 0.18 });
    }

    playPlayerHit() {
        this.#tone({ freq: 100, type: 'sawtooth', duration: 0.3, vol: 0.35 });
    }

    playBossSpawn() {
        [80, 60, 40].forEach((freq, i) =>
            this.#tone({ freq, type: 'sawtooth', duration: 0.4, vol: 0.45, delay: i * 0.15 })
        );
    }

    playBossDeath() {
        [300, 450, 600, 800].forEach((freq, i) =>
            this.#tone({ freq, duration: 0.2, vol: 0.35, delay: i * 0.1 })
        );
    }

    playShopOpen() {
        this.#tone({ freq: 600, duration: 0.15, vol: 0.18 });
    }

    playWaveClear() {
        [330, 440, 550].forEach((freq, i) =>
            this.#tone({ freq, duration: 0.15, vol: 0.28, delay: i * 0.1 })
        );
    }

    setEnabled(val) { this.#enabled = val; }
}
```

- [ ] **Step 2: Wire SoundManager into GameEngine**

Add import: `import { SoundManager } from '../utils/SoundManager.js';`

In constructor: `this.sound = new SoundManager();`

Add sounds at the correct hook points:

```javascript
// In takeDamage():
this.sound.playPlayerHit();

// In onEnemyKilled() — after comboSystem.hit():
this.sound.playHit(this.comboSystem.getTier());

// In #onWaveCleared():
this.sound.playWaveClear();

// In #openShop():
this.sound.playShopOpen();

// In #onBossWaveStart():
this.sound.playBossSpawn();

// In the boss-death detection block (where bossBear.isDead is detected):
this.sound.playBossDeath();

// In ComboSystem onMilestone callback (GameEngine constructor):
onMilestone: (mult, tier) => { this.sound.playComboMilestone(); }

// In ComboSystem onBreak callback:
onBreak: () => {
    this.#updateComboHUD(0, 1, 'grey', 0);
    this.sound.playComboBreak();
}

// Coin collect (when Raccoon steal):  
// (in the raccoon steal block in update())
// No sound — coin loss, so skip playCoinsCollect
// On enemy coin drop in onEnemyKilled():
this.sound.playCoinCollect();
```

- [ ] **Step 3: Smoke test sound**

```bash
cd running-game && npm run dev
```

Kill enemies — hear hit sounds with pitch rising at higher combos. Die — hear player-hit sound. Survive 5 waves — hear wave-clear jingle then shop-open whoosh.

- [ ] **Step 4: Commit**

```bash
cd running-game
git add js/utils/SoundManager.js js/core/GameEngine.js
git commit -m "feat: add SoundManager — Web Audio API procedural sound effects"
```

---

## Task 9: Visual Feedback — Screen Shake + Coin Pop Text

**Files:**
- Modify: `running-game/js/core/GameEngine.js`

- [ ] **Step 1: Add screen shake**

In `GameEngine`, add property in constructor: `this.screenShake = 0;`

Add shake helper:

```javascript
#shake(intensity) {
    this.screenShake = Math.max(this.screenShake, intensity);
}
```

In `update()`, decrement: `if (this.screenShake > 0) this.screenShake = Math.max(0, this.screenShake - 0.5);`

In `render()`, apply shake before drawing:

```javascript
render() {
    const shakeX = this.screenShake > 0 ? (Math.random() - 0.5) * this.screenShake : 0;
    const shakeY = this.screenShake > 0 ? (Math.random() - 0.5) * this.screenShake : 0;

    this.ctx.fillStyle = '#7CB342';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();
    this.ctx.translate(-this.camera.x + shakeX, -this.camera.y + shakeY);
    // ... rest of render unchanged
```

Trigger shakes:

```javascript
// In takeDamage(): 
this.#shake(8);

// In AngryBear hit (in performAttack after closestEnemy.takeDamage):
if (closestEnemy instanceof AngryBear) this.#shake(3);

// In boss death detection:
this.#shake(18);
```

- [ ] **Step 2: Add floating coin pop text**

Add a `this.floatingTexts = [];` array in the constructor.

Add helper:

```javascript
#spawnCoinPopText(x, y, amount) {
    const tierColors = { 1: '#94a3b8', 2: '#60a5fa', 3: '#f97316', 4: '#a855f7' };
    this.floatingTexts.push({
        x, y,
        text: `+${amount}🪙`,
        color: tierColors[amount] || '#ffffff',
        life: 1.0, // 0–1
        vy: -1.5
    });
}
```

In `onEnemyKilled()`, after `this.shopManager.addCoins(coinDrop)`:

```javascript
if (this.enemies[this.enemies.length - 1]) {
    const deadEnemy = this.enemies.find(e => e.isDead && !e.shouldRemove);
    if (deadEnemy) this.#spawnCoinPopText(deadEnemy.x, deadEnemy.y - 20, coinDrop);
}
```

In `update()`, tick floating texts:

```javascript
this.floatingTexts.forEach(t => { t.y += t.vy; t.life -= 0.02; });
this.floatingTexts = this.floatingTexts.filter(t => t.life > 0);
```

In `render()`, draw floating texts after particles (still inside camera transform):

```javascript
this.floatingTexts.forEach(t => {
    this.ctx.save();
    this.ctx.globalAlpha = t.life;
    this.ctx.fillStyle = t.color;
    this.ctx.font = 'bold 18px Nunito, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(t.text, t.x, t.y);
    this.ctx.restore();
});
```

- [ ] **Step 3: Add score overlay update**

In `updateHUD()`, update the score panel:

```javascript
// Score
const score = this.leaderboard.calculateScore({
    wavesSurvived: this.waveManager.getCurrentWave(),
    totalKills: this.totalKills,
    coinsSpent: this.shopManager.getCoinsSpent(),
    maxCombo: this.maxCombo
});
const scoreEl = document.getElementById('score-value');
if (scoreEl) scoreEl.textContent = score.toLocaleString();
const pb = this.leaderboard.getPersonalBest();
const bestEl = document.getElementById('score-best');
if (bestEl && pb) bestEl.textContent = `BEST ${pb.score.toLocaleString()}`;
```

- [ ] **Step 4: Smoke test visuals**

Kill enemies — floating "+1🪙", "+2🪙" etc. texts rise and fade. Take damage — screen shakes. Boss death — heavy shake.

- [ ] **Step 5: Commit**

```bash
cd running-game
git add js/core/GameEngine.js
git commit -m "feat: add screen shake, floating coin pop text, live score overlay"
```

---

## Task 10: Mobile Touch Controls

**Files:**
- Modify: `running-game/js/core/GameEngine.js`
- Modify: `running-game/index.html`

Replace D-pad event listeners with canvas-native hold-drag movement + auto-attack on mobile.

- [ ] **Step 1: Detect mobile and track touch state**

In GameEngine constructor, add:

```javascript
this.isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
this.touchDir = { x: 0, y: 0 };
this.isTouching = false;
this.touchOriginX = 0;
this.touchOriginY = 0;
```

- [ ] **Step 2: Add canvas touch event listeners in `setupEventListeners()`**

Remove the old `setupMobileButton(...)` calls entirely. Add:

```javascript
// Canvas touch — hold/drag for movement, two-finger for blast
const canvas = this.canvas;

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (this.gameState !== 'playing') return;
    if (e.touches.length >= 2 && this.comboSystem.isBlastReady()) {
        this.performWeaponBlast();
        return;
    }
    const t = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    this.touchOriginX = (t.clientX - rect.left) * scaleX;
    this.touchOriginY = (t.clientY - rect.top) * scaleY;
    this.isTouching = true;
    this.touchDir = { x: 0, y: 0 };
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!this.isTouching || this.gameState !== 'playing') return;
    const t = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const cx = (t.clientX - rect.left) * scaleX;
    const cy = (t.clientY - rect.top) * scaleY;
    const dx = cx - this.touchOriginX;
    const dy = cy - this.touchOriginY;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len > 12) { // 12px dead zone
        this.touchDir = { x: dx / len, y: dy / len };
    } else {
        this.touchDir = { x: 0, y: 0 };
    }
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    if (e.touches.length === 0) {
        this.isTouching = false;
        this.touchDir = { x: 0, y: 0 };
    }
}, { passive: false });
```

- [ ] **Step 3: Feed touch direction into player movement**

`CatHero.update()` currently takes `(keys, worldWidth, worldHeight)`. Read `CatHero.js` to find where movement direction is derived from `keys`. Add touch direction as a second input source.

In `GameEngine.update()`, before `this.player.update(...)`:

```javascript
// Merge touch direction into keys for mobile movement
if (this.isMobile && this.isTouching) {
    this.keys['ArrowLeft']  = this.touchDir.x < -0.3;
    this.keys['ArrowRight'] = this.touchDir.x > 0.3;
    this.keys['ArrowUp']    = this.touchDir.y < -0.3;
    this.keys['ArrowDown']  = this.touchDir.y > 0.3;
}
```

This feeds CatHero's existing key-reading movement without modifying CatHero itself.

- [ ] **Step 4: Add auto-attack on mobile**

In `update()`, after `this.player.update(...)`:

```javascript
// Mobile auto-attack: fires when in range, no button needed
if (this.isMobile && this.isTouching && this.attackCooldown <= 0 && !this.isAttacking) {
    this.performAttack();
}
```

- [ ] **Step 5: Make canvas responsive**

In `setupEventListeners()` or a new `setupCanvas()` method called from constructor:

```javascript
#setupResponsiveCanvas() {
    const resize = () => {
        const aspectRatio = 4 / 3;
        const maxW = window.innerWidth;
        const maxH = window.innerHeight;
        let w = maxW;
        let h = w / aspectRatio;
        if (h > maxH * 0.85) { // leave room for HUD bar
            h = maxH * 0.85;
            w = h * aspectRatio;
        }
        this.canvas.style.width = Math.floor(w) + 'px';
        this.canvas.style.height = Math.floor(h) + 'px';
    };
    window.addEventListener('resize', resize);
    resize();
}
```

Call `this.#setupResponsiveCanvas();` at the end of the constructor.

- [ ] **Step 6: Update index.html `<meta viewport>`**

Ensure the viewport meta tag reads:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
```

- [ ] **Step 7: Remove old mobile-controls DOM elements from index.html**

The D-pad `<div id="mobile-controls">` was removed in Task 1. Confirm it is absent. If not, delete it now.

- [ ] **Step 8: Test on mobile (or DevTools responsive mode)**

```bash
cd running-game && npm run dev
```

Open Chrome DevTools → toggle device toolbar → iPhone 12 Pro. Verify:
- Touch and drag moves the cat in the drag direction
- Release stops the cat
- Cat auto-attacks nearby enemies while dragging
- Two-finger tap fires blast when combo ×3+

- [ ] **Step 9: Commit**

```bash
cd running-game
git add js/core/GameEngine.js index.html
git commit -m "feat: canvas-native touch controls — hold/drag to move, auto-attack, two-finger blast"
```

---

## Task 11: Update Existing Playwright Tests

**Files:**
- Modify: `running-game/tests/game-functionality.spec.js`
- Modify: `running-game/tests/game.spec.js`
- Modify: `running-game/tests/hero-adventure.spec.js`
- Modify: `running-game/tests/sprite-and-spawning.spec.js`

The existing tests reference removed elements (`level-complete-modal`, `victory-modal`, `progress-text`, `next-level-btn`, mobile D-pad buttons). Update them to match the new HTML.

- [ ] **Step 1: Run all existing tests and list failures**

```bash
cd running-game && npm test 2>&1 | grep -E "FAIL|Error|✘" | head -40
```

Note every failing test and why.

- [ ] **Step 2: Fix references to removed elements**

For each failing test, replace:
- `#level-complete-modal` → `#leaderboard-modal`
- `#victory-modal` → `#leaderboard-modal`
- `#progress-text` → `#wave-label`
- `#next-level-btn` → `#lb-play-again-btn`
- `#play-again-btn` → `#lb-play-again-btn`
- `#mobile-up/down/left/right` → skip (removed; mobile tested via touch events)
- `yarn-display`, `butterfly-display`, `fish-display` → `coin-display`
- Level-based kill assertions → wave-based wave-label assertions

- [ ] **Step 3: Update game start assertions**

Tests that assert "game starts with level 1" should now assert "game starts wave 1":

```javascript
// Old:
await expect(page.locator('#progress-text')).toContainText('Boar Invasion');
// New:
await expect(page.locator('#wave-label')).toContainText('WAVE 1');
```

- [ ] **Step 4: Run all tests — confirm all pass**

```bash
cd running-game && npm test
```

Expected: all tests green. Fix any remaining failures before proceeding.

- [ ] **Step 5: Commit**

```bash
cd running-game
git add tests/
git commit -m "test: update Playwright tests for endless-wave overhaul (remove level refs, add wave refs)"
```

---

## Task 12: Final GameEngine Cleanup

**Files:**
- Modify: `running-game/js/core/GameEngine.js`

Strip the remaining dead code (old level array, `createCollectibles()`, `countKilledEnemies()`, `showVictory()`, `completeLevel()`, `nextLevel()`, old `updateUI()`, old mobile setup) so GameEngine is ≤300 lines.

- [ ] **Step 1: Delete dead methods**

Remove these methods if they still exist:
- `countKilledEnemies()`
- `showVictory()` (replaced by leaderboard)
- `completeLevel()` / `nextLevel()` (replaced by WaveManager)
- `createCollectibles()` (collectibles removed in favour of coin drops)
- `createHeartsDisplay()` (no longer needed)
- Old `setupMobileButton()` call block

- [ ] **Step 2: Remove dead constructor properties**

Remove from constructor:
- `this.levels = [...]` array
- `this.killStreak`
- `this.weaponBlastReady`
- `this.yarnBalls`, `this.butterflies`, `this.fishTreats`
- `this.shieldHP`
- `this.currentLevel`

- [ ] **Step 3: Count lines and confirm ≤300**

```bash
wc -l running-game/js/core/GameEngine.js
```

If still over 300, find the next largest block of logic that belongs in a helper and extract it.

- [ ] **Step 4: Run full test suite**

```bash
cd running-game && npm test
```

All tests must pass before committing.

- [ ] **Step 5: Commit**

```bash
cd running-game
git add js/core/GameEngine.js
git commit -m "refactor: strip GameEngine to <300 lines — dead level/collectible/killstreak code removed"
```

---

## Self-Review

**Spec coverage check:**

| Spec section | Task(s) covering it |
|---|---|
| Architecture — GameEngine split | Tasks 2, 3, 6, 7, 8, 12 |
| Endless waves + wave structure | Task 2 |
| Difficulty tuning (6 HP, 2.5s invuln, free revive ≤wave 5) | Task 2 (GameEngine init), note: free-revive not yet implemented — **add to Task 2 Step 6**: in `gameOver()`, check `waveManager.getCurrentWave() <= 5 && !this.usedFreeRevive` → restore 3 HP, set flag |
| Combo system | Task 3 |
| Shop system | Task 6 |
| Leaderboard | Task 7 |
| Raccoon, Fox, GiantBug, AngryBear | Task 4, 5 |
| Sound effects | Task 8 |
| Screen shake, coin pop, wave banner, boss HP bar | Task 9, boss bar in Task 5 |
| Mobile touch controls | Task 10 |
| Responsive canvas | Task 10 |
| Score overlay (top-right) | Task 9 |

**Gap found — free revive:** Add to Task 2 Step 6 in `gameOver()`:

```javascript
gameOver() {
    // Free revive safety net for younger players (waves 1–5, once per run)
    if (this.waveManager.getCurrentWave() <= 5 && !this.usedFreeRevive) {
        this.usedFreeRevive = true;
        this.currentHP = 3;
        this.playerInvulnerable = true;
        this.invulnerabilityTimer = 3000;
        this.showCelebrationMessage('Second chance! 🐱💪');
        return; // don't actually end the run
    }
    // ... rest of gameOver
}
```

And reset in `startNewGame()`: `this.usedFreeRevive = false;`

**Placeholder scan:** No TBDs found in plan.

**Type consistency:** `comboSystem.getTier()` returns `'grey'|'blue'|'orange'|'purple'` — used consistently in `#updateComboHUD()`, `SoundManager.playHit()`, and coin pop text colors. ✓

`waveManager.enemyKilled()` called in `onEnemyKilled()` ✓. `waveManager.shouldOpenShop(waveNum)` called in `#onWaveCleared()` ✓.

`shopManager.getCoinsSpent()` used in `leaderboard.calculateScore()` ✓.

---

**Plan complete and saved to `docs/superpowers/plans/2026-04-12-running-game-overhaul.md`.**

Two execution options:

**1. Subagent-Driven (recommended)** — Fresh subagent per task, review between tasks, fast parallel iteration

**2. Inline Execution** — Execute tasks in this session using executing-plans skill, with batch checkpoints

Which approach?
