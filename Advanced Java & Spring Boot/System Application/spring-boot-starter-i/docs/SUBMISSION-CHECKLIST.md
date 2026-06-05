# Exam Submission Checklist

Utility Billing System — WASAC/REG practical examination.

## Deliverables

- [x] Spring Boot backend (`com.ubs`)
- [x] PostgreSQL schema via Flyway migrations
- [x] JWT authentication and role-based authorization
- [x] Swagger UI at `/swagger-ui.html`
- [x] ERD diagram — [docs/ERD.md](ERD.md)
- [x] Flow diagrams — [docs/FLOW-DIAGRAM.md](FLOW-DIAGRAM.md)
- [x] README with setup instructions

## Task coverage

| Task | Feature | Swagger endpoint to demo |
|------|---------|--------------------------|
| 1 | Signup / Login / JWT | `POST /api/auth/signup`, `POST /api/auth/login` |
| 1 | Role security | Try operator token on `POST /api/tariffs` → 403 |
| 2 | Create customer | `POST /api/customers` (admin) |
| 2 | Duplicate national ID | Repeat same `nationalId` → 409 |
| 2 | Create meter | `POST /api/meters` (admin) |
| 3 | Capture reading | `POST /api/readings` (operator) |
| 3 | Invalid reading | `currentReading <= previousReading` → 422 |
| 4 | Create tariff | `POST /api/tariffs` (admin) |
| 4 | Overdue penalty | `POST /api/bills/apply-overdue-penalties` (finance) |
| 5 | Record payment | `POST /api/payments` (finance) |
| 5 | Partial payment | Pay less than total → `PARTIALLY_PAID` |
| 6 | Bill notification trigger | Generate bill → check `GET /api/notifications` |
| 6 | Payment notification trigger | Full payment → new `PAYMENT_RECEIVED` notification |

## Demo accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@ubs.rw | Admin123! |
| Operator | operator@ubs.rw | Operator123! |
| Finance | finance@ubs.rw | Finance123! |
| Customer | customer@ubs.rw | Customer123! |

## Diagram export for report

1. Open [mermaid.live](https://mermaid.live)
2. Copy Mermaid from `docs/ERD.md` → export **ERD.png**
3. Copy each block from `docs/FLOW-DIAGRAM.md` → export **Flow-*.png**
4. Attach to submission document

## Build verification

```bash
mvn clean install
mvn spring-boot:run
```

## Database verification

```sql
-- Notifications from triggers
SELECT notification_type, message FROM notifications;

-- Bill statuses after payments
SELECT bill_reference, status, outstanding_balance FROM bills;
```
