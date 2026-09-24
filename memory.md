# Project Memory

## Project
College ERP Fee Management & Automated Regression Testing System

## Objective
Build a production-quality, modular College ERP Fee Management System integrated with an automated regression testing platform. The primary objective is to demonstrate the Software Engineering regression testing principle:
"A defect is corrected in the fee-calculation module of a college ERP. After the correction, previously working reports start producing incorrect totals. Regression testing is required to ensure that modifications do not break existing functionality."

The platform must provide complete fee management (students, departments, academic years, fee structures, discounts, scholarships, late fines, payments, refunds, assessments) coupled with automated test suites, expected-vs-actual diff comparison, test run history, and a controlled defect simulator demonstrating clean baseline (v1.0) -> defect introduced and regression detected (v1.1) -> fix verified and regression resolved (v1.2).

## Case Study
A college ERP fee calculation engine calculates student billing based on configurable components (Tuition, Exam, Library, Lab, etc.), scholarships, discounts, and late fines.
- **Initial Baseline (v1.0)**:
  - Tuition: ₹40,000 | Exam: ₹5,000 | Library: ₹2,000 | Lab: ₹3,000 -> Total = ₹50,000.
  - Student, Department, Monthly Collection, and Outstanding reports all calculate matching totals.
  - All 42 automated regression tests pass.
- **Defect Injection (v1.1)**:
  - A developer modifies the fee calculation engine to fix a minor issue or adjust logic, but accidentally introduces a defect (e.g., the library component is counted twice, or discounts are applied erroneously), producing ₹52,000 instead of ₹50,000.
  - Because all four reports consume the exact same shared Fee Engine, previously correct reports now produce inflated totals.
  - The Automated Regression Testing Engine runs the regression suite, immediately catches the failure, pinpointing:
    - Affected Test Case (e.g., Department Fee Report Aggregate)
    - Expected Result: ₹5,00,000
    - Actual Result: ₹5,20,000
    - Discrepancy: +₹20,000
    - Status: REGRESSION DETECTED
- **Defect Correction (v1.2)**:
  - The defect is fixed in the Fee Engine.
  - The regression test suite is re-executed.
  - All 42 tests pass with 0 failures.

## Current Architecture
- **Monorepo**: Turborepo + Bun workspaces.
- **Backend API (`apps/api`)**: Express + TypeScript modular monolith with controller-service-repository pattern, Zod validation, centralized error handling, and structured logging.
- **Frontend (`apps/web`)**: Next.js 15+ App Router, TypeScript, Tailwind CSS, and shadcn/ui.
- **Database Package (`packages/database`)**: PostgreSQL with Prisma ORM, migrations, and realistic seed data (50–100 students).
- **Fee Engine Package (`packages/fee-engine`)**: Pure domain calculation engine, completely isolated from HTTP/UI frameworks. Deterministic input/output with zero side-effects.
- **Testing Package (`packages/testing`)**: Dedicated regression testing engine containing test suites, runners, deep expected-vs-actual comparator, and historical result storage.
- **Shared Packages**: `packages/shared` (helpers, currency math), `packages/types` (cross-cutting DTOs), `packages/config` (tooling configs).

## Technology Stack
- **Runtime & Package Manager**: Bun (>= 1.3.x)
- **Monorepo Tooling**: Turborepo
- **Language**: TypeScript 5.x / 7.x (Strict Mode)
- **Database**: PostgreSQL 16 (via Docker Compose / local)
- **ORM**: Prisma 6.x
- **API Framework**: Express 4.x / 5.x with Bun runtime
- **Validation**: Zod
- **Unit & Integration Testing**: Vitest, Supertest
- **E2E Testing**: Playwright
- **Frontend**: Next.js 15+, React 19, Tailwind CSS, shadcn/ui, Lucide React

## Repository Structure
```text
college-erp-regression/
├── apps/
│   ├── api/                    # Express + TypeScript REST API
│   └── web/                    # Next.js frontend application
├── packages/
│   ├── database/               # Prisma schema, migrations, seed script
│   ├── fee-engine/             # Isolated pure calculation engine
│   ├── testing/                # Regression runner, suites, comparator
│   ├── shared/                 # Common validation, math & date utils
│   ├── config/                 # Tooling configuration
│   └── types/                  # Shared TypeScript interfaces & types
├── tests/
│   ├── integration/            # API integration tests
│   └── e2e/                    # Playwright end-to-end tests
├── prisma/                     # Database schema mapping
├── docs/                       # 31 comprehensive architecture & design docs
├── scripts/                    # Build, test, and seed automation scripts
├── docker/                     # Docker Compose for PostgreSQL
├── .github/workflows/          # CI/CD pipelines
├── .env.example
├── turbo.json
├── package.json
├── README.md
└── memory.md
```

## Database
- Relational schema modeled in PostgreSQL via Prisma.
- Key entities:
  - `Department`: Academic departments (CSE, ECE, EEE, CIVIL, MECH).
  - `AcademicYear`: Term periods (2024-25, 2025-26, 2026-27).
  - `Student`: Student demographics, department, academic year, status.
  - `FeeStructure`: Versioned fee template per department and academic year.
  - `FeeComponent`: Line items (Tuition, Exam, Library, Lab, Dev, Hostel, Misc).
  - `Scholarship`: Merit/need-based reduction (PERCENTAGE or FIXED).
  - `Discount`: Institutional discounts (PERCENTAGE or FIXED).
  - `StudentScholarship` & `StudentDiscount`: Mapping students to reductions.
  - `FeeAssessment`: Student billing ledger, tracking baseAmount, reductions, fines, paid, outstanding.
  - `Payment`: Financial transactions with audit-ready statuses (PENDING, SUCCESS, FAILED, REFUNDED).
  - `Refund`: Non-destructive credit/refund adjustments.
  - `TestCase`, `TestSuite`, `TestRun`, `TestResult`: Regression testing storage.
  - `DefectSimulation`: Configuration for injecting controlled defects.
  - `AuditLog`: Immutable audit trail for financial actions.

## Backend
- Layered modular design:
  - Route -> Controller -> Service -> Repository -> Database / Fee Engine.
- Endpoints return standard response envelope:
  `{ success: true, data: ..., error: null, meta: ... }`
- Global error handler catching typed `AppError` subclasses with clean HTTP status codes.
- Structured JSON logging with request IDs.

## Fee Engine
- Independent package `packages/fee-engine`.
- Zero dependencies on Express, HTTP, React, or Prisma.
- Pure function `calculateStudentFee(input)`:
  1. Base Amount = Sum of Fee Components.
  2. Scholarship Amount = Evaluated on Base Amount.
  3. Discount Amount = Evaluated on Remaining Base Amount.
  4. Late Fine Amount = Evaluated based on Due Date vs Calculation Date.
  5. Net Payable = Base + Late Fine - Scholarship - Discount.
  6. Paid Amount = Sum of successful payments - processed refunds.
  7. Outstanding Amount = Net Payable - Paid Amount.
- Defect Simulation Hook: When `defectFlags.doubleCountLibraryFee` is active, the engine intentionally duplicates the library fee to demonstrate regression.

## Testing
- Unit testing: Vitest covering all fee engine edge cases (zero values, percentages, boundaries, refunds).
- Integration testing: Supertest exercising REST endpoints with transactional database rollback.
- Regression testing: Dedicated database-backed test runner executing canonical test vectors against engine and reports.
- E2E testing: Playwright validating student fee flows, payment recording, and regression comparison dashboard.

## Regression Strategy
- Automated regression suite runs 42 core tests covering calculation vectors, student reports, department aggregations, monthly collections, and outstanding aging.
- Every run persists `TestRun` and `TestResult` records.
- Run-to-run comparison highlights regressions in red with exact numerical and structural diffs.

## Current Phase
- **Phase 10 / 12**: Automated E2E Testing & Frontend Dashboard Development.

## Completed
- Phase 0: Project understanding and environment verification.
- Phase 1: Documentation-first foundation completed:
  - All 31 technical documents generated in `/docs/*.md`.
  - Monorepo package directories created (`apps/api`, `packages/database`, `packages/fee-engine`, `packages/testing`, `packages/shared`, `packages/types`, `docker`, `scripts`, `.github/workflows`).
  - `.env.example` and `docker/docker-compose.yml` created.
  - Root `memory.md` initialized.
- Phase 2: Database Layer Completed:
  - Prisma schema with normalized models and enums pushed to live Neon PostgreSQL database.
  - Prisma client generated.
  - Database seeded with 5 departments, 1 academic year, 60 students, 5 fee structures, 20 fee components, 60 assessments, 45 payments, and regression test suites.
  - Database verification confirmed live records in Neon.
- Phase 3: Backend Foundation Completed:
  - Bun + Express modular REST API (`apps/api`) running on port 4000.
  - Zod validation middleware for body, query, and params.
  - Centralized error handling (`AppError`, `ValidationError`, `NotFoundError`, `ConflictError`, `BusinessRuleViolationError`).
  - Structured request logging with UUID correlation IDs.
- Phase 4: Core Domain Modules Completed:
  - `departments`: Listing, ID lookup, creation, update with student count relations.
  - `academic-years`: Term management, current year toggle.
  - `students`: Pagination, search, filters by department/academic year, student ledger profiles.
  - `fees`: Fee structures, components, calculation previews, student fee assessment creation.
  - `payments`: Recording payments with atomic status and balance updates on assessments.
  - `refunds`: Non-destructive refund processing and audit trail.
- Phase 5: Pure Fee Calculation Engine Completed:
  - Isolated `@repo/fee-engine` package with zero HTTP/UI dependencies.
  - Deterministic calculations for base fees, scholarships, discounts, late fines, net payable, and balances.
  - 14 Vitest unit tests passing in 100ms with 100% coverage of boundary cases.
- Phase 6: Reporting Subsystem Completed:
  - Student Fee Report, Department Fee Report, Monthly Collection Report, and Outstanding Balances Report implemented.
  - All reports derive figures strictly through `@repo/fee-engine`.
- Phase 7, 8 & 9: Automated Regression Testing & Defect Simulation Completed:
  - Test suites, runner, execution persistence (`TestRun`, `TestResult`), and side-by-side run comparison API.
  - Defect simulation toggle (`DOUBLE_LIBRARY_FEE`) demonstrates the complete case study:
    - v1.0 Clean: All regression tests PASS.
    - v1.1 Defect Injected: Tests FAIL with exact numerical differences (+₹2,000) flagged.
    - v1.2 Fixed: Tests PASS again.

## In Progress
- Phase 12: Next.js Frontend Dashboard (connecting to the fully validated backend).

## Pending
- Phase 10: Playwright E2E Tests.
- Phase 11: CI/CD Pipeline.
- Phase 12: Next.js Web Frontend.
- Phase 13: Final Validation & Demonstration.

## Important Decisions
1. **Isolated Fee Engine**: Calculation logic MUST remain in `packages/fee-engine` without HTTP or UI dependencies.
2. **Shared Reporting Logic**: Reports MUST use the Fee Engine; reports must NOT implement separate calculation algorithms.
3. **Non-destructive Financial Records**: Refunds never delete or modify historical payments; they create audit-friendly refund records.
4. **Controlled Defect Simulation**: Defect simulation is an explicit flag accessible only in dev/test environments.
5. **Phase Gate Enforcement**: Frontend development will strictly commence only after backend, database, fee engine, and regression engine are validated.

## Do Not Change Without Review
- Core case study scenario (₹50,000 baseline vs ₹52,000 defect with double-counted library component).
- Requirement for all reports to derive values through the Fee Engine.
- Directory and package structure of the Bun monorepo.
- Non-destructive payment and refund audit trail.

## Known Issues
- None at present.
