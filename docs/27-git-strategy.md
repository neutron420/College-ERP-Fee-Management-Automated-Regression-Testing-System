# 27 - Git Strategy

## 1. Branching Strategy
The project follows GitHub Flow:
- `main`: Production-ready baseline. All commits on `main` must pass unit, integration, and regression suites.
- `feature/<feature-name>`: Scoped branches for specific domain modules or UI enhancements.
- `fix/<issue-name>`: Targeted bug fixes.
- `experiment/<defect-test>`: Experimental demonstration branches.

## 2. Commit Message Convention
Adheres to the Conventional Commits specification:
- `feat(fee-engine)`: Add late fine grace period rules
- `fix(reports)`: Correct departmental fee aggregation accumulator
- `test(regression)`: Add canonical test vectors for sibling discounts
- `docs(api)`: Update response contracts for payment endpoints
- `refactor(db)`: Add composite index on student roll number

## 3. Pull Request Requirements
Every PR must pass automated CI checks:
1. TypeScript strict typecheck (`bun run check-types`)
2. Linter without warnings (`bun run lint`)
3. Fee engine unit tests 100% passing
4. Full regression testing suite clean run (42/42 pass)
