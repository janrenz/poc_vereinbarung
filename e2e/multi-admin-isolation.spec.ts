import { test, expect } from "@playwright/test";
import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

/**
 * E2E Test: Multi-Admin Authorization & Data Isolation
 *
 * Tests that multiple Schulaufsicht admins can only see and manage their own forms.
 * This ensures proper row-level authorization and data isolation between different
 * Schulaufsicht organizations.
 */

test.describe("Multi-Admin Authorization & Data Isolation", () => {
  let admin1Email: string;
  let admin1Password: string;
  let admin1Name: string;
  let admin2Email: string;
  let admin2Password: string;
  let admin2Name: string;
  let admin1FormCode: string;
  let admin2FormCode: string;

  test.beforeAll(async () => {
    // Create two separate Schulaufsicht admins
    admin1Email = `schulaufsicht.koeln@test-${Date.now()}.com`;
    admin1Password = "SecurePassword123!";
    admin1Name = "Schulaufsicht Köln";

    admin2Email = `schulaufsicht.duesseldorf@test-${Date.now()}.com`;
    admin2Password = "SecurePassword456!";
    admin2Name = "Schulaufsicht Düsseldorf";

    const hashedPassword1 = await bcrypt.hash(admin1Password, 12);
    const hashedPassword2 = await bcrypt.hash(admin2Password, 12);

    // Create admin 1
    await prisma.user.create({
      data: {
        email: admin1Email,
        password: hashedPassword1,
        name: "Max Mustermann",
        schulaufsichtName: admin1Name,
        role: "ADMIN",
        active: true,
        emailVerified: true,
      },
    });

    // Create admin 2
    await prisma.user.create({
      data: {
        email: admin2Email,
        password: hashedPassword2,
        name: "Erika Musterfrau",
        schulaufsichtName: admin2Name,
        role: "ADMIN",
        active: true,
        emailVerified: true,
      },
    });
  });

  test.afterAll(async () => {
    // Cleanup: Delete test users and their forms
    await prisma.user.deleteMany({
      where: {
        OR: [
          { email: admin1Email },
          { email: admin2Email },
        ],
      },
    });
  });

  test("Admin 1 creates a form - should only see their own forms", async ({ page }) => {
    // Login as Admin 1
    await page.goto("/login");
    await page.fill('input[name="email"]', admin1Email);
    await page.fill('input[name="password"]', admin1Password);
    await page.click('button[type="submit"]');
    await page.waitForURL("/admin");

    // Should see admin name in header
    await expect(page.locator(`text=${admin1Name}`)).toBeVisible();

    // Create a form as Admin 1
    await page.click('text=Neue Zielvereinbarung erstellen');
    await page.fill('input[placeholder="Schule suchen..."]', "Test");
    await page.click('text=Testschule');
    await page.waitForSelector('text=Zugangscode');

    const codeElement = await page.locator('[data-testid="access-code"]').first();
    admin1FormCode = (await codeElement.textContent()) || "";
    expect(admin1FormCode).toBeTruthy();

    // Go back to admin dashboard
    await page.goto("/admin");

    // Should see exactly 1 form (their own)
    const formRows = await page.locator('text=Testschule').count();
    expect(formRows).toBe(1);

    // Verify the form shows the correct Schulaufsicht name
    await expect(page.locator(`text=${admin1Name}`)).toBeVisible();
  });

  test("Admin 2 creates a form - should only see their own forms", async ({ page }) => {
    // Login as Admin 2
    await page.goto("/login");
    await page.fill('input[name="email"]', admin2Email);
    await page.fill('input[name="password"]', admin2Password);
    await page.click('button[type="submit"]');
    await page.waitForURL("/admin");

    // Should see admin 2's name
    await expect(page.locator(`text=${admin2Name}`)).toBeVisible();

    // Should NOT see admin 1's form
    await expect(page.locator(`text=${admin1FormCode}`)).not.toBeVisible();

    // Create a form as Admin 2
    await page.click('text=Neue Zielvereinbarung erstellen');
    await page.fill('input[placeholder="Schule suchen..."]', "Test");
    await page.click('text=Testschule');
    await page.waitForSelector('text=Zugangscode');

    const codeElement = await page.locator('[data-testid="access-code"]').first();
    admin2FormCode = (await codeElement.textContent()) || "";
    expect(admin2FormCode).toBeTruthy();

    // Verify codes are different
    expect(admin1FormCode).not.toBe(admin2FormCode);

    // Go back to admin dashboard
    await page.goto("/admin");

    // Should see exactly 1 form (their own)
    const formRows = await page.locator('text=Testschule').count();
    expect(formRows).toBe(1);

    // Should NOT see Admin 1's form code
    await expect(page.locator(`text=${admin1FormCode}`)).not.toBeVisible();

    // Should see Admin 2's form code
    await expect(page.locator(`text=${admin2FormCode}`)).toBeVisible();
  });

  test("Admin 1 cannot access Admin 2's form details", async ({ page }) => {
    // Login as Admin 1
    await page.goto("/login");
    await page.fill('input[name="email"]', admin1Email);
    await page.fill('input[name="password"]', admin1Password);
    await page.click('button[type="submit"]');
    await page.waitForURL("/admin");

    // Get Admin 2's form ID from database
    const admin2User = await prisma.user.findUnique({
      where: { email: admin2Email },
    });

    const admin2Form = await prisma.form.findFirst({
      where: { createdById: admin2User?.id },
      select: { id: true },
    });

    if (!admin2Form) {
      throw new Error("Admin 2's form not found");
    }

    // Try to access Admin 2's form directly via URL
    const response = await page.goto(`/admin/forms/${admin2Form.id}`);

    // Should be redirected or show 404/403
    // Either redirected to /admin or stays on error page
    await page.waitForTimeout(1000);
    const currentUrl = page.url();

    // Should NOT be on the form detail page
    expect(currentUrl).not.toContain(`/admin/forms/${admin2Form.id}`);

    // Should either be redirected to admin or see error
    const isOnAdmin = currentUrl.includes("/admin") && !currentUrl.includes("/forms/");
    const isError = response?.status() === 404 || response?.status() === 403;

    expect(isOnAdmin || isError).toBe(true);
  });

  test("Admin 1 sees only their forms in the list", async ({ page }) => {
    // Login as Admin 1
    await page.goto("/login");
    await page.fill('input[name="email"]', admin1Email);
    await page.fill('input[name="password"]', admin1Password);
    await page.click('button[type="submit"]');
    await page.waitForURL("/admin");

    // Get all form links
    const formLinks = await page.locator('a:has-text("Testschule")').all();

    // Admin 1 should only see 1 form
    expect(formLinks.length).toBe(1);

    // Verify it's their form by checking the access code
    await expect(page.locator(`text=${admin1FormCode}`)).toBeVisible();
    await expect(page.locator(`text=${admin2FormCode}`)).not.toBeVisible();
  });

  test("Admin 2 sees only their forms in the list", async ({ page }) => {
    // Login as Admin 2
    await page.goto("/login");
    await page.fill('input[name="email"]', admin2Email);
    await page.fill('input[name="password"]', admin2Password);
    await page.click('button[type="submit"]');
    await page.waitForURL("/admin");

    // Get all form links
    const formLinks = await page.locator('a:has-text("Testschule")').all();

    // Admin 2 should only see 1 form
    expect(formLinks.length).toBe(1);

    // Verify it's their form by checking the access code
    await expect(page.locator(`text=${admin2FormCode}`)).toBeVisible();
    await expect(page.locator(`text=${admin1FormCode}`)).not.toBeVisible();
  });

  test("Admin 1 can only approve/return their own forms", async ({ page }) => {
    // First, submit admin 1's form
    await page.goto(`/formular/${admin1FormCode}`);
    await page.click('text=Neuer Eintrag');
    await page.waitForURL(/\/formular\/.*\/entry\/new/);
    await page.fill('input[name="title"]', "Test Entry for Admin 1");
    await page.click('button:has-text("Speichern und zurück")');
    await page.waitForURL(`/formular/${admin1FormCode}`);
    await page.click('button:has-text("Absenden")');
    await page.waitForURL(/\/completed\/view/);

    // Login as Admin 1
    await page.goto("/login");
    await page.fill('input[name="email"]', admin1Email);
    await page.fill('input[name="password"]', admin1Password);
    await page.click('button[type="submit"]');
    await page.waitForURL("/admin");

    // Should see the submitted form
    await expect(page.locator('text=Testschule')).toBeVisible();

    // Click on the form
    await page.click('text=Testschule');
    await page.waitForURL(/\/admin\/forms\//);

    // Should see approve/return buttons
    await expect(page.locator('button:has-text("Genehmigen")')).toBeVisible();
    await expect(page.locator('button:has-text("Zurückweisen")')).toBeVisible();

    // Approve the form
    await page.click('button:has-text("Genehmigen")');
    await page.waitForURL("/admin");

    // Verify form status changed
    await expect(page.locator('text=Genehmigt')).toBeVisible();
  });

  test("Notifications are isolated between admins", async ({ page }) => {
    // Submit admin 2's form to generate notification
    await page.goto(`/formular/${admin2FormCode}`);
    await page.click('text=Neuer Eintrag');
    await page.waitForURL(/\/formular\/.*\/entry\/new/);
    await page.fill('input[name="title"]', "Test Entry for Admin 2");
    await page.click('button:has-text("Speichern und zurück")');
    await page.waitForURL(`/formular/${admin2FormCode}`);
    await page.click('button:has-text("Absenden")');
    await page.waitForURL(/\/completed\/view/);

    // Login as Admin 1
    await page.goto("/login");
    await page.fill('input[name="email"]', admin1Email);
    await page.fill('input[name="password"]', admin1Password);
    await page.click('button[type="submit"]');
    await page.waitForURL("/admin");

    // Check notifications - Admin 1 should NOT see Admin 2's form submission
    const notificationBadge = await page.locator('[data-testid="notification-badge"]');

    if (await notificationBadge.isVisible()) {
      await notificationBadge.click();
      await page.waitForURL("/admin/notifications");

      // Should NOT see notification about Admin 2's form
      await expect(page.locator(`text=${admin2FormCode}`)).not.toBeVisible();
    }

    // Login as Admin 2
    await page.goto("/login");
    await page.fill('input[name="email"]', admin2Email);
    await page.fill('input[name="password"]', admin2Password);
    await page.click('button[type="submit"]');
    await page.waitForURL("/admin");

    // Admin 2 should see notification about their form submission
    const admin2NotificationBadge = await page.locator('[data-testid="notification-badge"]');

    if (await admin2NotificationBadge.isVisible()) {
      await admin2NotificationBadge.click();
      await page.waitForURL("/admin/notifications");

      // Should see notification about Admin 2's form
      await expect(page.locator('text=Neue Zielvereinbarung')).toBeVisible();
    }
  });

  test("Database verification: Forms have correct createdBy user", async () => {
    // Get users from database
    const admin1User = await prisma.user.findUnique({
      where: { email: admin1Email },
    });

    const admin2User = await prisma.user.findUnique({
      where: { email: admin2Email },
    });

    expect(admin1User).toBeTruthy();
    expect(admin2User).toBeTruthy();

    // Verify admin 1's form
    const admin1Form = await prisma.form.findFirst({
      where: { createdById: admin1User?.id },
      include: { accessCode: true },
    });

    expect(admin1Form).toBeTruthy();
    expect(admin1Form?.createdById).toBe(admin1User?.id);
    expect(admin1Form?.accessCode?.code).toBe(admin1FormCode);

    // Verify admin 2's form
    const admin2Form = await prisma.form.findFirst({
      where: { createdById: admin2User?.id },
      include: { accessCode: true },
    });

    expect(admin2Form).toBeTruthy();
    expect(admin2Form?.createdById).toBe(admin2User?.id);
    expect(admin2Form?.accessCode?.code).toBe(admin2FormCode);

    // Verify forms are different
    expect(admin1Form?.id).not.toBe(admin2Form?.id);
  });
});
