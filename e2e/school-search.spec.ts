import { test, expect } from '@playwright/test';

test.describe('School Search', () => {
  // Login before each test
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    
    // Fill in login credentials
    await page.fill('input[name="email"]', 'schulaufsicht@example.com');
    await page.fill('input[name="password"]', 'schulaufsicht123');
    
    // Click login button
    await page.click('button[type="submit"]');
    
    // Wait for navigation to admin page
    await page.waitForURL('/admin');
  });

  test('should display school search input', async ({ page }) => {
    // Check if search input is visible
    const searchInput = page.getByTestId('school-search-input');
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute('placeholder', /Schulname oder Ort/i);
  });

  test('should show minimum character message for short queries', async ({ page }) => {
    const searchInput = page.getByTestId('school-search-input');
    
    // Type a single character
    await searchInput.fill('B');
    
    // Should show message about minimum characters
    await expect(page.getByText(/mindestens 2 Zeichen/i)).toBeVisible();
  });

  test('should search for schools with live API data', async ({ page }) => {
    const searchInput = page.getByTestId('school-search-input');
    
    // Type a search query (using a common school name from NRW)
    await searchInput.fill('Gymnasium');
    
    // Wait for loading spinner to appear
    await expect(page.getByTestId('loading-spinner')).toBeVisible({ timeout: 2000 });
    
    // Wait for results or error to appear
    await page.waitForFunction(() => {
      return document.querySelector('[data-testid="search-results"]') !== null || 
             document.querySelector('[data-testid="loading-spinner"]') === null;
    }, { timeout: 10000 });
    
    // Check if search results appear
    const searchResults = page.getByTestId('search-results');
    await expect(searchResults).toBeVisible();
    
    // Should have at least one result
    const firstResult = page.getByTestId('school-result-0');
    await expect(firstResult).toBeVisible();
  });

  test('should display school details in results', async ({ page }) => {
    const searchInput = page.getByTestId('school-search-input');
    
    // Search for schools in Cologne
    await searchInput.fill('Köln');
    
    // Wait for results
    await page.waitForSelector('[data-testid^="school-result-"]', { timeout: 10000 });
    
    // Check first result has school name
    const firstResult = page.getByTestId('school-result-0');
    await expect(firstResult).toContainText(/\w+/); // Should contain some text
  });

  test('should select a school from search results', async ({ page }) => {
    const searchInput = page.getByTestId('school-search-input');
    
    // Search for schools
    await searchInput.fill('Realschule');
    
    // Wait for results
    await page.waitForSelector('[data-testid^="school-result-"]', { timeout: 10000 });
    
    // Click first result
    const firstResult = page.getByTestId('school-result-0');
    await firstResult.click();
    
    // Should show selected school card
    await expect(page.getByTestId('selected-school')).toBeVisible();
    
    // Search results should disappear
    await expect(page.getByTestId('search-results')).not.toBeVisible();
    
    // Create form button should be enabled
    const createButton = page.getByTestId('create-form-button');
    await expect(createButton).toBeEnabled();
  });

  test('should allow changing selected school', async ({ page }) => {
    const searchInput = page.getByTestId('school-search-input');
    
    // Search and select a school
    await searchInput.fill('Hauptschule');
    await page.waitForSelector('[data-testid^="school-result-"]', { timeout: 10000 });
    await page.getByTestId('school-result-0').click();
    
    // Verify selection
    await expect(page.getByTestId('selected-school')).toBeVisible();
    
    // Click "Ändern" button
    await page.getByTestId('clear-selection').click();
    
    // Selected school should disappear
    await expect(page.getByTestId('selected-school')).not.toBeVisible();
    
    // Search input should be enabled again
    await expect(searchInput).toBeEnabled();
    await expect(searchInput).toHaveValue('');
  });

  test('should create a form for selected school', async ({ page }) => {
    const searchInput = page.getByTestId('school-search-input');
    
    // Search for a school
    await searchInput.fill('Gesamtschule');
    await page.waitForSelector('[data-testid^="school-result-"]', { timeout: 10000 });
    
    // Select first school
    await page.getByTestId('school-result-0').click();
    await expect(page.getByTestId('selected-school')).toBeVisible();
    
    // Click create form button
    const createButton = page.getByTestId('create-form-button');
    await createButton.click();
    
    // Should show loading state
    await expect(createButton).toContainText(/wird erstellt/i);
    
    // Wait for form to be created (page should refresh)
    await page.waitForTimeout(2000);
    
    // Should see the new form in the recent forms list
    // The page should have refreshed and shown the new form
    await expect(page.getByText(/Letzte Formulare/i)).toBeVisible();
  });

  test('should handle search with no results gracefully', async ({ page }) => {
    const searchInput = page.getByTestId('school-search-input');
    
    // Search for something that likely won't exist
    await searchInput.fill('XYZXYZNONEXISTENTSCHOOL99999');
    
    // Wait for loading to finish
    await page.waitForTimeout(1000);
    
    // Should show error message
    await expect(page.getByTestId('search-error')).toBeVisible();
    await expect(page.getByTestId('search-error')).toContainText(/Keine Schulen gefunden/i);
  });

  test('should debounce search requests', async ({ page }) => {
    const searchInput = page.getByTestId('school-search-input');
    
    // Track network requests
    const requests: string[] = [];
    page.on('request', request => {
      if (request.url().includes('/api/schools')) {
        requests.push(request.url());
      }
    });
    
    // Type multiple characters quickly
    await searchInput.pressSequentially('Gymna', { delay: 50 });
    
    // Wait a bit for debounce
    await page.waitForTimeout(600);
    
    // Should have made fewer requests than characters typed due to debouncing
    expect(requests.length).toBeLessThan(5);
  });

  test('should show school location information', async ({ page }) => {
    const searchInput = page.getByTestId('school-search-input');
    
    // Search for schools in a specific city
    await searchInput.fill('Köln');
    
    // Wait for results
    await page.waitForSelector('[data-testid^="school-result-"]', { timeout: 10000 });
    
    // Select first school
    await page.getByTestId('school-result-0').click();
    
    // Selected school card should show location details
    const selectedCard = page.getByTestId('selected-school');
    await expect(selectedCard).toBeVisible();
    
    // Should show school name
    await expect(selectedCard).toContainText(/\w+/);
  });

  test('should only return schools from Nordrhein-Westfalen', async ({ page }) => {
    const searchInput = page.getByTestId('school-search-input');
    
    // Search for a common school name
    await searchInput.fill('Gymnasium');
    
    // Wait for results to appear
    await page.waitForSelector('[data-testid^="school-result-"]', { timeout: 10000 });
    
    // Get all result elements
    const results = page.locator('[data-testid^="school-result-"]');
    const count = await results.count();
    
    // Verify each result is from NRW
    for (let i = 0; i < Math.min(count, 5); i++) {
      const result = results.nth(i);
      const text = await result.textContent();
      
      // Should NOT contain other federal states
      expect(text?.toLowerCase()).not.toContain('berlin');
      expect(text?.toLowerCase()).not.toContain('bayern');
      expect(text?.toLowerCase()).not.toContain('hamburg');
      expect(text?.toLowerCase()).not.toContain('sachsen');
      
      // Should contain NRW indicators (cities or state name)
      const hasNRWIndicator = 
        text?.includes('Nordrhein-Westfalen') ||
        text?.includes('NRW') ||
        text?.match(/Köln|Düsseldorf|Dortmund|Essen|Duisburg|Bochum|Wuppertal|Bielefeld|Bonn|Münster|Aachen|Mönchengladbach|Gelsenkirchen/) !== null;
      
      expect(hasNRWIndicator).toBeTruthy();
    }
  });

  test('should disable create button when no school is selected', async ({ page }) => {
    const createButton = page.getByTestId('create-form-button');
    
    // Wait for button to be visible and check if disabled
    await createButton.waitFor({ state: 'visible' });
    
    // Check the disabled attribute directly
    const isDisabled = await createButton.evaluate((el) => (el as HTMLButtonElement).disabled);
    expect(isDisabled).toBe(true);
    
    // Search and select a school
    const searchInput = page.getByTestId('school-search-input');
    await searchInput.fill('Berufskolleg');
    await page.waitForSelector('[data-testid^="school-result-"]', { timeout: 10000 });
    await page.getByTestId('school-result-0').click();
    
    // Button should be enabled now
    await expect(createButton).toBeEnabled();
  });

  test('should maintain search context across multiple searches', async ({ page }) => {
    const searchInput = page.getByTestId('school-search-input');
    
    // First search
    await searchInput.fill('Grundschule');
    await page.waitForSelector('[data-testid^="school-result-"]', { timeout: 10000 });
    
    // Clear and search again
    await searchInput.fill('');
    await searchInput.fill('Realschule');
    await page.waitForSelector('[data-testid^="school-result-"]', { timeout: 10000 });
    
    // Results should be for the second search
    const results = page.getByTestId('search-results');
    await expect(results).toBeVisible();
  });
});

