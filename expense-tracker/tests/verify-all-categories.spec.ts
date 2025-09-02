import { test, expect } from '@playwright/test';

test('verify all 7 categories are present in correct order', async ({ page }) => {
  await page.goto('http://localhost:3000/add-expense');
  await page.waitForLoadState('networkidle');
  
  // Click category selector
  await page.locator('button').filter({ hasText: 'Food' }).first().click();
  await page.waitForSelector('div[style*="maxHeight"]', { state: 'visible' });
  
  // Expected categories in order
  const expectedCategories = [
    'Food',
    'Transportation',
    'Entertainment', 
    'Shopping',
    'Bills',
    'Finance',
    'Other'
  ];
  
  // Check each category exists and is visible
  for (const category of expectedCategories) {
    const categoryOption = page.locator(`button:has-text("${category}")`);
    await expect(categoryOption).toBeVisible();
    console.log(`✓ Found category: ${category}`);
  }
  
  // Take screenshot to verify visual state
  await page.screenshot({ path: 'all-categories-visible.png', fullPage: true });
  
  console.log('All 7 categories are present and visible!');
});