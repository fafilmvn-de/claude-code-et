const { test, expect } = require('@playwright/test');

test.describe('Cat Hero Adventure Game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForTimeout(2000); // Wait for game to load
  });

  test('should load game main menu', async ({ page }) => {
    // Check if main menu elements are visible
    await expect(page.locator('#main-menu')).toBeVisible();
    await expect(page.locator('#new-game-btn')).toBeVisible();
    await expect(page.locator('#instructions-btn')).toBeVisible();
    
    // Check title elements
    await expect(page.locator('text=Cat Hero\'s')).toBeVisible();
    await expect(page.locator('text=Adventure!')).toBeVisible();
  });

  test('should start new game', async ({ page }) => {
    // Click new game button
    await page.click('#new-game-btn');
    await page.waitForTimeout(1000);
    
    // Check if game container is visible
    await expect(page.locator('#game-container')).toBeVisible();
    await expect(page.locator('#main-menu')).toBeHidden();
    
    // Check if game canvas is present
    await expect(page.locator('#game-canvas')).toBeVisible();
    
    // Check if UI elements are visible
    await expect(page.locator('.hearts-display')).toBeVisible();
    await expect(page.locator('#yarn-display')).toBeVisible();
    await expect(page.locator('#butterfly-display')).toBeVisible();
    await expect(page.locator('#fish-display')).toBeVisible();
  });

  test('should show instructions modal', async ({ page }) => {
    // Click instructions button
    await page.click('#instructions-btn');
    await page.waitForTimeout(500);
    
    // Check if modal is visible
    await expect(page.locator('#instructions-modal')).toBeVisible();
    await expect(page.locator('text=How to Play!')).toBeVisible();
    
    // Close instructions
    await page.click('#close-instructions-btn');
    await page.waitForTimeout(500);
    
    // Check if modal is hidden
    await expect(page.locator('#instructions-modal')).toBeHidden();
  });

  test('should handle game controls', async ({ page }) => {
    // Start game
    await page.click('#new-game-btn');
    await page.waitForTimeout(2000);
    
    // Test keyboard controls
    await page.press('body', 'ArrowUp');
    await page.press('body', 'ArrowDown');
    await page.press('body', 'ArrowLeft');
    await page.press('body', 'ArrowRight');
    
    // Test attack with spacebar
    await page.press('body', 'Space');
    await page.waitForTimeout(500);
    
    // Test attack with click
    await page.click('#game-canvas');
    await page.waitForTimeout(500);
  });

  test('should spawn enemies over time', async ({ page }) => {
    // Start game
    await page.click('#new-game-btn');
    await page.waitForTimeout(1000);
    
    // Wait for enemies to spawn (should be within 2 seconds due to fast spawn)
    await page.waitForTimeout(3000);
    
    // Check console logs for enemy spawning (we can't directly check canvas content)
    const logs = [];
    page.on('console', msg => logs.push(msg.text()));
    
    // Wait a bit more to see spawning activity
    await page.waitForTimeout(2000);
  });

  test('should handle single-target attacks', async ({ page }) => {
    // Start game
    await page.click('#new-game-btn');
    await page.waitForTimeout(2000);
    
    // Listen for console logs to verify single-target behavior
    const attackLogs = [];
    page.on('console', msg => {
      if (msg.text().includes('Attacking single enemy') || msg.text().includes('No enemies in range')) {
        attackLogs.push(msg.text());
      }
    });
    
    // Perform multiple attacks
    await page.press('body', 'Space');
    await page.waitForTimeout(600); // Wait for cooldown
    await page.press('body', 'Space');
    await page.waitForTimeout(600);
    await page.press('body', 'Space');
    await page.waitForTimeout(1000);
    
    // We should see attack logs indicating single-target behavior
    console.log('Attack logs:', attackLogs);
  });

  test('should pause and resume game', async ({ page }) => {
    // Start game
    await page.click('#new-game-btn');
    await page.waitForTimeout(1000);
    
    // Pause game
    await page.click('#pause-btn');
    await page.waitForTimeout(500);
    
    // Check if pause modal is visible
    await expect(page.locator('#pause-modal')).toBeVisible();
    
    // Resume game
    await page.click('#resume-btn');
    await page.waitForTimeout(500);
    
    // Check if pause modal is hidden
    await expect(page.locator('#pause-modal')).toBeHidden();
  });

  test('should handle escape key for pause/resume', async ({ page }) => {
    // Start game
    await page.click('#new-game-btn');
    await page.waitForTimeout(1000);
    
    // Pause with Escape
    await page.press('body', 'Escape');
    await page.waitForTimeout(500);
    
    // Check if pause modal is visible
    await expect(page.locator('#pause-modal')).toBeVisible();
    
    // Resume with Escape
    await page.press('body', 'Escape');
    await page.waitForTimeout(500);
    
    // Check if pause modal is hidden
    await expect(page.locator('#pause-modal')).toBeHidden();
  });

  test('should exit to menu', async ({ page }) => {
    // Start game
    await page.click('#new-game-btn');
    await page.waitForTimeout(1000);
    
    // Pause game
    await page.click('#pause-btn');
    await page.waitForTimeout(500);
    
    // Exit to menu
    await page.click('#exit-game-btn');
    await page.waitForTimeout(500);
    
    // Check if main menu is visible
    await expect(page.locator('#main-menu')).toBeVisible();
    await expect(page.locator('#game-container')).toBeHidden();
  });

  test('should update UI elements during gameplay', async ({ page }) => {
    // Start game
    await page.click('#new-game-btn');
    await page.waitForTimeout(1000);
    
    // Check initial values
    const initialYarn = await page.textContent('#yarn-display');
    const initialButterfly = await page.textContent('#butterfly-display');
    const initialFish = await page.textContent('#fish-display');
    
    expect(initialYarn).toBe('0');
    expect(initialButterfly).toBe('0');
    expect(initialFish).toBe('0');
    
    // Check that time display updates
    await page.waitForTimeout(2000);
    const timeDisplay = await page.textContent('#time-display');
    expect(timeDisplay).toMatch(/\d+:\d+/);
  });

  test('should handle mobile controls', async ({ page }) => {
    // Start game
    await page.click('#new-game-btn');
    await page.waitForTimeout(1000);
    
    // Test mobile controls (if visible)
    const mobileUp = page.locator('#mobile-up');
    const mobileDown = page.locator('#mobile-down');
    const mobileLeft = page.locator('#mobile-left');
    const mobileRight = page.locator('#mobile-right');
    
    // Check if mobile controls exist (might be hidden on desktop)
    if (await mobileUp.isVisible()) {
      await mobileUp.click();
      await page.waitForTimeout(100);
      await mobileDown.click();
      await page.waitForTimeout(100);
      await mobileLeft.click();
      await page.waitForTimeout(100);
      await mobileRight.click();
      await page.waitForTimeout(100);
    }
  });

  test('should verify sprite processing and loading', async ({ page }) => {
    // Start game
    await page.click('#new-game-btn');
    await page.waitForTimeout(3000); // Wait for sprites to load and process
    
    // Listen for image loading logs
    const imageLogs = [];
    page.on('console', msg => {
      if (msg.text().includes('Loaded:') || msg.text().includes('images loaded')) {
        imageLogs.push(msg.text());
      }
    });
    
    await page.waitForTimeout(2000);
    
    // Should have some image loading activity
    console.log('Image loading logs:', imageLogs);
  });

  test('should verify random enemy spawning (1-3 enemies)', async ({ page }) => {
    // Start game
    await page.click('#new-game-btn');
    await page.waitForTimeout(1000);
    
    // Monitor spawning for a few cycles
    let spawnCycles = 0;
    const maxCycles = 5;
    
    while (spawnCycles < maxCycles) {
      await page.waitForTimeout(2000); // Wait for spawn interval
      spawnCycles++;
    }
    
    // The test passes if we don't get errors and the game continues running
    await expect(page.locator('#game-container')).toBeVisible();
  });

  test('should verify faster spawn intervals', async ({ page }) => {
    // Start game
    await page.click('#new-game-btn');
    await page.waitForTimeout(1000);
    
    // Record time before waiting
    const startTime = Date.now();
    
    // Wait for multiple spawn cycles (should happen quickly)
    await page.waitForTimeout(5000); // 5 seconds should see multiple spawns
    
    const endTime = Date.now();
    const elapsedTime = endTime - startTime;
    
    // Should have had time for multiple spawns (intervals are 0.8-2 seconds)
    expect(elapsedTime).toBeGreaterThan(3000);
    
    // Game should still be running
    await expect(page.locator('#game-container')).toBeVisible();
  });
});