import { test, expect } from '@playwright/test';

test.describe('Payment Links Manager - Intensive Testing Suite', () => {
  test('1. Form Validation Intensive Test: Blocks invalid inputs and displays communicative error feedback', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('header').getByText('Razorpay')).toBeVisible();

    // 1. Open Modal
    await page.locator('#open-create-modal').click();
    await expect(page.locator('role=dialog')).toBeVisible();

    // 2. Submit Empty Form
    const submitBtn = page.locator('#submit-create-link');
    await submitBtn.click();

    // 3. Verify Error Summary Banner & Field-Level Errors
    await expect(page.locator('role=dialog').locator('role=alert')).toBeVisible();
    await expect(page.locator('text=Please resolve the following errors:')).toBeVisible();
    await expect(page.locator('#amount-error')).toContainText('Amount is required');
    await expect(page.locator('#description-error')).toContainText('Description is required');

    // 4. Test Negative Amount Validation
    await page.fill('#amount', '-500');
    await submitBtn.click();
    await expect(page.locator('#amount-error')).toContainText('greater than ₹0');

    // 5. Test Live Character Counter
    const descCounter = page.locator('#desc-counter');
    await expect(descCounter).toHaveText('0 / 200');
    await page.fill('#description', 'Design and Architecture Consultation');
    await expect(descCounter).toHaveText('36 / 200');

    // 6. Test Invalid Indian Phone Format
    await page.fill('#customerPhone', '1234567890'); // Doesn't start with 6-9
    await submitBtn.click();
    await expect(page.locator('#phone-error')).toContainText('valid 10-digit Indian phone number');

    // 7. Test Partial Payment Constraint Validation
    await page.fill('#amount', '3000');
    await page.check('#allowPartialPayment');
    await expect(page.locator('#minPartialAmount')).toBeVisible();

    // Set partial amount equal to total amount
    await page.fill('#minPartialAmount', '3000');
    await submitBtn.click();
    await expect(page.locator('#min-partial-error')).toContainText('must be less than total amount');

    // 8. Correct All Inputs to Valid State
    await page.fill('#minPartialAmount', '1000');
    await page.fill('#customerName', 'Rohan Mathur');
    await page.fill('#customerEmail', 'rohan@enterprise.in');
    await page.fill('#customerPhone', '9811223344');

    // Submit valid form
    await submitBtn.click();

    // Modal should close and success alert should appear
    await expect(page.locator('role=dialog')).toBeHidden();
    await expect(page.locator('role=alert')).toContainText('created successfully');

    // Verify row rendered in table
    const createdRow = page.locator('tr', { hasText: 'Design and Architecture Consultation' });
    await expect(createdRow).toBeVisible();
    await expect(createdRow).toContainText('₹3,000.00');
    await expect(createdRow).toContainText('Partial Allowed');
  });

  test('2. Communicative Empty State & Filter Recovery Test', async ({ page }) => {
    await page.goto('/');

    // 1. Filter by "Issued"
    const issuedTab = page.locator('role=tab', { hasText: 'Issued' });
    await issuedTab.click();

    // 2. Search for non-existent item
    const searchInput = page.locator('#search-links');
    await searchInput.fill('NonExistentMerchantXYZ');

    // 3. Verify Communicative Empty State
    const emptyStateRegion = page.locator('role=region', { hasText: 'No matching payment links found' });
    await expect(emptyStateRegion).toBeVisible();
    await expect(emptyStateRegion).toContainText('NonExistentMerchantXYZ');
    await expect(emptyStateRegion).toContainText('ISSUED');

    // 4. Test "Clear Filters" Button inside Empty State
    const clearBtn = page.locator('#clear-filters-btn');
    await expect(clearBtn).toBeVisible();
    await clearBtn.click();

    // 5. Verify Filters Reset and Links Table Returns
    await expect(searchInput).toHaveValue('');
    await expect(emptyStateRegion).toBeHidden();
    await expect(page.locator('table')).toBeVisible();
  });
});
