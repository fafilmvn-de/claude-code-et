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
