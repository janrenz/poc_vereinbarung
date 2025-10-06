import { test, expect } from "@playwright/test";

test.describe("Autosave Security & Authorization", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto("/");
  });

  test("should reject API requests without access code", async ({ request }) => {
    // Try to create an entry without access code
    const createResponse = await request.post("/api/entries", {
      data: {
        formId: "test-form-id",
        title: "Unauthorized Entry",
        zielsetzungenText: "This should fail",
      },
    });

    expect(createResponse.status()).toBe(401);
    const createBody = await createResponse.json();
    expect(createBody.error).toContain("Access code required");

    // Try to update an entry without access code
    const updateResponse = await request.patch("/api/entries/test-entry-id", {
      data: {
        title: "Hacked Title",
      },
    });

    expect(updateResponse.status()).toBe(401);
    const updateBody = await updateResponse.json();
    expect(updateBody.error).toContain("Access code required");

    // Try to delete an entry without access code
    const deleteResponse = await request.delete("/api/entries/test-entry-id");

    expect(deleteResponse.status()).toBe(401);
    const deleteBody = await deleteResponse.json();
    expect(deleteBody.error).toContain("Access code required");
  });

  test("should reject API requests with invalid access code", async ({
    page,
    request,
  }) => {
    // Login as admin and create a form
    await page.goto("/login");
    await page.fill('input[name="email"]', "admin@schulaufsicht.nrw");
    await page.fill('input[name="password"]', "admin123");
    await page.click('button[type="submit"]');
    await page.waitForURL("/admin");

    // Create a form
    await page.click('text="+ Neues Formular erstellen"');
    await page.fill('input[placeholder="Schulnummer oder Name"]', "Test School");
    await page.waitForTimeout(1000);
    const schoolOption = page.locator('button:has-text("Test School")').first();
    await schoolOption.click();
    await page.click('button:has-text("Formular erstellen")');
    await page.waitForURL(/\/admin\/forms\/.+/);

    // Get the access code
    const accessCode = await page
      .locator('[data-testid="access-code"]')
      .textContent();
    const cleanCode = accessCode?.trim() || "";

    // Get form ID from URL
    const formId = page.url().split("/forms/")[1];

    // Create an entry via API with valid access code
    const createResponse = await request.post("/api/entries", {
      headers: {
        "Content-Type": "application/json",
        "X-Access-Code": cleanCode,
      },
      data: {
        formId: formId,
        title: "Test Entry",
        zielsetzungenText: "Original content",
      },
    });

    expect(createResponse.status()).toBe(200);
    const createBody = await createResponse.json();
    const entryId = createBody.entry.id;

    // Try to update with WRONG access code
    const updateResponse = await request.patch(`/api/entries/${entryId}`, {
      headers: {
        "Content-Type": "application/json",
        "X-Access-Code": "WRONGCODE123",
      },
      data: {
        zielsetzungenText: "Hacked content",
      },
    });

    expect(updateResponse.status()).toBe(403);
    const updateBody = await updateResponse.json();
    expect(updateBody.error).toContain("Invalid access code");

    // Try to delete with WRONG access code
    const deleteResponse = await request.delete(`/api/entries/${entryId}`, {
      headers: {
        "X-Access-Code": "WRONGCODE123",
      },
    });

    expect(deleteResponse.status()).toBe(403);
    const deleteBody = await deleteResponse.json();
    expect(deleteBody.error).toContain("Invalid access code");

    // Verify entry was NOT modified
    await page.goto(`/formular/${cleanCode}`);
    await page.click(`text="Test Entry"`);
    const contentField = page.locator('textarea[name="zielsetzungenText"]');
    await expect(contentField).toHaveValue("Original content");
  });

  test("should allow autosave with valid access code", async ({ page }) => {
    // Login as admin and create a form
    await page.goto("/login");
    await page.fill('input[name="email"]', "admin@schulaufsicht.nrw");
    await page.fill('input[name="password"]', "admin123");
    await page.click('button[type="submit"]');
    await page.waitForURL("/admin");

    // Create a form
    await page.click('text="+ Neues Formular erstellen"');
    await page.fill('input[placeholder="Schulnummer oder Name"]', "Test School");
    await page.waitForTimeout(1000);
    const schoolOption = page.locator('button:has-text("Test School")').first();
    await schoolOption.click();
    await page.click('button:has-text("Formular erstellen")');
    await page.waitForURL(/\/admin\/forms\/.+/);

    // Get the access code
    const accessCode = await page
      .locator('[data-testid="access-code"]')
      .textContent();
    const cleanCode = accessCode?.trim() || "";

    // Go to the school form view
    await page.goto(`/formular/${cleanCode}`);

    // Create a new entry
    await page.click('text="+ Neuer Eintrag"');
    await page.waitForURL(new RegExp(`/formular/${cleanCode}/entry/new`));

    // Fill in the form
    await page.fill('input[name="title"]', "Test Entry with Autosave");
    await page.fill(
      'textarea[name="zielsetzungenText"]',
      "This should autosave with proper authorization"
    );

    // Wait for autosave indicator
    await page.waitForTimeout(3000);

    // Check for "Gespeichert" status
    await expect(page.locator('text="Gespeichert"')).toBeVisible({
      timeout: 10000,
    });

    // Navigate away and back to verify data was saved
    await page.goto(`/formular/${cleanCode}`);
    await page.click('text="Test Entry with Autosave"');

    // Verify the content was saved
    const titleField = page.locator('input[name="title"]');
    const contentField = page.locator('textarea[name="zielsetzungenText"]');

    await expect(titleField).toHaveValue("Test Entry with Autosave");
    await expect(contentField).toHaveValue(
      "This should autosave with proper authorization"
    );
  });

  test("should prevent modifications to submitted forms", async ({
    page,
    request,
  }) => {
    // Login as admin and create a form
    await page.goto("/login");
    await page.fill('input[name="email"]', "admin@schulaufsicht.nrw");
    await page.fill('input[name="password"]', "admin123");
    await page.click('button[type="submit"]');
    await page.waitForURL("/admin");

    // Create a form with an entry
    await page.click('text="+ Neues Formular erstellen"');
    await page.fill('input[placeholder="Schulnummer oder Name"]', "Test School");
    await page.waitForTimeout(1000);
    const schoolOption = page.locator('button:has-text("Test School")').first();
    await schoolOption.click();
    await page.click('button:has-text("Formular erstellen")');
    await page.waitForURL(/\/admin\/forms\/.+/);

    // Get access code and form ID
    const accessCode = await page
      .locator('[data-testid="access-code"]')
      .textContent();
    const cleanCode = accessCode?.trim() || "";
    const formId = page.url().split("/forms/")[1];

    // Create an entry via API
    const createResponse = await request.post("/api/entries", {
      headers: {
        "Content-Type": "application/json",
        "X-Access-Code": cleanCode,
      },
      data: {
        formId: formId,
        title: "Entry in Draft Form",
        zielsetzungenText: "Original content before submission",
      },
    });

    expect(createResponse.status()).toBe(200);
    const entryId = createResponse.json().then((body) => body.entry.id);

    // Go to school form and submit it
    await page.goto(`/formular/${cleanCode}`);
    await page.click('button:has-text("Absenden")');
    await page.waitForURL(/\/completed\/view/);

    // Try to modify the entry after submission (should fail)
    const updateResponse = await request.patch(`/api/entries/${await entryId}`, {
      headers: {
        "Content-Type": "application/json",
        "X-Access-Code": cleanCode,
      },
      data: {
        zielsetzungenText: "Modified after submission - should fail",
      },
    });

    expect(updateResponse.status()).toBe(403);
    const updateBody = await updateResponse.json();
    expect(updateBody.error).toContain(
      "Cannot modify entries in submitted or approved forms"
    );
  });

  test("should not leak entry data through enumeration", async ({
    page,
    request,
  }) => {
    // Try to access a non-existent entry
    const response = await request.patch("/api/entries/non-existent-id-12345", {
      headers: {
        "Content-Type": "application/json",
        "X-Access-Code": "TESTCODE123",
      },
      data: {
        title: "Hacked",
      },
    });

    // Should return 404, not 403 (to prevent information leakage)
    expect(response.status()).toBe(404);
    const body = await response.json();
    expect(body.error).toBe("Entry not found");
  });
});
