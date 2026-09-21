# 05 - Non-Functional Requirements

## 1. Performance & Scalability
- **NFR-1.1 (Calculation Latency)**: The core fee calculation function must execute in under 2 milliseconds for any individual student input payload.
- **NFR-1.2 (Report Generation)**: Aggregated department reports covering up to 5,000 student records must compute and return within 500 milliseconds.
- **NFR-1.3 (Regression Execution)**: The entire canonical regression test suite (40+ test cases) must complete execution and persistence within 3 seconds.

## 2. Reliability & Determinism
- **NFR-2.1 (Mathematical Determinism)**: The fee calculation engine must be a pure, idempotent function. Given identical inputs, it must produce identical numerical outputs with zero floating-point drift.
- **NFR-2.2 (Financial Rounding)**: All monetary figures must be rounded to two decimal places (or integer cents/paise) using standard half-up rounding rules to prevent cumulative truncation errors.
- **NFR-2.3 (Data Integrity)**: Database transactions (`SERIALIZABLE` or `READ COMMITTED` with advisory locking where required) must protect payment and assessment ledger mutations against race conditions.

## 3. Auditability & Traceability
- **NFR-3.1 (Immutable History)**: Payments and refunds must remain permanently logged. Modifying or deleting payment rows is prohibited; reversing transactions requires creating explicit refund entries.
- **NFR-3.2 (Audit Trail)**: Critical actions (fee structure updates, refund approvals, manual assessment overrides) must generate structured audit logs detailing user, timestamp, previous state, and new state.

## 4. Maintainability & Modularity
- **NFR-4.1 (Decoupled Engine)**: The `fee-engine` package must not import any HTTP, Express, React, or database drivers.
- **NFR-4.2 (Single Source of Truth)**: No reporting endpoint or UI component may replicate fee arithmetic. All computations must invoke the shared engine.
- **NFR-4.3 (Strict Typing)**: The entire codebase must adhere to strict TypeScript (`strict: true`, `noImplicitAny: true`, `strictNullChecks: true`).

## 5. Security & Isolation
- **NFR-5.1 (Defect Simulation Safeguard)**: Defect simulation mechanisms must be strictly gated by `NODE_ENV !== 'production'`. The production build must physically disallow defect activation.
- **NFR-5.2 (Input Validation)**: All HTTP endpoints must strictly validate payloads against Zod schemas before reaching service layers.
