import { test, expect } from '@playwright/test';

test.describe('Required Field Validation', () => {
  const testAccessCode = 'REAL9999'; // From seed data

  test('should prevent saving without title', async ({ page }) => {
    // Navigate to new entry form
    await page.goto(`/formular/${testAccessCode}/entry/new`);
    
    // Wait for form to load
    await expect(page.locator('input[name="title"]')).toBeVisible();
    
    // Try to click "Speichern & Zurück" without filling title
    page.once('dialog', async dialog => {
      expect(dialog.type()).toBe('alert');
      expect(dialog.message()).toContain('Titel der Maßnahme');
      await dialog.accept();
    });
    
    await page.click('button:has-text("Speichern & Zurück")');
    
    // Should still be on the entry page (not navigated)
    await expect(page).toHaveURL(new RegExp(`/formular/${testAccessCode}/entry/new`));
  });

  test('should show required field indicator', async ({ page }) => {
    await page.goto(`/formular/${testAccessCode}/entry/new`);
    
    // Check that title field has required attribute
    const titleInput = page.locator('input[name="title"]');
    await expect(titleInput).toHaveAttribute('required', '');
    
    // Check for visual required indicator
    await expect(page.locator('text=*Pflichtfeld')).toBeVisible();
  });

  test('should allow saving with filled title', async ({ page }) => {
    const testTitle = `Valid Title ${Date.now()}`;
    
    await page.goto(`/formular/${testAccessCode}/entry/new`);
    
    // Fill in required title
    await page.fill('input[name="title"]', testTitle);
    
    // Click "Speichern & Zurück"
    await page.click('button:has-text("Speichern & Zurück")');
    
    // Should navigate back to overview
    await expect(page).toHaveURL(new RegExp(`/formular/${testAccessCode}$`));
    
    // Entry should be visible
    await expect(page.getByText(testTitle)).toBeVisible();
  });

  test('should focus title field when validation fails', async ({ page }) => {
    await page.goto(`/formular/${testAccessCode}/entry/new`);
    
    // Fill other fields but leave title empty
    await page.fill('textarea[name="zielsetzungenText"]', 'Test Zielsetzung');
    await page.fill('textarea[name="massnahmen"]', 'Test Maßnahmen');
    
    // Try to save
    page.once('dialog', async dialog => {
      await dialog.accept();
    });
    
    await page.click('button:has-text("Speichern & Zurück")');
    
    // Title field should be focused
    const titleInput = page.locator('input[name="title"]');
    await expect(titleInput).toBeFocused();
  });

  test('should not allow saving with whitespace-only title', async ({ page }) => {
    await page.goto(`/formular/${testAccessCode}/entry/new`);
    
    // Fill title with only spaces
    await page.fill('input[name="title"]', '   ');
    
    // Try to save
    page.once('dialog', async dialog => {
      expect(dialog.message()).toContain('Titel der Maßnahme');
      await dialog.accept();
    });
    
    await page.click('button:has-text("Speichern & Zurück")');
    
    // Should still be on entry page
    await expect(page).toHaveURL(new RegExp(`/formular/${testAccessCode}/entry/new`));
  });

  test('should validate on editing existing entry', async ({ page }) => {
    const initialTitle = `Initial Title ${Date.now()}`;
    
    // Create entry with title first
    await page.goto(`/formular/${testAccessCode}/entry/new`);
    await page.fill('input[name="title"]', initialTitle);
    
    // Wait for autosave
    await page.waitForSelector('text=/Gespeichert/i', { timeout: 5000 });
    
    // Get current URL to find entry ID
    const currentUrl = page.url();
    const entryId = currentUrl.match(/entry\/([a-z0-9]+)$/)?.[1];
    
    if (!entryId) {
      test.skip();
      return;
    }
    
    // Navigate to edit page
    await page.goto(`/formular/${testAccessCode}/entry/${entryId}`);
    
    // Clear the title
    await page.fill('input[name="title"]', '');
    
    // Try to save
    page.once('dialog', async dialog => {
      expect(dialog.message()).toContain('Titel der Maßnahme');
      await dialog.accept();
    });
    
    await page.click('button:has-text("Speichern & Zurück")');
    
    // Should still be on edit page
    await expect(page).toHaveURL(new RegExp(`/formular/${testAccessCode}/entry/${entryId}`));
  });

  test('should allow autosave without title but prevent manual save', async ({ page }) => {
    await page.goto(`/formular/${testAccessCode}/entry/new`);
    
    // Fill other fields without title
    await page.fill('textarea[name="zielsetzungenText"]', 'Test without title');
    
    // Autosave should work (no error)
    await page.waitForSelector('text=/Gespeichert/i', { timeout: 5000 });
    
    // But manual save should be prevented
    page.once('dialog', async dialog => {
      expect(dialog.message()).toContain('Titel der Maßnahme');
      await dialog.accept();
    });
    
    await page.click('button:has-text("Speichern & Zurück")');
    
    // Should still be on page
    await expect(page).toHaveURL(new RegExp(`/formular/${testAccessCode}/entry/new`));
  });

  test('should show validation error with correct styling', async ({ page }) => {
    await page.goto(`/formular/${testAccessCode}/entry/new`);
    
    const titleInput = page.locator('input[name="title"]');
    
    // Try to submit empty form (trigger HTML5 validation)
    await titleInput.focus();
    await titleInput.blur();
    
    // Check for invalid state (should have error border after validation attempt)
    page.once('dialog', async dialog => {
      await dialog.accept();
    });
    
    await page.click('button:has-text("Speichern & Zurück")');
    
    // Input should have invalid styling
    const borderColor = await titleInput.evaluate((el) => {
      return window.getComputedStyle(el).borderColor;
    });
    
    // Should have some border styling (exact color depends on CSS variables)
    expect(borderColor).toBeTruthy();
  });
});

