import { test, expect } from '@playwright/test';

test('add Finance and Other expense items', async ({ page }) => {
  await page.goto('http://localhost:3000/add-expense');
  await page.waitForLoadState('networkidle');
  
  // Test 1: Add Finance expense
  console.log('=== Testing Finance Expense ===');
  
  // Fill in amount
  await page.fill('input[type="number"]', '150.00');
  
  // Fill in description
  await page.fill('input[placeholder*="description"]', 'Investment account fee');
  
  // Click category dropdown
  await page.locator('button').filter({ hasText: 'Food' }).first().click();
  await page.waitForSelector('.animate-scale-in', { state: 'visible' });
  
  // Take screenshot of dropdown
  await page.screenshot({ path: 'dropdown-before-finance.png', fullPage: true });
  
  // Try to find and click Finance
  const financeButton = page.locator('button:has-text("Finance")');
  const financeExists = await financeButton.count();
  console.log('Finance button count:', financeExists);
  
  if (financeExists > 0) {
    console.log('Finance button found, clicking...');
    await financeButton.click();
  } else {
    console.log('Finance button not found, trying to scroll...');
    const dropdown = page.locator('.animate-scale-in');
    await dropdown.evaluate(el => el.scrollTop = el.scrollHeight);
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'dropdown-after-scroll.png', fullPage: true });
    
    // Try again after scrolling
    const financeButtonAfterScroll = page.locator('button:has-text("Finance")');
    await financeButtonAfterScroll.click();
  }
  
  // Verify Finance is selected
  await expect(page.locator('button').filter({ hasText: 'Finance' }).first()).toBeVisible();
  
  // Submit the form
  await page.click('button:has-text("Add Expense")');
  await page.waitForLoadState('networkidle');
  
  // Take screenshot after submission
  await page.screenshot({ path: 'after-finance-submission.png', fullPage: true });
  
  console.log('Finance expense added successfully');
  
  // Test 2: Add Other expense
  console.log('=== Testing Other Expense ===');
  
  // Go back to add expense page
  await page.goto('http://localhost:3000/add-expense');
  await page.waitForLoadState('networkidle');
  
  // Fill in amount
  await page.fill('input[type="number"]', '25.50');
  
  // Fill in description  
  await page.fill('input[placeholder*="description"]', 'Random miscellaneous item');
  
  // Click category dropdown
  await page.locator('button').filter({ hasText: 'Food' }).first().click();
  await page.waitForSelector('.animate-scale-in', { state: 'visible' });
  
  // Try to find and click Other
  const otherButton = page.locator('button:has-text("Other")');
  const otherExists = await otherButton.count();
  console.log('Other button count:', otherExists);
  
  if (otherExists > 0) {
    console.log('Other button found, clicking...');
    await otherButton.click();
  } else {
    console.log('Other button not found, trying to scroll...');
    const dropdown = page.locator('.animate-scale-in');
    await dropdown.evaluate(el => el.scrollTop = el.scrollHeight);
    await page.waitForTimeout(500);
    
    // Try again after scrolling
    const otherButtonAfterScroll = page.locator('button:has-text("Other")');
    await otherButtonAfterScroll.click();
  }
  
  // Verify Other is selected
  await expect(page.locator('button').filter({ hasText: 'Other' }).first()).toBeVisible();
  
  // Submit the form
  await page.click('button:has-text("Add Expense")');
  await page.waitForLoadState('networkidle');
  
  // Take final screenshot
  await page.screenshot({ path: 'after-other-submission.png', fullPage: true });
  
  console.log('Other expense added successfully');
  
  // Verify both expenses were added by checking the expenses page
  await page.goto('http://localhost:3000/expenses');
  await page.waitForLoadState('networkidle');
  
  // Take screenshot of expenses page
  await page.screenshot({ path: 'expenses-page-final.png', fullPage: true });
  
  // Look for our added expenses
  const financeExpense = page.locator('text=Investment account fee');
  const otherExpense = page.locator('text=Random miscellaneous item');
  
  await expect(financeExpense).toBeVisible();
  await expect(otherExpense).toBeVisible();
  
  console.log('Both Finance and Other expenses are visible on expenses page!');
});