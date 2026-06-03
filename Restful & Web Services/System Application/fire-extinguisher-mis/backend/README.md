# Fire Extinguisher Management System (FEMS) — Backend

> **🎉 Microservices Migration Complete!**  
> The backend has been migrated to a microservices architecture with zero breaking changes.  
> All API endpoints remain unchanged. See **[MICROSERVICES.md](MICROSERVICES.md)** for details.

A production-ready RESTful backend for managing fire extinguishers, inspections, maintenance, compliance reporting, and users. Built with **Express + Bun + PostgreSQL + Prisma + Zod + JWT**, structured as an **API Gateway + microservice modules** following the **Controller → Service → Repository** pattern.

---

## Project Overview

FEMS lets organisations register extinguishers, schedule and track inspections, log maintenance, enforce compliance, and generate reports/exports (PDF & CSV) — all secured with JWT authentication and role-based access control (ADMIN, INSPECTOR, USER).

### 📊 Documentation & Diagrams

- **[Database Schema](docs/DATABASE-DIAGRAM.dbml)** - Complete ER diagram for dbdiagram.io
- **[Architecture Diagrams](docs/ARCHITECTURE-DIAGRAMS.md)** - 10 Mermaid diagrams (microservices, flows, deployment)
- **[Diagrams Guide](docs/DIAGRAMS-QUICK-REFERENCE.md)** - How to use and render the diagrams
- **[Microservices Guide](MICROSERVICES.md)** - Detailed architecture documentation
- **[Migration Report](MIGRATION-COMPLETE.md)** - Monolith to microservices migration summary

### Key features

- JWT auth (access + refresh tokens, rotation), bcrypt password hashing
- Password reset (forgot / reset with expiring tokens)
- RBAC across all routes (ADMIN / INSPECTOR / USER)
- Full CRUD for extinguishers, inspections, maintenance, users
- Pagination, searching, filtering, sorting on list endpoints
- Reporting: dashboard, daily/monthly/yearly totals, inspection status, expired units, maintenance history
- PDF & CSV export with downloadable URLs
- Swagger/OpenAPI 3.0 docs at `/api/docs`
- Audit trail + Winston request/error logging to `logs/`
- Security: Helmet, CORS, HPP, rate limiting, input validation/sanitization
- Docker + Docker Compose, health check, graceful shutdown
- Unit + integration tests, Postman collection

---

## Architecture

**Microservices Architecture** (migrated from modular monolith)

```
backend/
├── api-gateway/             # Port 5000 - Entry point, routing, CORS, rate limiting
│   ├── src/index.ts
│   ├── Dockerfile
│   └── package.json
├── auth-service/            # Port 5001 - Authentication, JWT management
│   ├── src/
│   ├── prisma/
│   ├── Dockerfile
│   └── package.json
├── user-service/            # Port 5002 - User CRUD, profiles
│   ├── src/
│   ├── prisma/
│   └── package.json
├── extinguisher-service/    # Port 5003 - Extinguisher management
│   ├── src/
│   ├── prisma/
│   └── package.json
├── inspection-service/      # Port 5004 - Inspection records
│   ├── src/
│   ├── prisma/
│   └── package.json
├── maintenance-service/     # Port 5005 - Maintenance tracking
│   ├── src/
│   ├── prisma/
│   └── package.json
├── reporting-service/       # Port 5006 - Reports, PDF/CSV exports
│   ├── src/
│   ├── prisma/
│   └── package.json
├── docker-compose.yml       # Orchestration for all services
├── start-dev.sh            # Development manager
└── MICROSERVICES.md        # Detailed architecture guide
```

The **API Gateway** forwards requests to the appropriate microservice while maintaining all original API endpoints. All services share a **single PostgreSQL database** for simplified deployment and data consistency. See **[MICROSERVICES.md](MICROSERVICES.md)** for detailed architecture documentation.

---

## Requirements

- [Bun](https://bun.sh) ≥ 1.0
- PostgreSQL ≥ 14 (or use Docker Compose)

---

## Installation

### Quick Start (All Services)

```bash
# Install dependencies for all services
cd api-gateway && bun install && cd ..
cd auth-service && bun install && cd ..
cd user-service && bun install && cd ..
cd extinguisher-service && bun install && cd ..
cd inspection-service && bun install && cd ..
cd maintenance-service && bun install && cd ..
cd reporting-service && bun install && cd ..
```

Or use the automated script (see [MICROSERVICES.md](MICROSERVICES.md)).

## Configuration

Copy the example environment file and adjust values:

```bash
cp .env.example .env
```

| Variable | Description |
| --- | --- |
| `NODE_ENV` | `development` / `production` |
| `PORT` | HTTP port (default `5000`) |
| `DATABASE_URL` | PostgreSQL connection string (URL-encode special chars: `&` → `%26`) |
| `JWT_SECRET` / `JWT_EXPIRES_IN` | Access token secret + lifetime |
| `JWT_REFRESH_SECRET` / `JWT_REFRESH_EXPIRES_IN` | Refresh token secret + lifetime |
| `RESET_TOKEN_EXPIRES_MIN` | Password reset token lifetime (minutes) |
| `CORS_ORIGIN` | Allowed origin(s), comma-separated |
| `LOG_LEVEL` | Winston log level |
| `RATE_LIMIT_*` / `AUTH_RATE_LIMIT_MAX` | Rate limiting config |
| `BCRYPT_SALT_ROUNDS` | bcrypt cost factor |
| `EXPORT_DIR` | Directory for generated report files |

> The configured database is `fems-db` with user `r-yvan`. The password contains `&`, which **must** be URL-encoded as `%26` inside `DATABASE_URL`.

---

## Database: migrate & seed

```bash
# Generate Prisma client
bun run prisma:generate

# Create the schema (runs an initial migration)
bun run prisma:migrate

# Seed admin/inspector/user + 50 extinguishers + inspections + maintenance
bun run db:seed
```

Reset everything (drops, re-migrates, re-seeds):

```bash
bun run db:reset
```

### Seeded login credentials

| Role | Email | Password |
| --- | --- | --- |
| ADMIN | `admin@fems.com` | `Admin@123` |
| INSPECTOR | `inspector@fems.com` | `Inspector@123` |
| USER | `user@fems.com` | `User@123` |

---

## Running

### Development Mode

**Option 1: Automated (Recommended)**
```bash
# Start all services
./start-dev.sh start

# Check status
./start-dev.sh status

# View logs
./start-dev.sh logs api-gateway

# Stop all services
./start-dev.sh stop
```

**Option 2: Manual (7 terminals)**
```bash
# Terminal 1: API Gateway
cd api-gateway && bun run dev

# Terminal 2-7: Microservices
cd auth-service && bun run dev
cd user-service && bun run dev
cd extinguisher-service && bun run dev
cd inspection-service && bun run dev
cd maintenance-service && bun run dev
cd reporting-service && bun run dev
```

### Production

```bash
bun run start  # In each service directory
```

Or use Docker Compose:

```bash
docker compose up --build
```

Server: `http://localhost:5000` (API Gateway)  
Health: `http://localhost:5000/health`

See **[MICROSERVICES.md](MICROSERVICES.md)** for detailed setup instructions.

---

## Swagger / API documentation

**Interactive API documentation is now available!**

- **Swagger UI**: `http://localhost:5000/api/docs`
- **OpenAPI JSON**: `http://localhost:5000/api/docs.json`

### Quick Start with Swagger

1. Start the API Gateway:
   ```bash
   cd api-gateway && bun run dev
   # OR
   ./start-dev.sh start
   ```

2. Open browser: `http://localhost:5000/api/docs`

3. **Authenticate**:
   - Click `POST /api/auth/login`
   - Try it out with: `{"email":"admin@fems.com","password":"Admin@123"}`
   - Execute and copy the `accessToken`
   - Click **Authorize** button (🔓 at top right)
   - Enter: `Bearer <your-access-token>`
   - Now you can test all protected endpoints!

4. **Test APIs**: All 60+ endpoints are documented with:
   - Request/response schemas
   - Query parameters
   - Authentication requirements
   - "Try it out" functionality
   - Example data

See **[Swagger Documentation Guide](docs/SWAGGER-DOCUMENTATION.md)** for detailed usage.

---

## API summary

All routes are prefixed with `/api`. Successful responses use:

```json
{ "success": true, "message": "Operation successful", "data": {} }
```

Errors use:

```json
{ "success": false, "message": "Validation failed", "errors": [] }
```

List endpoints return a `pagination` object: `{ page, limit, total, pages }`.

| Area | Endpoints |
| --- | --- |
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `POST /auth/refresh-token`, `POST /auth/forgot-password`, `POST /auth/reset-password`, `GET /auth/me` |
| Users | `GET /users`, `GET /users/:id`, `POST /users`, `PUT /users/:id`, `DELETE /users/:id`, `GET/PUT /users/profile`, `PUT /users/change-password` |
| Extinguishers | `POST/GET /extinguishers`, `GET/PUT/DELETE /extinguishers/:id` |
| Inspections | `POST/GET /inspections`, `GET/PUT/DELETE /inspections/:id` |
| Maintenance | `POST/GET /maintenance`, `GET/PUT/DELETE /maintenance/:id` |
| Reports | `GET /reports/dashboard`, `/extinguishers`, `/inspection-status`, `/expired`, `/maintenance-history`, `/export/pdf`, `/export/csv`, `/download/:fileName` |

### Query examples

```
/api/extinguishers?page=1&limit=10
/api/extinguishers?status=ACTIVE
/api/extinguishers?type=CO2
/api/extinguishers?search=warehouse
/api/extinguishers?sortBy=expiryDate&sortOrder=asc
```

---

## Testing

```bash
# Unit tests (no DB required)
bun test tests/unit

# Integration tests (require a migrated + seeded DB)
bun test tests/integration

# Everything
bun test
```

Integration tests boot the gateway on an ephemeral port and exercise the auth flow and RBAC.

### Postman

Import `docs/postman/FEMS.postman_collection.json` and `docs/postman/FEMS.postman_environment.json`. Run **Auth → Login (Admin)** first — it stores `accessToken`/`refreshToken` automatically for subsequent requests.

---

## Docker deployment

### Production (Microservices)

```bash
# From the backend directory
docker compose up --build
```

This starts:
- PostgreSQL (5432)
- 6 microservices (5001-5006)
- API Gateway (5000) - your entry point

The API Gateway is exposed on `http://localhost:5000`. All services define health checks and start in dependency order.

To seed inside the running container:

```bash
docker exec -it fems-auth-service bunx prisma db seed
```

See **[MICROSERVICES.md](MICROSERVICES.md)** for advanced Docker configuration.

---

## Security

- **JWT**: short-lived access tokens + rotating refresh tokens (revoked on logout/reset)
- **Passwords**: bcrypt hashing, never stored in plaintext; strong-password policy enforced via Zod
- **Rate limiting**: global limiter + stricter limiter on `/auth/login` & `/auth/register`
- **Helmet**: secure HTTP headers
- **CORS**: configurable allowed origins
- **HPP** + Zod validation: protects against parameter pollution & malicious payloads
- **Secrets**: sourced only from environment variables

---

## Logging & audit

- HTTP requests, auth events, CRUD operations and errors are logged via Winston to `logs/combined.log` and `logs/error.log` (plus console in development).
- Important actions (who/what/when, old/new values) are persisted to the `audit_logs` table.

---

## Production readiness

- Graceful shutdown on `SIGINT`/`SIGTERM`
- `/health` endpoint with uptime
- Environment-based configuration
- Centralised error handling + structured logging ready for monitoring tools
