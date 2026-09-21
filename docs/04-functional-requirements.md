# 04 - Functional Requirements

## 1. Module FR-1: Department Management
- **FR-1.1**: The system shall create, update, retrieve, and list academic departments.
- **FR-1.2**: Each department must have a unique identifier, unique short code (e.g., `CSE`, `ECE`), full name, and description.
- **FR-1.3**: The system shall prevent deletion of departments that have associated students or fee structures.

## 2. Module FR-2: Academic Year Management
- **FR-2.1**: The system shall allow creating and maintaining academic years (e.g., `2024-25`).
- **FR-2.2**: The system shall allow designating exactly one academic year as the `isCurrent` year.
- **FR-2.3**: Academic years must define a valid `startDate` and `endDate`.

## 3. Module FR-3: Student Management
- **FR-3.1**: The system shall register students with Roll Number, First Name, Last Name, Email, Department, and Academic Year.
- **FR-3.2**: The system shall enforce uniqueness on Roll Number and Email.
- **FR-3.3**: The system shall allow filtering students by Department, Academic Year, and Status (`ACTIVE`, `INACTIVE`, `GRADUATED`).
- **FR-3.4**: The system shall support full-text search across student names and roll numbers.

## 4. Module FR-4: Fee Structure & Assessment
- **FR-4.1**: The system shall define fee structures tied to a specific Department and Academic Year.
- **FR-4.2**: A fee structure shall contain multiple fee components (Tuition, Exam, Library, Lab, Development, Hostel, Misc).
- **FR-4.3**: The system shall calculate student assessments based on their assigned fee structure, active scholarships, applicable discounts, and late fines.
- **FR-4.4**: Assessments must record `baseAmount`, `scholarshipAmount`, `discountAmount`, `lateFineAmount`, `netPayable`, `paidAmount`, and `outstandingAmount`.

## 5. Module FR-5: Payments & Refunds
- **FR-5.1**: The system shall record payments against specific fee assessments with payment date, transaction reference, payment method, and amount.
- **FR-5.2**: The system shall update the assessment's `paidAmount`, `outstandingAmount`, and status (`UNPAID`, `PARTIALLY_PAID`, `PAID`, `OVERDUE`).
- **FR-5.3**: The system shall record refunds non-destructively, linking each refund to the parent payment and adjusting net paid balances.

## 6. Module FR-6: Financial Reports
- **FR-6.1**: **Student Fee Report**: Granular ledger for a selected student displaying all components, waivers, payments, and balance.
- **FR-6.2**: **Department Fee Report**: Aggregate totals per department including total billed, total waivers, total collections, and outstanding.
- **FR-6.3**: **Monthly Collection Report**: Chronological summary of successful fee collections grouped by month.
- **FR-6.4**: **Outstanding Fee Report**: Roster of all students with non-zero balances categorized by delinquency duration.
- **FR-6.5**: All reports must derive values through the core Fee Calculation Engine.

## 7. Module FR-7: Automated Regression Testing
- **FR-7.1**: The system shall maintain test suites (`FEE_CALCULATION`, `PAYMENT`, `STUDENT`, `REPORTS`, `INTEGRATION`, `FULL_REGRESSION`).
- **FR-7.2**: The runner shall execute test cases and evaluate actual output against expected output using a deterministic comparator.
- **FR-7.3**: The system shall store test runs with metrics: total tests, passed, failed, duration, and timestamp.
- **FR-7.4**: The system shall provide side-by-side run comparisons highlighting regressions in red.
- **FR-7.5**: The system shall support toggling simulated defects in development/testing mode to demonstrate regression detection.
