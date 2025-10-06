import { test, expect } from '@playwright/test';

test.describe('Registration Flow', () => {
  test('should display registration page with all fields', async ({ page }) => {
    await page.goto('/register');

    await expect(page.locator('text=Schulaufsicht Registrierung')).toBeVisible();
    await expect(page.getByLabel('Ihr Name')).toBeVisible();
    await expect(page.getByLabel('Name der Schulaufsicht')).toBeVisible();
    await expect(page.getByLabel('E-Mail-Adresse')).toBeVisible();
    await expect(page.getByLabel('Passwort', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Passwort bestätigen')).toBeVisible();
    await expect(page.getByRole('button', { name: /Jetzt registrieren/i })).toBeVisible();
  });

  test('should show note that schools do not need an account', async ({ page }) => {
    await page.goto('/register');

    await expect(page.locator('text=Als Schule benötigen Sie keinen Account')).toBeVisible();
  });

  test('should have link back to login page', async ({ page }) => {
    await page.goto('/register');

    const loginLink = page.getByRole('link', { name: /Bereits registriert/i });
    await expect(loginLink).toBeVisible();
    await loginLink.click();

    await expect(page).toHaveURL(/\/login/);
  });

  test('should validate password confirmation match', async ({ page }) => {
    await page.goto('/register');

    await page.getByLabel('Ihr Name').fill('Test User');
    await page.getByLabel('Name der Schulaufsicht').fill('Schulaufsicht Test');
    await page.getByLabel('E-Mail-Adresse').fill('test@example.com');
    await page.getByLabel('Passwort', { exact: true }).fill('TestPassword123!@#');
    await page.getByLabel('Passwort bestätigen').fill('DifferentPassword123!@#');
    await page.getByRole('button', { name: /Jetzt registrieren/i }).click();

    await expect(page.locator('text=Die Passwörter stimmen nicht überein')).toBeVisible({ timeout: 5000 });
  });

  test('should reject weak password', async ({ page }) => {
    await page.goto('/register');

    await page.getByLabel('Ihr Name').fill('Test User');
    await page.getByLabel('Name der Schulaufsicht').fill('Schulaufsicht Test');
    await page.getByLabel('E-Mail-Adresse').fill('test@example.com');
    await page.getByLabel('Passwort', { exact: true }).fill('weak');
    await page.getByLabel('Passwort bestätigen').fill('weak');
    await page.getByRole('button', { name: /Jetzt registrieren/i }).click();

    // Should show validation error from backend
    await expect(page.locator('text=/Passwort|Password/i')).toBeVisible({ timeout: 5000 });
  });

  test('should successfully register with valid data', async ({ page }) => {
    const timestamp = Date.now();
    const testEmail = `schulaufsicht-test-${timestamp}@example.com`;

    await page.goto('/register');

    await page.getByLabel('Ihr Name').fill('Test Schulaufsicht User');
    await page.getByLabel('Name der Schulaufsicht').fill('Schulaufsicht Teststadt');
    await page.getByLabel('E-Mail-Adresse').fill(testEmail);
    await page.getByLabel('Passwort', { exact: true }).fill('TestPassword123!@#');
    await page.getByLabel('Passwort bestätigen').fill('TestPassword123!@#');
    await page.getByRole('button', { name: /Jetzt registrieren/i }).click();

    // Should show success message
    await expect(page.locator('text=Registrierung erfolgreich!')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Bitte bestätigen Sie Ihre E-Mail-Adresse')).toBeVisible();
    await expect(page.locator('text=Wir haben Ihnen eine E-Mail gesendet')).toBeVisible();
  });

  test('should reject duplicate email registration', async ({ page }) => {
    await page.goto('/register');

    // Try to register with existing demo user email
    await page.getByLabel('Ihr Name').fill('Another User');
    await page.getByLabel('Name der Schulaufsicht').fill('Another schulaufsicht');
    await page.getByLabel('E-Mail-Adresse').fill('schulaufsicht@example.com');
    await page.getByLabel('Passwort', { exact: true }).fill('TestPassword123!@#');
    await page.getByLabel('Passwort bestätigen').fill('TestPassword123!@#');
    await page.getByRole('button', { name: /Jetzt registrieren/i }).click();

    // Should show error about existing user
    await expect(page.locator('text=/bereits|existiert|exists/i')).toBeVisible({ timeout: 5000 });
  });

  test('should enforce rate limiting', async ({ page }) => {
    const timestamp = Date.now();

    // Make multiple registration attempts
    for (let i = 0; i < 4; i++) {
      await page.goto('/register');

      await page.getByLabel('Ihr Name').fill(`Test User ${i}`);
      await page.getByLabel('Name der Schulaufsicht').fill(`Schulaufsicht ${i}`);
      await page.getByLabel('E-Mail-Adresse').fill(`test-${timestamp}-${i}@example.com`);
      await page.getByLabel('Passwort', { exact: true }).fill('TestPassword123!@#');
      await page.getByLabel('Passwort bestätigen').fill('TestPassword123!@#');
      await page.getByRole('button', { name: /Jetzt registrieren/i }).click();

      await page.waitForTimeout(1000);
    }

    // Fourth attempt should be rate limited
    await expect(page.locator('text=/rate limit|zu viele|too many/i')).toBeVisible({ timeout: 5000 });
  });

  test('should require all mandatory fields', async ({ page }) => {
    await page.goto('/register');

    // Try to submit without filling fields
    await page.getByRole('button', { name: /Jetzt registrieren/i }).click();

    // Browser HTML5 validation should prevent submission
    const nameInput = page.getByLabel('Ihr Name');
    await expect(nameInput).toHaveAttribute('required', '');
  });

  test('should have accessible registration link from login page', async ({ page }) => {
    await page.goto('/login');

    const registerLink = page.getByRole('link', { name: /Jetzt registrieren/i });
    await expect(registerLink).toBeVisible();
    await registerLink.click();

    await expect(page).toHaveURL(/\/register/);
    await expect(page.locator('text=Schulaufsicht Registrierung')).toBeVisible();
  });

  test('should show password requirements hint', async ({ page }) => {
    await page.goto('/register');

    // Check for password requirement hints
    await expect(page.locator('text=/mindestens 12 Zeichen|12 characters/i')).toBeVisible();
  });
});

test.describe('Email Verification Flow', () => {
  test('should show error for missing verification token', async ({ page }) => {
    await page.goto('/verify-email');

    await expect(page.locator('text=Verifizierung fehlgeschlagen')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=/Kein.*Token|no.*token/i')).toBeVisible();
  });

  test('should show error for invalid verification token', async ({ page }) => {
    await page.goto('/verify-email?token=invalid-token-123');

    await expect(page.locator('text=Verifizierung fehlgeschlagen')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=/Ungültig|invalid/i')).toBeVisible();
  });

  test('should provide link to retry registration on error', async ({ page }) => {
    await page.goto('/verify-email?token=invalid-token-123');

    await expect(page.locator('text=Verifizierung fehlgeschlagen')).toBeVisible({ timeout: 5000 });

    const registerLink = page.getByRole('link', { name: /Erneut registrieren/i });
    await expect(registerLink).toBeVisible();
    await expect(registerLink).toHaveAttribute('href', '/register');
  });

  test('should provide link to login page on error', async ({ page }) => {
    await page.goto('/verify-email?token=invalid-token-123');

    await expect(page.locator('text=Verifizierung fehlgeschlagen')).toBeVisible({ timeout: 5000 });

    const loginLink = page.getByRole('link', { name: /Zur Anmeldung/i });
    await expect(loginLink).toBeVisible();
    await expect(loginLink).toHaveAttribute('href', '/login');
  });

  test('should show loading state while verifying', async ({ page }) => {
    // Intercept the API call to delay response
    await page.route('**/api/auth/verify-email*', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 404,
        body: JSON.stringify({ error: 'Invalid token' }),
      });
    });

    await page.goto('/verify-email?token=test-token');

    // Should show loading state
    await expect(page.locator('text=E-Mail wird verifiziert')).toBeVisible();
    await expect(page.locator('text=Bitte warten Sie einen Moment')).toBeVisible();
  });
});

test.describe('Registration Security', () => {
  test('should not reveal whether email exists during registration', async ({ page }) => {
    await page.goto('/register');

    // Register with known email
    await page.getByLabel('Ihr Name').fill('Test User');
    await page.getByLabel('Name der Schulaufsicht').fill('Test schulaufsicht');
    await page.getByLabel('E-Mail-Adresse').fill('schulaufsicht@example.com');
    await page.getByLabel('Passwort', { exact: true }).fill('TestPassword123!@#');
    await page.getByLabel('Passwort bestätigen').fill('TestPassword123!@#');

    const submitButton = page.getByRole('button', { name: /Jetzt registrieren/i });
    await submitButton.click();

    // Error message should not be too specific
    const errorMessage = await page.locator('[class*="error"]').first().textContent({ timeout: 5000 });
    expect(errorMessage?.toLowerCase()).not.toContain('already registered');
    expect(errorMessage?.toLowerCase()).not.toContain('account exists');
  });

  test('should not allow registration with SQL injection attempts', async ({ page }) => {
    await page.goto('/register');

    await page.getByLabel('Ihr Name').fill("'; DROP TABLE users; --");
    await page.getByLabel('Name der Schulaufsicht').fill("Test'; DELETE FROM forms; --");
    await page.getByLabel('E-Mail-Adresse').fill('test@example.com');
    await page.getByLabel('Passwort', { exact: true }).fill('TestPassword123!@#');
    await page.getByLabel('Passwort bestätigen').fill('TestPassword123!@#');
    await page.getByRole('button', { name: /Jetzt registrieren/i }).click();

    // Should handle safely without errors or SQL injection
    await page.waitForTimeout(2000);
    // Page should either show success or validation error, but not crash
    const pageContent = await page.textContent('body');
    expect(pageContent).not.toContain('syntax error');
    expect(pageContent).not.toContain('SQL');
  });

  test('should not allow XSS through registration fields', async ({ page }) => {
    await page.goto('/register');

    const xssPayload = '<script>alert("XSS")</script>';
    await page.getByLabel('Ihr Name').fill(xssPayload);
    await page.getByLabel('Name der Schulaufsicht').fill(xssPayload);
    await page.getByLabel('E-Mail-Adresse').fill('test@example.com');
    await page.getByLabel('Passwort', { exact: true }).fill('TestPassword123!@#');
    await page.getByLabel('Passwort bestätigen').fill('TestPassword123!@#');
    await page.getByRole('button', { name: /Jetzt registrieren/i }).click();

    // Wait for response
    await page.waitForTimeout(2000);

    // Check that script was not executed
    page.on('dialog', dialog => {
      throw new Error('XSS alert dialog should not appear');
    });

    // Verify no alert dialogs appeared
    await page.waitForTimeout(1000);
  });
});
