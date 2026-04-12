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
