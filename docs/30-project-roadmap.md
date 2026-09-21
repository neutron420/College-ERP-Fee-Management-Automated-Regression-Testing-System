# 30 - Project Roadmap

## 1. Phase Milestones

```mermaid
gantt
    title Development Order & Milestones
    dateFormat  YYYY-MM-DD
    section Preparation
    Phase 0: Understanding           :done,    p0, 2026-09-21, 1d
    Phase 1: Documentation & Scaffold:active,  p1, 2026-09-21, 1d
    section Backend & Database
    Phase 2: Database Layer          :         p2, after p1, 1d
    Phase 3: Backend Foundation      :         p3, after p2, 1d
    Phase 4: Core Domain Modules     :         p4, after p3, 1d
    Phase 5: Fee Calculation Engine  :         p5, after p4, 1d
    Phase 6: Reporting Subsystem     :         p6, after p5, 1d
    section Testing & Simulation
    Phase 7: Testing Infrastructure  :         p7, after p6, 1d
    Phase 8: Regression Engine       :         p8, after p7, 1d
    Phase 9: Defect Simulation       :         p9, after p8, 1d
    Phase 10: Playwright E2E Tests   :         p10, after p9, 1d
    Phase 11: CI/CD Pipeline         :         p11, after p10, 1d
    section Frontend & Validation
    Phase 12: Next.js Frontend       :         p12, after p11, 2d
    Phase 13: Final Validation       :         p13, after p12, 1d
```

- **Phase 0 & 1 (Current)**: Architecture, Monorepo layout, 31 documentation guides, `memory.md`.
- **Phase 2**: PostgreSQL schema, Prisma migrations, realistic seed data (50-100 students).
- **Phase 3 & 4**: Bun + Express API foundation, Zod validation, domain modules.
- **Phase 5**: Pure `fee-engine` package with >95% Vitest coverage.
- **Phase 6**: Reporting module consuming the shared Fee Engine.
- **Phase 7 & 8**: Testing infrastructure, automated regression engine, expected vs actual diff comparator.
- **Phase 9**: Controlled defect simulation demonstrating the real-world case study.
- **Phase 10 & 11**: Playwright E2E tests and GitHub Actions CI.
- **Phase 12**: Next.js 15+ frontend dashboard, reports, and regression control panel.
- **Phase 13**: Final regression verification and live demonstration.
