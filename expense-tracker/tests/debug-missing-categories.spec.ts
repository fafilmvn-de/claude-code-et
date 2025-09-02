import { test, expect } from '@playwright/test';

test('debug why Finance and Other are missing', async ({ page }) => {
  // Enable console logging
  page.on('console', msg => console.log('BROWSER:', msg.text()));
  
  await page.goto('http://localhost:3000/add-expense');
  await page.waitForLoadState('networkidle');
  
  // Inject debug code to check EXPENSE_CATEGORIES
  await page.evaluate(() => {
    // Try to access the categories from the window or module system
    console.log('Checking categories...');
    
    // Look for the component and log its state
    const buttons = document.querySelectorAll('button');
    buttons.forEach((btn, i) => {
      if (btn.textContent?.includes('Food') && btn.textContent?.includes('Restaurants')) {
        console.log(`Found category button ${i}:`, btn.textContent);
      }
    });
  });
  
  // Click category selector
  const categoryButton = page.locator('button').filter({ hasText: 'Food' }).first();
  await categoryButton.click();
  await page.waitForSelector('.animate-scale-in', { state: 'visible' });
  
  // Get all buttons in dropdown and log them
  const dropdownButtons = page.locator('.animate-scale-in button');
  const count = await dropdownButtons.count();
  
  console.log(`Found ${count} dropdown buttons`);
  
  for (let i = 0; i < count; i++) {
    const button = dropdownButtons.nth(i);
    const text = await button.textContent();
    const isVisible = await button.isVisible();
    console.log(`Button ${i}: "${text?.split('\n')[0]}" - Visible: ${isVisible}`);
  }
  
  // Check if Finance and Other elements exist at all (even if not visible)
  const financeExists = await page.locator('text=Finance').count();
  const otherExists = await page.locator('text=Other').count();
  
  console.log('Finance elements found:', financeExists);
  console.log('Other elements found:', otherExists);
  
  // Take a screenshot
  await page.screenshot({ path: 'debug-missing-categories.png', fullPage: true });
});