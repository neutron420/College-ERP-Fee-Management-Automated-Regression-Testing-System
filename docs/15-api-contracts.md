# 15 - API Contracts

## 1. Fee Calculation Preview (`POST /api/fees/calculate`)

### Request Payload
```json
{
  "components": [
    { "type": "TUITION", "name": "Tuition Fee", "amount": 40000 },
    { "type": "EXAMINATION", "name": "Exam Fee", "amount": 5000 },
    { "type": "LIBRARY", "name": "Library Fee", "amount": 2000 },
    { "type": "LABORATORY", "name": "Lab Fee", "amount": 3000 }
  ],
  "scholarships": [
    { "code": "MERIT_10", "name": "Merit Scholarship", "type": "PERCENTAGE", "value": 10 }
  ],
  "discounts": [
    { "code": "SIBLING_2000", "name": "Sibling Concession", "type": "FIXED", "value": 2000 }
  ],
  "dueDate": "2026-09-30T00:00:00.000Z",
  "calculationDate": "2026-10-10T00:00:00.000Z",
  "graceDays": 0,
  "finePerDay": 50,
  "payments": [
    { "amount": 20000, "status": "SUCCESS", "paymentDate": "2026-10-05T12:00:00.000Z" }
  ],
  "refunds": []
}
```

### Response Payload
```json
{
  "success": true,
  "data": {
    "baseAmount": 50000,
    "breakdown": {
      "tuition": 40000,
      "examination": 5000,
      "library": 2000,
      "laboratory": 3000,
      "development": 0,
      "hostel": 0,
      "miscellaneous": 0
    },
    "scholarshipAmount": 5000,
    "discountAmount": 2000,
    "totalConcessions": 7000,
    "lateDays": 10,
    "lateFineAmount": 500,
    "netPayable": 43500,
    "grossPaidAmount": 20000,
    "refundedAmount": 0,
    "netPaidAmount": 20000,
    "outstandingAmount": 23500,
    "status": "PARTIALLY_PAID",
    "isDefectSimulated": false
  },
  "error": null,
  "meta": {
    "timestamp": "2026-09-21T18:00:00.000Z"
  }
}
```

## 2. Department Fee Report (`GET /api/reports/department/:id?academicYearId=...`)

### Response Payload
```json
{
  "success": true,
  "data": {
    "department": {
      "id": "dept_cse_01",
      "code": "CSE",
      "name": "Computer Science & Engineering"
    },
    "academicYear": {
      "id": "ay_2024_25",
      "yearCode": "2024-25"
    },
    "summary": {
      "totalStudents": 10,
      "totalGrossBilled": 500000,
      "totalScholarships": 25000,
      "totalDiscounts": 10000,
      "totalLateFines": 2500,
      "netReceivable": 467500,
      "totalCollected": 350000,
      "totalRefunded": 0,
      "netCollected": 350000,
      "totalOutstanding": 117500,
      "collectionPercentage": 74.87
    },
    "studentSummaries": [
      {
        "studentId": "std_01",
        "rollNumber": "CSE-2024-001",
        "name": "Alice Johnson",
        "grossBilled": 50000,
        "concessions": 5000,
        "fines": 0,
        "netPayable": 45000,
        "paid": 45000,
        "outstanding": 0,
        "status": "PAID"
      }
    ]
  },
  "error": null
}
```

## 3. Regression Test Execution (`POST /api/testing/runs`)

### Request Payload
```json
{
  "suiteCode": "FULL_REGRESSION",
  "triggerSource": "MANUAL"
}
```

### Response Payload
```json
{
  "success": true,
  "data": {
    "runId": "run_clv123456",
    "suiteCode": "FULL_REGRESSION",
    "engineVersion": "1.0",
    "defectActive": false,
    "totalTests": 42,
    "passed": 42,
    "failed": 0,
    "skipped": 0,
    "durationMs": 340,
    "status": "PASSED",
    "startedAt": "2026-09-21T18:00:00.000Z",
    "completedAt": "2026-09-21T18:00:00.340Z"
  },
  "error": null
}
```

## 4. Run Comparison (`GET /api/testing/compare?baseRunId=...&candidateRunId=...`)

### Response Payload
```json
{
  "success": true,
  "data": {
    "baseRun": {
      "id": "run_01",
      "version": "1.0",
      "status": "PASSED",
      "passed": 42,
      "failed": 0
    },
    "candidateRun": {
      "id": "run_02",
      "version": "1.1",
      "status": "FAILED",
      "passed": 37,
      "failed": 5
    },
    "hasRegression": true,
    "regressions": [
      {
        "testCaseCode": "TC_DEPT_REPORT_CSE_TOTAL",
        "name": "CSE Department Aggregate Fee Total",
        "targetModule": "REPORTS",
        "baseStatus": "PASS",
        "candidateStatus": "FAIL",
        "expected": { "totalGrossBilled": 500000 },
        "actual": { "totalGrossBilled": 520000 },
        "difference": { "totalGrossBilled": 20000 }
      }
    ]
  }
}
```
