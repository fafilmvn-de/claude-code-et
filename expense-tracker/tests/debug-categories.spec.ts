import { test, expect } from '@playwright/test';

test('debug category rendering', async ({ page }) => {
  await page.goto('http://localhost:3000/add-expense');
  await page.waitForLoadState('networkidle');
  
  // Click category selector
  await page.locator('button').filter({ hasText: 'Food' }).first().click();
  await page.waitForSelector('.animate-scale-in', { state: 'visible' });
  
  // Get dropdown container and inspect its properties
  const dropdown = page.locator('.animate-scale-in');
  
  // Log dropdown properties
  const dropdownHeight = await dropdown.evaluate(el => el.scrollHeight);
  const visibleHeight = await dropdown.evaluate(el => el.clientHeight);
  const isScrollable = await dropdown.evaluate(el => el.scrollHeight > el.clientHeight);
  
  console.log('Dropdown scroll height:', dropdownHeight);
  console.log('Dropdown visible height:', visibleHeight);
  console.log('Is scrollable:', isScrollable);
  
  // Get all category buttons and log their positions
  const categoryButtons = page.locator('.animate-scale-in button');
  const count = await categoryButtons.count();
  console.log('Total category buttons found:', count);
  
  for (let i = 0; i < count; i++) {
    const button = categoryButtons.nth(i);
    const text = await button.textContent();
    const isVisible = await button.isVisible();
    const bbox = await button.boundingBox();
    
    console.log(`Category ${i}: "${text?.split('\n')[0]}" - Visible: ${isVisible}, Position: ${bbox?.y}`);
  }
  
  // Try to scroll to bottom and see if more become visible
  await dropdown.evaluate(el => el.scrollTo(0, el.scrollHeight));
  await page.waitForTimeout(100);
  
  console.log('--- After scrolling to bottom ---');
  for (let i = 0; i < count; i++) {
    const button = categoryButtons.nth(i);
    const text = await button.textContent();
    const isVisible = await button.isVisible();
    
    console.log(`Category ${i}: "${text?.split('\n')[0]}" - Visible after scroll: ${isVisible}`);
  }
  
  await page.screenshot({ path: 'debug-categories.png', fullPage: true });
});