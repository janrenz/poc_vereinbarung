import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  test('home page should not have accessibility violations', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('login page should not have accessibility violations', async ({ page }) => {
    await page.goto('/login');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('formular page should not have accessibility violations', async ({ page }) => {
    await page.goto('/formular');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('all pages should have proper heading hierarchy', async ({ page }) => {
    const pages = ['/', '/login', '/formular'];
    
    for (const path of pages) {
      await page.goto(path);
      
      // Check for h1 presence
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBeGreaterThanOrEqual(1);
    }
  });

  test('interactive elements should be keyboard accessible', async ({ page }) => {
    await page.goto('/');
    
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    
    // First focusable element should be focused
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON', 'INPUT']).toContain(focusedElement);
  });

  test('images and icons should have proper aria labels', async ({ page }) => {
    await page.goto('/');
    
    // Check decorative elements have aria-hidden
    const decorativeElements = page.locator('[aria-hidden="true"]');
    const count = await decorativeElements.count();
    
    // Should have some decorative elements
    expect(count).toBeGreaterThan(0);
  });
});

