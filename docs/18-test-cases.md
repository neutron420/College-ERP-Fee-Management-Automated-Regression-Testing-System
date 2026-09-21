# 18 - Test Cases

## 1. Canonical Calculation Test Cases

| Test Case ID | Name | Inputs | Expected Output | Module |
| :--- | :--- | :--- | :--- | :--- |
| `TC-CALC-001` | Standard 4-Component Base Fee | Tuition: ₹40,000, Exam: ₹5,000, Library: ₹2,000, Lab: ₹3,000 | Base: ₹50,000, Net: ₹50,000 | `FEE_ENGINE` |
| `TC-CALC-002` | Percentage Scholarship (10%) | Base: ₹50,000, Scholarship: 10% | Scholarship: ₹5,000, Net: ₹45,000 | `FEE_ENGINE` |
| `TC-CALC-003` | Fixed Discount (₹2,000) | Base: ₹50,000, Discount: ₹2,000 | Discount: ₹2,000, Net: ₹48,000 | `FEE_ENGINE` |
| `TC-CALC-004` | Combined Scholarship & Discount | Base: ₹50,000, Schol: 10% (₹5k), Disc: ₹2k | Concessions: ₹7,000, Net: ₹43,000 | `FEE_ENGINE` |
| `TC-CALC-005` | Late Fine (10 days @ ₹50/day) | Base: ₹50,000, Overdue: 10 days, Fine: ₹50 | Late Fine: ₹500, Net: ₹50,500 | `FEE_ENGINE` |
| `TC-CALC-006` | Partial Payment | Net: ₹50,000, Payment: ₹30,000 | Paid: ₹30,000, Outstanding: ₹20,000, Status: `PARTIALLY_PAID` | `FEE_ENGINE` |
| `TC-CALC-007` | Full Payment | Net: ₹50,000, Payment: ₹50,000 | Paid: ₹50,000, Outstanding: ₹0, Status: `PAID` | `FEE_ENGINE` |
| `TC-CALC-008` | Refund Reconciliation | Paid: ₹50,000, Refund: ₹10,000 | Net Paid: ₹40,000, Outstanding: ₹10,000 | `FEE_ENGINE` |
| `TC-CALC-009` | Zero Fee Structure | All components: ₹0 | Base: ₹0, Net: ₹0 | `FEE_ENGINE` |
| `TC-CALC-010` | 100% Scholarship Waiver | Base: ₹50,000, Schol: 100% | Scholarship: ₹50,000, Net: ₹0 | `FEE_ENGINE` |

## 2. Canonical Report Regression Test Cases

| Test Case ID | Name | Scope / Filter | Expected Output | Vulnerable to Defect? |
| :--- | :--- | :--- | :--- | :--- |
| `TC-REP-001` | CSE Department Total Billed | 10 Students @ ₹50,000 | Total Gross Billed: ₹5,00,000 | **YES** (Fails if Library Fee duplicated: Actual ₹5,20,000) |
| `TC-REP-002` | ECE Department Total Billed | 8 Students @ ₹48,000 | Total Gross Billed: ₹3,84,000 | **YES** (Fails if Library Fee duplicated: Actual ₹4,00,000) |
| `TC-REP-003` | Monthly Collection Summary | September Collections | Verified Total: ₹4,50,000 | NO (Tracks payments directly) |
| `TC-REP-004` | Outstanding Balances Total | Unpaid Balances | Total Outstanding: ₹1,85,000 | **YES** (Fails if Net Payable is inflated) |
| `TC-REP-005` | Student Ledger Accuracy | Student `CSE-2024-001` | Net Payable: ₹45,000 | **YES** (Fails if Library Fee duplicated: Actual ₹47,000) |
