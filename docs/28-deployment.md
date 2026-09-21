# 28 - Deployment

## 1. Containerization
The system is deployable via multi-stage Dockerfiles:
- **API Container (`apps/api`)**: Runs Bun runtime in production mode, listening on port 4000.
- **Web Container (`apps/web`)**: Next.js standalone output container, listening on port 3000.
- **Database**: Managed PostgreSQL instance (AWS RDS, Supabase, or local Docker).

## 2. Production Checklist
1. `NODE_ENV=production` must be set.
2. `DEFECT_SIMULATION_ENABLED=false` must be strictly enforced.
3. Database migrations applied (`prisma migrate deploy`).
4. Automated smoke test run executed to verify fee calculation health.
