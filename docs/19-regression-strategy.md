# 19 - Regression Strategy

## 1. The Core Case Study & Rationale
Regression testing is essential in mission-critical financial applications because changes in shared calculations silently propagate to downstream reports.

```text
               +---------------------------------+
               |  Fee Calculation Engine         |
               |  (calculateStudentFee)          |
               +----------------+----------------+
                                |
             +------------------+------------------+
             |                  |                  |
             v                  v                  v
    Student Fee Report   Department Report   Outstanding Report
```

When a developer alters the Fee Engine, every report that aggregates student fees will mirror that alteration. Without regression tests covering both the core engine AND the reporting summaries, errors go unnoticed until financial audits or student billing disputes occur.

## 2. Regression Lifecycle
1. **Establish Baseline (Version 1.0)**:
   - All tests run against certified logic.
   - Outputs are verified and stored as canonical assertions (`expectedOutput`).
2. **Detect Regressions (Version 1.1)**:
   - When logic changes, the suite executes.
   - Any divergence between `actualOutput` and `expectedOutput` flags a `REGRESSION DETECTED` status.
   - The engine logs the difference, identifying the affected modules and the monetary magnitude of the error.
3. **Verify Resolution (Version 1.2)**:
   - Following bug rectification, the suite re-runs.
   - Green status is re-established across all 42 test cases.
