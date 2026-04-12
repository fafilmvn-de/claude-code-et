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
