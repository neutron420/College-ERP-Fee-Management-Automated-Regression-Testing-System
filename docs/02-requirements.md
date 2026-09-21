# 02 - Requirements

## 1. Business Requirements
1. **Academic Administration**:
   - The institution must define dynamic departments (e.g., Computer Science, Electronics, Electrical, Civil, Mechanical) without hardcoding department codes into source code.
   - The institution must define academic calendar years (e.g., 2024-25, 2025-26, 2026-27) and mark active/current terms.
   - The institution must register and manage student records with roll numbers, contact information, department affiliation, and enrollment status.

2. **Fee Structure & Billing**:
   - Fee structures must be configurable per department and academic year.
   - Fee structures must support multiple fee components (Tuition, Examination, Library, Laboratory, Campus Development, Hostel, Miscellaneous).
   - The system must support financial aid, scholarships (percentage and fixed), institutional discounts, and late payment fine policies.
   - Fee assessments must be generated for students reflecting their personalized net payable amounts.

3. **Collections & Reconciliation**:
   - The system must record payments with support for full payments, partial installments, and multiple payment methods.
   - Non-destructive refunds must be recorded against payments without deleting historical transaction records.
   - Accurate, up-to-date ledgers must track total billed, total paid, and total outstanding balances.

4. **Financial Reporting**:
   - Authorized personnel must be able to view Student Fee Breakdown Reports, Department Aggregate Fee Reports, Monthly Cash Collection Reports, and Outstanding Balances Reports.
   - All reports must reflect consistent calculation rules identical to student billing.

5. **Quality Assurance & Regression Testing**:
   - The platform must include an integrated regression testing engine capable of running automated test suites against the fee calculation engine and reports.
   - The system must capture and store test results, expected vs. actual values, and historical runs.
   - A defect simulation mode must exist to demonstrate regression failure detection and post-fix resolution.
