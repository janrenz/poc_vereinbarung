import { test, expect } from '@playwright/test';

test.describe('Autosave Functionality', () => {
  test('should display autosave indicator on entry form', async ({ page }) => {
    // Navigate to formular page
    await page.goto('/formular');
    
    // Enter a test access code
    // First, create a form as admin
    await page.goto('/login');
    await page.fill('input[name="email"]', 'schulaufsicht@example.com');
    await page.fill('input[name="password"]', 'schulaufsicht123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');
    
    // Get first form's access code
    await page.waitForSelector('a[href^="/admin/forms/"]', { timeout: 5000 });
    const firstFormCard = page.locator('a[href^="/admin/forms/"]').first();
    const codeText = await firstFormCard.locator('text=/Code: /').textContent();
    const accessCode = codeText?.match(/Code: ([A-Z0-9]+)/)?.[1];
    
    if (!accessCode) {
      test.skip();
      return;
    }
    
    // Navigate to school form with access code
    await page.goto(`/formular/${accessCode}`);
    await expect(page).toHaveURL(new RegExp(`/formular/${accessCode}`));
    
    // Click "Neuer Eintrag"
    await page.click('a:has-text("Neuer Eintrag")');
    await page.waitForURL(new RegExp(`/formular/${accessCode}/entry/new`));
    
    // Should see autosave indicator
    await expect(page.getByText(/Automatisches Speichern aktiviert/i)).toBeVisible();
  });

  test('should show saving status when typing', async ({ page }) => {
    // Setup: Login and navigate to a form entry
    await page.goto('/login');
    await page.fill('input[name="email"]', 'schulaufsicht@example.com');
    await page.fill('input[name="password"]', 'schulaufsicht123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');
    
    // Get access code
    await page.waitForSelector('a[href^="/admin/forms/"]', { timeout: 5000 });
    const firstFormCard = page.locator('a[href^="/admin/forms/"]').first();
    const codeText = await firstFormCard.locator('text=/Code: /').textContent();
    const accessCode = codeText?.match(/Code: ([A-Z0-9]+)/)?.[1];
    
    if (!accessCode) {
      test.skip();
      return;
    }
    
    // Navigate to new entry form
    await page.goto(`/formular/${accessCode}/entry/new`);
    
    // Type in the goal text field
    const goalInput = page.locator('textarea[name="zielsetzungenText"]').first();
    await goalInput.fill('Test Zielvereinbarung für Autosave');
    
    // Should show "Speichert..." indicator after typing
    await page.waitForSelector('text=/Speichert/i', { timeout: 3000 });
    await expect(page.getByText(/Speichert/i)).toBeVisible();
    
    // Wait a bit and should show "Gespeichert"
    await page.waitForSelector('text=/Gespeichert/i', { timeout: 5000 });
    await expect(page.getByText(/Gespeichert/i)).toBeVisible();
  });

  test('should autosave when editing existing entry', async ({ page }) => {
    // Setup: Login and navigate to an existing entry
    await page.goto('/login');
    await page.fill('input[name="email"]', 'schulaufsicht@example.com');
    await page.fill('input[name="password"]', 'schulaufsicht123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');
    
    // Get access code
    await page.waitForSelector('a[href^="/admin/forms/"]', { timeout: 5000 });
    const firstFormCard = page.locator('a[href^="/admin/forms/"]').first();
    await firstFormCard.click();
    
    // Get the access code from the detail page
    const codeElement = page.locator('text=/Zugangscode/i').first();
    const accessCode = await codeElement.evaluate((el) => {
      const text = el.textContent || '';
      return text.split(':')[1]?.trim();
    });
    
    if (!accessCode) {
      test.skip();
      return;
    }
    
    // Navigate to form
    await page.goto(`/formular/${accessCode}`);
    
    // Check if there are entries
    const entryCount = await page.locator('a:has-text("Bearbeiten")').count();
    
    if (entryCount === 0) {
      // Create a new entry first
      await page.click('a:has-text("Neuer Eintrag")');
      await page.waitForURL(new RegExp(`/formular/${accessCode}/entry/new`));
      
      const goalInput = page.locator('textarea[name="zielsetzungenText"]').first();
      await goalInput.fill('Initial Test Entry');
      
      // Wait for autosave
      await page.waitForSelector('text=/Gespeichert/i', { timeout: 5000 });
      
      // Go back
      await page.goto(`/formular/${accessCode}`);
    }
    
    // Click on first entry to edit
    await page.locator('a:has-text("Bearbeiten")').first().click();
    await page.waitForURL(new RegExp(`/formular/${accessCode}/entry/`));
    
    // Should see autosave indicator
    await expect(page.getByText(/Automatisches Speichern aktiviert/i)).toBeVisible();
    
    // Edit the goal text
    const goalInput = page.locator('textarea[name="zielsetzungenText"]').first();
    await goalInput.fill(`Updated at ${new Date().toISOString()}`);
    
    // Should autosave
    await page.waitForSelector('text=/Gespeichert/i', { timeout: 5000 });
    await expect(page.getByText(/Gespeichert/i)).toBeVisible();
  });

  test('should show last saved time', async ({ page }) => {
    // Setup
    await page.goto('/login');
    await page.fill('input[name="email"]', 'schulaufsicht@example.com');
    await page.fill('input[name="password"]', 'schulaufsicht123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');
    
    await page.waitForSelector('a[href^="/admin/forms/"]', { timeout: 5000 });
    const firstFormCard = page.locator('a[href^="/admin/forms/"]').first();
    const codeText = await firstFormCard.locator('text=/Code: /').textContent();
    const accessCode = codeText?.match(/Code: ([A-Z0-9]+)/)?.[1];
    
    if (!accessCode) {
      test.skip();
      return;
    }
    
    // Navigate to new entry
    await page.goto(`/formular/${accessCode}/entry/new`);
    
    // Type something
    const goalInput = page.locator('textarea[name="zielsetzungenText"]').first();
    await goalInput.fill('Testing timestamp');
    
    // Wait for save
    await page.waitForSelector('text=/Gespeichert um/i', { timeout: 5000 });
    
    // Should show timestamp
    const savedText = await page.locator('text=/Gespeichert um/i').textContent();
    expect(savedText).toMatch(/\d{2}:\d{2}/); // Should contain time like "14:30"
  });

  test('should preserve data after autosave on page reload', async ({ page }) => {
    const testText = `Autosave Test ${Date.now()}`;
    
    // Setup
    await page.goto('/login');
    await page.fill('input[name="email"]', 'schulaufsicht@example.com');
    await page.fill('input[name="password"]', 'schulaufsicht123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');
    
    await page.waitForSelector('a[href^="/admin/forms/"]', { timeout: 5000 });
    const firstFormCard = page.locator('a[href^="/admin/forms/"]').first();
    const codeText = await firstFormCard.locator('text=/Code: /').textContent();
    const accessCode = codeText?.match(/Code: ([A-Z0-9]+)/)?.[1];
    
    if (!accessCode) {
      test.skip();
      return;
    }
    
    // Create new entry
    await page.goto(`/formular/${accessCode}/entry/new`);
    
    // Fill in data
    const goalInput = page.locator('textarea[name="zielsetzungenText"]').first();
    await goalInput.fill(testText);
    
    // Wait for autosave
    await page.waitForSelector('text=/Gespeichert/i', { timeout: 5000 });
    
    // Reload the page
    await page.reload();
    
    // Go back to form overview
    await page.goto(`/formular/${accessCode}`);
    
    // Should see the entry in the list
    await expect(page.getByText(testText).first()).toBeVisible();
  });
});

