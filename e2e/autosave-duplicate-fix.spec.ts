import { test, expect } from '@playwright/test';

test.describe('Autosave Duplicate Prevention & Sorting', () => {
  test.beforeEach(async ({ page }) => {
    // Login and get access code
    await page.goto('/login');
    await page.fill('input[name="email"]', 'schulaufsicht@example.com');
    await page.fill('input[name="password"]', 'schulaufsicht123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');
  });

  test('should not create duplicate entries when autosaving', async ({ page }) => {
    // Get access code
    await page.waitForSelector('a[href^="/admin/forms/"]', { timeout: 5000 });
    const firstFormCard = page.locator('a[href^="/admin/forms/"]').first();
    const codeText = await firstFormCard.locator('text=/Code: /').textContent();
    const accessCode = codeText?.match(/Code: ([A-Z0-9]+)/)?.[1];
    
    if (!accessCode) {
      test.skip();
      return;
    }

    // Count initial entries
    await page.goto(`/formular/${accessCode}`);
    const initialCountElement = page.locator('h2:has-text("Einträge")');
    const initialCount = await initialCountElement.textContent();
    const initialNumber = parseInt(initialCount?.match(/\d+/)?.[0] || '0');

    // Create new entry
    await page.click('a:has-text("Neuer Eintrag")');
    await page.waitForURL(new RegExp(`/formular/${accessCode}/entry/new`));
    
    const uniqueTitle = `No Duplicate Test ${Date.now()}`;
    await page.fill('textarea[name="zielsetzungenText"]', uniqueTitle);
    
    // Wait for first autosave
    await page.waitForSelector('text=/Gespeichert/i', { timeout: 5000 });
    
    // Type more to trigger additional autosaves
    await page.fill('textarea[name="massnahmen"]', 'Additional content to trigger more saves');
    await page.waitForSelector('text=/Gespeichert/i', { timeout: 5000 });
    
    // Go back to overview
    await page.goto(`/formular/${accessCode}`);
    
    // Count entries again
    const finalCountElement = page.locator('h2:has-text("Einträge")');
    const finalCount = await finalCountElement.textContent();
    const finalNumber = parseInt(finalCount?.match(/\d+/)?.[0] || '0');
    
    // Should only have created ONE new entry
    expect(finalNumber).toBe(initialNumber + 1);
    
    // Should see the entry title only once in the list
    const titleMatches = await page.locator(`text="${uniqueTitle}"`).count();
    expect(titleMatches).toBeLessThanOrEqual(2); // One in nav, one in list
  });

  test('should display sort controls', async ({ page }) => {
    // Get access code
    await page.waitForSelector('a[href^="/admin/forms/"]', { timeout: 5000 });
    const firstFormCard = page.locator('a[href^="/admin/forms/"]').first();
    const codeText = await firstFormCard.locator('text=/Code: /').textContent();
    const accessCode = codeText?.match(/Code: ([A-Z0-9]+)/)?.[1];
    
    if (!accessCode) {
      test.skip();
      return;
    }

    await page.goto(`/formular/${accessCode}`);
    
    // Should see sort controls
    await expect(page.getByText(/Sortieren nach/i)).toBeVisible();
    await expect(page.locator('button:has-text("Erstellungsdatum")')).toBeVisible();
    await expect(page.locator('button:has-text("Titel")')).toBeVisible();
    await expect(page.locator('button:has-text("Zeitplan")')).toBeVisible();
  });

  test('should sort entries by title', async ({ page }) => {
    // Get access code
    await page.waitForSelector('a[href^="/admin/forms/"]', { timeout: 5000 });
    const firstFormCard = page.locator('a[href^="/admin/forms/"]').first();
    const codeText = await firstFormCard.locator('text=/Code: /').textContent();
    const accessCode = codeText?.match(/Code: ([A-Z0-9]+)/)?.[1];
    
    if (!accessCode) {
      test.skip();
      return;
    }

    // Create multiple entries with different titles
    const titles = [
      `Z Sort Last ${Date.now()}`,
      `A Sort First ${Date.now()}`,
      `M Sort Middle ${Date.now()}`,
    ];

    for (const title of titles) {
      await page.goto(`/formular/${accessCode}/entry/new`);
      await page.fill('textarea[name="zielsetzungenText"]', title);
      await page.waitForSelector('text=/Gespeichert/i', { timeout: 5000 });
    }

    // Go to overview and sort by title
    await page.goto(`/formular/${accessCode}`);
    await page.click('button:has-text("Titel")');
    
    // Wait for re-render
    await page.waitForTimeout(500);
    
    // Get all entry titles
    const entryTitles = await page.locator('.font-semibold.text-\\[var\\(--md-sys-color-on-surface\\)\\].mb-2').allTextContents();
    
    // Filter to only our test entries
    const testEntryTitles = entryTitles.filter(t => t.includes('Sort'));
    
    // Check if sorted alphabetically
    if (testEntryTitles.length >= 2) {
      const isSorted = testEntryTitles[0] < testEntryTitles[1];
      expect(isSorted).toBe(true);
    }
  });

  test('should sort entries by timeline', async ({ page }) => {
    // Get access code
    await page.waitForSelector('a[href^="/admin/forms/"]', { timeout: 5000 });
    const firstFormCard = page.locator('a[href^="/admin/forms/"]').first();
    const codeText = await firstFormCard.locator('text=/Code: /').textContent();
    const accessCode = codeText?.match(/Code: ([A-Z0-9]+)/)?.[1];
    
    if (!accessCode) {
      test.skip();
      return;
    }

    // Create entries with different timelines
    const entries = [
      { title: `Timeline Late ${Date.now()}`, year: '2026/27', half: '2' },
      { title: `Timeline Early ${Date.now()}`, year: '2024/25', half: '1' },
    ];

    for (const entry of entries) {
      await page.goto(`/formular/${accessCode}/entry/new`);
      await page.fill('textarea[name="zielsetzungenText"]', entry.title);
      await page.selectOption('select[name="beginnSchuljahr"]', entry.year);
      await page.selectOption('select[name="beginnHalbjahr"]', entry.half);
      await page.waitForSelector('text=/Gespeichert/i', { timeout: 5000 });
    }

    // Go to overview and sort by timeline
    await page.goto(`/formular/${accessCode}`);
    await page.click('button:has-text("Zeitplan")');
    
    // Wait for re-render
    await page.waitForTimeout(500);
    
    // Get all entry titles
    const entryTitles = await page.locator('.font-semibold.text-\\[var\\(--md-sys-color-on-surface\\)\\].mb-2').allTextContents();
    
    // Filter to only our test entries
    const testEntryTitles = entryTitles.filter(t => t.includes('Timeline'));
    
    // The "Early" entry should come before "Late" when sorted by timeline
    if (testEntryTitles.length >= 2) {
      const earlyIndex = testEntryTitles.findIndex(t => t.includes('Early'));
      const lateIndex = testEntryTitles.findIndex(t => t.includes('Late'));
      
      if (earlyIndex !== -1 && lateIndex !== -1) {
        expect(earlyIndex).toBeLessThan(lateIndex);
      }
    }
  });

  test('should toggle sort direction', async ({ page }) => {
    // Get access code
    await page.waitForSelector('a[href^="/admin/forms/"]', { timeout: 5000 });
    const firstFormCard = page.locator('a[href^="/admin/forms/"]').first();
    const codeText = await firstFormCard.locator('text=/Code: /').textContent();
    const accessCode = codeText?.match(/Code: ([A-Z0-9]+)/)?.[1];
    
    if (!accessCode) {
      test.skip();
      return;
    }

    await page.goto(`/formular/${accessCode}`);
    
    // Click title sort button
    const titleButton = page.locator('button:has-text("Titel")');
    await titleButton.click();
    
    // Should show active state
    await expect(titleButton).toHaveClass(/bg-\[var\(--md-sys-color-primary-container\)\]/);
    
    // Click again to toggle direction
    await titleButton.click();
    
    // Should still be active
    await expect(titleButton).toHaveClass(/bg-\[var\(--md-sys-color-primary-container\)\]/);
  });

  test('should update URL after first autosave of new entry', async ({ page }) => {
    // Get access code
    await page.waitForSelector('a[href^="/admin/forms/"]', { timeout: 5000 });
    const firstFormCard = page.locator('a[href^="/admin/forms/"]').first();
    const codeText = await firstFormCard.locator('text=/Code: /').textContent();
    const accessCode = codeText?.match(/Code: ([A-Z0-9]+)/)?.[1];
    
    if (!accessCode) {
      test.skip();
      return;
    }

    // Go to new entry page
    await page.goto(`/formular/${accessCode}/entry/new`);
    
    // Verify we're on the "new" URL
    expect(page.url()).toContain('/entry/new');
    
    // Fill in data
    await page.fill('textarea[name="zielsetzungenText"]', `URL Update Test ${Date.now()}`);
    
    // Wait for autosave
    await page.waitForSelector('text=/Gespeichert/i', { timeout: 5000 });
    
    // URL should have changed from /new to /[id]
    await page.waitForTimeout(500);
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/entry/new');
    expect(currentUrl).toMatch(/\/entry\/[a-z0-9]+$/);
  });

  test('should show created date for entries', async ({ page }) => {
    // Get access code
    await page.waitForSelector('a[href^="/admin/forms/"]', { timeout: 5000 });
    const firstFormCard = page.locator('a[href^="/admin/forms/"]').first();
    const codeText = await firstFormCard.locator('text=/Code: /').textContent();
    const accessCode = codeText?.match(/Code: ([A-Z0-9]+)/)?.[1];
    
    if (!accessCode) {
      test.skip();
      return;
    }

    await page.goto(`/formular/${accessCode}`);
    
    // Check if there are entries
    const entryCountElement = page.locator('h2:has-text("Einträge")');
    const entryCount = await entryCountElement.textContent();
    const number = parseInt(entryCount?.match(/\d+/)?.[0] || '0');
    
    if (number > 0) {
      // Should show "Erstellt:" label
      await expect(page.getByText(/Erstellt:/i).first()).toBeVisible();
    }
  });
});

