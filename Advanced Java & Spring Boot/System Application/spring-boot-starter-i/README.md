# Utility Billing System (UBS)

Production-ready Spring Boot backend for a national utility company managing **water** (postpaid) and **electricity** (transitioning to postpaid) billing.

## Design Documentation

| Document | Description |
|----------|-------------|
| [docs/ERD.md](docs/ERD.md) | Entity Relationship Diagram (Mermaid) |
| [docs/FLOW-DIAGRAM.md](docs/FLOW-DIAGRAM.md) | Spring Boot flow diagrams (Mermaid) |
| [docs/SUBMISSION-CHECKLIST.md](docs/SUBMISSION-CHECKLIST.md) | Exam demo & submission checklist |
| [docs/TESTING_GUIDE.md](docs/TESTING_GUIDE.md) | Full API testing guide with all endpoints |

Render diagrams at [mermaid.live](https://mermaid.live) — copy any ` ```mermaid ` block and export PNG/SVG.

## Technologies

- Java 17
- Spring Boot 3.2 (Web, Security, Data JPA, Validation, Mail)
- PostgreSQL + Flyway migrations
- JWT authentication (BCrypt passwords)
- Swagger/OpenAPI (springdoc)
- Lombok, JavaMailSender

## Prerequisites

- Java 17+
- Maven 3.8+
- PostgreSQL 12+

## PostgreSQL Setup

```bash
# Create database
psql -U r-yvan -h localhost -c "CREATE DATABASE \"ubs-db\";"
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
SERVER_PORT=8080
DB_URL=jdbc:postgresql://localhost:5432/ubs-db
DB_USERNAME=r-yvan
DB_PASSWORD=your-password
JWT_SECRET=base64-encoded-secret
JWT_EXPIRATION_MS=3600000
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@example.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=no-reply@ubs.rw
OTP_EXPIRY_MINUTES=10
CORS_ALLOWED_ORIGINS=http://localhost:3000
FILE_UPLOAD_DIR=uploads
MAX_FILE_SIZE=5MB
```

Secrets are loaded via `spring-dotenv` from `.env` — never hardcoded in Java.

## Run the Application

```bash
# Build
mvn clean install

# Start (migrations run automatically)
mvn spring-boot:run
```

## Swagger UI

- **URL:** http://localhost:8080/swagger-ui.html
- **OpenAPI JSON:** http://localhost:8080/api-docs
- Use **Authorize** with `Bearer <JWT>` for protected endpoints.

## Seeded Users

| Email | Password | Role |
|-------|----------|------|
| admin@ubs.rw | Admin123! | ROLE_ADMIN |
| operator@ubs.rw | Operator123! | ROLE_OPERATOR |
| finance@ubs.rw | Finance123! | ROLE_FINANCE |
| customer@ubs.rw | Customer123! | ROLE_CUSTOMER |

Seeded data also includes 3 customers, water/electricity meters, readings, tariffs, bills, payments, and notifications.

## API Routes (no version prefix)

| Module | Base Path |
|--------|-----------|
| Auth | `/api/auth` |
| Users | `/api/users` |
| Customers | `/api/customers` |
| Meters | `/api/meters` |
| Readings | `/api/readings` |
| Tariffs | `/api/tariffs` |
| Bills | `/api/bills` |
| Payments | `/api/payments` |
| Notifications | `/api/notifications` |
| Files | `/api/files` |

## Quick API Testing

### 1. Login as admin

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ubs.rw","password":"Admin123!"}'
```

### 2. List customers

```bash
curl http://localhost:8080/api/customers \
  -H "Authorization: Bearer <token>"
```

### 3. Generate a bill

```bash
curl -X POST http://localhost:8080/api/bills/generate \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"meterReadingId":1,"dueDate":"2026-07-05"}'
```

### 4. Record payment

```bash
curl -X POST http://localhost:8080/api/payments \
  -H "Authorization: Bearer <finance-token>" \
  -H "Content-Type: application/json" \
  -d '{"billReference":"BILL-202605-0001","amountPaid":5000,"paymentMethod":"MOBILE_MONEY","paymentDate":"2026-06-05"}'
```

## Business Rule Testing Checklist

1. Signup creates user and sends OTP
2. Login returns JWT
3. Inactive user cannot log in
4. Admin can create customer
5. Duplicate national ID rejected
6. Admin can create meter
7. Duplicate meter number rejected
8. Operator can capture reading
9. Reading with current ≤ previous rejected
10. Duplicate reading for same meter/month/year rejected
11. Reading for inactive meter rejected
12. Admin creates tariff
13. Tariff versioning works
14. Old bill unchanged by new tariff
15. Bill generation calculates correct amount
16. Bill generation rejects inactive customer
17. Bill generation rejects inactive meter
18. Duplicate bill for same meter/month/year rejected
19. Bill generation inserts notification via DB trigger
20. Finance records partial payment
21. Partial payment updates outstanding balance
22. Full payment marks bill PAID
23. Full payment inserts notification via DB routine
24. Customer can view own bills (`GET /api/bills/my`)
25. Customer cannot view another customer's bills
26. Operator cannot configure tariffs
27. Finance cannot capture meter readings
28. Unauthorized request returns 401
29. Forbidden role returns 403
30. Rate limiting blocks repeated login attempts (429)

## Overdue Penalties

Late payment penalties are configured per tariff (`penaltyRate`). A scheduled job runs daily at 1:00 AM, or trigger manually:

```bash
curl -X POST http://localhost:8080/api/bills/apply-overdue-penalties \
  -H "Authorization: Bearer <admin-or-finance-token>"
```

Penalty formula: `outstanding_balance × penalty_rate / 100`. Applied once per bill when past `due_date`.

## Database Triggers

### Bill generation (`V2__create_triggers.sql`)

`trg_bill_insert_notification` fires **AFTER INSERT** on `bills` and inserts a `BILL_GENERATED` notification:

```
Dear <Customer Name>,

Your <Month/Year> utility bill of <Amount> FRW has been successfully processed.
```

### Full payment

`trg_payment_update_bill` fires **AFTER INSERT** on `payments`:

- Updates `amount_paid`, `outstanding_balance`, and bill status
- Rejects overpayment and cancelled bills
- When balance reaches zero, sets status to `PAID` and inserts `PAYMENT_RECEIVED` notification

## Email & OTP

- 6-digit OTP, BCrypt-hashed in database
- Default expiry: 10 minutes (configurable)
- Used for account verification and password reset
- Email failures are logged; DB consistency is not blocked
- Configure SMTP credentials in `.env` for production

## Architecture

```
controller/   → HTTP only
service/      → Business logic
repository/   → Data access
dto/          → API input/output
entity/       → JPA mappings
security/     → JWT, rate limiting
db/migration/ → Flyway SQL (schema, triggers, seed)
```

## Deployment Notes

- Externalize all secrets via environment variables
- Set strong `JWT_SECRET` (Base64-encoded, 256-bit+)
- Configure production PostgreSQL with SSL
- Enable SMTP for OTP and notification emails
- File uploads stored in `FILE_UPLOAD_DIR` (local; swap for S3 in cloud)
- CORS configured for `http://localhost:3000` by default
