import { test, expect } from '@playwright/test';

test.describe('Payment Links Manager - E2E Happy Path', () => {
  test('should create a new payment link, copy it, and verify status & search filtering', async ({ page }) => {
    // 1. Visit Dashboard
    await page.goto('/');
    await expect(page.locator('header').getByText('Razorpay')).toBeVisible();
    await expect(page.locator('header').getByText('Payment Links')).toBeVisible();

    // 2. Open Create Modal
    const createBtn = page.locator('#open-create-modal');
    await expect(createBtn).toBeVisible();
    await createBtn.click();

    // Verify modal is open
    await expect(page.locator('role=dialog')).toBeVisible();
    await expect(page.locator('#modal-title')).toHaveText('Create Payment Link');

    // 3. Fill in Valid Form Details
    await page.fill('#amount', '7500');
    await page.fill('#description', 'E2E Playwright Test Invoice #8841');
    await page.fill('#customerName', 'Kavita Patel');
    await page.fill('#customerEmail', 'kavita.patel@test.in');
    await page.fill('#customerPhone', '9988776655');

    // 4. Submit Form
    const submitBtn = page.locator('#submit-create-link');
    await submitBtn.click();

    // 5. Verify Modal Closes and Toast Confirmation Appears
    await expect(page.locator('role=dialog')).toBeHidden();
    await expect(page.locator('role=alert')).toContainText('created successfully');

    // 6. Verify New Link Appears in Table with "Issued" Status
    const newRow = page.locator('tr', { hasText: 'E2E Playwright Test Invoice #8841' });
    await expect(newRow).toBeVisible();
    await expect(newRow).toContainText('₹7,500.00');
    await expect(newRow).toContainText('Issued');
    await expect(newRow).toContainText('Kavita Patel');

    // 7. Test Copy Link Action
    const copyButton = newRow.locator('button[title="Copy link"]');
    await copyButton.click();
    await expect(newRow.locator('text=Copied!')).toBeVisible();

    // 8. Filter by Status: Select "Paid" -> Verify the new link is hidden
    const paidTab = page.locator('role=tab', { hasText: 'Paid' }).first();
    await paidTab.click();
    await expect(page.locator('text=E2E Playwright Test Invoice #8841')).toBeHidden();

    // 9. Filter by Status: Select "Issued" -> Verify the new link is visible
    const issuedTab = page.locator('role=tab', { hasText: 'Issued' });
    await issuedTab.click();
    await expect(page.locator('text=E2E Playwright Test Invoice #8841')).toBeVisible();

    // 10. Filter by Search Query
    const searchInput = page.locator('#search-links');
    await searchInput.fill('Kavita');
    await expect(page.locator('text=E2E Playwright Test Invoice #8841')).toBeVisible();

    // Search query that shouldn't match
    await searchInput.fill('NonExistentMerchantXYZ');
    await expect(page.locator('text=No payment links found')).toBeVisible();

    // Clear search
    await searchInput.fill('');
    await expect(page.locator('text=E2E Playwright Test Invoice #8841')).toBeVisible();
  });
});
