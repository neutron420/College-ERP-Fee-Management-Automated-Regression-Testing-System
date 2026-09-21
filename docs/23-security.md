# 23 - Security

## 1. Security Architecture
The platform handles sensitive student records and financial transactions. Security is enforced through defense-in-depth:

### 1.1 Input Validation & Sanitization
- All HTTP endpoints validate request payloads against strict Zod schemas.
- Extra unknown keys are stripped.
- Path and query parameters are cast and validated with typed parsers.
- SQL injection prevention is guaranteed through Prisma's parameterized query engine.

### 1.2 Access Control & Boundaries
- Role-Based Access Control (RBAC) separates administrative permissions (modifying fee structures, approving refunds) from cashier permissions (recording payments) and read-only report viewing.
- Defect simulation toggles are hard-blocked when `process.env.NODE_ENV === 'production'`.

### 1.3 Financial Audit Logging
- Every mutation to fees, payments, refunds, and simulation flags generates an immutable row in the `audit_logs` table.
- Logs capture actor, timestamp, IP address, previous state JSON, and new state JSON.

### 1.4 Secret Management
- Database credentials and application secrets are stored exclusively in `.env` files.
- `.env` is ignored by Git; `.env.example` provides template keys with dummy values.
