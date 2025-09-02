import { test, expect } from '@playwright/test';

test('verify Finance category appears in dropdown', async ({ page }) => {
  // Navigate to the add expense page
  await page.goto('http://localhost:3000/add-expense');
  
  // Wait for the page to load
  await page.waitForLoadState('networkidle');
  
  // Find and click the category selector button
  const categorySelector = page.locator('button').filter({ hasText: 'Food' }).first();
  await categorySelector.click();
  
  // Wait for dropdown to open
  await page.waitForSelector('[role="listbox"], .animate-scale-in', { state: 'visible' });
  
  // Take a screenshot to see what's rendered
  await page.screenshot({ path: 'category-dropdown.png' });
  
  // Check if Finance category is present in the dropdown
  const financeOption = page.locator('text=Finance');
  await expect(financeOption).toBeVisible();
  
  // Also check for the description text
  const financeDescription = page.locator('text=Investments, banking, and financial services');
  await expect(financeDescription).toBeVisible();
  
  // List all visible category options
  const categoryOptions = await page.locator('[role="button"]:has-text("Food"), [role="button"]:has-text("Transportation"), [role="button"]:has-text("Entertainment"), [role="button"]:has-text("Shopping"), [role="button"]:has-text("Bills"), [role="button"]:has-text("Finance"), [role="button"]:has-text("Other")').allTextContents();
  console.log('Visible categories:', categoryOptions);
});