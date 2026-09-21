# 29 - Environment Configuration

## 1. Environment Variable Reference

| Variable | Description | Default / Example | Required |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Application environment (`development`, `test`, `production`) | `development` | Yes |
| `PORT` | API listening port | `4000` | No |
| `API_PORT` | Alias for API port | `4000` | No |
| `WEB_PORT` | Frontend listening port | `3000` | No |
| `DATABASE_URL` | PostgreSQL connection string for active runtime | `postgresql://postgres:postgres@localhost:5432/college_erp_fee` | Yes |
| `TEST_DATABASE_URL` | PostgreSQL connection string for automated tests | `postgresql://postgres:postgres@localhost:5432/college_erp_fee_test` | For tests |
| `LOG_LEVEL` | Minimum log level (`debug`, `info`, `warn`, `error`) | `debug` | No |
| `DEFECT_SIMULATION_ENABLED` | Allows defect toggling in dev/test | `false` | Dev/Test |
| `DEFECT_KEY` | Initial defect to inject on startup (`NONE`, `DOUBLE_LIBRARY_FEE`) | `NONE` | No |

## 2. Configuration Validation
All environment variables are validated at startup via a dedicated Zod schema (`apps/api/src/config/env.ts`). If any required variable is missing or malformed, the process exits immediately with a descriptive startup error.
