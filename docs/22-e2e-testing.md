# 22 - End-to-End Testing (Playwright)

## 1. Scope of E2E Tests
Playwright tests reside in `tests/e2e` and validate full browser-driven user interactions from UI click to database persistence and visual feedback.

## 2. Primary Test Flows

### Flow 1: Student Fee & Payment Lifecycle
1. Open Web App $\rightarrow$ Navigate to `/students`.
2. Select student `CSE-2024-001` (Alice Johnson).
3. View Fee Assessment card: verify base fee (₹50,000), concessions (₹5,000), net payable (₹45,000).
4. Click "Record Payment", enter ₹45,000, select UPI, submit form.
5. Verify status badge updates to `PAID` with green highlight and zero outstanding balance.

### Flow 2: Department Fee Reporting
1. Navigate to `/reports/department`.
2. Filter by Department: `Computer Science & Engineering` and Year: `2024-25`.
3. Verify aggregate cards: Total Billed, Total Collected, Total Outstanding.
4. Export report preview or filter student table.

### Flow 3: Regression Dashboard & Defect Demonstration
1. Navigate to `/testing`.
2. Click "Run Regression Suite" button.
3. Observe live progress indicator and verify 42/42 tests pass (v1.0 Baseline).
4. Open Development panel $\rightarrow$ Toggle "Simulate Library Fee Defect" to ON.
5. Click "Run Regression Suite" again.
6. Verify status shifts to `REGRESSION DETECTED` (v1.1) with 5 failed tests.
7. Click into failed Department Report test $\rightarrow$ Verify expected ₹5,00,000 vs actual ₹5,20,000 diff.
8. Navigate to `/testing/compare` $\rightarrow$ View side-by-side run comparison matrix.
9. Toggle defect OFF $\rightarrow$ Re-run suite $\rightarrow$ Verify 42/42 tests pass (v1.2 Fixed).
