# 25 - Logging

## 1. Structured Logging Standard
The backend utilizes structured JSON logging (Winston or Pino) outputting machine-readable JSON in production and colorized human-readable logs in development.

## 2. Standard Log Schema
```json
{
  "timestamp": "2026-09-21T18:00:00.123Z",
  "level": "info",
  "message": "Fee assessment calculated",
  "context": "FeeService.assessStudent",
  "reqId": "req_c984210a",
  "data": {
    "studentId": "std_01",
    "feeStructureId": "fs_cse_01",
    "baseAmount": 50000,
    "netPayable": 45000,
    "outstanding": 45000
  }
}
```

## 3. Log Levels & Usage
- `DEBUG`: Granular calculation step values, SQL query durations, test assertion steps.
- `INFO`: Payment recorded, refund processed, student created, regression test run completed.
- `WARN`: Validation failure, unexpected input format, defect simulation mode currently active.
- `ERROR`: Unhandled exception, database connection failure, regression test failure detected.

## 4. Privacy & Data Masking
- Passwords, access tokens, and sensitive financial identifiers are masked before reaching log sinks.
