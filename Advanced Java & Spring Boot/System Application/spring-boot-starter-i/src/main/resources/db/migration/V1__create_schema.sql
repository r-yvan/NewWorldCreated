-- Utility Billing System Schema

CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    full_names      VARCHAR(255) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    phone_number    VARCHAR(50)  NOT NULL,
    password        VARCHAR(255) NOT NULL,
    status          VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    customer_id     BIGINT,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_users_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

CREATE TABLE user_roles (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role    VARCHAR(50) NOT NULL,
    PRIMARY KEY (user_id, role),
    CONSTRAINT chk_user_roles CHECK (role IN ('ROLE_ADMIN', 'ROLE_OPERATOR', 'ROLE_FINANCE', 'ROLE_CUSTOMER'))
);

CREATE TABLE customers (
    id           BIGSERIAL PRIMARY KEY,
    full_names   VARCHAR(255) NOT NULL,
    national_id  VARCHAR(50)  NOT NULL UNIQUE,
    email        VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50)  NOT NULL,
    address      VARCHAR(500) NOT NULL,
    status       VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_customers_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

ALTER TABLE users
    ADD CONSTRAINT fk_users_customer FOREIGN KEY (customer_id) REFERENCES customers(id);

CREATE TABLE meters (
    id                BIGSERIAL PRIMARY KEY,
    meter_number      VARCHAR(50)  NOT NULL UNIQUE,
    meter_type        VARCHAR(20)  NOT NULL,
    installation_date DATE         NOT NULL,
    status            VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    customer_id       BIGINT       NOT NULL REFERENCES customers(id),
    created_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_meters_type CHECK (meter_type IN ('WATER', 'ELECTRICITY')),
    CONSTRAINT chk_meters_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

CREATE INDEX idx_meters_customer ON meters(customer_id);
CREATE INDEX idx_meters_type ON meters(meter_type);

CREATE TABLE tariffs (
    id                   BIGSERIAL PRIMARY KEY,
    meter_type           VARCHAR(20)    NOT NULL,
    tariff_type          VARCHAR(20)    NOT NULL,
    rate_per_unit        DECIMAL(15,2),
    fixed_service_charge DECIMAL(15,2)  NOT NULL,
    vat_rate             DECIMAL(5,2)   NOT NULL,
    penalty_rate         DECIMAL(5,2)   NOT NULL,
    effective_from       DATE           NOT NULL,
    effective_to         DATE,
    active               BOOLEAN        NOT NULL DEFAULT TRUE,
    version              INTEGER        NOT NULL,
    created_by           BIGINT         REFERENCES users(id),
    created_at           TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_tariffs_meter_type CHECK (meter_type IN ('WATER', 'ELECTRICITY')),
    CONSTRAINT chk_tariffs_type CHECK (tariff_type IN ('FLAT', 'TIERED'))
);

CREATE INDEX idx_tariffs_meter_type_active ON tariffs(meter_type, active);

CREATE TABLE tariff_tiers (
    id            BIGSERIAL PRIMARY KEY,
    tariff_id     BIGINT         NOT NULL REFERENCES tariffs(id) ON DELETE CASCADE,
    min_units     INTEGER        NOT NULL,
    max_units     INTEGER,
    rate_per_unit DECIMAL(15,2)  NOT NULL
);

CREATE TABLE meter_readings (
    id                BIGSERIAL PRIMARY KEY,
    meter_id          BIGINT         NOT NULL REFERENCES meters(id),
    previous_reading  DECIMAL(15,2)  NOT NULL,
    current_reading   DECIMAL(15,2)  NOT NULL,
    consumption       DECIMAL(15,2)  NOT NULL,
    reading_date      DATE           NOT NULL,
    billing_month     INTEGER        NOT NULL,
    billing_year      INTEGER        NOT NULL,
    captured_by       BIGINT         NOT NULL REFERENCES users(id),
    created_at        TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_readings_month CHECK (billing_month BETWEEN 1 AND 12),
    CONSTRAINT chk_readings_positive CHECK (current_reading > previous_reading AND previous_reading >= 0),
    CONSTRAINT uq_meter_reading_period UNIQUE (meter_id, billing_month, billing_year)
);

CREATE INDEX idx_readings_meter ON meter_readings(meter_id);
CREATE INDEX idx_readings_period ON meter_readings(billing_year, billing_month);

CREATE TABLE bills (
    id                   BIGSERIAL PRIMARY KEY,
    bill_reference       VARCHAR(50)    NOT NULL UNIQUE,
    customer_id          BIGINT         NOT NULL REFERENCES customers(id),
    meter_id             BIGINT         NOT NULL REFERENCES meters(id),
    meter_reading_id     BIGINT         NOT NULL REFERENCES meter_readings(id),
    tariff_id            BIGINT         NOT NULL REFERENCES tariffs(id),
    billing_month        INTEGER        NOT NULL,
    billing_year         INTEGER        NOT NULL,
    consumption          DECIMAL(15,2)  NOT NULL,
    consumption_amount   DECIMAL(15,2)  NOT NULL,
    fixed_service_charge DECIMAL(15,2)  NOT NULL,
    tax_amount           DECIMAL(15,2)  NOT NULL,
    penalty_amount       DECIMAL(15,2)  NOT NULL DEFAULT 0,
    total_amount         DECIMAL(15,2)  NOT NULL,
    amount_paid          DECIMAL(15,2)  NOT NULL DEFAULT 0,
    outstanding_balance  DECIMAL(15,2)  NOT NULL,
    due_date             DATE           NOT NULL,
    status               VARCHAR(20)    NOT NULL DEFAULT 'GENERATED',
    approved_by          BIGINT         REFERENCES users(id),
    approved_at          TIMESTAMP,
    created_at           TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_bills_status CHECK (status IN ('GENERATED', 'APPROVED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED')),
    CONSTRAINT uq_bill_meter_period UNIQUE (meter_id, billing_month, billing_year)
);

CREATE INDEX idx_bills_customer ON bills(customer_id);
CREATE INDEX idx_bills_status ON bills(status);
CREATE INDEX idx_bills_reference ON bills(bill_reference);

CREATE TABLE payments (
    id             BIGSERIAL PRIMARY KEY,
    bill_id        BIGINT         NOT NULL REFERENCES bills(id),
    amount_paid    DECIMAL(15,2)  NOT NULL,
    payment_method VARCHAR(20)    NOT NULL,
    payment_date   DATE           NOT NULL,
    recorded_by    BIGINT         NOT NULL REFERENCES users(id),
    created_at     TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_payments_method CHECK (payment_method IN ('CASH', 'BANK_TRANSFER', 'MOBILE_MONEY', 'CARD')),
    CONSTRAINT chk_payments_positive CHECK (amount_paid > 0)
);

CREATE INDEX idx_payments_bill ON payments(bill_id);

CREATE TABLE notifications (
    id                BIGSERIAL PRIMARY KEY,
    customer_id       BIGINT       NOT NULL REFERENCES customers(id),
    bill_id           BIGINT       REFERENCES bills(id),
    message           TEXT         NOT NULL,
    notification_type VARCHAR(30)  NOT NULL,
    status            VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    created_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sent_at           TIMESTAMP,
    CONSTRAINT chk_notifications_type CHECK (notification_type IN ('BILL_GENERATED', 'PAYMENT_RECEIVED', 'OTP', 'GENERAL')),
    CONSTRAINT chk_notifications_status CHECK (status IN ('PENDING', 'SENT', 'FAILED'))
);

CREATE INDEX idx_notifications_customer ON notifications(customer_id);

CREATE TABLE otps (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    otp_hash   VARCHAR(255) NOT NULL,
    purpose    VARCHAR(30)  NOT NULL,
    expires_at TIMESTAMP    NOT NULL,
    used       BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_otps_purpose CHECK (purpose IN ('ACCOUNT_VERIFICATION', 'PASSWORD_RESET', 'LOGIN_VERIFICATION'))
);

CREATE INDEX idx_otps_user_purpose ON otps(user_id, purpose);

CREATE TABLE file_metadata (
    id                  BIGSERIAL PRIMARY KEY,
    file_name           VARCHAR(255) NOT NULL,
    original_file_name  VARCHAR(255) NOT NULL,
    content_type        VARCHAR(100) NOT NULL,
    file_size           BIGINT       NOT NULL,
    file_path           VARCHAR(500) NOT NULL,
    related_entity_type VARCHAR(50),
    related_entity_id   BIGINT,
    uploaded_by         BIGINT       REFERENCES users(id),
    created_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);
