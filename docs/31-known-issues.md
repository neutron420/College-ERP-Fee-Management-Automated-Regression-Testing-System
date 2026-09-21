# 31 - Known Issues

## 1. Floating Point Precision in Financial Math
- **Issue**: Standard JavaScript numbers (`number`) are 64-bit binary floating-point (IEEE 754), which can cause rounding inaccuracies like `0.1 + 0.2 = 0.30000000000000004`.
- **Mitigation**: All monetary amounts are handled via fixed decimal utility functions (`packages/shared/src/money.ts`), rounding each computation to 2 decimal places using standard half-up rounding, or stored as Prisma `Decimal` with scale 2.

## 2. Windows Path & Child Process Quirks
- **Issue**: Running multi-package Turbo tasks on Windows systems can occasionally encounter locked file descriptors or command line length limits.
- **Mitigation**: Bun scripts use cross-platform commands and Turborepo caching is configured cleanly in `turbo.json`.

## 3. Asynchronous Test Isolation
- **Issue**: Concurrent regression test runs mutating shared test database records could produce race conditions in expected report counts.
- **Mitigation**: Integration tests execute with transactional rollbacks or unique test fixture prefixes, and regression suite test runs operate in scoped run contexts.
