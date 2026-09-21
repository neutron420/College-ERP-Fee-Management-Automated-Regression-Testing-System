# 01 - Project Overview

## 1. Executive Summary
The **College ERP Fee Management & Automated Regression Testing System** is an enterprise-grade academic financial management solution paired with an automated regression testing platform. It addresses one of the most pervasive challenges in software maintenance: ensuring that modifications in core business calculation logic do not silently corrupt dependent features such as financial reports, billing summaries, and audit ledgers.

## 2. The Core Problem Statement
In educational ERPs, fee calculation logic is central to multiple subsystems:
- Real-time student billing
- Receipt generation
- Department budget consolidation
- Institutional cash-flow and collection reports
- Outstanding debt recovery

When a developer modifies the fee calculation engine to fix an isolated bug or introduce a new rule, unintended side-effects often ripple across the application. Without a rigorous, automated regression testing suite, such errors slip into production, resulting in erroneous financial reporting and compliance violations.

## 3. Case Study Alignment
This system is engineered around a canonical Software Engineering case study:
> *"A defect is corrected in the fee-calculation module of a college ERP. After the correction, previously working reports start producing incorrect totals. Regression testing is required to ensure that modifications do not break existing functionality."*

The platform provides a controlled simulation environment demonstrating:
1. **Version 1.0 (Baseline)**: Fee engine correctly computes ₹50,000 (Tuition ₹40,000 + Exam ₹5,000 + Library ₹2,000 + Lab ₹3,000). All reports match expected totals. All regression tests pass (42/42).
2. **Version 1.1 (Defect Injected)**: Modification inadvertently duplicates the library fee, producing ₹52,000. All dependent reports now generate inflated figures. The regression suite executes, identifies the exact discrepancies, and halts release.
3. **Version 1.2 (Defect Resolved)**: The engine logic is corrected, the regression suite is rerun, and full green status is restored.

## 4. Key Deliverables
- **Core Fee Management Domain**: Full CRUD for Departments, Academic Years, Students, Fee Structures, Scholarships, Discounts, Payments, and Refunds.
- **Pure Fee Calculation Engine (`packages/fee-engine`)**: Zero-dependency deterministic computation engine.
- **Unified Reporting Subsystem**: Student, Department, Monthly Collection, and Outstanding Fee reports deriving figures exclusively through the Fee Engine.
- **Automated Regression Engine (`packages/testing`)**: Multi-suite runner, deep expected-vs-actual comparator, run history, and comparative diff visualization.
- **Modern User Interface**: Responsive Next.js 15+ dashboard with interactive test execution, comparison views, and report analytics.
