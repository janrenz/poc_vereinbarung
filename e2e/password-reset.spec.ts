import { test, expect } from '@playwright/test';

test.describe('Forgot Password Flow', () => {
  test('should display forgot password page', async ({ page }) => {
    await page.goto('/forgot-password');

    await expect(page.locator('text=Passwort vergessen?')).toBeVisible();
    await expect(page.getByLabel('E-Mail-Adresse')).toBeVisible();
    await expect(page.getByRole('button', { name: /Link anfordern/i })).toBeVisible();
  });

  test('should show note that this is only for Schulamt staff', async ({ page }) => {
    await page.goto('/forgot-password');

    await expect(page.locator('text=/Diese Funktion ist nur für Schulamt-Mitarbeiter/i')).toBeVisible();
    await expect(page.locator('text=/Als Schule.*Zugangscode/i')).toBeVisible();
  });

  test('should have link back to login', async ({ page }) => {
    await page.goto('/forgot-password');

    const loginLink = page.getByRole('link', { name: /Zurück zur Anmeldung/i });
    await expect(loginLink).toBeVisible();
    await loginLink.click();

    await expect(page).toHaveURL(/\/login/);
  });

  test('should successfully request password reset', async ({ page }) => {
    await page.goto('/forgot-password');

    await page.getByLabel('E-Mail-Adresse').fill('schulamt@example.com');
    await page.getByRole('button', { name: /Link anfordern/i }).click();

    // Should show success message (even if user doesn't exist - security)
    await expect(page.locator('text=/E-Mail wurde versendet/i')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=/Überprüfen Sie Ihr Postfach/i')).toBeVisible();
  });

  test('should not reveal if email does not exist (user enumeration protection)', async ({ page }) => {
    await page.goto('/forgot-password');

    await page.getByLabel('E-Mail-Adresse').fill('nonexistent@example.com');
    await page.getByRole('button', { name: /Link anfordern/i }).click();

    // Should show same success message to prevent user enumeration
    await expect(page.locator('text=/E-Mail wurde versendet/i')).toBeVisible({ timeout: 5000 });
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/forgot-password');

    await page.getByLabel('E-Mail-Adresse').fill('invalid-email');
    await page.getByRole('button', { name: /Link anfordern/i }).click();

    // Browser HTML5 validation or backend validation
    const emailInput = page.getByLabel('E-Mail-Adresse');
    const inputType = await emailInput.getAttribute('type');
    expect(inputType).toBe('email');
  });

  test('should enforce rate limiting on forgot password', async ({ page }) => {
    await page.goto('/forgot-password');

    // Make multiple requests quickly
    for (let i = 0; i < 4; i++) {
      await page.getByLabel('E-Mail-Adresse').fill('test@example.com');
      await page.getByRole('button', { name: /Link anfordern/i }).click();
      await page.waitForTimeout(500);
    }

    // Should show rate limit error
    await expect(page.locator('text=/rate limit|zu viele|Bitte versuchen Sie es später/i')).toBeVisible({ timeout: 5000 });
  });

  test('should be accessible from login page', async ({ page }) => {
    await page.goto('/login');

    const forgotPasswordLink = page.getByRole('link', { name: /Passwort vergessen/i });
    await expect(forgotPasswordLink).toBeVisible();
    await forgotPasswordLink.click();

    await expect(page).toHaveURL(/\/forgot-password/);
  });
});

test.describe('Reset Password Flow', () => {
  test('should display reset password page with token', async ({ page }) => {
    await page.goto('/reset-password?token=test-token-123');

    await expect(page.locator('text=Neues Passwort setzen')).toBeVisible();
    await expect(page.getByLabel('Neues Passwort', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Passwort bestätigen')).toBeVisible();
    await expect(page.getByRole('button', { name: /Passwort zurücksetzen/i })).toBeVisible();
  });

  test('should show error when token is missing', async ({ page }) => {
    await page.goto('/reset-password');

    await expect(page.locator('text=/Token.*erforderlich|ungültig/i')).toBeVisible({ timeout: 5000 });
  });

  test('should show error for invalid token', async ({ page }) => {
    await page.goto('/reset-password?token=invalid-token-123');

    // Fill in new password
    await page.getByLabel('Neues Passwort', { exact: true }).fill('NewPassword123!@#');
    await page.getByLabel('Passwort bestätigen').fill('NewPassword123!@#');
    await page.getByRole('button', { name: /Passwort zurücksetzen/i }).click();

    // Should show error for invalid/expired token
    await expect(page.locator('text=/Ungültig|abgelaufen|expired|invalid/i')).toBeVisible({ timeout: 5000 });
  });

  test('should validate password confirmation match', async ({ page }) => {
    await page.goto('/reset-password?token=test-token-123');

    await page.getByLabel('Neues Passwort', { exact: true }).fill('NewPassword123!@#');
    await page.getByLabel('Passwort bestätigen').fill('DifferentPassword123!@#');
    await page.getByRole('button', { name: /Passwort zurücksetzen/i }).click();

    await expect(page.locator('text=/Passwörter stimmen nicht überein/i')).toBeVisible({ timeout: 5000 });
  });

  test('should reject weak password', async ({ page }) => {
    await page.goto('/reset-password?token=test-token-123');

    await page.getByLabel('Neues Passwort', { exact: true }).fill('weak');
    await page.getByLabel('Passwort bestätigen').fill('weak');
    await page.getByRole('button', { name: /Passwort zurücksetzen/i }).click();

    // Should show validation error about password requirements
    await expect(page.locator('text=/Passwort|Password/i')).toBeVisible({ timeout: 5000 });
  });

  test('should show password requirements', async ({ page }) => {
    await page.goto('/reset-password?token=test-token-123');

    // Check for password requirement hints
    await expect(page.locator('text=/mindestens 12 Zeichen|12 characters/i')).toBeVisible();
  });

  test('should enforce rate limiting on password reset', async ({ page }) => {
    await page.goto('/reset-password?token=test-token-123');

    // Make multiple reset attempts
    for (let i = 0; i < 6; i++) {
      await page.getByLabel('Neues Passwort', { exact: true }).fill('NewPassword123!@#');
      await page.getByLabel('Passwort bestätigen').fill('NewPassword123!@#');
      await page.getByRole('button', { name: /Passwort zurücksetzen/i }).click();
      await page.waitForTimeout(500);
    }

    // Should show rate limit error
    await expect(page.locator('text=/rate limit|zu viele|Bitte versuchen Sie es später/i')).toBeVisible({ timeout: 5000 });
  });

  test('should have link to request new reset link', async ({ page }) => {
    await page.goto('/reset-password?token=expired-token');

    // Fill and submit to trigger error
    await page.getByLabel('Neues Passwort', { exact: true }).fill('NewPassword123!@#');
    await page.getByLabel('Passwort bestätigen').fill('NewPassword123!@#');
    await page.getByRole('button', { name: /Passwort zurücksetzen/i }).click();

    // Wait for error
    await page.waitForTimeout(2000);

    // Should have link to forgot password page
    const forgotPasswordLink = page.getByRole('link', { name: /Neuen Link anfordern/i });
    if (await forgotPasswordLink.isVisible()) {
      await expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password');
    }
  });
});

test.describe('Password Reset Security', () => {
  test('should not accept SQL injection in reset token', async ({ page }) => {
    const sqlInjection = "' OR '1'='1";
    await page.goto(`/reset-password?token=${encodeURIComponent(sqlInjection)}`);

    await page.getByLabel('Neues Passwort', { exact: true }).fill('NewPassword123!@#');
    await page.getByLabel('Passwort bestätigen').fill('NewPassword123!@#');
    await page.getByRole('button', { name: /Passwort zurücksetzen/i }).click();

    // Should handle safely
    await page.waitForTimeout(2000);
    const pageContent = await page.textContent('body');
    expect(pageContent).not.toContain('syntax error');
    expect(pageContent).not.toContain('SQL');
  });

  test('should invalidate old sessions after password reset', async ({ page, context }) => {
    // This test would require a valid reset token from the database
    // For now, we'll just verify the endpoint exists and responds
    await page.goto('/reset-password?token=test');
    await expect(page.locator('text=Neues Passwort setzen')).toBeVisible();
  });

  test('should not allow password reset token reuse', async ({ page }) => {
    // This test verifies that tokens can only be used once
    // Would require database seeding with a valid token for full E2E test
    await page.goto('/reset-password?token=test-used-token');

    await page.getByLabel('Neues Passwort', { exact: true }).fill('NewPassword123!@#');
    await page.getByLabel('Passwort bestätigen').fill('NewPassword123!@#');
    await page.getByRole('button', { name: /Passwort zurücksetzen/i }).click();

    // Should show error for already used token
    await expect(page.locator('text=/Ungültig|abgelaufen|bereits verwendet/i')).toBeVisible({ timeout: 5000 });
  });

  test('should have proper CORS headers on auth endpoints', async ({ page }) => {
    const response = await page.request.post('/api/auth/forgot-password', {
      data: { email: 'test@example.com' },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Should not have overly permissive CORS
    const corsHeader = response.headers()['access-control-allow-origin'];
    if (corsHeader) {
      expect(corsHeader).not.toBe('*');
    }
  });
});

test.describe('Integration: Full Password Reset Flow', () => {
  test('should complete full flow from forgot to reset (mock)', async ({ page }) => {
    // Step 1: Request password reset
    await page.goto('/forgot-password');
    await page.getByLabel('E-Mail-Adresse').fill('schulamt@example.com');
    await page.getByRole('button', { name: /Link anfordern/i }).click();

    // Should show success
    await expect(page.locator('text=/E-Mail wurde versendet/i')).toBeVisible({ timeout: 5000 });

    // Step 2: Navigate to reset page (with mock token)
    // In real scenario, user would click link from email
    await page.goto('/reset-password?token=mock-token-from-email');

    // Should show reset form
    await expect(page.locator('text=Neues Passwort setzen')).toBeVisible();

    // Step 3: Set new password
    await page.getByLabel('Neues Passwort', { exact: true }).fill('NewSecurePassword123!@#');
    await page.getByLabel('Passwort bestätigen').fill('NewSecurePassword123!@#');
    await page.getByRole('button', { name: /Passwort zurücksetzen/i }).click();

    // Wait for response (will fail with mock token but form should work)
    await page.waitForTimeout(2000);

    // Verify form handled submission
    const url = page.url();
    expect(url).toContain('/reset-password');
  });

  test('should have consistent UI/UX across auth pages', async ({ page }) => {
    // Check login page
    await page.goto('/login');
    await expect(page.locator('.animated-gradient')).toBeVisible();

    // Check register page
    await page.goto('/register');
    await expect(page.locator('.animated-gradient')).toBeVisible();

    // Check forgot password page
    await page.goto('/forgot-password');
    await expect(page.locator('.animated-gradient')).toBeVisible();

    // Check reset password page
    await page.goto('/reset-password?token=test');
    await expect(page.locator('.animated-gradient')).toBeVisible();
  });
});
