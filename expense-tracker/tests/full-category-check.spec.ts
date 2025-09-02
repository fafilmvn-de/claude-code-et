import { test, expect } from '@playwright/test';

test('verify all categories including Finance', async ({ page }) => {
  // Navigate to the add expense page
  await page.goto('http://localhost:3000/add-expense');
  
  // Wait for the page to load
  await page.waitForLoadState('networkidle');
  
  // Find and click the category selector button
  const categorySelector = page.locator('button').filter({ hasText: 'Food' }).first();
  await categorySelector.click();
  
  // Wait for dropdown to open
  await page.waitForSelector('.animate-scale-in', { state: 'visible' });
  
  // Get all category buttons in the dropdown
  const categoryButtons = page.locator('.animate-scale-in button');
  const categoryCount = await categoryButtons.count();
  
  console.log(`Found ${categoryCount} category options`);
  
  const categories = [];
  for (let i = 0; i < categoryCount; i++) {
    const categoryText = await categoryButtons.nth(i).textContent();
    categories.push(categoryText);
  }
  
  console.log('All categories found:', categories);
  
  // Check if Finance is in the list
  const hasFinance = categories.some(cat => cat?.includes('Finance'));
  console.log('Finance category found:', hasFinance);
  
  // Take a full page screenshot
  await page.screenshot({ path: 'full-category-dropdown.png', fullPage: true });
  
  // Verify Finance category exists
  const financeOption = page.locator('text=Finance');
  await expect(financeOption).toBeVisible();
});