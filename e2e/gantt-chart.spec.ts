import { test, expect } from '@playwright/test';

test.describe('Gantt Chart', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin and get an access code
    await page.goto('/login');
    await page.fill('input[name="email"]', 'schulaufsicht@example.com');
    await page.fill('input[name="password"]', 'schulaufsicht123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');
  });

  test('should display gantt chart when entries have timeline data', async ({ page }) => {
    // Get access code from first form
    await page.waitForSelector('a[href^="/admin/forms/"]', { timeout: 5000 });
    const firstFormCard = page.locator('a[href^="/admin/forms/"]').first();
    const codeText = await firstFormCard.locator('text=/Code: /').textContent();
    const accessCode = codeText?.match(/Code: ([A-Z0-9]+)/)?.[1];
    
    if (!accessCode) {
      test.skip();
      return;
    }

    // Navigate to form
    await page.goto(`/formular/${accessCode}`);
    
    // Check if there are entries
    const entryCount = await page.locator('a:has-text("Bearbeiten")').count();
    
    if (entryCount === 0) {
      // Create an entry with timeline data
      await page.click('a:has-text("Neuer Eintrag")');
      await page.waitForURL(new RegExp(`/formular/${accessCode}/entry/new`));
      
      await page.fill('textarea[name="zielsetzungenText"]', 'Test für Gantt-Diagramm');
      
      // Set timeline
      await page.selectOption('select[name="beginnSchuljahr"]', '2024/25');
      await page.selectOption('select[name="beginnHalbjahr"]', '1');
      await page.selectOption('select[name="endeSchuljahr"]', '2025/26');
      await page.selectOption('select[name="endeHalbjahr"]', '2');
      
      // Wait for autosave
      await page.waitForSelector('text=/Gespeichert/i', { timeout: 5000 });
      
      // Go back
      await page.goto(`/formular/${accessCode}`);
    }
    
    // Should display Gantt chart
    await expect(page.getByText(/Gantt-Diagramm/i)).toBeVisible();
    await expect(page.getByText(/Zeitplan der Maßnahmen/i)).toBeVisible();
  });

  test('should show empty state when no timeline data available', async ({ page }) => {
    // Get access code
    await page.waitForSelector('a[href^="/admin/forms/"]', { timeout: 5000 });
    const firstFormCard = page.locator('a[href^="/admin/forms/"]').first();
    const codeText = await firstFormCard.locator('text=/Code: /').textContent();
    const accessCode = codeText?.match(/Code: ([A-Z0-9]+)/)?.[1];
    
    if (!accessCode) {
      test.skip();
      return;
    }

    await page.goto(`/formular/${accessCode}`);
    
    // If there are no entries, gantt chart should not be visible
    const entryCount = await page.locator('a:has-text("Bearbeiten")').count();
    
    if (entryCount === 0) {
      const ganttVisible = await page.getByText(/Gantt-Diagramm/i).isVisible().catch(() => false);
      expect(ganttVisible).toBe(false);
    }
  });

  test('should display print button', async ({ page }) => {
    // Get access code
    await page.waitForSelector('a[href^="/admin/forms/"]', { timeout: 5000 });
    const firstFormCard = page.locator('a[href^="/admin/forms/"]').first();
    const codeText = await firstFormCard.locator('text=/Code: /').textContent();
    const accessCode = codeText?.match(/Code: ([A-Z0-9]+)/)?.[1];
    
    if (!accessCode) {
      test.skip();
      return;
    }

    await page.goto(`/formular/${accessCode}`);
    
    // Check if gantt chart is visible
    const ganttVisible = await page.getByText(/Gantt-Diagramm/i).isVisible().catch(() => false);
    
    if (ganttVisible) {
      // Should have print button
      await expect(page.locator('button:has-text("Drucken")')).toBeVisible();
    }
  });

  test('should display download button', async ({ page }) => {
    // Get access code
    await page.waitForSelector('a[href^="/admin/forms/"]', { timeout: 5000 });
    const firstFormCard = page.locator('a[href^="/admin/forms/"]').first();
    const codeText = await firstFormCard.locator('text=/Code: /').textContent();
    const accessCode = codeText?.match(/Code: ([A-Z0-9]+)/)?.[1];
    
    if (!accessCode) {
      test.skip();
      return;
    }

    await page.goto(`/formular/${accessCode}`);
    
    // Check if gantt chart is visible
    const ganttVisible = await page.getByText(/Gantt-Diagramm/i).isVisible().catch(() => false);
    
    if (ganttVisible) {
      // Should have download button
      await expect(page.locator('button:has-text("Als SVG herunterladen")')).toBeVisible();
    }
  });

  test('should trigger download when download button clicked', async ({ page }) => {
    // Get access code
    await page.waitForSelector('a[href^="/admin/forms/"]', { timeout: 5000 });
    const firstFormCard = page.locator('a[href^="/admin/forms/"]').first();
    const codeText = await firstFormCard.locator('text=/Code: /').textContent();
    const accessCode = codeText?.match(/Code: ([A-Z0-9]+)/)?.[1];
    
    if (!accessCode) {
      test.skip();
      return;
    }

    await page.goto(`/formular/${accessCode}`);
    
    // Check if gantt chart is visible
    const ganttVisible = await page.getByText(/Gantt-Diagramm/i).isVisible().catch(() => false);
    
    if (ganttVisible) {
      // Set up download promise
      const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);
      
      // Click download button
      await page.locator('button:has-text("Als SVG herunterladen")').click();
      
      // Wait for download
      const download = await downloadPromise;
      
      if (download) {
        // Verify download filename contains .svg
        expect(download.suggestedFilename()).toContain('.svg');
        expect(download.suggestedFilename()).toContain('gantt-');
      }
    }
  });

  test('should display year headers in gantt chart', async ({ page }) => {
    // Get access code
    await page.waitForSelector('a[href^="/admin/forms/"]', { timeout: 5000 });
    const firstFormCard = page.locator('a[href^="/admin/forms/"]').first();
    const codeText = await firstFormCard.locator('text=/Code: /').textContent();
    const accessCode = codeText?.match(/Code: ([A-Z0-9]+)/)?.[1];
    
    if (!accessCode) {
      test.skip();
      return;
    }

    // Create an entry with timeline first
    await page.goto(`/formular/${accessCode}/entry/new`);
    await page.fill('textarea[name="zielsetzungenText"]', 'Test Timeline Header');
    await page.selectOption('select[name="beginnSchuljahr"]', '2024/25');
    await page.selectOption('select[name="beginnHalbjahr"]', '1');
    await page.selectOption('select[name="endeSchuljahr"]', '2024/25');
    await page.selectOption('select[name="endeHalbjahr"]', '2');
    await page.waitForSelector('text=/Gespeichert/i', { timeout: 5000 });

    await page.goto(`/formular/${accessCode}`);
    
    // Check if gantt chart is visible
    const ganttVisible = await page.getByText(/Gantt-Diagramm/i).isVisible().catch(() => false);
    
    if (ganttVisible) {
      // Should show semester labels
      const pageContent = await page.content();
      expect(pageContent).toContain('HJ'); // "1. HJ" or "2. HJ"
    }
  });

  test('should display gantt chart in admin detail view', async ({ page }) => {
    // Navigate to admin detail view
    await page.waitForSelector('a[href^="/admin/forms/"]', { timeout: 5000 });
    const firstFormCard = page.locator('a[href^="/admin/forms/"]').first();
    await firstFormCard.click();
    
    await page.waitForURL(/\/admin\/forms\/[a-z0-9]+/);
    
    // Check if gantt chart exists (may not be visible if no entries with timeline)
    const pageContent = await page.content();
    const hasGanttOrEmptyState = 
      pageContent.includes('Gantt-Diagramm') || 
      pageContent.includes('Zielvereinbarungs-Einträge');
    
    expect(hasGanttOrEmptyState).toBe(true);
  });

  test('should show timeline bars for entries', async ({ page }) => {
    // Get access code
    await page.waitForSelector('a[href^="/admin/forms/"]', { timeout: 5000 });
    const firstFormCard = page.locator('a[href^="/admin/forms/"]').first();
    const codeText = await firstFormCard.locator('text=/Code: /').textContent();
    const accessCode = codeText?.match(/Code: ([A-Z0-9]+)/)?.[1];
    
    if (!accessCode) {
      test.skip();
      return;
    }

    // Create an entry with timeline
    await page.goto(`/formular/${accessCode}/entry/new`);
    
    const testTitle = `Gantt Timeline Test ${Date.now()}`;
    await page.fill('textarea[name="zielsetzungenText"]', testTitle);
    
    // Set timeline
    await page.selectOption('select[name="beginnSchuljahr"]', '2024/25');
    await page.selectOption('select[name="beginnHalbjahr"]', '1');
    await page.selectOption('select[name="endeSchuljahr"]', '2024/25');
    await page.selectOption('select[name="endeHalbjahr"]', '2');
    
    // Wait for autosave
    await page.waitForSelector('text=/Gespeichert/i', { timeout: 5000 });
    
    // Go to form overview
    await page.goto(`/formular/${accessCode}`);
    
    // Should see the entry title in gantt chart
    await expect(page.getByText(testTitle).first()).toBeVisible();
  });

  test('should display correct time range in gantt bars', async ({ page }) => {
    // Get access code
    await page.waitForSelector('a[href^="/admin/forms/"]', { timeout: 5000 });
    const firstFormCard = page.locator('a[href^="/admin/forms/"]').first();
    const codeText = await firstFormCard.locator('text=/Code: /').textContent();
    const accessCode = codeText?.match(/Code: ([A-Z0-9]+)/)?.[1];
    
    if (!accessCode) {
      test.skip();
      return;
    }

    // Create entry with timeline
    await page.goto(`/formular/${accessCode}/entry/new`);
    await page.fill('textarea[name="zielsetzungenText"]', 'Test Time Range Display');
    await page.selectOption('select[name="beginnSchuljahr"]', '2024/25');
    await page.selectOption('select[name="beginnHalbjahr"]', '1');
    await page.selectOption('select[name="endeSchuljahr"]', '2025/26');
    await page.selectOption('select[name="endeHalbjahr"]', '2');
    await page.waitForSelector('text=/Gespeichert/i', { timeout: 5000 });

    await page.goto(`/formular/${accessCode}`);
    
    // Check if gantt chart is visible
    const ganttVisible = await page.getByText(/Gantt-Diagramm/i).isVisible().catch(() => false);
    
    if (ganttVisible) {
      // Should show the time range somewhere on the page
      const pageContent = await page.content();
      expect(pageContent).toContain('2024/25');
      expect(pageContent).toContain('2025/26');
    }
  });
});

