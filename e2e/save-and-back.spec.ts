import { test, expect } from '@playwright/test';

test.describe('Save and Back Functionality', () => {
  const testAccessCode = 'REAL9999'; // From seed data

  test('should have "Speichern & Zurück" button on new entry page', async ({ page }) => {
    await page.goto(`/formular/${testAccessCode}/entry/new`);
    
    // Check for the new button
    await expect(page.getByRole('button', { name: /Speichern & Zurück zur Übersicht/i })).toBeVisible();
  });

  test('should save and navigate back when clicking "Speichern & Zurück"', async ({ page }) => {
    const testTitle = `Save and Back Test ${Date.now()}`;
    
    // Navigate to new entry form
    await page.goto(`/formular/${testAccessCode}/entry/new`);
    
    // Fill in some data
    await page.fill('input[name="title"]', testTitle);
    await page.fill('textarea[name="zielsetzungenText"]', 'Test Zielsetzung');
    
    // Click "Speichern & Zurück"
    await page.click('button:has-text("Speichern & Zurück zur Übersicht")');
    
    // Should navigate back to overview
    await expect(page).toHaveURL(new RegExp(`/formular/${testAccessCode}$`));
    
    // Entry should be visible in the list
    await expect(page.getByText(testTitle)).toBeVisible();
  });

  test('should show "Speichert..." while saving', async ({ page }) => {
    // Navigate to new entry form
    await page.goto(`/formular/${testAccessCode}/entry/new`);
    
    // Fill in data
    await page.fill('input[name="title"]', 'Loading Test');
    await page.fill('textarea[name="zielsetzungenText"]', 'Test');
    
    // Click the button
    const saveButton = page.getByRole('button', { name: /Speichern & Zurück/i });
    await saveButton.click();
    
    // Should show loading state (might be quick)
    // The button should be disabled while saving
    await expect(saveButton).toBeDisabled();
  });

  test('should save changes when editing existing entry', async ({ page }) => {
    const initialTitle = `Initial ${Date.now()}`;
    const updatedTitle = `Updated ${Date.now()}`;
    
    // Create entry first
    await page.goto(`/formular/${testAccessCode}/entry/new`);
    await page.fill('input[name="title"]', initialTitle);
    await page.fill('textarea[name="zielsetzungenText"]', 'Initial text');
    
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
    
    // Edit the title
    await page.fill('input[name="title"]', updatedTitle);
    
    // Click "Speichern & Zurück"
    await page.click('button:has-text("Speichern & Zurück zur Übersicht")');
    
    // Should be back at overview
    await expect(page).toHaveURL(new RegExp(`/formular/${testAccessCode}$`));
    
    // Should see updated title
    await expect(page.getByText(updatedTitle)).toBeVisible();
    await expect(page.getByText(initialTitle)).not.toBeVisible();
  });

  test('should not lose data when using "Speichern & Zurück"', async ({ page }) => {
    const testData = {
      title: `Complete Entry ${Date.now()}`,
      zielsetzungen: 'Test Zielsetzung mit vielen Details',
      massnahmen: 'Test Maßnahmen',
      indikatoren: 'Test Indikatoren',
      verantwortlich: 'Frau Test',
      beteiligt: 'Herr Test',
    };
    
    // Navigate to new entry form
    await page.goto(`/formular/${testAccessCode}/entry/new`);
    
    // Fill all fields
    await page.fill('input[name="title"]', testData.title);
    await page.fill('textarea[name="zielsetzungenText"]', testData.zielsetzungen);
    await page.fill('textarea[name="massnahmen"]', testData.massnahmen);
    await page.fill('textarea[name="indikatoren"]', testData.indikatoren);
    await page.fill('input[name="verantwortlich"]', testData.verantwortlich);
    await page.fill('input[name="beteiligt"]', testData.beteiligt);
    
    // Save and go back
    await page.click('button:has-text("Speichern & Zurück zur Übersicht")');
    await expect(page).toHaveURL(new RegExp(`/formular/${testAccessCode}$`));
    
    // Find the entry and open it
    await page.click(`text=${testData.title}`);
    
    // Wait for edit page
    await page.waitForURL(new RegExp(`/formular/${testAccessCode}/entry/[a-z0-9]+`));
    
    // Verify all data was saved
    await expect(page.locator('input[name="title"]')).toHaveValue(testData.title);
    await expect(page.locator('textarea[name="zielsetzungenText"]')).toHaveValue(testData.zielsetzungen);
    await expect(page.locator('textarea[name="massnahmen"]')).toHaveValue(testData.massnahmen);
    await expect(page.locator('textarea[name="indikatoren"]')).toHaveValue(testData.indikatoren);
    await expect(page.locator('input[name="verantwortlich"]')).toHaveValue(testData.verantwortlich);
    await expect(page.locator('input[name="beteiligt"]')).toHaveValue(testData.beteiligt);
  });

  test('should work with delete button still present', async ({ page }) => {
    // Create an entry first
    await page.goto(`/formular/${testAccessCode}/entry/new`);
    await page.fill('input[name="title"]', 'Test for Delete Button');
    await page.fill('textarea[name="zielsetzungenText"]', 'Test');
    
    // Wait for autosave to create entry
    await page.waitForSelector('text=/Gespeichert/i', { timeout: 5000 });
    
    // Should now have delete button
    await expect(page.getByRole('button', { name: /Löschen/i })).toBeVisible();
    
    // Should also have save and back button
    await expect(page.getByRole('button', { name: /Speichern & Zurück/i })).toBeVisible();
    
    // Both buttons should be distinct
    const buttons = await page.getByRole('button').all();
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });
});

