import { test, expect } from '@playwright/test';

test.describe('Entry Title Functionality', () => {
  const testAccessCode = 'REAL9999'; // From seed data

  test('should save entry title when creating new entry', async ({ page }) => {
    const testTitle = `Leseförderung Test ${Date.now()}`;
    
    // Navigate to new entry form
    await page.goto(`/formular/${testAccessCode}/entry/new`);
    
    // Fill in the title
    await page.fill('input[name="title"]', testTitle);
    
    // Fill some other required fields
    await page.fill('textarea[name="zielsetzungenText"]', 'Test Zielsetzung');
    
    // Wait for autosave
    await page.waitForSelector('text=/Gespeichert/i', { timeout: 5000 });
    
    // Navigate back to form overview
    await page.goto(`/formular/${testAccessCode}`);
    
    // The title should be visible in the entry list
    await expect(page.getByText(testTitle)).toBeVisible();
  });

  test('should autosave title changes', async ({ page }) => {
    const initialTitle = `Initial Title ${Date.now()}`;
    const updatedTitle = `Updated Title ${Date.now()}`;
    
    // Create new entry with initial title
    await page.goto(`/formular/${testAccessCode}/entry/new`);
    await page.fill('input[name="title"]', initialTitle);
    await page.fill('textarea[name="zielsetzungenText"]', 'Test Zielsetzung');
    
    // Wait for autosave
    await page.waitForSelector('text=/Gespeichert/i', { timeout: 5000 });
    
    // Update the title
    await page.fill('input[name="title"]', updatedTitle);
    
    // Wait for autosave of the updated title
    await page.waitForSelector('text=/Gespeichert/i', { timeout: 5000 });
    
    // Navigate back to form overview
    await page.goto(`/formular/${testAccessCode}`);
    
    // Should see updated title, not initial title
    await expect(page.getByText(updatedTitle)).toBeVisible();
    await expect(page.getByText(initialTitle)).not.toBeVisible();
  });

  test('should load saved title when editing entry', async ({ page }) => {
    const testTitle = `Edit Test Title ${Date.now()}`;
    
    // Create new entry
    await page.goto(`/formular/${testAccessCode}/entry/new`);
    await page.fill('input[name="title"]', testTitle);
    await page.fill('textarea[name="zielsetzungenText"]', 'Test Zielsetzung');
    
    // Wait for autosave
    await page.waitForSelector('text=/Gespeichert/i', { timeout: 5000 });
    
    // Go back to overview
    await page.goto(`/formular/${testAccessCode}`);
    
    // Find and click the entry to edit
    const entryCard = page.locator('text=' + testTitle).locator('..').locator('..');
    await entryCard.getByRole('link', { name: /Bearbeiten/i }).click();
    
    // Wait for edit page to load
    await page.waitForURL(new RegExp(`/formular/${testAccessCode}/entry/[a-z0-9]+`));
    
    // Check if title field is populated with saved value
    const titleInput = page.locator('input[name="title"]');
    await expect(titleInput).toHaveValue(testTitle);
  });

  test('should display title as heading in entry card', async ({ page }) => {
    const testTitle = `Card Title Test ${Date.now()}`;
    
    // Create new entry
    await page.goto(`/formular/${testAccessCode}/entry/new`);
    await page.fill('input[name="title"]', testTitle);
    await page.fill('textarea[name="zielsetzungenText"]', 'Test Zielsetzung');
    
    // Wait for autosave
    await page.waitForSelector('text=/Gespeichert/i', { timeout: 5000 });
    
    // Navigate back
    await page.goto(`/formular/${testAccessCode}`);
    
    // Title should be visible as a heading
    await expect(page.getByText(testTitle)).toBeVisible();
  });

  test('should persist title after page reload', async ({ page }) => {
    const testTitle = `Persistence Test ${Date.now()}`;
    
    // Create new entry
    await page.goto(`/formular/${testAccessCode}/entry/new`);
    await page.fill('input[name="title"]', testTitle);
    await page.fill('textarea[name="zielsetzungenText"]', 'Test Zielsetzung');
    
    // Wait for autosave
    await page.waitForSelector('text=/Gespeichert/i', { timeout: 5000 });
    
    // Get current URL
    const currentUrl = page.url();
    
    // Reload the page
    await page.reload();
    
    // Title should still be there
    const titleInput = page.locator('input[name="title"]');
    await expect(titleInput).toHaveValue(testTitle);
    
    // Navigate to overview
    await page.goto(`/formular/${testAccessCode}`);
    
    // Title should be in the list
    await expect(page.getByText(testTitle)).toBeVisible();
  });

  test('should require title field', async ({ page }) => {
    // Navigate to new entry form
    await page.goto(`/formular/${testAccessCode}/entry/new`);
    
    // Check if title field has required attribute
    const titleInput = page.locator('input[name="title"]');
    await expect(titleInput).toHaveAttribute('required', '');
  });

  test('should show title placeholder', async ({ page }) => {
    // Navigate to new entry form
    await page.goto(`/formular/${testAccessCode}/entry/new`);
    
    // Check if title field has a helpful placeholder
    const titleInput = page.locator('input[name="title"]');
    const placeholder = await titleInput.getAttribute('placeholder');
    
    expect(placeholder).toBeTruthy();
    expect(placeholder?.length).toBeGreaterThan(0);
  });
});

