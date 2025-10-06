import { test, expect } from "@playwright/test";

test.describe("Entry Deletion", () => {
  let accessCode: string;
  let entryId: string;

  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto("/login");
    await page.fill('input[name="email"]', "schulaufsicht@example.com");
    await page.fill('input[name="password"]', "schulaufsicht123");
    await page.click('button[type="submit"]');
    await page.waitForURL("/admin");

    // Create a form and get access code
    await page.click('text=Neue Zielvereinbarung erstellen');
    await page.fill('input[placeholder="Schule suchen..."]', "Test");
    await page.click('text=Testschule');

    // Wait for the form to be created and get the access code
    await page.waitForSelector('text=Zugangscode');
    const codeElement = await page.locator('[data-testid="access-code"]').first();
    accessCode = (await codeElement.textContent()) || "";

    // Navigate to the form as a school
    await page.goto(`/formular/${accessCode}`);

    // Create an entry
    await page.click('text=Neuer Eintrag');
    await page.waitForURL(/\/formular\/.*\/entry\/new/);

    // Fill in basic information
    await page.fill('input[name="title"]', "Test Entry to Delete");
    await page.fill('textarea[name="zielsetzungenText"]', "This is a test entry that will be deleted");

    // Save entry
    await page.click('button:has-text("Speichern und zurück")');
    await page.waitForURL(`/formular/${accessCode}`);

    // Get the entry ID from the URL when clicking edit
    const editLink = await page.locator('a:has-text("Bearbeiten")').first();
    const href = await editLink.getAttribute('href');
    entryId = href?.split('/').pop() || "";
  });

  test("should show delete button for entries", async ({ page }) => {
    await page.goto(`/formular/${accessCode}`);

    const deleteButton = page.locator('button:has-text("Löschen")').first();
    await expect(deleteButton).toBeVisible();
  });

  test("should show confirmation dialog when deleting", async ({ page }) => {
    await page.goto(`/formular/${accessCode}`);

    // Set up dialog handler to capture and dismiss the confirm dialog
    let dialogMessage = "";
    page.on("dialog", async (dialog) => {
      dialogMessage = dialog.message();
      await dialog.dismiss(); // Cancel deletion
    });

    // Click delete button
    await page.locator('button:has-text("Löschen")').first().click();

    // Wait a bit for dialog to be processed
    await page.waitForTimeout(500);

    // Verify dialog message contains confirmation text
    expect(dialogMessage).toContain("wirklich löschen");
    expect(dialogMessage).toContain("Test Entry to Delete");
    expect(dialogMessage).toContain("nicht rückgängig");

    // Entry should still exist (because we dismissed)
    await expect(page.locator('text=Test Entry to Delete')).toBeVisible();
  });

  test("should delete entry when confirmed", async ({ page }) => {
    await page.goto(`/formular/${accessCode}`);

    // Verify entry exists
    await expect(page.locator('text=Test Entry to Delete')).toBeVisible();

    // Set up dialog handler to accept deletion
    page.on("dialog", async (dialog) => {
      await dialog.accept(); // Confirm deletion
    });

    // Click delete button
    await page.locator('button:has-text("Löschen")').first().click();

    // Wait for navigation/refresh
    await page.waitForURL(`/formular/${accessCode}`);

    // Entry should be gone
    await expect(page.locator('text=Test Entry to Delete')).not.toBeVisible();
  });

  test("should not delete entry when cancelled", async ({ page }) => {
    await page.goto(`/formular/${accessCode}`);

    // Set up dialog handler to cancel deletion
    page.on("dialog", async (dialog) => {
      await dialog.dismiss(); // Cancel deletion
    });

    // Click delete button
    await page.locator('button:has-text("Löschen")').first().click();

    // Wait a bit
    await page.waitForTimeout(500);

    // Entry should still exist
    await expect(page.locator('text=Test Entry to Delete')).toBeVisible();
  });

  test("should update entry count after deletion", async ({ page }) => {
    await page.goto(`/formular/${accessCode}`);

    // Check initial count
    const countBefore = await page.locator('text=/Einträge \\(\\d+\\)/').textContent();
    expect(countBefore).toContain("(1)");

    // Delete entry
    page.on("dialog", async (dialog) => {
      await dialog.accept();
    });
    await page.locator('button:has-text("Löschen")').first().click();
    await page.waitForURL(`/formular/${accessCode}`);

    // Check count after deletion
    const countAfter = await page.locator('text=/Einträge \\(\\d+\\)/').textContent();
    expect(countAfter).toContain("(0)");
  });

  test("should show empty state after deleting all entries", async ({ page }) => {
    await page.goto(`/formular/${accessCode}`);

    // Delete the entry
    page.on("dialog", async (dialog) => {
      await dialog.accept();
    });
    await page.locator('button:has-text("Löschen")').first().click();
    await page.waitForURL(`/formular/${accessCode}`);

    // Should show empty state
    await expect(page.locator('text=Noch keine Einträge vorhanden')).toBeVisible();
    await expect(page.locator('text=Klicken Sie auf "Neuer Eintrag"')).toBeVisible();
  });

  test("should hide Gantt chart after deleting all entries", async ({ page }) => {
    await page.goto(`/formular/${accessCode}`);

    // Gantt chart should be visible initially (if entry has timeline data)
    // Delete the entry
    page.on("dialog", async (dialog) => {
      await dialog.accept();
    });
    await page.locator('button:has-text("Löschen")').first().click();
    await page.waitForURL(`/formular/${accessCode}`);

    // Gantt chart should not be visible
    await expect(page.locator('text=Zeitplanung (Gantt-Diagramm)')).not.toBeVisible();
  });
});

test.describe("Entry Deletion Security", () => {
  let accessCode1: string;
  let accessCode2: string;
  let entryId1: string;

  test.beforeEach(async ({ page }) => {
    // Login and create first form
    await page.goto("/login");
    await page.fill('input[name="email"]', "schulaufsicht@example.com");
    await page.fill('input[name="password"]', "schulaufsicht123");
    await page.click('button[type="submit"]');
    await page.waitForURL("/admin");

    // Create first form
    await page.click('text=Neue Zielvereinbarung erstellen');
    await page.fill('input[placeholder="Schule suchen..."]', "Test");
    await page.click('text=Testschule');
    await page.waitForSelector('text=Zugangscode');
    const codeElement1 = await page.locator('[data-testid="access-code"]').first();
    accessCode1 = (await codeElement1.textContent()) || "";

    // Create entry in first form
    await page.goto(`/formular/${accessCode1}`);
    await page.click('text=Neuer Eintrag');
    await page.waitForURL(/\/formular\/.*\/entry\/new/);
    await page.fill('input[name="title"]', "Entry in Form 1");
    await page.click('button:has-text("Speichern und zurück")');
    await page.waitForURL(`/formular/${accessCode1}`);

    // Get entry ID
    const editLink = await page.locator('a:has-text("Bearbeiten")').first();
    const href = await editLink.getAttribute('href');
    entryId1 = href?.split('/').pop() || "";

    // Create second form
    await page.goto("/admin");
    await page.click('text=Neue Zielvereinbarung erstellen');
    await page.fill('input[placeholder="Schule suchen..."]', "Test");
    await page.click('text=Testschule');
    await page.waitForSelector('text=Zugangscode');
    const codeElement2 = await page.locator('[data-testid="access-code"]').last();
    accessCode2 = (await codeElement2.textContent()) || "";
  });

  test("should not delete entry from different form", async ({ page, request }) => {
    // Try to delete entry from form 1 using form 2's access code
    // This simulates an attacker trying to delete entries from another form

    await page.goto(`/formular/${accessCode2}`);

    // Try to call the delete action directly via API
    // In a real scenario, this would be blocked by the server action
    const response = await request.post(`/formular/${accessCode2}/entry/${entryId1}/delete`, {
      failOnStatusCode: false,
    });

    // Should fail or return error
    expect(response.status()).not.toBe(200);

    // Verify entry still exists in form 1
    await page.goto(`/formular/${accessCode1}`);
    await expect(page.locator('text=Entry in Form 1')).toBeVisible();
  });

  test("should not show delete button for submitted forms", async ({ page }) => {
    await page.goto(`/formular/${accessCode1}`);

    // Submit the form
    await page.click('button:has-text("Absenden")');

    // Should redirect to completed view
    await page.waitForURL(/\/completed\/view/);

    // Delete button should not be present
    await expect(page.locator('button:has-text("Löschen")')).not.toBeVisible();
  });
});
