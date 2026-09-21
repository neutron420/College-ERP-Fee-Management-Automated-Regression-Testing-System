# 03 - System Scope

## 1. In-Scope Functionality
The system boundaries encompass the following primary capabilities:

### Core ERP Fee Management Subsystem
- **Master Data Management**: Departments, Academic Years, Students, Enrollment Lifecycle.
- **Fee Configuration**: Fee structures, modular fee heads/components, fee amounts per department/year.
- **Concessions & Waivers**: Merit/need-based scholarships, sibling/sports discounts, employee ward discounts.
- **Fine Management**: Per-day or fixed late fine penalties calculated deterministically beyond due dates.
- **Billing & Assessment**: Student fee assessment computation, real-time balance calculations.
- **Receipts & Transactions**: Payment capture (Cash, Net Banking, UPI, Card), transaction references, status transitions.
- **Adjustment & Refunds**: Audit-safe refund tracking linked to specific payments and assessments.
- **Reporting Engine**: Consolidated reports for students, departments, monthly receipts, and aging debtors.

### Automated Regression Testing Subsystem
- **Test Case Repository**: Pre-defined test vectors capturing canonical inputs and expected outputs.
- **Test Execution Engine**: Synchronous and background suite runner executing calculations and API checks.
- **Expected vs. Actual Comparator**: High-precision numeric and structural diff analyzer.
- **Regression Run History**: Storage of run snapshots (timestamp, engine version, pass/fail counts, duration).
- **Run Comparison Utility**: Diff comparison between baseline and modified runs.
- **Controlled Defect Simulator**: Secure flag to inject specific defects for academic and QA demonstrations.

## 2. Out-of-Scope (Future Enhancements)
- Multi-campus synchronization across geographically dispersed universities.
- Direct integration with commercial payment gateways (e.g., Stripe, Razorpay) with live webhook handling (mocked via standard transaction reference workflow).
- Complex biometric attendance integration.
- Full payroll and general ledger accounting beyond fee receivables.
