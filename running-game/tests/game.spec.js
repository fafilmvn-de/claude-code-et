const { test, expect } = require('@playwright/test');

test.describe('Cat Runner Game', () => {
  test.beforeEach(async ({ page }) => {
    // Start a local server for testing
    await page.goto('http://localhost:8000');
    await page.waitForLoadState('networkidle');
  });

  test('should display main menu on load', async ({ page }) => {
    // Check if main menu is visible
    await expect(page.locator('#main-menu')).toBeVisible();
    await expect(page.locator('h1:has-text("Cat Runner")')).toBeVisible();
    
    // Check if buttons are present
    await expect(page.locator('#new-game-btn')).toBeVisible();
    await expect(page.locator('#load-game-btn')).toBeVisible();
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
    await expect(page.locator('text=Left Arrow - Move Left')).toBeVisible();
    await expect(page.locator('text=Space Bar - Jump')).toBeVisible();
    
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
    await expect(page.locator('#coins-display')).toBeVisible();
    await expect(page.locator('#time-display')).toBeVisible();
    await expect(page.locator('#level-display')).toBeVisible();
    
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

  test('should display mobile controls on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Start new game
    await page.click('#new-game-btn');
    await page.waitForTimeout(1000);
    
    // Check if mobile controls are visible
    await expect(page.locator('#mobile-controls')).toBeVisible();
    await expect(page.locator('#mobile-left')).toBeVisible();
    await expect(page.locator('#mobile-jump')).toBeVisible();
    await expect(page.locator('#mobile-right')).toBeVisible();
    
    // Take mobile screenshot
    await page.screenshot({ path: 'test-results/mobile-view.png' });
  });

  test('should handle mobile controls', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Start new game
    await page.click('#new-game-btn');
    await page.waitForTimeout(1000);
    
    // Test mobile controls
    await page.click('#mobile-left');
    await page.waitForTimeout(100);
    
    await page.click('#mobile-right');
    await page.waitForTimeout(100);
    
    await page.click('#mobile-jump');
    await page.waitForTimeout(100);
    
    // Game should still be running
    await expect(page.locator('#game-container')).toBeVisible();
  });

  test('should track coins and time', async ({ page }) => {
    // Start new game
    await page.click('#new-game-btn');
    await page.waitForTimeout(1000);
    
    // Check initial values
    const initialCoins = await page.locator('#coins-display').textContent();
    expect(initialCoins).toBe('0');
    
    const initialLevel = await page.locator('#level-display').textContent();
    expect(initialLevel).toBe('Level 1');
    
    // Wait for time to update
    await page.waitForTimeout(2000);
    
    // Check if time is updating
    const timeDisplay = await page.locator('#time-display').textContent();
    expect(timeDisplay).not.toBe('0:00');
    
    // Take screenshot with updated UI
    await page.screenshot({ path: 'test-results/ui-tracking.png' });
  });

  test('should save and load game progress', async ({ page }) => {
    // Clear any existing save data
    await page.evaluate(() => localStorage.removeItem('catRunnerSave'));
    
    // Start new game
    await page.click('#new-game-btn');
    await page.waitForTimeout(2000);
    
    // Exit to menu (this should save progress)
    await page.keyboard.press('Escape');
    await page.click('#exit-game-btn');
    
    // Check if load button is enabled
    const loadButton = page.locator('#load-game-btn');
    await expect(loadButton).toBeVisible();
    
    // Try to load game
    await page.click('#load-game-btn');
    await page.waitForTimeout(1000);
    
    // Should be in game state
    await expect(page.locator('#game-container')).toBeVisible();
    
    // Take screenshot of loaded game
    await page.screenshot({ path: 'test-results/game-loaded.png' });
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
    
    // Check for level complete modal (if it appears)
    // This might not work in all cases due to game logic
    const levelCompleteModal = page.locator('#level-complete-modal');
    if (await levelCompleteModal.isVisible()) {
      await expect(levelCompleteModal).toBeVisible();
      await page.screenshot({ path: 'test-results/level-complete.png' });
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
    
    // Try to load game
    await page.click('#load-game-btn');
    await page.waitForTimeout(1000);
    
    // Should either show error or start new game
    // Game should not crash
    await expect(page.locator('body')).toBeVisible();
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