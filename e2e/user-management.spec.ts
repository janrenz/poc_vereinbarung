import { test, expect } from '@playwright/test';

test.describe('User Management - Benutzerverwaltung', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure we start from a clean state
    await page.goto('/');
  });

  test('Superadmin can login and access user management', async ({ page }) => {
    // Navigate to login
    await page.goto('/login');
    
    // Login as superadmin
    await page.fill('input[type="email"]', 'superadmin@schulamt.nrw');
    await page.fill('input[type="password"]', 'superadmin123');
    await page.click('button[type="submit"]');
    
    // Should be redirected to /admin/users (not /admin)
    await expect(page).toHaveURL(/\/admin\/users/);
    
    // Should see user management page
    await expect(page.locator('h1')).toContainText('Benutzerverwaltung');
    
    // Should see info about Superadmin access
    await expect(page.locator('text=Als Superadmin haben Sie nur Zugriff')).toBeVisible();
    
    // Should see current user email
    await expect(page.locator('text=superadmin@schulamt.nrw')).toBeVisible();
  });

  test('Superadmin cannot access form management', async ({ page }) => {
    // Login as superadmin
    await page.goto('/login');
    await page.fill('input[type="email"]', 'superadmin@schulamt.nrw');
    await page.fill('input[type="password"]', 'superadmin123');
    await page.click('button[type="submit"]');
    
    // Try to access admin page directly
    await page.goto('/admin');
    
    // Should be redirected to /admin/users
    await expect(page).toHaveURL(/\/admin\/users/);
  });

  test('Superadmin cannot access form details', async ({ page }) => {
    // Login as superadmin
    await page.goto('/login');
    await page.fill('input[type="email"]', 'superadmin@schulamt.nrw');
    await page.fill('input[type="password"]', 'superadmin123');
    await page.click('button[type="submit"]');
    
    // Try to access a form detail page directly (using a fake ID)
    await page.goto('/admin/forms/test-form-id');
    
    // Should be redirected to /admin/users
    await expect(page).toHaveURL(/\/admin\/users/);
  });

  test('Superadmin cannot access notifications', async ({ page }) => {
    // Login as superadmin
    await page.goto('/login');
    await page.fill('input[type="email"]', 'superadmin@schulamt.nrw');
    await page.fill('input[type="password"]', 'superadmin123');
    await page.click('button[type="submit"]');
    
    // Try to access notifications page directly
    await page.goto('/admin/notifications');
    
    // Should be redirected to /admin/users
    await expect(page).toHaveURL(/\/admin\/users/);
  });

  test('Superadmin does not see notification badge in header', async ({ page }) => {
    // Login as superadmin
    await page.goto('/login');
    await page.fill('input[type="email"]', 'superadmin@schulamt.nrw');
    await page.fill('input[type="password"]', 'superadmin123');
    await page.click('button[type="submit"]');
    
    await page.waitForURL(/\/admin\/users/);
    
    // Should not see notification bell icon
    const notificationBell = page.locator('[data-testid="notification-badge"]').or(page.locator('svg.lucide-bell'));
    await expect(notificationBell).not.toBeVisible();
  });

  test('Admin can login and access form management', async ({ page }) => {
    // Navigate to login
    await page.goto('/login');
    
    // Login as admin
    await page.fill('input[type="email"]', 'admin@schulamt.nrw');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Should be redirected to /admin
    await expect(page).toHaveURL(/\/admin/);
    
    // Should see form management page
    await expect(page.locator('h1')).toContainText('Schulamt');
    await expect(page.locator('text=Letzte Formulare')).toBeVisible();
  });

  test('Admin cannot access user management', async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@schulamt.nrw');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Try to access user management
    await page.goto('/admin/users');
    
    // Should be redirected to /admin
    await expect(page).toHaveURL(/\/admin$/);
  });

  test('Superadmin can create a new Admin user', async ({ page }) => {
    // Login as superadmin
    await page.goto('/login');
    await page.fill('input[type="email"]', 'superadmin@schulamt.nrw');
    await page.fill('input[type="password"]', 'superadmin123');
    await page.click('button[type="submit"]');
    
    await page.waitForURL(/\/admin\/users/);
    
    // Fill in new user form
    const timestamp = Date.now();
    await page.fill('input[name="email"]', `testadmin${timestamp}@schulamt.nrw`);
    await page.fill('input[name="name"]', 'Test Admin');
    await page.fill('input[name="password"]', 'testpassword123');
    await page.selectOption('select[name="role"]', 'ADMIN');
    
    // Submit form
    await page.click('button[type="submit"]:has-text("Benutzer anlegen")');
    
    // Should reload and show success
    await page.waitForURL(/\/admin\/users/);
    
    // Should see new user in list
    await expect(page.locator(`text=testadmin${timestamp}@schulamt.nrw`)).toBeVisible();
    await expect(page.locator('text=Test Admin')).toBeVisible();
  });

  test('Superadmin can create a new Superadmin user', async ({ page }) => {
    // Login as superadmin
    await page.goto('/login');
    await page.fill('input[type="email"]', 'superadmin@schulamt.nrw');
    await page.fill('input[type="password"]', 'superadmin123');
    await page.click('button[type="submit"]');
    
    await page.waitForURL(/\/admin\/users/);
    
    // Fill in new user form
    const timestamp = Date.now();
    await page.fill('input[name="email"]', `testsuperadmin${timestamp}@schulamt.nrw`);
    await page.fill('input[name="name"]', 'Test Superadmin');
    await page.fill('input[name="password"]', 'testpassword123');
    await page.selectOption('select[name="role"]', 'SUPERADMIN');
    
    // Submit form
    await page.click('button[type="submit"]:has-text("Benutzer anlegen")');
    
    // Should reload and show success
    await page.waitForURL(/\/admin\/users/);
    
    // Should see new user in list
    await expect(page.locator(`text=testsuperadmin${timestamp}@schulamt.nrw`)).toBeVisible();
    await expect(page.locator('text=SUPERADMIN').nth(1)).toBeVisible(); // nth(1) because demo superadmin also exists
  });

  test('Superadmin can deactivate a user', async ({ page }) => {
    // First create a user to deactivate
    await page.goto('/login');
    await page.fill('input[type="email"]', 'superadmin@schulamt.nrw');
    await page.fill('input[type="password"]', 'superadmin123');
    await page.click('button[type="submit"]');
    
    await page.waitForURL(/\/admin\/users/);
    
    const timestamp = Date.now();
    await page.fill('input[name="email"]', `todeactivate${timestamp}@schulamt.nrw`);
    await page.fill('input[name="name"]', 'To Deactivate');
    await page.fill('input[name="password"]', 'testpassword123');
    await page.click('button[type="submit"]:has-text("Benutzer anlegen")');
    
    await page.waitForURL(/\/admin\/users/);
    
    // Find the user and click deactivate
    const userRow = page.locator(`text=todeactivate${timestamp}@schulamt.nrw`).locator('..').locator('..');
    await userRow.locator('button:has-text("Deaktivieren")').click();
    
    // Should reload
    await page.waitForURL(/\/admin\/users/);
    
    // Should see "Deaktiviert" status and "Aktivieren" button
    const updatedUserRow = page.locator(`text=todeactivate${timestamp}@schulamt.nrw`).locator('..').locator('..');
    await expect(updatedUserRow.locator('text=Deaktiviert')).toBeVisible();
    await expect(updatedUserRow.locator('button:has-text("Aktivieren")')).toBeVisible();
  });

  test('Superadmin can delete a user', async ({ page }) => {
    // First create a user to delete
    await page.goto('/login');
    await page.fill('input[type="email"]', 'superadmin@schulamt.nrw');
    await page.fill('input[type="password"]', 'superadmin123');
    await page.click('button[type="submit"]');
    
    await page.waitForURL(/\/admin\/users/);
    
    const timestamp = Date.now();
    await page.fill('input[name="email"]', `todelete${timestamp}@schulamt.nrw`);
    await page.fill('input[name="name"]', 'To Delete');
    await page.fill('input[name="password"]', 'testpassword123');
    await page.click('button[type="submit"]:has-text("Benutzer anlegen")');
    
    await page.waitForURL(/\/admin\/users/);
    
    // Confirm user exists
    await expect(page.locator(`text=todelete${timestamp}@schulamt.nrw`)).toBeVisible();
    
    // Find the user and click delete (handle confirm dialog)
    const userRow = page.locator(`text=todelete${timestamp}@schulamt.nrw`).locator('..').locator('..');
    
    // Set up dialog handler before clicking
    page.on('dialog', dialog => dialog.accept());
    
    await userRow.locator('button:has-text("Löschen")').click();
    
    // Should reload
    await page.waitForURL(/\/admin\/users/);
    
    // User should be gone
    await expect(page.locator(`text=todelete${timestamp}@schulamt.nrw`)).not.toBeVisible();
  });

  test('Superadmin can see user list with roles and status', async ({ page }) => {
    // Login as superadmin
    await page.goto('/login');
    await page.fill('input[type="email"]', 'superadmin@schulamt.nrw');
    await page.fill('input[type="password"]', 'superadmin123');
    await page.click('button[type="submit"]');
    
    await page.waitForURL(/\/admin\/users/);
    
    // Should see demo users
    await expect(page.locator('text=Demo Superadmin')).toBeVisible();
    await expect(page.locator('text=Demo Admin')).toBeVisible();
    
    // Should see role badges
    await expect(page.locator('text=SUPERADMIN')).toBeVisible();
    await expect(page.locator('text=ADMIN')).toBeVisible();
    
    // Should see active status
    await expect(page.locator('text=Aktiv')).toBeVisible();
    
    // Should see user count
    await expect(page.locator('text=Benutzer (')).toBeVisible();
  });

  test('Password field requires minimum 8 characters', async ({ page }) => {
    // Login as superadmin
    await page.goto('/login');
    await page.fill('input[type="email"]', 'superadmin@schulamt.nrw');
    await page.fill('input[type="password"]', 'superadmin123');
    await page.click('button[type="submit"]');
    
    await page.waitForURL(/\/admin\/users/);
    
    // Try to create user with short password
    await page.fill('input[name="email"]', 'shortpass@schulamt.nrw');
    await page.fill('input[name="password"]', 'short'); // Only 5 characters
    
    // Check if browser validation kicks in
    const passwordInput = page.locator('input[name="password"]');
    const minLength = await passwordInput.getAttribute('minlength');
    expect(minLength).toBe('8');
  });

  test('Info box explains Superadmin limitations', async ({ page }) => {
    // Login as superadmin
    await page.goto('/login');
    await page.fill('input[type="email"]', 'superadmin@schulamt.nrw');
    await page.fill('input[type="password"]', 'superadmin123');
    await page.click('button[type="submit"]');
    
    await page.waitForURL(/\/admin\/users/);
    
    // Should see info box
    await expect(page.locator('text=Als Superadmin haben Sie nur Zugriff auf die Benutzerverwaltung')).toBeVisible();
    await expect(page.locator('text=Für die Verwaltung von Formularen benötigen Sie einen Admin-Account')).toBeVisible();
  });
});



