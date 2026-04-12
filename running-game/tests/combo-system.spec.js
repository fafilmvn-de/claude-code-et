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
