import { test, expect } from '@playwright/test';

test('check categories after removing height restrictions', async ({ page }) => {
  await page.goto('http://localhost:3000/add-expense');
  await page.waitForLoadState('networkidle');
  
  // Click category selector
  await page.locator('button').filter({ hasText: 'Food' }).first().click();
  await page.waitForSelector('.animate-scale-in', { state: 'visible' });
  
  // Take screenshot immediately
  await page.screenshot({ path: 'no-height-restriction.png', fullPage: true });
  
  // Check for specific missing categories
  const financeExists = await page.locator('text=Finance').isVisible();
  const billsExists = await page.locator('text=Bills').isVisible();
  const otherExists = await page.locator('text=Other').isVisible();
  
  console.log('Finance visible:', financeExists);
  console.log('Bills visible:', billsExists);  
  console.log('Other visible:', otherExists);
  
  // Count total visible categories
  const categoryButtons = page.locator('.animate-scale-in button');
  const count = await categoryButtons.count();
  console.log('Total category buttons:', count);
});