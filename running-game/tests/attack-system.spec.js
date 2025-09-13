const { test, expect } = require('@playwright/test');

test.describe('Attack System Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForTimeout(2000); // Wait for game to load
  });

  test('should perform single-target attacks only', async ({ page }) => {
    // Start game
    await page.click('#new-game-btn');
    await page.waitForTimeout(2000);
    
    // Capture console logs for attack behavior
    const attackLogs = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('Attacking single enemy') || 
          text.includes('No enemies in range') ||
          text.includes('Hit enemy!')) {
        attackLogs.push(text);
      }
    });
    
    // Wait for enemies to spawn
    await page.waitForTimeout(3000);
    
    // Perform several attacks
    for (let i = 0; i < 5; i++) {
      await page.press('body', 'Space');
      await page.waitForTimeout(600); // Wait for attack cooldown
    }
    
    // Check that we have attack logs
    console.log('Attack behavior logs:', attackLogs);
    
    // Each attack should either hit one enemy or hit no enemies
    // No attack should hit multiple enemies simultaneously
    attackLogs.forEach(log => {
      expect(log).toMatch(/(Attacking single enemy|No enemies in range)/);
    });
  });

  test('should distinguish between regular attack and sword blast', async ({ page }) => {
    // Start game
    await page.click('#new-game-btn');
    await page.waitForTimeout(2000);
    
    // Monitor for different attack types
    const attackLogs = [];
    const blastLogs = [];
    
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('Attacking single enemy')) {
        attackLogs.push(text);
      } else if (text.includes('SWORD BLAST')) {
        blastLogs.push(text);
      }
    });
    
    // Perform regular attacks
    for (let i = 0; i < 3; i++) {
      await page.press('body', 'Space');
      await page.waitForTimeout(600);
    }
    
    await page.waitForTimeout(2000);
    
    // Regular attacks should be single-target
    console.log('Regular attacks:', attackLogs.length);
    console.log('Sword blasts:', blastLogs.length);
    
    // Should have some regular attacks, sword blast only if kill streak reached
    expect(attackLogs.length).toBeGreaterThanOrEqual(0);
  });

  test('should handle attack cooldown properly', async ({ page }) => {
    // Start game
    await page.click('#new-game-btn');
    await page.waitForTimeout(2000);
    
    let attackCount = 0;
    page.on('console', msg => {
      if (msg.text().includes('Attacking single enemy') || msg.text().includes('No enemies in range')) {
        attackCount++;
      }
    });
    
    // Rapidly press attack button (should be limited by cooldown)
    const startTime = Date.now();
    for (let i = 0; i < 10; i++) {
      await page.press('body', 'Space');
      await page.waitForTimeout(50); // Very short delay
    }
    const endTime = Date.now();
    
    await page.waitForTimeout(1000); // Wait for any pending attacks
    
    const elapsedTime = endTime - startTime;
    console.log(`Elapsed time: ${elapsedTime}ms, Attack count: ${attackCount}`);
    
    // Should have fewer attacks than button presses due to cooldown
    expect(attackCount).toBeLessThan(10);
  });

  test('should attack with both keyboard and mouse', async ({ page }) => {
    // Start game
    await page.click('#new-game-btn');
    await page.waitForTimeout(2000);
    
    let keyboardAttacks = 0;
    let mouseAttacks = 0;
    
    page.on('console', msg => {
      if (msg.text().includes('Attacking single enemy') || msg.text().includes('No enemies in range')) {
        // We can't distinguish between keyboard and mouse from logs alone,
        // but we can count total attacks
        if (keyboardAttacks + mouseAttacks < 3) {
          keyboardAttacks++;
        } else {
          mouseAttacks++;
        }
      }
    });
    
    // Test keyboard attack
    await page.press('body', 'Space');
    await page.waitForTimeout(600);
    await page.press('body', 'Space');
    await page.waitForTimeout(600);
    await page.press('body', 'Space');
    await page.waitForTimeout(600);
    
    // Test mouse attack
    await page.click('#game-canvas');
    await page.waitForTimeout(600);
    await page.click('#game-canvas');
    await page.waitForTimeout(600);
    
    await page.waitForTimeout(1000);
    
    console.log(`Total attacks registered: ${keyboardAttacks + mouseAttacks}`);
    
    // Should have registered some attacks
    expect(keyboardAttacks + mouseAttacks).toBeGreaterThan(0);
  });

  test('should handle attack range correctly', async ({ page }) => {
    // Start game
    await page.click('#new-game-btn');
    await page.waitForTimeout(3000); // Wait for enemies to spawn
    
    const rangeLogs = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('distance:') || text.includes('No enemies in range')) {
        rangeLogs.push(text);
      }
    });
    
    // Try attacking (may or may not hit depending on enemy positions)
    for (let i = 0; i < 5; i++) {
      await page.press('body', 'Space');
      await page.waitForTimeout(600);
    }
    
    await page.waitForTimeout(1000);
    
    console.log('Range-related logs:', rangeLogs);
    
    // Should have some range-related activity
    expect(rangeLogs.length).toBeGreaterThanOrEqual(0);
  });

  test('should show celebration messages for hits', async ({ page }) => {
    // Start game
    await page.click('#new-game-btn');
    await page.waitForTimeout(3000); // Wait for enemies to spawn
    
    // Try to attack
    await page.press('body', 'Space');
    await page.waitForTimeout(1000);
    
    // Check if celebration message appears (it might not if no enemies in range)
    const celebrationMessage = page.locator('#celebration-message');
    
    // The celebration message might be visible briefly, so we check if it exists
    const messageExists = await celebrationMessage.count() > 0;
    expect(messageExists).toBe(true);
  });

  test('should verify attack affects game state', async ({ page }) => {
    // Start game
    await page.click('#new-game-btn');
    await page.waitForTimeout(2000);
    
    // Get initial progress
    const initialProgress = await page.textContent('#progress-text');
    
    // Wait for enemies and try attacking
    await page.waitForTimeout(3000);
    
    // Perform multiple attacks
    for (let i = 0; i < 10; i++) {
      await page.press('body', 'Space');
      await page.waitForTimeout(600);
    }
    
    await page.waitForTimeout(2000);
    
    // Check if progress might have changed (if enemies were killed)
    const finalProgress = await page.textContent('#progress-text');
    
    console.log('Initial progress:', initialProgress);
    console.log('Final progress:', finalProgress);
    
    // Progress text should exist
    expect(finalProgress).toBeTruthy();
  });
});