# 14 - API Design

## 1. REST Conventions
The API adheres strictly to RESTful design patterns:
- **Resource Nouns**: Use plural nouns (`/api/students`, `/api/departments`, `/api/payments`).
- **Standard HTTP Verbs**:
  - `GET`: Safe, idempotent retrieval.
  - `POST`: Non-idempotent resource creation or computational execution.
  - `PUT`/`PATCH`: Resource updates.
  - `DELETE`: Safe soft-deactivation or removal.
- **Uniform Response Envelope**:
  ```typescript
  export interface ApiResponse<T> {
    success: boolean;
    data: T | null;
    error: {
      code: string;
      message: string;
      details?: unknown;
    } | null;
    meta?: {
      page?: number;
      limit?: number;
      total?: number;
      timestamp: string;
    };
  }
  ```

## 2. Status Codes
- `200 OK`: Successful retrieval or computational evaluation.
- `201 Created`: Successful resource creation.
- `400 Bad Request`: Schema validation error or malformed payload.
- `404 Not Found`: Target entity does not exist.
- `409 Conflict`: Unique constraint violation (e.g. duplicate roll number).
- `422 Unprocessable Entity`: Business invariant violation (e.g. refund exceeds payment).
- `500 Internal Server Error`: Unhandled server exception with redacted stack in production.

## 3. Route Map
```text
/api/departments
  GET    /                 # List all departments
  POST   /                 # Create department
  GET    /:id              # Get department by ID
  PATCH  /:id              # Update department

/api/academic-years
  GET    /                 # List academic years
  POST   /                 # Create academic year
  PATCH  /:id/current      # Set as current academic year

/api/students
  GET    /                 # List/search students (with department/year filters)
  POST   /                 # Register new student
  GET    /:id              # Get student profile + assessments
  PATCH  /:id              # Update student details
  GET    /:id/ledger       # Detailed fee ledger for student

/api/fee-structures
  GET    /                 # List fee structures
  POST   /                 # Create fee structure with components
  GET    /:id              # Get fee structure details

/api/fees
  POST   /calculate        # Pure fee calculation preview endpoint
  POST   /assess           # Generate or re-evaluate assessment for student

/api/payments
  GET    /                 # List payment transactions
  POST   /                 # Record new payment
  GET    /:id              # Get payment details
  POST   /:id/refund       # Issue refund against payment

/api/reports
  GET    /student/:id      # Student fee report
  GET    /department/:id   # Department fee aggregation report
  GET    /monthly          # Monthly collection summary report
  GET    /outstanding      # Outstanding fee ledger report

/api/testing
  GET    /suites           # List test suites
  GET    /test-cases       # List test cases
  POST   /runs             # Trigger a regression test run
  GET    /runs             # List historical test runs
  GET    /runs/:id         # Get specific run details and results
  GET    /compare          # Compare two runs (baseline vs candidate)
  GET    /defects          # Get defect simulation status
  POST   /defects/toggle   # Toggle simulated defect flag (dev/test only)
```
