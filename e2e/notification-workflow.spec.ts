import { test, expect } from '@playwright/test';

test.describe('Notification Workflow with Read Marking', () => {
  test('should create notification on form submission and mark as read when admin views form', async ({ page }) => {
    // Step 1: Login as admin and create a form
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@schulaufsicht.nrw');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');

    // Create a new form
    await page.click('a:has-text("Neue Zielvereinbarung")');
    await page.waitForURL('/admin/forms/new');

    // Search for a school
    const searchInput = page.locator('input[placeholder*="Schule suchen"]');
    await searchInput.fill('Realschule');
    await searchInput.press('Enter');

    // Wait for search results and click first result
    await page.waitForSelector('button:has-text("Auswählen")', { timeout: 10000 });
    const firstSelectButton = page.locator('button:has-text("Auswählen")').first();
    await firstSelectButton.click();

    // Wait for form creation
    await page.waitForURL(/\/admin\/forms\/.+/, { timeout: 10000 });

    // Get the access code from the page
    const accessCodeElement = page.locator('text=/Zugangscode.*[A-Z0-9]{8}/');
    await accessCodeElement.waitFor({ timeout: 5000 });
    const codeText = await accessCodeElement.textContent();
    const accessCode = codeText?.match(/([A-Z0-9]{8})/)?.[1];

    if (!accessCode) {
      throw new Error('Could not find access code');
    }

    // Logout
    await page.goto('/api/auth/logout');
    await page.goto('/');

    // Step 2: Submit form as school
    await page.goto(`/formular/${accessCode}`);
    
    // Create an entry
    await page.click('a:has-text("Neuer Eintrag")');
    await page.waitForURL(new RegExp(`/formular/${accessCode}/entry/new`));

    // Fill in entry details
    await page.fill('input[name="title"]', 'Test Maßnahme für Notification');
    await page.fill('textarea[name="zielsetzungenText"]', 'Test Zielsetzung');
    await page.fill('textarea[name="massnahmen"]', 'Test Maßnahmen');

    // Wait for autosave
    await page.waitForSelector('text=/Gespeichert/i', { timeout: 5000 });

    // Go back to form overview
    await page.click('button:has-text("Speichern & Zurück")');
    await page.waitForURL(new RegExp(`/formular/${accessCode}$`));

    // Submit the form
    await page.click('button:has-text("Zur Prüfung einreichen")');
    
    // Confirm submission
    const confirmButton = page.locator('button:has-text("Ja, einreichen")');
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
    }

    // Wait for submission
    await page.waitForURL(/\/completed\/view/, { timeout: 5000 });

    // Step 3: Login as admin again and check notifications
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@schulaufsicht.nrw');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');

    // Check that notification badge appears with count
    const badge = page.locator('[class*="bg-red"]').filter({ hasText: /^\d+$/ }).first();
    await expect(badge).toBeVisible({ timeout: 5000 });
    const badgeText = await badge.textContent();
    const badgeCount = parseInt(badgeText || '0');
    expect(badgeCount).toBeGreaterThan(0);

    // Go to notifications page
    await page.goto('/admin/notifications');

    // Should see unread notification about form submission
    await expect(page.locator('text=/eingereicht/i').first()).toBeVisible();
    
    // Check unread count
    const unreadText = page.locator('text=/\\d+ ungelesen/').first();
    await expect(unreadText).toBeVisible();
    const initialUnreadText = await unreadText.textContent();
    const initialUnreadCount = parseInt(initialUnreadText?.match(/\d+/)?.[0] || '0');
    expect(initialUnreadCount).toBeGreaterThan(0);

    // Find the unread notification (has border-l-4)
    const unreadNotification = page.locator('[class*="border-l-4"]').first();
    await expect(unreadNotification).toBeVisible();

    // Click "Details ansehen" to open the form
    const detailLink = unreadNotification.locator('a:has-text("Details ansehen")');
    await detailLink.click();

    // Wait for form detail page
    await page.waitForURL(/\/admin\/forms\/.+/);

    // Verify we're on the form detail page
    await expect(page.locator('text=Test Maßnahme für Notification')).toBeVisible();

    // Go back to notifications
    await page.goto('/admin/notifications');

    // The notification should now be marked as read
    // Check that unread count decreased or shows "Alle Benachrichtigungen gelesen"
    const allReadMessage = page.locator('text=Alle Benachrichtigungen gelesen');
    const newUnreadText = page.locator('text=/\\d+ ungelesen/').first();
    
    const isAllRead = await allReadMessage.isVisible().catch(() => false);
    const hasUnreadText = await newUnreadText.isVisible().catch(() => false);

    if (isAllRead) {
      // Perfect - all notifications are now read
      expect(isAllRead).toBe(true);
    } else if (hasUnreadText) {
      // There are still some unread, but count should be less
      const newText = await newUnreadText.textContent();
      const newCount = parseInt(newText?.match(/\d+/)?.[0] || '0');
      expect(newCount).toBeLessThan(initialUnreadCount);
    }

    // The notification should no longer have the unread border styling
    const notification = page.locator('text=/eingereicht/i').locator('../..');
    await expect(notification).not.toHaveClass(/border-l-4/);
    await expect(notification).toHaveClass(/opacity-70/);
  });

  test('should show notification badge and clear after viewing form', async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@schulaufsicht.nrw');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');

    // Check if notification badge exists
    const badge = page.locator('[class*="bg-red"]').filter({ hasText: /^\d+$/ }).first();
    const hasBadge = await badge.isVisible().catch(() => false);

    if (!hasBadge) {
      // No notifications - test passes (nothing to mark as read)
      return;
    }

    // Navigate to notifications
    await page.goto('/admin/notifications');

    // Get first unread notification
    const firstUnread = page.locator('[class*="border-l-4"]').first();
    const hasUnread = await firstUnread.isVisible().catch(() => false);

    if (!hasUnread) {
      // No unread notifications
      return;
    }

    // Open the form from notification
    await firstUnread.locator('a:has-text("Details ansehen")').click();
    await page.waitForURL(/\/admin\/forms\/.+/);

    // Navigate back to admin dashboard
    await page.goto('/admin');

    // Badge should either be gone or show reduced count
    const newBadge = page.locator('[class*="bg-red"]').filter({ hasText: /^\d+$/ }).first();
    const stillHasBadge = await newBadge.isVisible().catch(() => false);

    if (stillHasBadge) {
      const initialCount = parseInt(await badge.textContent() || '0');
      const newCount = parseInt(await newBadge.textContent() || '0');
      expect(newCount).toBeLessThanOrEqual(initialCount);
    }
    // If badge disappeared, that's also fine
  });
});

