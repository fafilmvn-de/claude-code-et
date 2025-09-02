import { test, expect } from '@playwright/test';

test('final comprehensive debug', async ({ page }) => {
  await page.goto('http://localhost:3000/add-expense');
  await page.waitForLoadState('networkidle');
  
  // Click category selector
  await page.locator('button').filter({ hasText: 'Food' }).first().click();
  await page.waitForSelector('div.animate-scale-in', { state: 'visible' });
  
  // Take screenshot of initial state
  await page.screenshot({ path: 'final-debug-initial.png', fullPage: true });
  
  // Get the dropdown container
  const dropdown = page.locator('div.animate-scale-in');
  
  // Log all dropdown properties
  const dropdownRect = await dropdown.boundingBox();
  const dropdownStyle = await dropdown.evaluate(el => {
    const styles = window.getComputedStyle(el);
    return {
      maxHeight: styles.maxHeight,
      height: styles.height,
      overflowY: styles.overflowY,
      display: styles.display,
      position: styles.position
    };
  });
  
  console.log('Dropdown bounding box:', dropdownRect);
  console.log('Dropdown computed styles:', dropdownStyle);
  
  // Get all category buttons and their properties
  const buttons = await page.locator('div.animate-scale-in button').all();
  console.log(`Total buttons found: ${buttons.length}`);
  
  for (let i = 0; i < buttons.length; i++) {
    const button = buttons[i];
    const text = await button.textContent();
    const rect = await button.boundingBox();
    const isVisible = await button.isVisible();
    const categoryName = text?.split('\n')[0] || '';
    
    console.log(`Button ${i}: "${categoryName}" - Visible: ${isVisible}, Rect: ${JSON.stringify(rect)}`);
  }
  
  // Check if we can scroll
  const canScroll = await dropdown.evaluate(el => el.scrollHeight > el.clientHeight);
  console.log('Can scroll:', canScroll);
  
  if (canScroll) {
    console.log('Attempting to scroll...');
    await dropdown.evaluate(el => el.scrollTop = el.scrollHeight);
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'final-debug-scrolled.png', fullPage: true });
  }
});