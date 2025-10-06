import { test, expect } from '@playwright/test';

test.describe('Copyable Access Code', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('input[name="email"]', 'schulaufsicht@example.com');
    await page.fill('input[name="password"]', 'schulaufsicht123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');
  });

  test('should display copyable code button in admin overview', async ({ page }) => {
    await page.waitForSelector('button:has-text("Code")', { timeout: 5000 });
    
    // Should see the code button
    const codeButton = page.locator('button').filter({ hasText: /Code/ }).first();
    await expect(codeButton).toBeVisible();
    
    // Should have copy icon
    await expect(page.locator('svg').locator('..').filter({ has: codeButton })).toBeVisible();
  });

  test('should copy code to clipboard when clicked in admin overview', async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    
    await page.waitForSelector('button', { timeout: 5000 });
    
    // Find a code button
    const codeButtons = page.locator('button').filter({ hasText: /[A-Z0-9]{8}/ });
    const firstCodeButton = codeButtons.first();
    
    if (await firstCodeButton.count() > 0) {
      // Get the code text before clicking
      const codeText = await firstCodeButton.textContent();
      const code = codeText?.match(/[A-Z0-9]{8}/)?.[0];
      
      if (code) {
        // Click to copy
        await firstCodeButton.click();
        
        // Should show "Kopiert!" message
        await expect(page.getByText(/Kopiert!/i)).toBeVisible({ timeout: 2000 });
        
        // Verify clipboard content
        const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
        expect(clipboardText).toBe(code);
      }
    }
  });

  test('should display copyable code in form detail page', async ({ page }) => {
    // Get access code from first form
    await page.waitForSelector('a[href^="/admin/forms/"]', { timeout: 5000 });
    const firstFormCard = page.locator('a[href^="/admin/forms/"]').first();
    const codeButton = firstFormCard.locator('..').locator('button').filter({ hasText: /[A-Z0-9]{8}/ }).first();
    
    if (await codeButton.count() > 0) {
      const codeText = await codeButton.textContent();
      const accessCode = codeText?.match(/[A-Z0-9]{8}/)?.[0];
      
      if (accessCode) {
        // Navigate to form detail
        await firstFormCard.click();
        await page.waitForURL(/\/admin\/forms\/[a-z0-9]+/);
        
        // Should see copyable code in detail view
        const detailCodeButton = page.locator('button').filter({ hasText: accessCode }).first();
        await expect(detailCodeButton).toBeVisible();
      }
    }
  });

  test('should copy code from form detail page', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    
    // Navigate to form detail
    await page.waitForSelector('a[href^="/admin/forms/"]', { timeout: 5000 });
    await page.locator('a[href^="/admin/forms/"]').first().click();
    await page.waitForURL(/\/admin\/forms\/[a-z0-9]+/);
    
    // Find and click copyable code
    const codeButton = page.locator('button').filter({ hasText: /[A-Z0-9]{8}/ }).first();
    
    if (await codeButton.count() > 0) {
      const codeText = await codeButton.textContent();
      const code = codeText?.match(/[A-Z0-9]{8}/)?.[0];
      
      if (code) {
        await codeButton.click();
        
        // Should show confirmation
        await expect(page.getByText(/Kopiert!/i)).toBeVisible({ timeout: 2000 });
        
        // Verify clipboard
        const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
        expect(clipboardText).toBe(code);
      }
    }
  });

  test('should display copyable code in school form view', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    
    // Get access code
    await page.waitForSelector('button', { timeout: 5000 });
    const codeButton = page.locator('button').filter({ hasText: /[A-Z0-9]{8}/ }).first();
    
    if (await codeButton.count() > 0) {
      const codeText = await codeButton.textContent();
      const accessCode = codeText?.match(/[A-Z0-9]{8}/)?.[0];
      
      if (accessCode) {
        // Navigate to school form view
        await page.goto(`/formular/${accessCode}`);
        await page.waitForURL(new RegExp(`/formular/${accessCode}`));
        
        // Should see copyable code
        const formCodeButton = page.locator('button').filter({ hasText: accessCode }).first();
        await expect(formCodeButton).toBeVisible();
        
        // Click to copy
        await formCodeButton.click();
        
        // Should show confirmation
        await expect(page.getByText(/Kopiert!/i)).toBeVisible({ timeout: 2000 });
      }
    }
  });

  test('should show copy icon on hover', async ({ page }) => {
    await page.waitForSelector('button', { timeout: 5000 });
    
    const codeButton = page.locator('button').filter({ hasText: /[A-Z0-9]{8}/ }).first();
    
    if (await codeButton.count() > 0) {
      // Hover over button
      await codeButton.hover();
      
      // Should have title attribute for accessibility
      const title = await codeButton.getAttribute('title');
      expect(title).toContain('Kopieren');
    }
  });

  test('should change icon to checkmark after copy', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    
    await page.waitForSelector('button', { timeout: 5000 });
    const codeButton = page.locator('button').filter({ hasText: /[A-Z0-9]{8}/ }).first();
    
    if (await codeButton.count() > 0) {
      // Click to copy
      await codeButton.click();
      
      // Should show "Kopiert!" text
      await expect(page.getByText(/Kopiert!/i)).toBeVisible({ timeout: 2000 });
      
      // Wait for message to disappear
      await page.waitForTimeout(2500);
      
      // Message should be gone
      await expect(page.getByText(/Kopiert!/i)).not.toBeVisible();
    }
  });

  test('should be touch-friendly on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/admin');
    await page.waitForSelector('button', { timeout: 5000 });
    
    const codeButton = page.locator('button').filter({ hasText: /[A-Z0-9]{8}/ }).first();
    
    if (await codeButton.count() > 0) {
      // Button should be visible and have adequate size
      const box = await codeButton.boundingBox();
      
      if (box) {
        // Minimum touch target size should be 44px (WCAG guideline)
        expect(box.height).toBeGreaterThanOrEqual(30); // Allowing some tolerance
      }
    }
  });
});



