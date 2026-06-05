# Entity Relationship Diagram (ERD)

Utility Billing System — PostgreSQL relational schema for WASAC/REG postpaid billing.

## How to render

Copy the Mermaid block below into any of:

- [Mermaid Live Editor](https://mermaid.live)
- VS Code with a Mermaid extension
- GitHub/GitLab markdown preview

```mermaid
erDiagram
    USERS ||--o{ USER_ROLES : has
    USERS |o--o| CUSTOMERS : "linked customer account"
    USERS ||--o{ OTPS : receives
    USERS ||--o{ METER_READINGS : captures
    USERS ||--o{ PAYMENTS : records
    USERS ||--o{ BILLS : approves
    USERS ||--o{ TARIFFS : creates

    CUSTOMERS ||--o{ METERS : owns
    CUSTOMERS ||--o{ BILLS : billed
    CUSTOMERS ||--o{ NOTIFICATIONS : receives

    METERS ||--o{ METER_READINGS : generates
    METERS ||--o{ BILLS : billed_on

    METER_READINGS ||--|| BILLS : sources

    TARIFFS ||--o{ TARIFF_TIERS : contains
    TARIFFS ||--o{ BILLS : priced_by

    BILLS ||--o{ PAYMENTS : paid_by
    BILLS ||--o{ NOTIFICATIONS : triggers

    USERS {
        bigint id PK
        varchar full_names
        varchar email UK
        varchar phone_number
        varchar password
        varchar status "ACTIVE|INACTIVE"
        bigint customer_id FK
        timestamp created_at
        timestamp updated_at
    }

    USER_ROLES {
        bigint user_id PK,FK
        varchar role PK "ROLE_ADMIN|ROLE_OPERATOR|ROLE_FINANCE|ROLE_CUSTOMER"
    }

    CUSTOMERS {
        bigint id PK
        varchar full_names
        varchar national_id UK
        varchar email
        varchar phone_number
        varchar address
        varchar status "ACTIVE|INACTIVE"
        timestamp created_at
        timestamp updated_at
    }

    METERS {
        bigint id PK
        varchar meter_number UK
        varchar meter_type "WATER|ELECTRICITY"
        date installation_date
        varchar status "ACTIVE|INACTIVE"
        bigint customer_id FK
        timestamp created_at
        timestamp updated_at
    }

    METER_READINGS {
        bigint id PK
        bigint meter_id FK
        decimal previous_reading
        decimal current_reading
        decimal consumption
        date reading_date
        int billing_month
        int billing_year
        bigint captured_by FK
        timestamp created_at
    }

    TARIFFS {
        bigint id PK
        varchar meter_type
        varchar tariff_type "FLAT|TIERED"
        decimal rate_per_unit
        decimal fixed_service_charge
        decimal vat_rate
        decimal penalty_rate
        date effective_from
        date effective_to
        boolean active
        int version
        bigint created_by FK
        timestamp created_at
    }

    TARIFF_TIERS {
        bigint id PK
        bigint tariff_id FK
        int min_units
        int max_units
        decimal rate_per_unit
    }

    BILLS {
        bigint id PK
        varchar bill_reference UK
        bigint customer_id FK
        bigint meter_id FK
        bigint meter_reading_id FK
        bigint tariff_id FK
        int billing_month
        int billing_year
        decimal consumption
        decimal consumption_amount
        decimal fixed_service_charge
        decimal tax_amount
        decimal penalty_amount
        decimal total_amount
        decimal amount_paid
        decimal outstanding_balance
        date due_date
        varchar status
        bigint approved_by FK
        timestamp approved_at
        timestamp created_at
        timestamp updated_at
    }

    PAYMENTS {
        bigint id PK
        bigint bill_id FK
        decimal amount_paid
        varchar payment_method
        date payment_date
        bigint recorded_by FK
        timestamp created_at
    }

    NOTIFICATIONS {
        bigint id PK
        bigint customer_id FK
        bigint bill_id FK
        text message
        varchar notification_type
        varchar status "PENDING|SENT|FAILED"
        timestamp created_at
        timestamp sent_at
    }

    OTPS {
        bigint id PK
        bigint user_id FK
        varchar otp_hash
        varchar purpose
        timestamp expires_at
        boolean used
        timestamp created_at
    }

    FILE_METADATA {
        bigint id PK
        varchar file_name
        varchar original_file_name
        varchar content_type
        bigint file_size
        varchar file_path
        varchar related_entity_type
        bigint related_entity_id
        bigint uploaded_by FK
        timestamp created_at
    }
```

## Key constraints

| Constraint | Purpose |
|------------|---------|
| `customers.national_id` UNIQUE | Prevent duplicate customer registration |
| `meters.meter_number` UNIQUE | Prevent duplicate meters |
| `meter_readings (meter_id, billing_month, billing_year)` UNIQUE | One reading per meter per period |
| `bills (meter_id, billing_month, billing_year)` UNIQUE | One bill per meter per period |
| `bills.bill_reference` UNIQUE | Unique payment reference |

## Database triggers

| Trigger | Event | Action |
|---------|-------|--------|
| `bill_after_insert_notification` | AFTER INSERT on `bills` | Insert `BILL_GENERATED` notification |
| `payment_after_insert_update_bill` | AFTER INSERT on `payments` | Update balance/status; notify on full payment |
