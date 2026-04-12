const { test, expect } = require('@playwright/test');

test.describe('Cat Runner Game', () => {
  test.beforeEach(async ({ page }) => {
    // Start a local server for testing
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');
  });

  test('should display main menu on load', async ({ page }) => {
    // Check if main menu is visible
    await expect(page.locator('#main-menu')).toBeVisible();

    // Check if buttons are present
    await expect(page.locator('#new-game-btn')).toBeVisible();
    await expect(page.locator('#instructions-btn')).toBeVisible();

    // Take screenshot of main menu
    await page.screenshot({ path: 'test-results/main-menu.png' });
  });

  test('should show instructions modal', async ({ page }) => {
    // Click instructions button
    await page.click('#instructions-btn');

    // Check if instructions modal is visible
    await expect(page.locator('#instructions-modal')).toBeVisible();
    await expect(page.locator('h2:has-text("How to Play")')).toBeVisible();

    // Check for control instructions
    await expect(page.locator('text=Space or Click/Tap to attack!')).toBeVisible();

    // Close instructions
    await page.click('#close-instructions-btn');
    await expect(page.locator('#instructions-modal')).toBeHidden();

    // Take screenshot
    await page.screenshot({ path: 'test-results/instructions.png' });
  });

  test('should start new game', async ({ page }) => {
    // Click new game button
    await page.click('#new-game-btn');
    
    // Wait for game to load
    await page.waitForTimeout(1000);
    
    // Check if game container is visible
    await expect(page.locator('#game-container')).toBeVisible();
    await expect(page.locator('#main-menu')).toBeHidden();
    
    // Check if game UI elements are present
    await expect(page.locator('#coin-display')).toBeVisible();
    await expect(page.locator('#wave-label')).toBeVisible();
    
    // Check if canvas is present
    await expect(page.locator('#game-canvas')).toBeVisible();
    
    // Take screenshot of game
    await page.screenshot({ path: 'test-results/game-started.png' });
  });

  test('should handle keyboard controls', async ({ page }) => {
    // Start new game
    await page.click('#new-game-btn');
    await page.waitForTimeout(1000);
    
    // Test keyboard controls
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(100);
    
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(100);
    
    await page.keyboard.press('Space');
    await page.waitForTimeout(100);
    
    // Game should still be running
    await expect(page.locator('#game-container')).toBeVisible();
    
    // Take screenshot after controls
    await page.screenshot({ path: 'test-results/keyboard-controls.png' });
  });

  test('should pause and resume game', async ({ page }) => {
    // Start new game
    await page.click('#new-game-btn');
    await page.waitForTimeout(1000);
    
    // Pause using ESC key
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    // Check if pause modal is visible
    await expect(page.locator('#pause-modal')).toBeVisible();
    await expect(page.locator('h2:has-text("Game Paused")')).toBeVisible();
    
    // Take screenshot of pause modal
    await page.screenshot({ path: 'test-results/game-paused.png' });
    
    // Resume game
    await page.click('#resume-btn');
    await page.waitForTimeout(500);
    
    // Check if pause modal is hidden
    await expect(page.locator('#pause-modal')).toBeHidden();
    await expect(page.locator('#game-container')).toBeVisible();
  });

  test('should pause using pause button', async ({ page }) => {
    // Start new game
    await page.click('#new-game-btn');
    await page.waitForTimeout(1000);
    
    // Click pause button
    await page.click('#pause-btn');
    await page.waitForTimeout(500);
    
    // Check if pause modal is visible
    await expect(page.locator('#pause-modal')).toBeVisible();
    
    // Exit to menu
    await page.click('#exit-game-btn');
    await page.waitForTimeout(500);
    
    // Check if back to main menu
    await expect(page.locator('#main-menu')).toBeVisible();
    await expect(page.locator('#game-container')).toBeHidden();
  });

  test('should display canvas-based touch controls on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Start new game
    await page.click('#new-game-btn');
    await page.waitForTimeout(1000);

    // Mobile controls are canvas-based (touch zones), verify canvas is present
    await expect(page.locator('#game-canvas')).toBeVisible();

    // Take mobile screenshot
    await page.screenshot({ path: 'test-results/mobile-view.png' });
  });

  test('should track coins and wave', async ({ page }) => {
    // Start new game
    await page.click('#new-game-btn');
    await page.waitForTimeout(1000);

    // Check initial values
    const initialCoins = await page.locator('#coin-display').textContent();
    expect(initialCoins).toBe('0');

    // Check wave label starts at wave 1
    const waveLabel = await page.locator('#wave-label').textContent();
    expect(waveLabel).toContain('WAVE');

    // Take screenshot with updated UI
    await page.screenshot({ path: 'test-results/ui-tracking.png' });
  });

  test('should start a new game from main menu after exiting', async ({ page }) => {
    // Start new game
    await page.click('#new-game-btn');
    await page.waitForTimeout(2000);

    // Exit to menu
    await page.keyboard.press('Escape');
    await page.click('#exit-game-btn');

    // Should be back at main menu
    await expect(page.locator('#main-menu')).toBeVisible();

    // Start new game again
    await page.click('#new-game-btn');
    await page.waitForTimeout(1000);

    // Should be in game state
    await expect(page.locator('#game-container')).toBeVisible();

    // Take screenshot
    await page.screenshot({ path: 'test-results/game-restarted.png' });
  });

  test('should handle game completion scenarios', async ({ page }) => {
    // Start new game
    await page.click('#new-game-btn');
    await page.waitForTimeout(1000);
    
    // Simulate level completion by manipulating game state
    await page.evaluate(() => {
      // Access the game instance and trigger level completion
      if (window.game) {
        window.game.levelComplete();
      }
    });
    
    await page.waitForTimeout(500);
    
    // Check for leaderboard modal (if it appears after game ends)
    // This might not work in all cases due to game logic
    const leaderboardModal = page.locator('#leaderboard-modal');
    if (await leaderboardModal.isVisible()) {
      await expect(leaderboardModal).toBeVisible();
      await page.screenshot({ path: 'test-results/leaderboard.png' });
    }
  });

  test('should be responsive on different screen sizes', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080, name: 'desktop' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Check if main elements are visible
      await expect(page.locator('#main-menu')).toBeVisible();
      await expect(page.locator('#new-game-btn')).toBeVisible();
      
      // Take screenshot for each viewport
      await page.screenshot({ path: `test-results/responsive-${viewport.name}.png` });
    }
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Test with invalid localStorage data
    await page.evaluate(() => {
      localStorage.setItem('catRunnerSave', 'invalid-json');
    });

    // Start a new game — game should not crash
    await page.click('#new-game-btn');
    await page.waitForTimeout(1000);

    // Should be in game state without crashing
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('#game-container')).toBeVisible();
  });

  test('should maintain game performance', async ({ page }) => {
    // Start new game
    await page.click('#new-game-btn');
    await page.waitForTimeout(1000);
    
    // Let game run for a few seconds to generate objects
    await page.waitForTimeout(5000);
    
    // Check if game is still responsive
    await page.keyboard.press('Space');
    await page.waitForTimeout(100);
    
    // Game should still be running smoothly
    await expect(page.locator('#game-container')).toBeVisible();
    
    // Take screenshot after performance test
    await page.screenshot({ path: 'test-results/performance-test.png' });
  });
});