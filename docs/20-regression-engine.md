# 20 - Regression Engine

## 1. Engine Structure (`packages/testing`)
The Regression Engine is an automated test runner built to execute database-backed and programmatic test cases.

```text
packages/testing/
├── src/
│   ├── runner.ts           # Orchestrates suite execution and records metrics
│   ├── comparator.ts       # Deep object/number comparison with precision tolerance
│   ├── suites/             # Test suite registry
│   │   ├── calculation.ts  # Direct fee engine calculation vectors
│   │   ├── reports.ts      # Department, monthly, and student report assertions
│   │   └── full.ts         # Full 42-test canonical regression suite
│   ├── types.ts            # TypeScript interfaces for suites, runs, and results
│   └── index.ts            # Public API exports
└── package.json
```

## 2. Comparator Logic (`comparator.ts`)
Financial testing requires exact numeric precision without JavaScript IEEE-754 binary floating-point discrepancies:
- **Epsilon Comparison**: Numbers are compared within an absolute epsilon threshold ($\epsilon = 0.001$).
- **Structured JSON Diffing**: Compares expected JSON trees with actual JSON trees. When a difference is found, an annotated diff payload is produced:
  ```json
  {
    "field": "totalGrossBilled",
    "expected": 500000,
    "actual": 520000,
    "difference": 20000,
    "regressionType": "NUMERICAL_MISMATCH"
  }
  ```

## 3. Execution Pipeline
1. `runSuite(suiteCode, options)` fetches active test cases from PostgreSQL (or memory fixtures).
2. For each test case:
   - Evaluates execution target (Direct Fee Engine invocation or HTTP Report query).
   - Records execution time in milliseconds.
   - Runs `compareOutput(expected, actual)`.
   - Populates a `TestResult` record.
3. Computes summary metrics: `totalTests`, `passed`, `failed`, `durationMs`.
4. Saves `TestRun` and all child `TestResult` records into the database.
5. Returns the completed run details to the caller.
