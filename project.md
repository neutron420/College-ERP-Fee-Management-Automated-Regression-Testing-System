# College ERP Fee Management: Automated Whiteboard Regression Testing and Quality Gate System

**Document Version:** 1.0.0  
**Classification:** Technical System Specification & Architectural Manual  
**Repository:** College-ERP-Fee-Management---Automated-Regression-Testing-System  
**Date:** September 2026  

---

## Table of Contents

1. [Project Overview and Core Objective](#1-project-overview-and-core-objective)
2. [Problem Statement: Why this System is Necessary](#2-problem-statement-why-this-system-is-necessary)
3. [Why Testing is Critical in Financial Fee Engines](#3-why-testing-is-critical-in-financial-fee-engines)
4. [Regulatory, Quality, and Accounting Standards](#4-regulatory-quality-and-accounting-standards)
5. [Complete Technology Stack](#5-complete-technology-stack)
6. [Comprehensive Testing Taxonomy: What Testing We Have](#6-comprehensive-testing-taxonomy-what-testing-we-have)
7. [End-to-End Process Flow: How the Pipeline Operates](#7-end-to-end-process-flow-how-the-pipeline-operates)
8. [The 12-Step Horizontal Release Architecture](#8-the-12-step-horizontal-release-architecture)
9. [Enterprise Evaluator Features](#9-enterprise-evaluator-features)
10. [Database and Backend Architecture](#10-database-and-backend-architecture)
11. [Monorepo Directory Structure](#11-monorepo-directory-structure)
12. [Verification and Execution Guide](#12-verification-and-execution-guide)

---

## 1. Project Overview and Core Objective

The **College ERP Fee Management Automated Regression Testing System** is an enterprise-grade platform developed to solve a critical point of failure in higher education software: **untested software regressions in financial calculation routines**.

Higher education fee administration involves a combinatorial matrix of institutional variables:
- Degree programs and departments (e.g., Computer Science, Electronics, Mechanical, Civil)
- Admission quota classifications (Merit, Management, Sports, NRI)
- Academic terms and cohorts
- Recurring fee heads (Tuition, Laboratory, Library, Sports, Examination)
- Concessions, government waivers, and merit-based scholarship percentage deductions

When enterprise software developers modify fee calculation logic (e.g., revising tuition brackets or applying a new tax policy), unintended regressions frequently compromise related heads. 

This project provides:
1. An **infinite Excalidraw-style interactive whiteboard canvas** (`/pipeline`) that models the software delivery lifecycle horizontally.
2. **Rete.js modular visual nodes** displaying real-time fee evaluation states, progress metrics, and HTTP request telemetry.
3. An **Automated Regression Engine** that detects discrepancies before invoices reach student ledgers.
4. **Interactive testing tools** including a multi-defect scenario engine, a 3-way visual ledger diff inspector, a custom student test case playground, and IEEE 829 QA sign-off certification.

---

## 2. Problem Statement: Why this System is Necessary

In traditional academic institutions, fee billing is handled either by legacy monolithic ERPs or manual administrative accounting. When software patches are introduced:

1. **Silent Overcharging**: An off-by-one error or array duplication in a fee calculation service does not throw a server crash; it simply bills an extra fee head. Because the transaction succeeds with an HTTP 200, system monitors report zero errors while students are overcharged.
2. **Audit Exposure and Liability**: Overcharging an entire cohort of students creates massive legal exposure, regulatory scrutiny from education boards, and financial reconciliation costs.
3. **Disjointed QA Processes**: QA teams often test through static spreadsheets or isolated unit tests that fail to simulate multi-stage deployment lifecycles or visualize cumulative ledger damage.

This platform bridges software engineering and financial auditing by providing continuous, automated visual regression gates across every release stage.

---

## 3. Why Testing is Critical in Financial Fee Engines

Financial software requires zero-tolerance regression boundaries. Unlike UI rendering glitches, arithmetic errors in billing code compound across cohorts:

### Mathematical Impact Analysis

#### Case Study A: Duplicate Fee Head (`DOUBLE_LIBRARY_FEE`)
* **Standard Assessment**: Tuition (Rs. 45,000) + Library (Rs. 2,000) = Rs. 47,000
* **Defect Condition**: Developer mistakenly evaluates the library line twice: Rs. 45,000 + Rs. 2,000 + Rs. 2,000 = Rs. 49,000
* **Single Student Variance**: +Rs. 2,000 overcharge
* **Cohort Impact (60 students)**: Rs. 1,20,000 silent discrepancy

#### Case Study B: Missing Scholarship Waiver (`SCHOLARSHIP_DROP_GLITCH`)
* **Standard Assessment**: Tuition (Rs. 45,000) - Merit Waiver (25% = Rs. 11,250) + Library (Rs. 2,000) = Rs. 35,750
* **Defect Condition**: Concession array filter omitted in candidate release: Net = Rs. 47,000
* **Single Student Variance**: +Rs. 11,250 overcharge
* **Cohort Impact (60 students)**: Rs. 6,75,000 silent discrepancy

#### Case Study C: Surcharge Duplication (`QUOTA_SURCHARGE_BUG`)
* **Standard Assessment**: Tuition (Rs. 45,000) + Quota Surcharge (Rs. 25,000) + Library (Rs. 2,000) = Rs. 72,000
* **Defect Condition**: Surcharge applied in both department and quota routines: Net = Rs. 97,000
* **Single Student Variance**: +Rs. 25,000 overcharge
* **Cohort Impact (60 students)**: Rs. 15,00,000 silent discrepancy

Automated regression testing ensures that any variance between the baseline net ($\Delta \neq 0$) immediately trips the pipeline quality gate, halting deployment before any corrupted data touches the production database.

---

## 4. Regulatory, Quality, and Accounting Standards

This project has been engineered to comply with recognized industrial software and accounting benchmarks:

### 1. IEEE 829-2008 (Standard for Software and System Test Documentation)
* **Master Test Plan (MTP)**: Explicit test suite definitions (`FULL_REGRESSION`, `SMOKE_SUITE`, `FINANCIAL_LEDGER_SUITE`).
* **Test Incident Reporting**: Structured anomaly capture recording expected values, actual corruptions, root cause keys, and execution timestamps.
* **Test Summary Reports (TSR)**: Integrated QA sign-off certificate equipped with cryptographic verification hashes (SHA-256) and formal evaluator sign-off fields.

### 2. ISO/IEC 25010 (Software Product Quality Model)
* **Functional Suitability**: Verifies functional completeness, correctness, and mathematical precision across all fee formulas.
* **Reliability (Fault Tolerance)**: Frontend resilience design ensures graceful fallback handling during transient database disconnects or latency spikes.
* **Performance Efficiency**: Pacing engine benchmarked at ~1.5 seconds per step under standard mode and ~0.5 seconds under demo mode.

### 3. Generally Accepted Accounting Principles (GAAP) Double-Entry Integrity
* **Balance Consistency**: For every debit entry posted to a student ledger, a corresponding credit entry must balance across fee head accounts.
* **Zero Discrepancy Gate**: Releases are only approved when candidate ledger variance against baseline equals exactly Rs. 0.00.

---

## 5. Complete Technology Stack

The monorepo is architected with modern, battle-tested technologies:

### Monorepo & Build System
* **Turborepo**: High-performance monorepo orchestration caching build artifacts across workspaces.
* **pnpm / Bun Workspaces**: Strict symlinked package dependency management.

### Frontend Application (`apps/web`)
* **Next.js 16 (App Router)**: Utilizing Turbopack compiler, server-side streaming, and client-side hydration controls.
* **React 19**: Component lifecycle with hooks (`useState`, `useCallback`, `useRef`, `useMemo`, `useEffect`).
* **@xyflow/react (ReactFlow)**: Canvas engine customized to deliver an Excalidraw hand-drawn whiteboard aesthetic with infinite left-to-right panning and zoom capabilities.
* **Vanilla CSS / CSS-in-JS Tokens**: Clean styling system avoiding uncurated utilities, complete with micro-animations, socket glow effects, and responsive layout tokens.
* **Lucide React**: Vector iconography for status indicators, tools, and telemetry badges.

### Backend API Services (`apps/api`)
* **Express.js (v4.21)**: Modular REST API server handling testing, fee administration, payments, and reporting.
* **TypeScript 5.x**: End-to-end type safety spanning backend and frontend interfaces.
* **Prisma ORM (v6.x)**: Type-safe database queries, migrations, and relationship definitions.
* **PostgreSQL (Neon AWS Cloud)**: Cloud relational database storing student rosters, fee structures, test suites, and test run history.

### Core Internal Packages (`packages/*`)
* **`@repo/fee-engine`**: Pure mathematical domain calculation logic, completely isolated from HTTP or UI dependencies for absolute testability.
* **`@repo/database`**: Centralized Prisma schema, client exports, and database connection handlers.
* **`@repo/types`**: Shared DTOs, regression comparison interfaces, and defect scenario types.
* **`@repo/shared`**: Cross-cutting validation routines and formatting utilities.

---

## 6. Comprehensive Testing Taxonomy: What Testing We Have

The system implements a multi-tier testing strategy covering every layer of the monorepo:

### 1. Pure Mathematical Engine Tests
* Validates isolated calculations inside `@repo/fee-engine`.
* Ensures base fee + quota fee + incidental heads - scholarships = net payable down to two decimal places.

### 2. Automated Regression Test Suites
Configurable via the top toolbar dropdown:
* **Full Regression Suite (`FULL_REGRESSION`)**: 10 comprehensive test cases evaluating all combinations of department fees, quota surcharges, merit deductions, refund processing, and double-entry consistency.
* **Critical Smoke Sanity Suite (`SMOKE_SUITE`)**: 3 fast-path tests targeting primary tuition calculation and payment receipt generation.
* **Financial Ledger & Audit Suite (`FINANCIAL_LEDGER_SUITE`)**: 5 accounting tests asserting ledger debit-credit parity, receipt hashing, and zero-sum balance checks.

### 3. Fault Injection / Defect Simulation Testing
* Simulates live developer bugs injected through `POST /api/testing/defects/toggle`.
* Evaluates whether the test suite detects arithmetic anomalies and blocks deployment.

### 4. Visual 3-Way Diff Regression Testing
* Compares outputs side-by-side: `v1.0 Baseline` vs `v1.1 Defective` vs `v1.2 Restored`.
* Highlights specific ledger line items that incurred discrepancy.

### 5. Custom Student Test Case Playground
* User-defined test case builder allowing testers to input arbitrary student data and verify engine assertion results in real time.

### 6. End-to-End Pipeline Testing
* Automated execution through the 12 horizontal whiteboard steps with state progression, wire activation, and CI/CD quality gate enforcement.

---

## 7. End-to-End Process Flow: How the Pipeline Operates

The complete regression execution flow follows this state machine:

```
[ User Clicks 'RUN PIPELINE' ]
            │
            ▼
┌────────────────────────────────────────────────────────┐
│  STAGE 1: v1.0 CLEAN BASELINE (Blue Theme)             │
│  - Enroll student (Rahul Sharma, CSE, Merit)           │
│  - Compute baseline net fee: Rs. 47,000                │
│  - Generate clean ledger invoice                       │
│  - Execute Regression Suite: 10/10 Passed (Green)      │
│  - Store baseline run ID in database                   │
└────────────────────────────────────────────────────────┘
            │
            ▼ (Bridge Wire Activated)
┌────────────────────────────────────────────────────────┐
│  STAGE 2: v1.1 DEFECT GLITCH (Red Theme)               │
│  - Defect injected via API (e.g. DOUBLE_LIBRARY_FEE)   │
│  - Engine calculates corrupted fee: Rs. 49,000         │
│  - Ledger records +Rs. 2,000 overcharge                │
│  - Regression Suite triggers: TC-LIB-FEE FAILS         │
│  - CI/CD Gate blocks build & stops deployment          │
│  - Popover opens automatically with financial audit    │
└────────────────────────────────────────────────────────┘
            │
            ▼ (Bridge Wire Activated)
┌────────────────────────────────────────────────────────┐
│  STAGE 3: v1.2 HOTFIX & VERIFICATION (Green Theme)     │
│  - Hotfix applied & defect simulation turned OFF       │
│  - Re-evaluate calculation: Rs. 47,000 verified        │
│  - Invoice regenerated with 0 discrepancy              │
│  - Regression Suite passes 10/10                       │
│  - Automated diff comparison verifies v1.0 == v1.2     │
│  - Release gate signs off production build             │
└────────────────────────────────────────────────────────┘
```

---

## 8. The 12-Step Horizontal Release Architecture

The whiteboard canvas models twelve discrete Rete.js cards divided across three release stages:

| Step # | Step Title | Version | Category | Expected Output / State |
|---|---|---|---|---|
| **Step 01** | Student Intake & Verification | v1.0 | Roster Ingestion | Student enrolled with validated department and quota parameters. |
| **Step 02** | Base Fee Structure Assessment | v1.0 | Calculation Engine | Tuition + Library fee computed: Net Rs. 47,000. |
| **Step 03** | Clean Ledger Billing Commit | v1.0 | Ledger Journal | Invoice generated; balance committed to student account. |
| **Step 04** | Baseline Regression Suite Run | v1.0 | Quality Gate | 10/10 assertions pass; benchmark baseline stored. |
| **Step 05** | Fault Injection & Toggle | v1.1 | Code Mutation | Candidate defect activated via API (`/defects/toggle`). |
| **Step 06** | Corrupted Fee Computation | v1.1 | Engine Anomaly | Engine evaluates duplicate head; net billed: Rs. 49,000. |
| **Step 07** | Billed Ledger Discrepancy | v1.1 | Financial Impact | Student overcharged +Rs. 2,000; cohort damage Rs. 1,20,000. |
| **Step 08** | Automated Audit Tripwire | v1.1 | Incident Interception | Test suite asserts variance $\neq$ 0; build fails; popover displays. |
| **Step 09** | Hotfix Deployment & Patch | v1.2 | Release Engineering | Defect deactivated; patched engine logic deployed. |
| **Step 10** | Re-evaluation of Fee Logic | v1.2 | Validation Engine | Recalculated net confirmed at Rs. 47,000. |
| **Step 11** | Restored Ledger Invoices | v1.2 | Financial Restoration | Student account reconciled with Rs. 0.00 delta. |
| **Step 12** | Diff & Release Sign-Off | v1.2 | Final Audit Gate | 3-way ledger comparison confirmed; QA sign-off granted. |

---

## 9. Enterprise Evaluator Features

### Feature 1: Multi-Defect Simulation Matrix
Allows evaluators to switch between three distinct software defects:
- **Double Library Fee**: Simulates duplicate head evaluation (+Rs. 2,000/student).
- **Missing Scholarship Waiver**: Simulates omission of merit percentage discount (+Rs. 11,250/student).
- **Management Quota Bug**: Simulates duplicate surcharge addition (+Rs. 25,000/student).

### Feature 2: Visual 3-Way Ledger Diff Inspector
An audit modal comparing line-by-line financial ledger entries across all three stages:
- Base v1.0 vs Defective v1.1 vs Restored v1.2.
- Immediately identifies which fee line caused the discrepancy and displays exact monetary deltas.

### Feature 3: IEEE 829 & ISO 25010 QA Sign-Off Certificate
A formal audit document modal featuring:
- Official compliance stamps (QA Approved & Audit Certified).
- Cryptographic SHA-256 verification signature.
- Test pass rate, duration, and financial variance metrics.
- One-click print / export to PDF function.

### Feature 4: CI/CD Pipeline Quality Gate Monitor
A visual build gate simulator modeling GitHub Actions / GitLab CI pipelines:
- Shows successful build on commit `v1.0-release`.
- Shows failed build and blocked deployment on commit `v1.1-buggy`.
- Shows restored passing build on commit `v1.2-hotfix`.

### Option 2: Test Suite Switcher
Allows evaluators to change test suite scope on the fly (`Full Regression`, `Smoke Sanity`, `Ledger Audit`).

### Option 3: Custom Student Test Case Playground
Allows evaluators to test arbitrary student parameters live:
- Input custom student names, departments, quotas, tuition, and library fees.
- Click **"Run Live Test on This Student"** to evaluate engine assertions.
- Click **"Apply This Student to Canvas Pipeline"** to re-render the entire whiteboard pipeline with that student's specific metrics.

---

## 10. Database and Backend Architecture

### PostgreSQL Database Schema (Prisma ORM)
The database stores all operational and testing records:
* `TestSuite`: Contains registered test suites (`FULL_REGRESSION`, etc.).
* `TestCase`: Individual assertions with expected values and test codes.
* `TestRun`: Stores executed runs, duration, pass/fail counts, and engine version.
* `TestResult`: Granular results for each test case in a run.
* `DefectSimulation`: Stores active defect keys, descriptions, and activation timestamps.
* `Student`, `FeeHead`, `FeeStructure`, `StudentFeeAssessment`, `Payment`: Production ERP records.

### Resilient Hybrid Design
To guarantee that presentations and evaluations remain uninterrupted:
* Every pipeline action issues an asynchronous HTTP request to the Express backend (`http://localhost:4000`).
* If the remote cloud database experiences connection latency, the client-side engine seamlessly applies mathematical fallback calculations, preventing UI freezes or application crashes.

---

## 11. Monorepo Directory Structure

```text
fee-testing/
├── apps/
│   ├── web/                         # Next.js 16 (Turbopack) Web Application
│   │   ├── app/
│   │   │   ├── page.tsx             # Main ERP Fee Management Dashboard
│   │   │   ├── pipeline/            # Whiteboard Regression Canvas (Excalidraw + Rete.js)
│   │   │   │   └── page.tsx         # 12-Node Horizontal Visual Pipeline
│   │   │   ├── test-runs/           # Test Runs List & Historical Comparisons
│   │   │   └── defects/             # Defect Injection Control Center
│   │   └── components/              # Navigation, layout, and shared UI components
│   │
│   └── api/                         # Express.js REST API Server
│       ├── src/
│       │   ├── modules/
│       │   │   ├── testing/         # Test suites, runs, comparisons, defect toggles
│       │   │   ├── fees/            # Fee calculation and structure services
│       │   │   ├── students/        # Student management services
│       │   │   └── payments/        # Ledger and payment receipt handling
│       │   └── server.ts            # API Server Entry Point (Port 4000)
│
├── packages/
│   ├── fee-engine/                  # Pure fee calculation mathematical engine
│   ├── database/                    # Prisma Schema, migrations, and PostgreSQL client
│   ├── types/                       # Shared TypeScript interfaces & DTOs
│   ├── shared/                      # Common validation schemas and constants
│   ├── ui/                          # Shared UI component primitives
│   └── typescript-config/           # Centralized tsconfig presets
│
├── project.md                       # Complete System Specification Manual (This Document)
├── README.md                        # Master Project Documentation
├── package.json                     # Monorepo Workspace Configuration (pnpm / bun)
└── turbo.json                       # Turborepo Build & Dev Task Orchestration
```

---

## 12. Verification and Execution Guide

### Local Development Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Start all services concurrently via Turborepo
pnpm run dev

# Or start services individually:
# Terminal 1: Backend API (Port 4000)
cd apps/api && bun run src/server.ts

# Terminal 2: Web Frontend (Port 3000)
cd apps/web && npm run dev
```

### URLs for Evaluation
* **Whiteboard Regression Canvas**: `http://localhost:3000/pipeline`
* **Main ERP Dashboard**: `http://localhost:3000`
* **Backend API Health**: `http://localhost:4000/api/testing/suites`

---

*Authored for the College ERP Automated Regression Testing Project. Compliant with IEEE 829 and ISO/IEC 25010 standards.*
