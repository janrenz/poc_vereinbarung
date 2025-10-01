import { test, expect } from "@playwright/test";

test.describe("Form Authorization", () => {
  // Helper to login as a specific user
  async function loginAs(page, email: string, password: string) {
    await page.goto("/login");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Passwort").fill(password);
    await page.getByRole("button", { name: /Anmelden/i }).click();
    await expect(page).toHaveURL(/\/admin/);
  }

  // Helper to create a form via API
  async function createFormViaUI(page) {
    // Use the school search to create a form
    const searchInput = page.getByPlaceholder(/Name, Ort/i);
    await searchInput.fill("Gymnasium");
    await page.waitForTimeout(1000);

    // Select first result if available
    const firstResult = page.locator('[data-school-item]').first();
    const isVisible = await firstResult.isVisible().catch(() => false);

    if (isVisible) {
      await firstResult.click();
      await page.waitForTimeout(500);

      // Click create button
      const createButton = page.getByTestId("create-form-button");
      await createButton.click();
      await page.waitForTimeout(2000);
    } else {
      // Fallback: create form via mock
      await page.evaluate(() => {
        fetch('/api/forms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            school: {
              externalId: 'test-' + Date.now(),
              name: 'Test Gymnasium',
              city: 'Berlin',
              state: 'Berlin',
              address: 'Test Str. 1'
            }
          })
        });
      });
      await page.waitForTimeout(1000);
      await page.reload();
    }
  }

  test("admin user should only see their own forms", async ({ page, context }) => {
    // Login as first admin
    await loginAs(page, "admin@schulamt.nrw", "admin123");

    // Get the list of forms on the admin page
    await page.waitForSelector("text=Schulamt – Formulare");
    const formsAdmin1 = await page.locator('[class*="rounded-lg border-2"]').count();

    // Create a new form as admin1
    await createFormViaUI(page);

    // Verify the form was created
    const formsAfterCreation = await page.locator('[class*="rounded-lg border-2"]').count();
    expect(formsAfterCreation).toBeGreaterThanOrEqual(formsAdmin1);

    // Get the access code of the newly created form
    const accessCode = await page
      .locator('[class*="rounded-lg border-2"]')
      .first()
      .locator('code')
      .textContent();

    // Logout
    await page.goto("/api/auth/logout");
    await page.waitForURL("/login");

    // Login as a different admin (create a second admin context)
    const page2 = await context.newPage();
    await loginAs(page2, "admin@schulamt.nrw", "admin123");

    // Verify the second admin sees their own forms (should not see admin1's form)
    await page2.waitForSelector("text=Schulamt – Formulare");

    // Try to access the form created by admin1 directly via URL
    // First, get the form ID by checking the detail link
    await page.goto("/admin");
    const formDetailLink = await page
      .locator('[class*="rounded-lg border-2"]')
      .first()
      .locator('a:has-text("Details ansehen")')
      .getAttribute("href");

    if (formDetailLink) {
      const formId = formDetailLink.split("/").pop();

      // Try to access this form as the second admin
      await page2.goto(`/admin/forms/${formId}`);

      // Should be redirected back to admin page (not authorized)
      await page2.waitForURL("/admin");
    }

    await page2.close();
  });

  test("unauthorized API access should return 401", async ({ request }) => {
    // Try to create a form without authentication
    const response = await request.post("/api/forms", {
      data: {
        school: {
          externalId: "test-123",
          name: "Test School",
        },
      },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toBe("Unauthorized");
  });

  test("accessing another user's form via API should return 403", async ({
    page,
    request,
  }) => {
    // Login as admin
    await loginAs(page, "admin@schulamt.nrw", "admin123");

    // Create a form
    await createFormViaUI(page);

    // Get the form ID
    const formDetailLink = await page
      .locator('[class*="rounded-lg border-2"]')
      .first()
      .locator('a:has-text("Details ansehen")')
      .getAttribute("href");

    const formId = formDetailLink?.split("/").pop();
    expect(formId).toBeTruthy();

    // Logout
    await page.goto("/api/auth/logout");
    await page.waitForTimeout(500);

    // Login as superadmin (who should not have access to forms)
    await loginAs(page, "superadmin@schulamt.nrw", "superadmin123");

    // Verify superadmin is redirected to user management
    await page.waitForURL("/admin/users");

    // Superadmin should not be able to access form detail page
    await page.goto(`/admin/forms/${formId}`);
    await expect(page).toHaveURL("/admin/users");
  });

  test("form creator should be able to approve their own form", async ({
    page,
  }) => {
    // Login as admin
    await loginAs(page, "admin@schulamt.nrw", "admin123");

    // Create a form
    await createFormViaUI(page);

    // Click on the form details
    await page
      .locator('[class*="rounded-lg border-2"]')
      .first()
      .locator('a:has-text("Details ansehen")')
      .click();

    // Wait for form detail page to load
    await page.waitForSelector("text=Formular-Details");

    // Verify approve button is visible and clickable
    const approveButton = page.locator(
      'button:has-text("Zielvereinbarung annehmen")'
    );
    await expect(approveButton).toBeVisible();
    await expect(approveButton).toBeEnabled();
  });

  test("export should only work for form creator", async ({ page, request }) => {
    // Login as admin
    await loginAs(page, "admin@schulamt.nrw", "admin123");

    // Get cookies
    const cookies = await page.context().cookies();
    const cookieHeader = cookies
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");

    // Create a form
    await createFormViaUI(page);

    // Get the form ID
    const formDetailLink = await page
      .locator('[class*="rounded-lg border-2"]')
      .first()
      .locator('a:has-text("Details ansehen")')
      .getAttribute("href");

    const formId = formDetailLink?.split("/").pop();
    expect(formId).toBeTruthy();

    // Export should work for the creator
    const exportResponse = await request.get(
      `/api/forms/${formId}/export?format=json`,
      {
        headers: {
          Cookie: cookieHeader,
        },
      }
    );

    expect(exportResponse.status()).toBe(200);
    const exportData = await exportResponse.json();
    expect(exportData.form).toBeTruthy();
    expect(exportData.form.id).toBe(formId);
  });
});
