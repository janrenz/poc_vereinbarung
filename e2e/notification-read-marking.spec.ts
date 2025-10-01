import { test, expect } from '@playwright/test';

test.describe('Notification Read Marking', () => {
  test('should automatically mark notifications as read when opening form from notification', async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@schulamt.nrw');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');

    // Check if there are any unread notifications in the badge
    const notificationBadge = page.locator('[aria-label*="Benachrichtigungen"]');
    
    // Go to notifications page
    await page.goto('/admin/notifications');
    
    // Check if there are any notifications
    const noNotificationsMessage = page.locator('text=Keine Benachrichtigungen');
    const hasNotifications = !(await noNotificationsMessage.isVisible().catch(() => false));
    
    if (!hasNotifications) {
      // Skip test if no notifications exist
      test.skip();
      return;
    }

    // Find first unread notification (if any)
    const unreadNotification = page.locator('[class*="border-l-4"]').first();
    const hasUnreadNotification = await unreadNotification.isVisible().catch(() => false);
    
    if (!hasUnreadNotification) {
      // Create a test scenario: We need a submitted form to generate a notification
      // For now, we'll just verify the mechanism works
      console.log('No unread notifications available for testing');
      test.skip();
      return;
    }

    // Get the form ID from the notification's detail link
    const detailLink = unreadNotification.locator('a:has-text("Details ansehen")');
    const href = await detailLink.getAttribute('href');
    
    if (!href) {
      test.skip();
      return;
    }

    // Click on "Details ansehen" to open the form
    await detailLink.click();
    
    // Wait for navigation to form detail page
    await page.waitForURL(/\/admin\/forms\/.+/);
    
    // Navigate back to notifications
    await page.goto('/admin/notifications');
    
    // The notification should now be marked as read (no border-l-4 class, opacity-70)
    const formId = href.split('/').pop();
    const notificationForForm = page.locator(`a[href="${href}"]`).locator('../..');
    
    // Check that it has the read styling (opacity-70 class)
    await expect(notificationForForm).toHaveClass(/opacity-70/);
  });

  test('should show correct unread count after viewing form', async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@schulamt.nrw');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');

    // Go to notifications page
    await page.goto('/admin/notifications');
    
    // Get initial unread count from the page
    const unreadText = page.locator('text=/\\d+ ungelesen/').first();
    const hasUnreadText = await unreadText.isVisible().catch(() => false);
    
    if (!hasUnreadText) {
      // No unread notifications
      test.skip();
      return;
    }

    const initialText = await unreadText.textContent();
    const initialCount = parseInt(initialText?.match(/\d+/)?.[0] || '0');
    
    if (initialCount === 0) {
      test.skip();
      return;
    }

    // Click on first unread notification's detail link
    const firstUnread = page.locator('[class*="border-l-4"]').first();
    const detailLink = firstUnread.locator('a:has-text("Details ansehen")');
    await detailLink.click();
    
    // Wait for form page
    await page.waitForURL(/\/admin\/forms\/.+/);
    
    // Go back to notifications
    await page.goto('/admin/notifications');
    
    // Check that unread count has decreased
    const newUnreadText = page.locator('text=/\\d+ ungelesen/').first();
    const stillHasUnread = await newUnreadText.isVisible().catch(() => false);
    
    if (stillHasUnread) {
      const newText = await newUnreadText.textContent();
      const newCount = parseInt(newText?.match(/\d+/)?.[0] || '0');
      expect(newCount).toBeLessThan(initialCount);
    } else {
      // Should show "Alle Benachrichtigungen gelesen" if count is now 0
      await expect(page.locator('text=Alle Benachrichtigungen gelesen')).toBeVisible();
    }
  });

  test('should update notification badge count after viewing form', async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@schulamt.nrw');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');

    // Check notification badge
    const badge = page.locator('[class*="bg-"][class*="rounded-full"]').filter({ hasText: /^\d+$/ }).first();
    const hasBadge = await badge.isVisible().catch(() => false);
    
    if (!hasBadge) {
      // No unread notifications
      test.skip();
      return;
    }

    const initialBadgeText = await badge.textContent();
    const initialBadgeCount = parseInt(initialBadgeText || '0');
    
    if (initialBadgeCount === 0) {
      test.skip();
      return;
    }

    // Go to notifications and open first unread
    await page.goto('/admin/notifications');
    const firstUnread = page.locator('[class*="border-l-4"]').first();
    const detailLink = firstUnread.locator('a:has-text("Details ansehen")');
    await detailLink.click();
    
    // Wait for form page
    await page.waitForURL(/\/admin\/forms\/.+/);
    
    // Go back to admin overview to check badge
    await page.goto('/admin');
    
    // Badge should either show a lower number or be hidden
    const newBadge = page.locator('[class*="bg-"][class*="rounded-full"]').filter({ hasText: /^\d+$/ }).first();
    const stillHasBadge = await newBadge.isVisible().catch(() => false);
    
    if (stillHasBadge) {
      const newBadgeText = await newBadge.textContent();
      const newBadgeCount = parseInt(newBadgeText || '0');
      expect(newBadgeCount).toBeLessThan(initialBadgeCount);
    }
    // If badge is not visible, that's also fine (means no unread notifications)
  });

  test('should handle multiple notifications for same form', async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@schulamt.nrw');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');

    await page.goto('/admin/notifications');
    
    // Check if there are notifications
    const notifications = page.locator('[class*="md-surface"]').filter({ has: page.locator('a:has-text("Details ansehen")') });
    const count = await notifications.count();
    
    if (count === 0) {
      test.skip();
      return;
    }

    // Get all unread notifications
    const unreadNotifications = page.locator('[class*="border-l-4"]');
    const unreadCount = await unreadNotifications.count();
    
    if (unreadCount === 0) {
      test.skip();
      return;
    }

    // Get the first notification's form link
    const firstDetailLink = unreadNotifications.first().locator('a:has-text("Details ansehen")');
    const href = await firstDetailLink.getAttribute('href');
    
    if (!href) {
      test.skip();
      return;
    }

    // Check how many unread notifications point to the same form
    const sameFormNotifications = page.locator(`a[href="${href}"]`).locator('../..');
    const sameFormCount = await sameFormNotifications.filter('[class*="border-l-4"]').count();
    
    // Click to open the form
    await firstDetailLink.click();
    await page.waitForURL(/\/admin\/forms\/.+/);
    
    // Go back to notifications
    await page.goto('/admin/notifications');
    
    // All notifications for this form should now be marked as read
    const stillUnreadForSameForm = await sameFormNotifications.filter('[class*="border-l-4"]').count();
    expect(stillUnreadForSameForm).toBe(0);
  });

  test('should not mark other forms notifications as read', async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@schulamt.nrw');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');

    await page.goto('/admin/notifications');
    
    // Count all unread notifications
    const allUnread = page.locator('[class*="border-l-4"]');
    const totalUnreadCount = await allUnread.count();
    
    if (totalUnreadCount < 2) {
      // Need at least 2 unread notifications from different forms
      test.skip();
      return;
    }

    // Get links from first two notifications
    const firstLink = await allUnread.nth(0).locator('a:has-text("Details ansehen")').getAttribute('href');
    const secondLink = await allUnread.nth(1).locator('a:has-text("Details ansehen")').getAttribute('href');
    
    if (!firstLink || !secondLink || firstLink === secondLink) {
      // Both notifications are for the same form
      test.skip();
      return;
    }

    // Click on first notification
    await allUnread.nth(0).locator('a:has-text("Details ansehen")').click();
    await page.waitForURL(/\/admin\/forms\/.+/);
    
    // Go back to notifications
    await page.goto('/admin/notifications');
    
    // Second notification should still be unread (if it's for a different form)
    const secondNotificationStillUnread = page.locator(`a[href="${secondLink}"]`).locator('../..').locator('[class*="border-l-4"]');
    const isStillUnread = await secondNotificationStillUnread.isVisible().catch(() => false);
    
    // If links are different, second should still be unread
    if (firstLink !== secondLink) {
      expect(isStillUnread).toBe(true);
    }
  });
});

