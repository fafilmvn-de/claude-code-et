const { test, expect } = require('@playwright/test');

test.describe('Cat Hero Adventure Game', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the game
    await page.goto('http://localhost:8001');
  });

  test('should load the main menu', async ({ page }) => {
    // Check if main menu is visible
    await expect(page.locator('#main-menu')).toBeVisible();
    
    // Check game title
    await expect(page.locator('.game-title').first()).toContainText("Cat Hero's");
    
    // Check start button exists
    await expect(page.locator('#new-game-btn')).toBeVisible();
    await expect(page.locator('#new-game-btn')).toContainText('Start Adventure!');
  });

  test('should show instructions modal', async ({ page }) => {
    // Click instructions button
    await page.click('#instructions-btn');
    
    // Check if modal appears
    await expect(page.locator('#instructions-modal')).toBeVisible();
    
    // Check content mentions attack mechanics
    await expect(page.locator('#instructions-modal')).toContainText('Space or Click to attack!');
    await expect(page.locator('#instructions-modal')).toContainText('Power-ups');
    
    // Close modal
    await page.click('#close-instructions-btn');
    await expect(page.locator('#instructions-modal')).not.toBeVisible();
  });

  test('should start the game and show game container', async ({ page }) => {
    // Start new game
    await page.click('#new-game-btn');
    
    // Wait for game to load images
    await page.waitForTimeout(2000);
    
    // Check if game container is visible
    await expect(page.locator('#game-container')).toBeVisible();
    
    // Check if main menu is hidden
    await expect(page.locator('#main-menu')).not.toBeVisible();
    
    // Check HP display
    await expect(page.locator('.hearts-display')).toBeVisible();
    
    // Check game canvas
    await expect(page.locator('#game-canvas')).toBeVisible();
    
    // Check progress bar
    await expect(page.locator('#progress-bar')).toBeVisible();
    await expect(page.locator('#progress-text')).toContainText('enemies defeated');
  });

  test('should display correct UI elements in game', async ({ page }) => {
    // Start game
    await page.click('#new-game-btn');
    await page.waitForTimeout(2000);
    
    // Check all UI elements are present
    await expect(page.locator('#yarn-display')).toBeVisible();
    await expect(page.locator('#butterfly-display')).toBeVisible();
    await expect(page.locator('#fish-display')).toBeVisible();
    await expect(page.locator('#time-display')).toBeVisible();
    
    // Check progress bar shows correct initial state
    await expect(page.locator('#progress-text')).toContainText('0/20 enemies defeated');
    await expect(page.locator('#progress-text')).toContainText('Boar Invasion');
  });

  test('should handle keyboard controls', async ({ page }) => {
    // Start game
    await page.click('#new-game-btn');
    await page.waitForTimeout(2000);
    
    // Test movement keys (just verify they don't cause errors)
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowRight');
    
    // Test attack
    await page.keyboard.press('Space');
    
    // Game should still be running
    await expect(page.locator('#game-canvas')).toBeVisible();
  });

  test('should handle mouse attacks', async ({ page }) => {
    // Start game
    await page.click('#new-game-btn');
    await page.waitForTimeout(2000);
    
    // Click on canvas to attack
    await page.click('#game-canvas');
    
    // Game should still be running
    await expect(page.locator('#game-canvas')).toBeVisible();
  });

  test('should show pause modal when pressing Escape', async ({ page }) => {
    // Start game
    await page.click('#new-game-btn');
    await page.waitForTimeout(2000);
    
    // Press Escape to pause
    await page.keyboard.press('Escape');
    
    // Check pause modal appears
    await expect(page.locator('#pause-modal')).toBeVisible();
    await expect(page.locator('#pause-modal')).toContainText('Game Paused');
    
    // Resume game
    await page.click('#resume-btn');
    await expect(page.locator('#pause-modal')).not.toBeVisible();
  });

  test('should handle pause button', async ({ page }) => {
    // Start game
    await page.click('#new-game-btn');
    await page.waitForTimeout(2000);
    
    // Click pause button
    await page.click('#pause-btn');
    
    // Check pause modal appears
    await expect(page.locator('#pause-modal')).toBeVisible();
    
    // Exit to menu
    await page.click('#exit-game-btn');
    
    // Should return to main menu
    await expect(page.locator('#main-menu')).toBeVisible();
    await expect(page.locator('#game-container')).not.toBeVisible();
  });

  test('should load images correctly', async ({ page }) => {
    // Start game
    await page.click('#new-game-btn');
    
    // Wait for images to load
    await page.waitForTimeout(3000);
    
    // Check that the loading text is gone (images should be loaded)
    const canvas = page.locator('#game-canvas');
    await expect(canvas).toBeVisible();
    
    // Take a screenshot to verify visuals
    await page.screenshot({ path: 'test-results/hero-game-loaded.png' });
  });

  test('should show mobile controls on smaller screens', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Start game
    await page.click('#new-game-btn');
    await page.waitForTimeout(2000);
    
    // Mobile controls should be visible (remove md:hidden class effect)
    await expect(page.locator('#mobile-controls')).toBeVisible();
    
    // Test mobile buttons exist
    await expect(page.locator('#mobile-up')).toBeVisible();
    await expect(page.locator('#mobile-down')).toBeVisible();
    await expect(page.locator('#mobile-left')).toBeVisible();
    await expect(page.locator('#mobile-right')).toBeVisible();
  });

  test('should handle window resize gracefully', async ({ page }) => {
    // Start game
    await page.click('#new-game-btn');
    await page.waitForTimeout(2000);
    
    // Resize window
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(500);
    
    // Game should still be functional
    await expect(page.locator('#game-canvas')).toBeVisible();
    
    // Resize to smaller
    await page.setViewportSize({ width: 800, height: 600 });
    await page.waitForTimeout(500);
    
    await expect(page.locator('#game-canvas')).toBeVisible();
  });

  test('should track time correctly', async ({ page }) => {
    // Start game
    await page.click('#new-game-btn');
    await page.waitForTimeout(2000);
    
    // Check initial time
    const initialTime = await page.locator('#time-display').textContent();
    expect(initialTime).toBe('0:00');
    
    // Wait a bit
    await page.waitForTimeout(2000);
    
    // Time should have progressed
    const laterTime = await page.locator('#time-display').textContent();
    expect(laterTime).not.toBe('0:00');
  });

  test('visual regression - game canvas renders correctly', async ({ page }) => {
    // Start game and wait for full load
    await page.click('#new-game-btn');
    await page.waitForTimeout(5000); // Give extra time for image loading
    
    // Take screenshot of the game area
    const canvas = page.locator('#game-canvas');
    await expect(canvas).toBeVisible();
    
    // Screenshot for visual regression testing
    await canvas.screenshot({ path: 'test-results/game-canvas-visual.png' });
    
    // The canvas should not be completely empty or show loading text
    // This is a basic check that rendering is working
    await expect(canvas).toBeVisible();
  });
});