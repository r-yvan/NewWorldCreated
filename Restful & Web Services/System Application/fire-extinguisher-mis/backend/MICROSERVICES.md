# Fire Extinguisher Management System - Microservices Architecture

## Architecture Overview

The backend has been successfully migrated from a modular monolithic architecture to a microservices architecture using an API Gateway pattern. **API endpoints and URLs remain unchanged** - the gateway transparently forwards requests to the appropriate services.

### Services

| Service | Port | Responsibility | Endpoints |
|---------|------|----------------|-----------|
| **api-gateway** | 5000 | Edge proxy, CORS, rate limiting, routing | All `/api/*` routes |
| **auth-service** | 5001 | Authentication, JWT management | `/api/auth/*` |
| **user-service** | 5002 | User management, profiles | `/api/users/*` |
| **extinguisher-service** | 5003 | Extinguisher CRUD | `/api/extinguishers/*` |
| **inspection-service** | 5004 | Inspection records | `/api/inspections/*` |
| **maintenance-service** | 5005 | Maintenance records | `/api/maintenance/*` |
| **reporting-service** | 5006 | Reports, exports (PDF/CSV) | `/api/reports/*` |

### Database Architecture

All services share a **single PostgreSQL database** (`fems-db`) via Prisma Client. This is a pragmatic approach that:
- Maintains data consistency without distributed transactions
- Simplifies deployment (no database-per-service complexity)
- Enables straightforward migrations
- Allows future evolution to separate databases if needed

---

## Development Setup

### Prerequisites
- [Bun](https://bun.sh) ≥ 1.0
- PostgreSQL ≥ 14 (or use Docker Compose)

### 1. Install Dependencies

Each service has its own `package.json` and must be installed separately:

```bash
# API Gateway
cd api-gateway && bun install && cd ..

# All microservices
cd auth-service && bun install && cd ..
cd user-service && bun install && cd ..
cd extinguisher-service && bun install && cd ..
cd inspection-service && bun install && cd ..
cd maintenance-service && bun install && cd ..
cd reporting-service && bun install && cd ..
```

### 2. Database Setup

The database schema is managed by each service's Prisma schema. You need to migrate the database before starting:

```bash
# From any service directory (they all point to the same database)
cd auth-service
bun run prisma:generate
bunx prisma migrate dev
bunx prisma db seed  # Seeds admin, inspector, user + sample data
```

### 3. Environment Configuration

Each service has its own `.env` file:

**api-gateway/.env**
```env
PORT=5000
CORS_ORIGIN=http://localhost:3000
AUTH_SERVICE_URL=http://localhost:5001
USER_SERVICE_URL=http://localhost:5002
EXTINGUISHER_SERVICE_URL=http://localhost:5003
INSPECTION_SERVICE_URL=http://localhost:5004
MAINTENANCE_SERVICE_URL=http://localhost:5005
REPORTING_SERVICE_URL=http://localhost:5006
```

**Service .env files** (e.g., `auth-service/.env`):
```env
NODE_ENV=development
PORT=5001  # Unique per service: 5001-5006
DATABASE_URL=postgresql://r-yvan:Nry369%262008@localhost:5432/fems-db
JWT_SECRET=your_secret_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_REFRESH_EXPIRES_IN=7d
```

> **Note**: The password contains `&`, which must be URL-encoded as `%26` in `DATABASE_URL`.

### 4. Running Services (Development)

Each service runs independently. You'll need **7 terminal windows** (or use a process manager like PM2):

```bash
# Terminal 1: API Gateway
cd api-gateway && bun run dev

# Terminal 2: Auth Service
cd auth-service && bun run dev

# Terminal 3: User Service
cd user-service && bun run dev

# Terminal 4: Extinguisher Service
cd extinguisher-service && bun run dev

# Terminal 5: Inspection Service
cd inspection-service && bun run dev

# Terminal 6: Maintenance Service
cd maintenance-service && bun run dev

# Terminal 7: Reporting Service
cd reporting-service && bun run dev
```

**Access**: `http://localhost:5000` (all requests go through the gateway)

### Health Checks

Each service exposes a `/health` endpoint:

```bash
# Gateway health (also shows service registry)
curl http://localhost:5000/health

# Individual service health
curl http://localhost:5001/health  # auth-service
curl http://localhost:5002/health  # user-service
# ... etc
```

---

## Docker Deployment

### Production Deployment (Docker Compose)

The `docker-compose.yml` at the backend root orchestrates all services:

```bash
# From backend directory
docker compose up --build
```

This starts:
- **postgres** (5432) - Shared database
- **auth-service** (5001)
- **user-service** (5002)
- **extinguisher-service** (5003)
- **inspection-service** (5004)
- **maintenance-service** (5005)
- **reporting-service** (5006)
- **api-gateway** (5000) - Main entry point

Services start with health checks and dependency ordering (gateway waits for all services → services wait for postgres).

### Seed Data in Docker

```bash
docker exec -it fems-auth-service bunx prisma db seed
```

### Environment Variables for Docker

Set secrets via `.env` file or environment:

```bash
export JWT_SECRET=production_secret_here
export JWT_REFRESH_SECRET=production_refresh_secret_here
docker compose up
```

---

## API Usage

### No Breaking Changes

All existing API clients, Postman collections, and integrations work unchanged:

```bash
# Login (via gateway → auth-service)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@fems.com","password":"Admin@123"}'

# Get extinguishers (via gateway → extinguisher-service)
curl http://localhost:5000/api/extinguishers \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Dashboard report (via gateway → reporting-service)
curl http://localhost:5000/api/reports/dashboard \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Postman Collection

The existing Postman collection (`docs/postman/FEMS.postman_collection.json`) works as-is. Update the environment URL to `http://localhost:5000` if changed.

---

## Service Details

### API Gateway (`api-gateway/`)

**Responsibilities**:
- Single entry point for all clients
- CORS policy enforcement
- Global rate limiting (100 req/15min by default)
- Request routing to downstream services
- 502 handling for unavailable services

**No Authentication Logic**: The gateway is a transparent proxy. Authentication/authorization happens in individual services.

**Configuration**: See `api-gateway/.env`

### Auth Service (`auth-service/`)

**Responsibilities**:
- User registration & login
- JWT access/refresh token generation
- Password reset flow
- Token rotation & blacklisting
- Auth middleware export (used by other services)

**Endpoints**: `/api/auth/*`

**Database Tables**: `users`, `tokens`, `audit_logs`

### User Service (`user-service/`)

**Responsibilities**:
- User CRUD operations
- Profile management
- Password changes
- Role-based access control (ADMIN, INSPECTOR, USER)

**Endpoints**: `/api/users/*`

**Database Tables**: `users`, `audit_logs`

### Extinguisher Service (`extinguisher-service/`)

**Responsibilities**:
- Fire extinguisher registration
- Location tracking
- Status management (ACTIVE, EXPIRED, UNDER_MAINTENANCE)
- Expiry date monitoring

**Endpoints**: `/api/extinguishers/*`

**Database Tables**: `extinguishers`, `audit_logs`

### Inspection Service (`inspection-service/`)

**Responsibilities**:
- Inspection record creation
- Inspector assignments
- Pass/fail status tracking
- Scheduled inspection management

**Endpoints**: `/api/inspections/*`

**Database Tables**: `inspections`, `audit_logs`

### Maintenance Service (`maintenance-service/`)

**Responsibilities**:
- Maintenance record tracking
- Cost logging
- Technician assignments
- Maintenance history

**Endpoints**: `/api/maintenance/*`

**Database Tables**: `maintenance`, `audit_logs`

### Reporting Service (`reporting-service/`)

**Responsibilities**:
- Dashboard statistics
- Inspection status reports
- Expired extinguisher alerts
- Maintenance history queries
- PDF & CSV export generation
- File download endpoints

**Endpoints**: `/api/reports/*`

**Database Tables**: Queries all tables (read-only)

**Dependencies**: `pdfkit`, `json2csv`

---

## Type Checking

Each service is TypeScript-based. Run type checking:

```bash
# From any service directory
bunx tsc --noEmit
```

**All services currently pass type checking with zero errors.**

---

## Security

- **Edge Security**: CORS, Helmet, HPP applied at the gateway
- **Authentication**: JWT validation happens in each service's middleware (shared logic from auth-service)
- **Rate Limiting**: Global limit at gateway + stricter limits on auth endpoints
- **Input Validation**: Zod schemas in each service
- **Secrets**: Never committed; sourced from environment

---

## Logging & Monitoring

- **Winston Logging**: Each service logs to `logs/combined.log` and `logs/error.log`
- **Request Logging**: HTTP requests logged with method, path, status, duration
- **Audit Trail**: Sensitive operations (CRUD on users, extinguishers, etc.) logged to `audit_logs` table
- **Health Endpoints**: All services expose `/health` for uptime monitoring

---

## Migration Notes

### What Changed
- **Architecture**: Modular monolith → Microservices with API gateway
- **Ports**: Gateway on 5000, services on 5001-5006
- **Deployment**: Single container → 8 containers (postgres + 6 services + gateway)

### What Stayed the Same
- **API Contracts**: All endpoints, request/response formats unchanged
- **Database Schema**: Same Prisma schema (shared database)
- **Authentication Flow**: JWT access/refresh tokens work identically
- **Business Logic**: Service implementations unchanged
- **Client Integration**: Postman collection, frontend apps need no changes (just point to `localhost:5000`)

---

## Troubleshooting

### Services not reachable
- Check all services are running: `curl http://localhost:500{1..6}/health`
- Check gateway logs for proxy errors
- Verify `.env` files have correct service URLs

### Database connection errors
- Ensure PostgreSQL is running: `pg_isready -U r-yvan -d fems-db`
- Verify `DATABASE_URL` in service `.env` files
- Check password encoding (`&` → `%26`)

### Gateway 502 errors
- Target service is down or unhealthy
- Check service logs: `docker logs fems-<service-name>`
- Restart unhealthy service

### CORS errors
- Update `CORS_ORIGIN` in `api-gateway/.env`
- Ensure frontend URL is whitelisted

---

## Future Enhancements

Potential evolution paths:
- **Database per Service**: Migrate to separate databases for full service isolation
- **Service Discovery**: Replace hard-coded service URLs with Consul/Eureka
- **API Versioning**: `/api/v1`, `/api/v2` routing in gateway
- **Circuit Breakers**: Add resilience patterns (retries, fallbacks)
- **Message Queue**: Decouple services with RabbitMQ/Kafka for async operations
- **Distributed Tracing**: Add OpenTelemetry for request flow visibility
- **Service Mesh**: Istio/Linkerd for advanced traffic management

---

## Commands Cheatsheet

```bash
# Development
bun run dev              # In any service directory

# Production
bun run start            # In any service directory

# Database
bunx prisma generate     # Generate Prisma client
bunx prisma migrate dev  # Run migrations
bunx prisma db seed      # Seed database
bunx prisma studio       # GUI database browser

# Docker
docker compose up        # Start all services
docker compose down      # Stop all services
docker compose logs -f   # View logs
docker exec -it fems-auth-service sh  # Shell into service

# Type Checking
bunx tsc --noEmit       # Check types

# Health
curl http://localhost:5000/health  # Gateway
curl http://localhost:5001/health  # Auth service
```

---

## Support

For issues or questions:
1. Check service health endpoints
2. Review service logs in `logs/` directory
3. Verify environment configuration
4. Ensure database migrations are up to date

---

**Migration Status**: ✅ **Complete**  
**API Compatibility**: ✅ **100% Backward Compatible**  
**Type Safety**: ✅ **All services pass type checking**  
**Docker Ready**: ✅ **Full orchestration configured**
