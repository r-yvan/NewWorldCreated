# Spring Boot Flow Diagrams

Utility Billing System request and business flows for WASAC/REG.

## How to render

Paste each Mermaid block into [Mermaid Live Editor](https://mermaid.live) and export as PNG/SVG.

---

## 1. Overall Spring Boot architecture

```mermaid
flowchart TB
    subgraph Client
        SW[Swagger UI / Postman]
        FE[Future Frontend :3000]
    end

    subgraph SpringBoot["Spring Boot Application"]
        SEC[Security Filter Chain<br/>Rate Limit → JWT → CORS]
        CTRL[Controllers<br/>/api/auth, /api/bills, ...]
        SVC[Service Layer<br/>Business Rules]
        REPO[Repositories<br/>Spring Data JPA]
        EX[GlobalExceptionHandler]
    end

    subgraph External
        PG[(PostgreSQL ubs-db)]
        SMTP[SMTP Mail Server]
    end

    SW --> SEC
    FE --> SEC
    SEC -->|authenticated| CTRL
    CTRL --> SVC
    SVC --> REPO
    REPO --> PG
    SVC --> SMTP
    SVC -.->|errors| EX
    EX -.-> SW
    PG -->|triggers| PG
```

---

## 2. JWT authentication flow

How a new user registers, verifies their account, logs in, and accesses protected APIs.

```mermaid
sequenceDiagram
    autonumber
    actor User as User (Swagger / Postman)
    participant Auth as Auth API<br/>/api/auth/*
    participant DB as Database
    participant Email as Email Service
    participant Security as JWT Security Filter

    rect rgb(230, 245, 255)
        Note over User, Email: Phase 1 — Sign up
        User->>Auth: POST /signup<br/>fullNames, email, password, role
        Auth->>DB: Create user (status = INACTIVE)
        Auth->>Email: Send 6-digit OTP to email
        Auth-->>User: "Registered. OTP sent for verification."
    end

    rect rgb(230, 255, 230)
        Note over User, DB: Phase 2 — Verify OTP
        User->>Auth: POST /verify-otp<br/>email + otp code
        Auth->>DB: Validate OTP (hashed, not expired)
        Auth->>DB: Update user status → ACTIVE
        Auth-->>User: "OTP verified successfully"
    end

    rect rgb(255, 245, 230)
        Note over User, Security: Phase 3 — Login
        User->>Auth: POST /login<br/>email + password
        Auth->>DB: Find user & check ACTIVE status
        Auth->>Security: Build JWT (email + roles)
        Auth-->>User: accessToken + user profile
    end

    rect rgb(245, 235, 255)
        Note over User, Security: Phase 4 — Use protected endpoints
        User->>Security: GET /api/bills<br/>Header: Authorization Bearer token
        Security->>Security: Validate token signature & expiry
        alt Token valid
            Security->>Auth: Forward authenticated request
            Auth->>DB: Load bills for user role
            Auth-->>User: 200 OK + bill data
        else Token missing or invalid
            Security-->>User: 401 Unauthorized
        end
    end
```

---

## 3. Bill generation flow

```mermaid
flowchart TD
    A[Finance/Admin POST /api/bills/generate] --> B{Meter reading exists?}
    B -->|No| E1[404 Not Found]
    B -->|Yes| C{Customer ACTIVE?}
    C -->|No| E2[422 Inactive customer]
    C -->|Yes| D{Meter ACTIVE?}
    D -->|No| E3[422 Inactive meter]
    D -->|Yes| F{Bill already exists<br/>for meter/month/year?}
    F -->|Yes| E4[409 Conflict]
    F -->|No| G[Find applicable tariff version<br/>for billing period]
    G --> H[BillCalculator<br/>consumption + VAT + fixed charge]
    H --> I[Save bill GENERATED<br/>unique BILL-YYYYMM-####]
    I --> J[(PostgreSQL Trigger)]
    J --> K[Insert BILL_GENERATED notification]
    K --> L[Return BillResponse]
```

---

## 4. Payment processing flow

```mermaid
flowchart TD
    A[Finance POST /api/payments] --> B{Bill exists by reference?}
    B -->|No| E1[404]
    B -->|Yes| C{Bill CANCELLED?}
    C -->|Yes| E2[422 Rejected]
    C -->|No| D{Amount > outstanding?}
    D -->|Yes| E3[422 Overpayment rejected]
    D -->|No| F[Insert payment record]
    F --> G[(PostgreSQL Trigger)]
    G --> H[Update amount_paid<br/>outstanding_balance<br/>status]
    H --> I{Outstanding = 0?}
    I -->|Yes| J[Set PAID + insert PAYMENT_RECEIVED notification]
    I -->|No| K[Set PARTIALLY_PAID]
    J --> L[Return PaymentResponse]
    K --> L
```

---

## 5. Meter reading capture flow

```mermaid
flowchart TD
    A[Operator POST /api/readings] --> B{Meter exists & ACTIVE?}
    B -->|No| E1[422 Inactive/Not found]
    B -->|Yes| C{current > previous?}
    C -->|No| E2[422 Invalid reading]
    C -->|Yes| D{Duplicate month/year?}
    D -->|Yes| E3[409 Conflict]
    D -->|No| F{Previous matches<br/>last cycle reading?}
    F -->|No| E4[422 Mismatch warning]
    F -->|Yes| G[consumption = current - previous]
    G --> H[Save meter reading]
    H --> I[Return MeterReadingResponse]
```

---

## 6. Overdue penalty flow (scheduled)

```mermaid
flowchart TD
    A[@Scheduled daily job] --> B[Find bills past due_date<br/>with outstanding balance]
    B --> C{Penalty already applied?}
    C -->|Yes| D[Skip]
    C -->|No| E[penalty = outstanding × penalty_rate / 100]
    E --> F[Update penalty_amount, total_amount,<br/>outstanding_balance, status OVERDUE]
    F --> G[Log applied penalties]
```

---

## 7. Role-based access summary

```mermaid
flowchart LR
    subgraph ADMIN[ROLE_ADMIN]
        A1[Users]
        A2[Customers]
        A3[Meters]
        A4[Tariffs]
        A5[Bills approve]
    end

    subgraph OPERATOR[ROLE_OPERATOR]
        O1[Meter readings]
    end

    subgraph FINANCE[ROLE_FINANCE]
        F1[Bills generate/approve]
        F2[Payments]
        F3[View customers]
    end

    subgraph CUSTOMER[ROLE_CUSTOMER]
        C1[My bills]
        C2[My payments]
        C3[My notifications]
    end
```
