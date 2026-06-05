# API Testing Guide

Complete manual testing reference for the WASAC/REG Utility Billing System.

**Swagger UI:** http://localhost:8080/swagger-ui.html  
**Base URL:** http://localhost:8080

---

## How the system is expected to work

WASAC (water) and REG (electricity) are transitioning to a unified **postpaid** billing platform. The expected flow:

1. **Admin** registers customers and assigns meters (water/electricity).
2. **Admin** configures versioned tariffs (flat or tiered) with VAT and penalty rates.
3. **Operator** captures monthly meter readings (consumption = current − previous).
4. **Finance** generates bills from readings using the active tariff for that period.
5. A **database trigger** inserts a `BILL_GENERATED` notification automatically.
6. **Finance** approves bills, then records partial or full payments.
7. A **database trigger** updates bill balance/status; full payment inserts `PAYMENT_RECEIVED` notification.
8. **Customer** users view their own bills, payments, and notifications.
9. Overdue bills receive **late penalties** via scheduled or manual job.

### How this implementation delivers that

| Expected | Implementation |
|----------|----------------|
| Secure role-based access | JWT + `@PreAuthorize` per endpoint |
| No duplicate customers/readings/bills | DB unique constraints + service validation |
| Tariff versioning | New tariff = new version; old bills keep original tariff |
| Automated notifications | PostgreSQL triggers on `bills` INSERT and `payments` INSERT |
| Partial/full payments | Payment insert only; DB trigger updates balance |
| Inactive entities blocked | Service layer rejects inactive customer/meter operations |
| Audit integrity | Payments and tariffs are **not** hard-deleted; users deactivated via status |

---

## Seeded test accounts

| Role | Email | Password | Use for |
|------|-------|----------|---------|
| Admin | admin@ubs.rw | Admin123! | Users, customers, meters, tariffs |
| Operator | operator@ubs.rw | Operator123! | Meter readings |
| Finance | finance@ubs.rw | Finance123! | Bills, payments |
| Customer | customer@ubs.rw | Customer123! | My bills/payments/notifications |

---

## Getting a Bearer token

**Endpoint:** `POST /api/auth/login`  
**Auth:** None  
**Body:**
```json
{
  "email": "admin@ubs.rw",
  "password": "Admin123!"
}
```
**Response:** Copy `accessToken` → use as `Authorization: Bearer <token>` on all protected routes.

In Swagger: click **Authorize** → enter `Bearer <token>`.

---

## Endpoints not added (by design)

| Resource | Why no DELETE |
|----------|---------------|
| Users | Referenced by readings/payments; use `PATCH /users/{id}/status` → INACTIVE |
| Tariffs | Referenced by bills; use `PATCH /tariffs/{id}/deactivate` |
| Bills | Audit trail; use `PATCH /bills/{id}/cancel` when no payments |
| Payments | Financial audit trail — immutable |

---

## 1. Authentication (`/api/auth`)

No Bearer token required.

| Method | Path | Body | Expected |
|--------|------|------|----------|
| POST | `/api/auth/signup` | See below | 201, OTP sent |
| POST | `/api/auth/login` | email, password | 200, JWT returned |
| POST | `/api/auth/verify-otp` | email, otp, purpose | 200 |
| POST | `/api/auth/forgot-password` | email | 200 |
| POST | `/api/auth/reset-password` | email, otp, newPassword | 200 |

**Signup body:**
```json
{
  "fullNames": "Test User",
  "email": "newuser@example.com",
  "phoneNumber": "0788111222",
  "password": "StrongPass123!",
  "role": "ROLE_CUSTOMER"
}
```

**Verify OTP body:**
```json
{
  "email": "newuser@example.com",
  "otp": "123456",
  "purpose": "ACCOUNT_VERIFICATION"
}
```

**Test:** Login as inactive user → 403. Repeat login 6× rapidly → 429 rate limit.

---

## 2. Users (`/api/users`) — ADMIN only

**Bearer:** Admin token

| Method | Path | Body / Params | Notes |
|--------|------|---------------|-------|
| GET | `/api/users` | Query: `page`, `size`, `sortBy`, `sortDirection`, `search`, `status`, `role` | List users |
| GET | `/api/users/{id}` | Path: `id` | Get one user |
| PATCH | `/api/users/{id}/status` | Body: `{"status":"INACTIVE"}` | Deactivate user |
| PATCH | `/api/users/{id}/roles` | Body: `{"roles":["ROLE_OPERATOR"]}` | Change roles |

**No DELETE** — use status INACTIVE.

**Test:** Operator token on `GET /api/users` → 403.

---

## 3. Customers (`/api/customers`)

| Method | Path | Role | Body / Params |
|--------|------|------|---------------|
| GET | `/api/customers` | ADMIN, FINANCE | Query: `page`, `size`, `sortBy`, `sortDirection`, `search`, `status` |
| GET | `/api/customers/{id}` | ADMIN, FINANCE | Path: `id` |
| POST | `/api/customers` | ADMIN | Body below |
| PUT | `/api/customers/{id}` | ADMIN | Same body as POST |
| PATCH | `/api/customers/{id}/status` | ADMIN | `{"status":"INACTIVE"}` |
| DELETE | `/api/customers/{id}` | ADMIN | Only if no meters & no bills |

**Create body:**
```json
{
  "fullNames": "Alice Mugisha",
  "nationalId": "1199880099999999",
  "email": "alice.new@example.com",
  "phoneNumber": "0788123456",
  "address": "Kigali, Rwanda"
}
```

**Test:** Duplicate `nationalId` → 409. Delete customer with meters → 422.

---

## 4. Meters (`/api/meters`)

| Method | Path | Role | Body / Params |
|--------|------|------|---------------|
| GET | `/api/meters` | ADMIN, OPERATOR, FINANCE | Query: `customerId`, `meterType`, `status`, `search`, `page`, `size`, `sortBy`, `sortDirection` |
| GET | `/api/meters/{id}` | ADMIN, OPERATOR, FINANCE | Path: `id` |
| POST | `/api/meters` | ADMIN | Body below |
| PUT | `/api/meters/{id}` | ADMIN | Body below |
| PATCH | `/api/meters/{id}/status` | ADMIN | `{"status":"INACTIVE"}` |
| DELETE | `/api/meters/{id}` | ADMIN | Only if no readings & no bills |

**Create body:**
```json
{
  "meterNumber": "WTR-0099",
  "meterType": "WATER",
  "installationDate": "2026-01-10",
  "customerId": 1
}
```

**Test:** Duplicate `meterNumber` → 409. Operator creates meter → 403.

---

## 5. Meter Readings (`/api/readings`)

| Method | Path | Role | Body / Params |
|--------|------|------|---------------|
| POST | `/api/readings` | OPERATOR | Body below |
| GET | `/api/readings` | ADMIN, OPERATOR, FINANCE | Query: `meterId`, `customerId`, `billingMonth`, `billingYear`, `meterType`, `page`, `size`, `sortBy`, `sortDirection` |
| GET | `/api/readings/{id}` | ADMIN, OPERATOR, FINANCE | Path: `id` |
| DELETE | `/api/readings/{id}` | ADMIN | Only if no bill generated |

**Capture body:**
```json
{
  "meterId": 1,
  "previousReading": 150,
  "currentReading": 200,
  "readingDate": "2026-06-05",
  "billingMonth": 6,
  "billingYear": 2026
}
```

**Test cases:**
- `currentReading <= previousReading` → 422
- Duplicate month/year for same meter → 409
- Inactive meter → 422
- Finance captures reading → 403

---

## 6. Tariffs (`/api/tariffs`)

| Method | Path | Role | Body / Params |
|--------|------|------|---------------|
| POST | `/api/tariffs` | ADMIN | Flat or tiered body below |
| GET | `/api/tariffs` | ADMIN, FINANCE | Query: `meterType`, `tariffType`, `active`, `page`, `size`, `sortBy`, `sortDirection` |
| GET | `/api/tariffs/active` | ADMIN, FINANCE | None |
| GET | `/api/tariffs/{id}` | ADMIN, FINANCE | Path: `id` |
| PATCH | `/api/tariffs/{id}/deactivate` | ADMIN | No body |

**Flat tariff body:**
```json
{
  "meterType": "WATER",
  "tariffType": "FLAT",
  "ratePerUnit": 500,
  "fixedServiceCharge": 1000,
  "vatRate": 18,
  "penaltyRate": 5,
  "effectiveFrom": "2026-07-01"
}
```

**Tiered tariff body:**
```json
{
  "meterType": "ELECTRICITY",
  "tariffType": "TIERED",
  "fixedServiceCharge": 1500,
  "vatRate": 18,
  "penaltyRate": 5,
  "effectiveFrom": "2026-07-01",
  "tiers": [
    {"minUnits": 0, "maxUnits": 50, "ratePerUnit": 300},
    {"minUnits": 51, "maxUnits": 100, "ratePerUnit": 500},
    {"minUnits": 101, "maxUnits": null, "ratePerUnit": 700}
  ]
}
```

**Test:** Operator creates tariff → 403. New tariff increments version; old bills unchanged.

---

## 7. Bills (`/api/bills`)

| Method | Path | Role | Body / Params |
|--------|------|------|---------------|
| POST | `/api/bills/generate` | ADMIN, FINANCE | Body below |
| PATCH | `/api/bills/{id}/approve` | ADMIN, FINANCE | No body |
| PATCH | `/api/bills/{id}/cancel` | ADMIN, FINANCE | No body (no payments recorded) |
| POST | `/api/bills/apply-overdue-penalties` | ADMIN, FINANCE | No body |
| GET | `/api/bills` | ADMIN, FINANCE | Query: `customerId`, `meterId`, `billingMonth`, `billingYear`, `status`, `fromDate`, `toDate`, `search`, `page`, `size`, `sortBy`, `sortDirection` |
| GET | `/api/bills/my` | CUSTOMER | Query: `page`, `size`, `sortBy`, `sortDirection` |
| GET | `/api/bills/{id}` | ADMIN, FINANCE, CUSTOMER (own only) | Path: `id` |

**Generate body:**
```json
{
  "meterReadingId": 1,
  "dueDate": "2026-07-05"
}
```

**Test flow:**
1. Generate bill → status `GENERATED`, notification inserted by DB trigger
2. Approve → status `APPROVED`
3. Check `GET /api/notifications` for `BILL_GENERATED` message
4. Duplicate generate same meter/month → 409
5. Customer views own bill via `/my`; another customer's bill → 422

---

## 8. Payments (`/api/payments`)

| Method | Path | Role | Body / Params |
|--------|------|------|---------------|
| POST | `/api/payments` | FINANCE | Body below |
| GET | `/api/payments` | ADMIN, FINANCE | Query: `billReference`, `customerId`, `paymentMethod`, `fromDate`, `toDate`, `page`, `size`, `sortBy`, `sortDirection` |
| GET | `/api/payments/my` | CUSTOMER | Query: `page`, `size`, `sortBy`, `sortDirection` |
| GET | `/api/payments/{id}` | ADMIN, FINANCE | Path: `id` |

**Record payment body:**
```json
{
  "billReference": "BILL-202605-0001",
  "amountPaid": 5000,
  "paymentMethod": "MOBILE_MONEY",
  "paymentDate": "2026-06-05"
}
```

**Payment methods:** `CASH`, `BANK_TRANSFER`, `MOBILE_MONEY`, `CARD`

**Test flow:**
1. Partial payment → bill `PARTIALLY_PAID`, balance reduced
2. Full payment → bill `PAID`, `PAYMENT_RECEIVED` notification via DB trigger
3. Overpayment → 422
4. Payment on cancelled bill → 422
5. No DELETE endpoint (audit trail)

---

## 9. Notifications (`/api/notifications`)

| Method | Path | Role | Body / Params |
|--------|------|------|---------------|
| GET | `/api/notifications` | ADMIN, FINANCE | Query: `customerId`, `notificationType`, `status`, `page`, `size`, `sortBy`, `sortDirection` |
| GET | `/api/notifications/my` | CUSTOMER | Query: `page`, `size`, `sortBy`, `sortDirection` |
| GET | `/api/notifications/{id}` | ADMIN, FINANCE | Path: `id` |
| POST | `/api/notifications/send-pending` | ADMIN, FINANCE | Sends pending emails async |

**Notification types:** `BILL_GENERATED`, `PAYMENT_RECEIVED`, `OTP`, `GENERAL`  
**Statuses:** `PENDING`, `SENT`, `FAILED`

---

## 10. Files (`/api/files`)

| Method | Path | Role | Body / Params |
|--------|------|------|---------------|
| POST | `/api/files/upload` | ADMIN, FINANCE | Multipart form (see below) |
| GET | `/api/files/{id}` | ADMIN, FINANCE | Path: `id` |
| DELETE | `/api/files/{id}` | ADMIN, FINANCE | Path: `id` |

**Upload (multipart/form-data):**
- `file` — PDF, PNG, JPG, JPEG (max 5MB)
- `relatedEntityType` — optional (e.g. `CUSTOMER`, `PAYMENT`)
- `relatedEntityId` — optional Long

**curl example:**
```bash
curl -X POST http://localhost:8080/api/files/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@receipt.pdf" \
  -F "relatedEntityType=PAYMENT" \
  -F "relatedEntityId=1"
```

---

## Recommended end-to-end test sequence

```
1. POST /api/auth/login          (admin)     → get adminToken
2. POST /api/customers           (admin)     → create customer
3. POST /api/meters              (admin)     → attach water meter
4. POST /api/auth/login          (operator)  → get operatorToken
5. POST /api/readings            (operator)  → capture June reading
6. POST /api/auth/login          (finance)   → get financeToken
7. POST /api/tariffs             (admin)     → ensure active tariff exists
8. POST /api/bills/generate      (finance)   → create bill
9. GET  /api/notifications       (finance)   → verify BILL_GENERATED trigger
10. PATCH /api/bills/{id}/approve (finance)  → approve bill
11. POST /api/payments           (finance)   → partial then full payment
12. GET  /api/notifications      (finance)   → verify PAYMENT_RECEIVED trigger
13. POST /api/auth/login         (customer)  → get customerToken
14. GET  /api/bills/my           (customer)  → view own bills
15. GET  /api/payments/my        (customer)  → view payment history
```

---

## Common query parameters (pagination)

All list endpoints support:

| Param | Default | Example |
|-------|---------|---------|
| `page` | 0 | `page=0` |
| `size` | 20 | `size=10` |
| `sortBy` | — | `sortBy=createdAt` |
| `sortDirection` | asc | `sortDirection=desc` |

---

## HTTP status codes to verify

| Code | When |
|------|------|
| 200 | Success |
| 201 | Created (signup, customer, bill, payment) |
| 204 | Deleted (customer, meter, reading, file) |
| 400 | Validation error |
| 401 | Missing/invalid JWT |
| 403 | Wrong role or inactive account |
| 404 | Resource not found |
| 409 | Duplicate resource |
| 422 | Business rule violation |
| 429 | Rate limit exceeded (auth endpoints) |
