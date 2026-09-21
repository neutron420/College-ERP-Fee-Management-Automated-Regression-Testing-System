# 08 - Backend Architecture

## 1. Modular Monolith Architecture
The backend is structured as a modular monolith within `apps/api`. Rather than scattering logic across unconstrained scripts, each business domain is cleanly contained within its own module directory:

```text
apps/api/src/
├── config/              # App configuration, env variables, constants
├── middleware/          # Request logging, auth, validation, error handler
├── modules/             # Domain modules
│   ├── departments/
│   │   ├── department.controller.ts
│   │   ├── department.service.ts
│   │   ├── department.repository.ts
│   │   ├── department.schema.ts
│   │   └── department.routes.ts
│   ├── academic-years/
│   ├── students/
│   ├── fees/
│   ├── payments/
│   ├── reports/
│   └── testing/
├── routes/              # Centralized route registration
├── utils/               # HTTP response helpers, formatting
├── errors/              # Domain and HTTP error classes
├── logger/              # Structured logging provider
└── server.ts            # Express server initialization
```

## 2. Layered Responsibilities

### 2.1 Controller Layer
- Unpacks HTTP request parameters (`body`, `query`, `params`).
- Delegates business logic execution to the service layer.
- Serializes results using standardized JSON envelopes:
  ```json
  {
    "success": true,
    "data": { ... },
    "error": null,
    "meta": { "timestamp": "2026-09-21T18:00:00Z" }
  }
  ```

### 2.2 Service Layer
- Contains all domain business logic and workflow orchestration.
- Coordinates calls between the repository layer and the pure `fee-engine`.
- Enforces cross-entity business invariants (e.g., cannot refund more than total successful payments).
- Manages atomic transactions across multiple database tables.

### 2.3 Repository Layer
- Encapsulates direct Prisma client queries.
- Abstracted interface allowing clean test mocking and database decoupling.
- Translates database records into domain entity models.

### 2.4 Shared Fee Engine Integration
- When computing a student fee assessment or generating reports, the service layer queries the database for active components, scholarships, discounts, and payments, passes this immutable snapshot into `calculateStudentFee(input)`, and saves or formats the result.
- **Critical Rule**: Under no circumstances does a repository or controller perform inline fee math.
