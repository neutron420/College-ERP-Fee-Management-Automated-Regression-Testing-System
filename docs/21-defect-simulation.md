# 21 - Defect Simulation

## 1. Objective & Principle
To realistically demonstrate the case study without corrupting database integrity, the platform implements a controlled, isolated **Defect Simulation Hook**.

The defect simulation:
- Must NOT permanently corrupt saved database records.
- Must ONLY be accessible in Development or Test environments (`NODE_ENV !== 'production'`).
- Can be activated or deactivated with a single configuration flag or UI toggle button.

## 2. Simulated Defect Scenarios

### Scenario A: Double-Counted Library Fee (Canonical Case Study)
- **Normal Engine Logic**:
  ```typescript
  const baseAmount = components.reduce((sum, c) => sum + c.amount, 0);
  ```
- **Defect Injected Logic**:
  ```typescript
  let baseAmount = components.reduce((sum, c) => sum + c.amount, 0);
  if (defectFlags?.doubleCountLibraryFee) {
    const libraryComp = components.find(c => c.type === 'LIBRARY');
    if (libraryComp) {
      baseAmount += libraryComp.amount; // Inadvertently added twice
    }
  }
  ```
- **Impact**:
  - Individual student fee with ₹2,000 library fee calculates as ₹52,000 instead of ₹50,000.
  - Department report with 10 students calculates as ₹5,20,000 instead of ₹5,00,000.
  - Outstanding balances report reflects an extra ₹20,000 in uncollected dues.

### Scenario B: Discount Omission in Net Payable
- **Defect**: The engine ignores institutional discounts when aggregating net payable amounts.
- **Impact**: Students entitled to sibling or staff ward discounts are billed the full gross amount.

## 3. Demonstration Script (v1.0 -> v1.1 -> v1.2)
1. **v1.0 (Clean Baseline)**: Defect toggle OFF. Run regression tests. Result: 42/42 Pass (Green).
2. **v1.1 (Defect Injected)**: Defect toggle ON ("Double Count Library Fee"). Run regression tests. Result: 37 Pass, 5 Fail (Red). Inspect discrepancy cards in Testing Dashboard.
3. **v1.2 (Defect Resolved)**: Defect toggle OFF. Run regression tests. Result: 42/42 Pass (Green). Run comparison view highlights the transition from FAIL back to PASS.
