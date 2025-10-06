import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should display the homepage with hero section', async ({ page }) => {
    await page.goto('/');
    
    // Check hero section
    await expect(page.getByRole('banner')).toContainText('Zielvereinbarung Digital');
    await expect(page.locator('text=Plattform')).toBeVisible();
  });

  test('should have navigation links', async ({ page }) => {
    await page.goto('/');
    
    // Check navigation
    await expect(page.getByRole('link', { name: 'Zielvereinbarung Digital' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'schulaufsicht' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Schule' })).toBeVisible();
  });

  test('should navigate to login when clicking Schulaufsicht card', async ({ page }) => {
    await page.goto('/');
    
    await page.getByRole('link', { name: /Für Schulämter/i }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  test('should navigate to formular when clicking Schule card', async ({ page }) => {
    await page.goto('/');
    
    await page.getByRole('link', { name: /Für Schulen/i }).click();
    await expect(page).toHaveURL(/\/formular/);
  });

  test('should have accessibility features', async ({ page }) => {
    await page.goto('/');
    
    // Check for proper ARIA labels
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('region', { name: /Vorteile/i })).toBeVisible();
  });

  test('should display feature cards with animations', async ({ page }) => {
    await page.goto('/');
    
    // Check for feature section
    await expect(page.locator('text=Vorteile auf einen Blick')).toBeVisible();
    await expect(page.locator('text=Einfache Bedienung')).toBeVisible();
    await expect(page.locator('text=Transparente Prozesse')).toBeVisible();
    await expect(page.locator('text=Effiziente Kommunikation')).toBeVisible();
  });
});

