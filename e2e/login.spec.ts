import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('should display login page with form', async ({ page }) => {
    await page.goto('/login');
    
    await expect(page.locator('text=Schulaufsicht Login')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Passwort')).toBeVisible();
    await expect(page.getByRole('button', { name: /Anmelden/i })).toBeVisible();
  });

  test('should show demo credentials', async ({ page }) => {
    await page.goto('/login');
    
    await expect(page.locator('text=Demo-Zugangsdaten')).toBeVisible();
    await expect(page.locator('text=schulaufsicht@example.com')).toBeVisible();
    await expect(page.locator('text=schulaufsicht123')).toBeVisible();
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.getByLabel('Email').fill('schulaufsicht@example.com');
    await page.getByLabel('Passwort').fill('schulaufsicht123');
    await page.getByRole('button', { name: /Anmelden/i }).click();
    
    // Should redirect to admin page
    await expect(page).toHaveURL(/\/admin/, { timeout: 10000 });
    await expect(page.locator('text=Schulaufsicht – Formulare')).toBeVisible();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.getByLabel('Email').fill('wrong@example.com');
    await page.getByLabel('Passwort').fill('wrongpassword');
    await page.getByRole('button', { name: /Anmelden/i }).click();
    
    // Should show error message
    await expect(page.locator('text=Ungültige Anmeldedaten')).toBeVisible({ timeout: 5000 });
  });

  test('should redirect to login when accessing admin without auth', async ({ page }) => {
    await page.goto('/admin');
    
    // Should be redirected to login
    await expect(page).toHaveURL(/\/login/);
  });
});

