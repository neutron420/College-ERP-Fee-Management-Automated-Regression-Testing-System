# 06 - Use Cases

## 1. Actors
- **College Finance Administrator / Bursar**: Manages fee structures, sets fee components, configures discount and fine policies.
- **Accountant / Cashier**: Collects student fee payments, issues receipts, records refund requests.
- **Academic Officer**: Manages department rosters, student enrollment, and academic year statuses.
- **QA Engineer / Test Manager**: Executes automated regression test suites, inspects expected vs. actual discrepancies, reviews run histories.
- **Software Developer / System Architect**: Maintains fee calculation engine, conducts bug fixes, simulates defects for testing verification.

## 2. Core Use Cases

### UC-1: Define Academic Fee Structure
- **Primary Actor**: Finance Administrator
- **Preconditions**: Department and Academic Year exist.
- **Main Flow**:
  1. Administrator selects Department and Academic Year.
  2. Administrator adds Fee Components: Tuition (₹40,000), Exam (₹5,000), Library (₹2,000), Lab (₹3,000).
  3. Administrator sets payment due date and fine schedule (e.g., ₹50/day grace 7 days).
  4. System validates and saves structure.
  5. Fee assessments are created or updated for associated students.

### UC-2: Process Student Payment
- **Primary Actor**: Accountant
- **Preconditions**: Student fee assessment exists with outstanding balance > 0.
- **Main Flow**:
  1. Accountant looks up student by Roll Number.
  2. System displays current fee assessment (Net Payable: ₹50,000, Paid: ₹0, Outstanding: ₹50,000).
  3. Accountant enters payment amount (e.g., ₹30,000) and payment method (UPI / Bank Transfer).
  4. System records Payment in `SUCCESS` status and generates a transaction reference.
  5. System updates assessment: Paid: ₹30,000, Outstanding: ₹20,000, Status: `PARTIALLY_PAID`.

### UC-3: Generate Department Fee Collection Report
- **Primary Actor**: Finance Administrator
- **Preconditions**: Students and fee assessments are populated.
- **Main Flow**:
  1. Administrator requests report for CSE Department for Academic Year 2024-25.
  2. Report service fetches enrolled students and invokes the Fee Engine to evaluate each student ledger.
  3. Service aggregates Total Billed, Total Scholarships, Total Discounts, Total Fines, Total Collected, and Net Outstanding.
  4. Administrator reviews tabulated summary and exportable metrics.

### UC-4: Execute Automated Regression Test Suite
- **Primary Actor**: QA Engineer
- **Preconditions**: Test cases seeded in database.
- **Main Flow**:
  1. QA Engineer accesses Testing Dashboard and triggers `FULL_REGRESSION` suite.
  2. Regression runner loads 42 test cases.
  3. Runner executes test vectors against Fee Engine and Reporting services.
  4. Runner evaluates actual results against expected assertions.
  5. TestRun record is created with summary: 42 passed, 0 failed.

### UC-5: Defect Simulation & Regression Failure Detection (Case Study)
- **Primary Actor**: QA Engineer / Developer
- **Preconditions**: System operating in Development/Testing mode.
- **Main Flow**:
  1. Developer activates simulated defect: "Double Count Library Fee".
  2. Engine begins computing ₹52,000 instead of ₹50,000 for standard structures.
  3. QA Engineer triggers regression run.
  4. Tests for Fee Calculation, Department Report, and Outstanding Report fail.
  5. Regression dashboard flags:
     - Expected Department Total: ₹5,00,000
     - Actual Department Total: ₹5,20,000
     - Difference: +₹20,000
     - Status: `REGRESSION DETECTED`
  6. Developer deactivates defect (simulating a code fix).
  7. Regression suite is re-run: 42/42 tests pass.
