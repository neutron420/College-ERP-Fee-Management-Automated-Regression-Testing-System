# 26 - Development Workflow

## 1. Prerequisites
- **Bun**: `>= 1.3.x`
- **Node.js**: `>= 20.x` (for Turborepo compatibility)
- **Docker**: For running PostgreSQL database container

## 2. Initial Setup
```bash
# 1. Clone repository
cd fee-testing

# 2. Start PostgreSQL via Docker Compose
docker compose -f docker/docker-compose.yml up -d

# 3. Copy environment configuration
cp .env.example .env

# 4. Install dependencies via Bun
bun install

# 5. Push Prisma schema to database and generate client
bun run db:push

# 6. Seed initial departments, students, fee structures, and test cases
bun run db:seed
```

## 3. Daily Development Commands
- `bun run dev`: Start all apps (`apps/api` on `:4000`, `apps/web` on `:3000`) concurrently via Turborepo.
- `bun run build`: Build all packages and applications.
- `bun run test`: Run unit and integration tests across packages.
- `bun run test:regression`: Execute canonical 42-test automated regression suite via CLI.
- `bun run check-types`: Run strict TypeScript validation across the monorepo.
- `bun run lint`: Run ESLint checks.
