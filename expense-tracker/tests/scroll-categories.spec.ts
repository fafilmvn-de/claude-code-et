import { test, expect } from '@playwright/test';

test('scroll through categories to find Finance', async ({ page }) => {
  // Navigate to the add expense page
  await page.goto('http://localhost:3000/add-expense');
  
  // Wait for the page to load
  await page.waitForLoadState('networkidle');
  
  // Find and click the category selector button
  const categorySelector = page.locator('button').filter({ hasText: 'Food' }).first();
  await categorySelector.click();
  
  // Wait for dropdown to open
  await page.waitForSelector('.animate-scale-in', { state: 'visible' });
  
  // Find the dropdown container and scroll to bottom
  const dropdown = page.locator('.animate-scale-in');
  await dropdown.evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });
  
  // Wait a bit for scrolling
  await page.waitForTimeout(500);
  
  // Take screenshot after scrolling
  await page.screenshot({ path: 'scrolled-dropdown.png', fullPage: true });
  
  // Look for Finance option specifically
  const financeButton = page.locator('button:has-text("Finance")');
  await expect(financeButton).toBeVisible();
  
  // Click on Finance to select it
  await financeButton.click();
  
  // Verify Finance is now selected
  const selectedCategory = page.locator('button').filter({ hasText: 'Finance' }).first();
  await expect(selectedCategory).toBeVisible();
  
  // Take final screenshot
  await page.screenshot({ path: 'finance-selected.png' });
});