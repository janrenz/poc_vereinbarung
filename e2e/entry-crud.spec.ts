import { test, expect } from '@playwright/test';

test.describe('Entry CRUD Operations', () => {
  const testAccessCode = 'REAL9999'; // From seed data

  test('should navigate to new entry page', async ({ page }) => {
    await page.goto(`/formular/${testAccessCode}`);
    
    // Click "Neuer Eintrag" button
    await page.getByRole('link', { name: /Neuer Eintrag/i }).click();
    
    // Should be on new entry page
    await expect(page).toHaveURL(new RegExp(`/formular/${testAccessCode}/entry/new`));
    await expect(page.locator('text=Neuer Eintrag')).toBeVisible();
  });

  test('should create a new entry', async ({ page }) => {
    await page.goto(`/formular/${testAccessCode}/entry/new`);
    
    // Fill out the form
    await page.getByLabel(/Zielsetzungen/i).fill('Test Zielvereinbarung via E2E');
    await page.getByLabel(/Maßnahme/i).fill('Test Maßnahmen');
    await page.getByLabel(/Indikatoren/i).fill('Test Indikatoren');
    await page.getByLabel(/Verantwortlich/i).first().fill('Frau Test');
    await page.getByLabel(/Beteiligt/i).fill('Herr Test');
    
    // Select time period
    await page.selectOption('select[name="beginnSchuljahr"]', '2025/26');
    await page.selectOption('select[name="beginnHalbjahr"]', '1');
    await page.selectOption('select[name="endeSchuljahr"]', '2025/26');
    await page.selectOption('select[name="endeHalbjahr"]', '2');
    
    // Submit the form
    await page.getByRole('button', { name: /Speichern/i }).click();
    
    // Should redirect back to form overview
    await expect(page).toHaveURL(new RegExp(`/formular/${testAccessCode}$`));
    
    // Should see the new entry
    await expect(page.locator('text=Test Zielvereinbarung via E2E')).toBeVisible();
  });

  test('should display entry details', async ({ page }) => {
    await page.goto(`/formular/${testAccessCode}`);
    
    // Should show entries count
    await expect(page.locator('text=/Einträge \\(\\d+\\)/')).toBeVisible();
    
    // Should show entry content
    const entryCards = page.locator('[class*="border"][class*="rounded"]').filter({ hasText: 'Maßnahmen:' });
    const count = await entryCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should edit an existing entry', async ({ page }) => {
    await page.goto(`/formular/${testAccessCode}`);
    
    // Find and click first "Bearbeiten" button
    const editButton = page.getByRole('link', { name: /Bearbeiten/i }).first();
    await editButton.click();
    
    // Should be on edit page
    await expect(page).toHaveURL(new RegExp(`/formular/${testAccessCode}/entry/[a-z0-9]+`));
    await expect(page.locator('text=Eintrag bearbeiten')).toBeVisible();
    
    // Modify a field
    const zielsetzungenField = page.getByLabel(/Zielsetzungen/i);
    await zielsetzungenField.fill('Aktualisierte Zielvereinbarung E2E');
    
    // Save
    await page.getByRole('button', { name: /Speichern/i }).click();
    
    // Should redirect back
    await expect(page).toHaveURL(new RegExp(`/formular/${testAccessCode}$`));
    
    // Should see updated content
    await expect(page.locator('text=Aktualisierte Zielvereinbarung E2E')).toBeVisible();
  });

  test('should delete an entry', async ({ page }) => {
    // First create an entry to delete
    await page.goto(`/formular/${testAccessCode}/entry/new`);
    await page.getByLabel(/Zielsetzungen/i).fill('Entry to be deleted');
    await page.getByRole('button', { name: /Speichern/i }).click();
    
    await page.waitForURL(new RegExp(`/formular/${testAccessCode}$`));
    
    // Find and click the entry to edit
    await page.locator('text=Entry to be deleted').click();
    
    // Click delete button
    await page.getByRole('button', { name: /Löschen/i }).click();
    
    // Should redirect back to overview
    await expect(page).toHaveURL(new RegExp(`/formular/${testAccessCode}$`));
    
    // Entry should no longer be visible
    await expect(page.locator('text=Entry to be deleted')).not.toBeVisible();
  });

  test('should cancel entry creation', async ({ page }) => {
    await page.goto(`/formular/${testAccessCode}/entry/new`);
    
    // Fill some data
    await page.getByLabel(/Zielsetzungen/i).fill('This will be cancelled');
    
    // Click cancel
    await page.getByRole('link', { name: /Abbrechen/i }).click();
    
    // Should go back to overview
    await expect(page).toHaveURL(new RegExp(`/formular/${testAccessCode}$`));
    
    // Data should not be saved
    await expect(page.locator('text=This will be cancelled')).not.toBeVisible();
  });

  test('should show back navigation', async ({ page }) => {
    await page.goto(`/formular/${testAccessCode}/entry/new`);
    
    // Should have back link
    const backLink = page.getByRole('link', { name: /Zurück/i });
    await expect(backLink).toBeVisible();
    
    await backLink.click();
    await expect(page).toHaveURL(new RegExp(`/formular/${testAccessCode}$`));
  });

  test('should display school name in entry pages', async ({ page }) => {
    await page.goto(`/formular/${testAccessCode}/entry/new`);
    
    // Should show school name from seed data
    await expect(page.locator('text=/Realschule|am Park/')).toBeVisible();
  });

  test('should handle fortbildung radio buttons', async ({ page }) => {
    await page.goto(`/formular/${testAccessCode}/entry/new`);
    
    // By default "Nein" should be selected
    const neinRadio = page.getByRole('radio', { name: /Nein/i });
    await expect(neinRadio).toBeChecked();
    
    // Select "Ja"
    const jaRadio = page.getByRole('radio', { name: /Ja/i });
    await jaRadio.check();
    await expect(jaRadio).toBeChecked();
    
    // Fill fortbildung details
    await page.getByPlaceholder(/Methoden zur Leseförderung/i).fill('Digitalisierung');
    await page.getByPlaceholder(/gesamtes Kollegium/i).fill('IT-Beauftragter');
  });

  test('should validate time period selections', async ({ page }) => {
    await page.goto(`/formular/${testAccessCode}/entry/new`);
    
    // Select beginning
    await page.selectOption('select[name="beginnSchuljahr"]', '2024/25');
    await page.selectOption('select[name="beginnHalbjahr"]', '2');
    
    // Select end (should be able to select later period)
    await page.selectOption('select[name="endeSchuljahr"]', '2025/26');
    await page.selectOption('select[name="endeHalbjahr"]', '1');
    
    // Values should be set
    expect(await page.selectOption('select[name="beginnSchuljahr"]')).toEqual(['2024/25']);
    expect(await page.selectOption('select[name="endeSchuljahr"]')).toEqual(['2025/26']);
  });
});

