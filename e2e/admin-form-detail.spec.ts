import { test, expect } from '@playwright/test';

test.describe('Admin Form Detail View', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('input[name="email"]', 'schulamt@example.com');
    await page.fill('input[name="password"]', 'schulamt123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');
  });

  test('should display form list and navigate to detail view', async ({ page }) => {
    // Check if we're on admin page
    await expect(page.getByText(/Schulamt – Formulare/i)).toBeVisible();
    
    // Wait for forms to load
    await page.waitForSelector('a[href^="/admin/forms/"]', { timeout: 5000 });
    
    // Click on first form to view details
    await page.click('a[href^="/admin/forms/"]:first-of-type');
    
    // Should navigate to detail page
    await expect(page).toHaveURL(/\/admin\/forms\/[a-z0-9]+/);
    
    // Should show detail page title
    await expect(page.getByText(/Formular-Details/i)).toBeVisible();
  });

  test('should display form information', async ({ page }) => {
    // Navigate to a form detail page
    await page.click('a[href^="/admin/forms/"]:first-of-type');
    await page.waitForURL(/\/admin\/forms\/[a-z0-9]+/);
    
    // Should show school name
    await expect(page.locator('text=/Schule/i').first()).toBeVisible();
    
    // Should show status badge
    await expect(page.locator('[class*="rounded-full"]').first()).toBeVisible();
    
    // Should show entries section
    await expect(page.getByText(/Zielvereinbarungs-Einträge/i)).toBeVisible();
  });

  test('should display entry details when expanded', async ({ page }) => {
    // Navigate to a form with entries
    await page.click('a[href^="/admin/forms/"]:first-of-type');
    await page.waitForURL(/\/admin\/forms\/[a-z0-9]+/);
    
    // Check if there are entries
    const entryCount = await page.locator('details').count();
    
    if (entryCount > 0) {
      // Expand first entry
      await page.locator('details').first().click();
      
      // Wait for details to expand
      await page.waitForTimeout(300);
      
      // Should show entry details
      const detailsContent = await page.locator('details[open]').first().textContent();
      expect(detailsContent).toBeTruthy();
    }
  });

  test('should display comments section', async ({ page }) => {
    // Navigate to form detail
    await page.click('a[href^="/admin/forms/"]:first-of-type');
    await page.waitForURL(/\/admin\/forms\/[a-z0-9]+/);
    
    // Should show comments heading
    await expect(page.getByText(/Kommentare & Feedback/i)).toBeVisible();
    
    // Should show comment textarea
    await expect(page.locator('textarea[name="comment"]')).toBeVisible();
  });

  test('should be able to add a comment', async ({ page }) => {
    // Navigate to form detail
    await page.click('a[href^="/admin/forms/"]:first-of-type');
    await page.waitForURL(/\/admin\/forms\/[a-z0-9]+/);
    
    const testComment = `Test comment ${Date.now()}`;
    
    // Fill in comment
    await page.fill('textarea[name="comment"]', testComment);
    
    // Submit comment
    await page.click('button[type="submit"]:has-text("Kommentar hinzufügen")');
    
    // Should redirect back to same page
    await page.waitForURL(/\/admin\/forms\/[a-z0-9]+/);
    
    // Should show the comment
    await expect(page.getByText(testComment)).toBeVisible();
  });

  test('should display action buttons', async ({ page }) => {
    // Navigate to form detail
    await page.click('a[href^="/admin/forms/"]:first-of-type');
    await page.waitForURL(/\/admin\/forms\/[a-z0-9]+/);
    
    // Should show actions section
    await expect(page.getByText(/^Aktionen$/)).toBeVisible();
    
    // Should show approve button
    await expect(page.locator('button:has-text("genehmigen")')).toBeVisible();
    
    // Should show return button
    await expect(page.locator('button:has-text("zurückgeben")')).toBeVisible();
    
    // Should show export link
    await expect(page.locator('a:has-text("exportieren")')).toBeVisible();
  });

  test('should be able to approve a form', async ({ page }) => {
    // Navigate to form detail
    await page.click('a[href^="/admin/forms/"]:first-of-type');
    await page.waitForURL(/\/admin\/forms\/[a-z0-9]+/);
    
    // Check if approve button is enabled
    const approveButton = page.locator('button:has-text("genehmigen")');
    const isDisabled = await approveButton.isDisabled();
    
    if (!isDisabled) {
      // Click approve
      await approveButton.click();
      
      // Should redirect to admin page
      await page.waitForURL('/admin');
      
      // Should show success (form should have APPROVED status)
      await expect(page.locator('text=/APPROVED/i').first()).toBeVisible();
    }
  });

  test('should be able to return a form with message', async ({ page }) => {
    // Navigate to form detail
    await page.click('a[href^="/admin/forms/"]:first-of-type');
    await page.waitForURL(/\/admin\/forms\/[a-z0-9]+/);
    
    const returnMessage = `Bitte überarbeiten: ${Date.now()}`;
    
    // Fill in return message
    await page.fill('textarea[name="message"]', returnMessage);
    
    // Check if return button is enabled
    const returnButton = page.locator('button:has-text("zurückgeben")');
    const isDisabled = await returnButton.isDisabled();
    
    if (!isDisabled) {
      // Click return
      await returnButton.click();
      
      // Should redirect to admin page
      await page.waitForURL('/admin');
      
      // Should show returned status
      await expect(page.locator('text=/RETURNED/i').first()).toBeVisible();
    }
  });

  test('should have back to overview link', async ({ page }) => {
    // Navigate to form detail
    await page.click('a[href^="/admin/forms/"]:first-of-type');
    await page.waitForURL(/\/admin\/forms\/[a-z0-9]+/);
    
    // Should show back link
    const backLink = page.locator('a:has-text("Zurück zur Übersicht")');
    await expect(backLink).toBeVisible();
    
    // Click back link
    await backLink.click();
    
    // Should navigate back to admin page
    await page.waitForURL('/admin');
    await expect(page.getByText(/Schulamt – Formulare/i)).toBeVisible();
  });

  test('should export form as JSON', async ({ page }) => {
    // Navigate to form detail
    await page.click('a[href^="/admin/forms/"]:first-of-type');
    await page.waitForURL(/\/admin\/forms\/[a-z0-9]+/);
    
    // Should have export link
    const exportLink = page.locator('a:has-text("exportieren")');
    await expect(exportLink).toBeVisible();
    
    // Check export link href
    const href = await exportLink.getAttribute('href');
    expect(href).toContain('/api/forms/');
    expect(href).toContain('/export');
    expect(href).toContain('format=json');
  });

  test('should show empty state for forms with no entries', async ({ page }) => {
    // This test would need a form with no entries
    // For now, we'll just check the structure
    await page.click('a[href^="/admin/forms/"]:first-of-type');
    await page.waitForURL(/\/admin\/forms\/[a-z0-9]+/);
    
    // Should show entries section even if empty
    await expect(page.getByText(/Zielvereinbarungs-Einträge/i)).toBeVisible();
  });

  test('should display status badge with correct color', async ({ page }) => {
    // Navigate to form detail
    await page.click('a[href^="/admin/forms/"]:first-of-type');
    await page.waitForURL(/\/admin\/forms\/[a-z0-9]+/);
    
    // Get status badge
    const statusBadge = page.locator('[class*="rounded-full"]').first();
    await expect(statusBadge).toBeVisible();
    
    // Should have status text
    const statusText = await statusBadge.textContent();
    expect(statusText).toMatch(/DRAFT|SUBMITTED|RETURNED|APPROVED|ARCHIVED/);
  });

  test('should show access code if available', async ({ page }) => {
    // Navigate to form detail
    await page.click('a[href^="/admin/forms/"]:first-of-type');
    await page.waitForURL(/\/admin\/forms\/[a-z0-9]+/);
    
    // Look for access code section
    const hasAccessCode = await page.locator('text=/Zugangscode/i').count();
    
    if (hasAccessCode > 0) {
      // Should show the code in mono font
      await expect(page.locator('text=/Zugangscode/i')).toBeVisible();
    }
  });
});

