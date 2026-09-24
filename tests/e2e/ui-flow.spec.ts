import { test, expect } from '@playwright/test';

// Run UI tests directly against the Next.js frontend web app
test.use({ baseURL: 'http://localhost:3000' });

test.describe('College ERP Fee Management & Regression Platform - Web UI E2E Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('UI-01: Executive Dashboard renders with Neo-Brutalist elements and KPI cards', async ({ page }) => {
    // Verify document title
    await expect(page).toHaveTitle(/COLLEGE ERP \/\/ FEE MANAGEMENT/);

    // Verify main header
    const mainHeading = page.locator('h1');
    await expect(mainHeading).toContainText('Fee Management & Automated Regression System');

    // Verify Neo-Brutalist Ticker
    await expect(page.locator('.brutal-ticker')).toBeVisible();
    await expect(page.locator('.brutal-ticker')).toContainText('RUNTIME: BUN 1.3 // POSTGRESQL 16');

    // Verify 4 KPI Cards exist and display values
    const kpiStudents = page.locator('[data-testid="kpi-students"]');
    await expect(kpiStudents).toBeVisible();
    await expect(kpiStudents).toContainText('STUDENTS');

    const kpiCollections = page.locator('[data-testid="kpi-collections"]');
    await expect(kpiCollections).toBeVisible();
    await expect(kpiCollections).toContainText('COLLECTIONS');

    const kpiOutstanding = page.locator('[data-testid="kpi-outstanding"]');
    await expect(kpiOutstanding).toBeVisible();
    await expect(kpiOutstanding).toContainText('OUTSTANDING');

    const kpiRegression = page.locator('[data-testid="kpi-regression"]');
    await expect(kpiRegression).toBeVisible();
    await expect(kpiRegression).toContainText('REGRESSION HEALTH');

    // Verify Academic Departments grid is present
    await expect(page.getByText('Academic Departments & Student Counts')).toBeVisible();
  });

  test('UI-02: Students & Ledger Navigation and Modal Inspection', async ({ page }) => {
    // Navigate to Students & Ledger Tab
    const studentsTab = page.locator('[data-testid="tab-students"]');
    await studentsTab.click();

    // Wait for student records to load into the table
    const firstRow = page.locator('.brutal-table tbody tr').first();
    await expect(firstRow).toBeVisible({ timeout: 15000 });

    // Click "VIEW LEDGER" on the first student
    const viewLedgerBtn = page.getByRole('button', { name: 'VIEW LEDGER' }).first();
    await expect(viewLedgerBtn).toBeVisible();
    await viewLedgerBtn.click();

    // Verify Ledger Modal opens with student details
    await expect(page.getByText('BASE GROSS FEE:')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('NET PAYABLE:')).toBeVisible();
    await expect(page.getByText('OUTSTANDING DUE:')).toBeVisible();

    // Close the modal via data-testid
    const closeBtn = page.locator('[data-testid="close-ledger-btn"]');
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();
    await expect(page.getByText('BASE GROSS FEE:')).not.toBeVisible();
  });

  test('UI-03: Pure Fee Simulator Interactive Real-Time Recalculation', async ({ page }) => {
    // Navigate to Pure Fee Simulator Tab
    const calcTab = page.locator('[data-testid="tab-calculator"]');
    await calcTab.click();

    // Verify fee simulator heading
    await expect(page.getByText('Pure Calculation Engine Simulator')).toBeVisible();

    // Verify the fee breakdown summary shows base amount
    await expect(page.getByText('BASE GROSS AMOUNT:')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('NET PAYABLE:')).toBeVisible();

    // Check Merit Scholarship checkbox
    const meritCheckbox = page.locator('input[type="checkbox"]').first();
    await expect(meritCheckbox).toBeVisible();
    await meritCheckbox.check();

    // Allow API recalculation
    await page.waitForTimeout(600);
    await expect(page.getByText('(-) MERIT SCHOLARSHIP:')).toBeVisible({ timeout: 15000 });
  });

  test('UI-04: Financial Reports Navigation', async ({ page }) => {
    // Navigate to Financial Reports Tab
    const reportsTab = page.locator('[data-testid="tab-reports"]');
    await reportsTab.click();

    // Verify reports tab buttons
    await expect(page.getByRole('button', { name: /DEPARTMENT/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /MONTHLY/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /OUTSTANDING/i })).toBeVisible();

    // Switch to Monthly Collections report
    const monthlyBtn = page.getByRole('button', { name: /MONTHLY/i });
    await monthlyBtn.click();
    await page.waitForTimeout(500);

    // Switch to Outstanding Dues Aging report
    const outstandingBtn = page.getByRole('button', { name: /OUTSTANDING/i });
    await outstandingBtn.click();
    await page.waitForTimeout(500);
  });

  test('UI-05: Case Study Defect Lifecycle in Browser UI', async ({ page }) => {
    // Navigate to Regression Testing Lab Tab
    const testingTab = page.locator('[data-testid="tab-testing"]');
    await testingTab.click();

    // Verify Automated Regression Control Station heading
    await expect(page.getByText('Automated Regression Engine & Defect Lab')).toBeVisible();

    // Verify Defect Toggle button in Lab
    const labToggleBtn = page.locator('[data-testid="lab-toggle-defect-btn"]');
    await expect(labToggleBtn).toBeVisible();

    // Trigger Regression Suite from UI Lab
    const labRunBtn = page.locator('[data-testid="lab-trigger-run-btn"]');
    await expect(labRunBtn).toBeVisible();
    await labRunBtn.click();

    // Wait for the test run to finish
    await expect(labRunBtn).toContainText('TRIGGER RUN', { timeout: 25000 });

    // Verify regression run results appear in table
    const table = page.locator('.brutal-table');
    await expect(table).toBeVisible();
  });
});
