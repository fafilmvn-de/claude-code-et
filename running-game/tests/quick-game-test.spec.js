const { test, expect } = require('@playwright/test');

test('test 3D runner gameplay', async ({ page }) => {
  await page.goto('http://localhost:8000');
  await page.waitForLoadState('networkidle');
  
  // Click New Game with force to bypass stability check
  await page.click('#new-game-btn', { force: true });
  await page.waitForTimeout(2000);
  
  // Take screenshot of the game
  await page.screenshot({ path: 'test-results/3d-runner-game.png', fullPage: true });
  
  // Test controls
  await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'test-results/moved-left.png' });
  
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'test-results/moved-right.png' });
  
  await page.keyboard.press('Space');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'test-results/jumped.png' });
  
  // Let it run for a few seconds to see objects
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'test-results/gameplay.png' });
});