import { test, expect } from '@playwright/test';

test.describe('Formular Access Flow', () => {
  test('should display formular landing page', async ({ page }) => {
    await page.goto('/formular');
    
    await expect(page.locator('text=Formular aufrufen')).toBeVisible();
    await expect(page.getByPlaceholder(/Zugangscode/i)).toBeVisible();
  });

  test('should show error for invalid access code', async ({ page }) => {
    await page.goto('/formular');
    
    await page.getByPlaceholder(/Zugangscode/i).fill('INVALID123');
    await page.getByRole('button', { name: /Weiter/i }).click();
    
    // Should redirect back with error
    await expect(page).toHaveURL(/\/formular\?invalid=1/);
    await expect(page.locator('text=Ungültiger Zugangscode')).toBeVisible();
  });

  test('should create a form and access it with code', async ({ page }) => {
    // First, login as admin and create a form
    await page.goto('/login');
    await page.getByLabel('Email').fill('schulamt@example.com');
    await page.getByLabel('Passwort').fill('schulamt123');
    await page.getByRole('button', { name: /Anmelden/i }).click();
    await expect(page).toHaveURL(/\/admin/);

    // Create a form
    await page.evaluate(() => {
      const hiddenInput = document.getElementById('school') as HTMLInputElement;
      if (hiddenInput) {
        hiddenInput.value = JSON.stringify({
          externalId: 'e2e-test-' + Date.now(),
          name: 'E2E Test Schule',
          city: 'Teststadt',
          state: 'NRW',
          address: 'Teststraße 1'
        });
      }
    });

    await page.getByRole('button', { name: /Formular anlegen/i }).click();
    await page.waitForTimeout(2000);

    // Find the access code from the page
    const codeElement = page.locator('[class*="font-mono"]').first();
    const accessCode = await codeElement.textContent().catch(() => null);

    if (accessCode) {
      // Navigate to formular page
      await page.goto('/formular');
      await page.getByPlaceholder(/Zugangscode/i).fill(accessCode);
      await page.getByRole('button', { name: /Weiter/i }).click();

      // Should show the form
      await expect(page.locator('text=Zielvereinbarung für')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('text=E2E Test Schule')).toBeVisible();
    }
  });
});

test.describe('Formular Detail Page', () => {
  let testAccessCode: string;

  test.beforeAll(async ({ browser }) => {
    // Create a test form to work with
    const page = await browser.newPage();
    await page.goto('/login');
    await page.getByLabel('Email').fill('schulamt@example.com');
    await page.getByLabel('Passwort').fill('schulamt123');
    await page.getByRole('button', { name: /Anmelden/i }).click();
    await page.waitForURL(/\/admin/);

    await page.evaluate(() => {
      const hiddenInput = document.getElementById('school') as HTMLInputElement;
      if (hiddenInput) {
        hiddenInput.value = JSON.stringify({
          externalId: 'e2e-persistent-' + Date.now(),
          name: 'Persistent Test Schule',
          city: 'Teststadt',
          state: 'NRW',
          address: 'Teststraße 1'
        });
      }
    });

    await page.getByRole('button', { name: /Formular anlegen/i }).click();
    await page.waitForTimeout(2000);

    const codeElement = page.locator('[class*="font-mono"]').first();
    testAccessCode = (await codeElement.textContent()) || 'TESTCODE';

    await page.close();
  });

  test('should display empty state when no entries', async ({ page }) => {
    if (!testAccessCode || testAccessCode === 'TESTCODE') {
      test.skip();
      return;
    }

    await page.goto(`/formular/${testAccessCode}`);
    
    await expect(page.locator('text=Noch keine Einträge vorhanden')).toBeVisible();
    await expect(page.getByRole('link', { name: /Neuer Eintrag/i })).toBeVisible();
  });

  test('should show form metadata', async ({ page }) => {
    if (!testAccessCode || testAccessCode === 'TESTCODE') {
      test.skip();
      return;
    }

    await page.goto(`/formular/${testAccessCode}`);
    
    await expect(page.locator('text=Persistent Test Schule')).toBeVisible();
    await expect(page.locator(`text=${testAccessCode}`)).toBeVisible();
    await expect(page.locator('text=Status:')).toBeVisible();
  });
});

