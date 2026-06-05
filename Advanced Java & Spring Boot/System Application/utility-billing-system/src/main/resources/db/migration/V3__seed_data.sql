-- Seed users (BCrypt hashed passwords)
INSERT INTO users (full_names, email, phone_number, password, status, created_at, updated_at) VALUES
('System Admin', 'admin@ubs.rw', '0788000001', '$2b$10$kFvhm7sQ4QmE2AV5Jn2Gn.OXnXT.CeBb08Hi/yrA6FTls7H2vl/ya', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Meter Operator', 'operator@ubs.rw', '0788000002', '$2b$10$ZL4TRyxEYMEJmGTAq2uVleVbEna/EbvNWa.5APJ0mDOy6K4DdSxcW', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Finance Officer', 'finance@ubs.rw', '0788000003', '$2b$10$0JLGp4t5i.A5Kv7UO1EHUesj9QCsc1dp0APSwvOwJ4uXORJhZJpI6', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Customer User', 'customer@ubs.rw', '0788000004', '$2b$10$HeVtwUF71SlUJsaJKutpQOQ1lynMlV/UcHfaHqerMfMxygHhBXZEG', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO user_roles (user_id, role) VALUES
(1, 'ROLE_ADMIN'),
(2, 'ROLE_OPERATOR'),
(3, 'ROLE_FINANCE'),
(4, 'ROLE_CUSTOMER');

-- Seed customers
INSERT INTO customers (full_names, national_id, email, phone_number, address, status, created_at, updated_at) VALUES
('Alice Mugisha', '1199880012345678', 'alice@example.com', '0788123456', 'Kigali, Rwanda', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Jean Baptiste', '1199880012345679', 'jean@example.com', '0788234567', 'Huye, Rwanda', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Marie Claire', '1199880012345680', 'marie@example.com', '0788345678', 'Musanze, Rwanda', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Link customer user to Alice
UPDATE users SET customer_id = 1 WHERE id = 4;

-- Seed meters
INSERT INTO meters (meter_number, meter_type, installation_date, status, customer_id, created_at, updated_at) VALUES
('WTR-0001', 'WATER', '2025-01-10', 'ACTIVE', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('ELC-0001', 'ELECTRICITY', '2025-02-15', 'ACTIVE', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('WTR-0002', 'WATER', '2025-03-01', 'ACTIVE', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('ELC-0002', 'ELECTRICITY', '2025-04-20', 'ACTIVE', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Seed tariffs
INSERT INTO tariffs (meter_type, tariff_type, rate_per_unit, fixed_service_charge, vat_rate, penalty_rate, effective_from, active, version, created_by, created_at) VALUES
('WATER', 'FLAT', 500.00, 1000.00, 18.00, 5.00, '2026-01-01', TRUE, 1, 1, CURRENT_TIMESTAMP),
('ELECTRICITY', 'TIERED', NULL, 1500.00, 18.00, 5.00, '2026-01-01', TRUE, 1, 1, CURRENT_TIMESTAMP);

INSERT INTO tariff_tiers (tariff_id, min_units, max_units, rate_per_unit) VALUES
(2, 0, 50, 300.00),
(2, 51, 100, 500.00),
(2, 101, NULL, 700.00);

-- Seed meter readings (May 2026)
INSERT INTO meter_readings (meter_id, previous_reading, current_reading, consumption, reading_date, billing_month, billing_year, captured_by, created_at) VALUES
(1, 100.00, 150.00, 50.00, '2026-05-05', 5, 2026, 2, CURRENT_TIMESTAMP),
(2, 200.00, 280.00, 80.00, '2026-05-05', 5, 2026, 2, CURRENT_TIMESTAMP),
(3, 50.00, 90.00, 40.00, '2026-05-05', 5, 2026, 2, CURRENT_TIMESTAMP);

-- Seed bills (amount_paid starts at 0; payment trigger updates balances)
INSERT INTO bills (bill_reference, customer_id, meter_id, meter_reading_id, tariff_id, billing_month, billing_year,
                   consumption, consumption_amount, fixed_service_charge, tax_amount, penalty_amount, total_amount,
                   amount_paid, outstanding_balance, due_date, status, created_at, updated_at) VALUES
('BILL-202605-0001', 1, 1, 1, 1, 5, 2026, 50.00, 25000.00, 1000.00, 4680.00, 0.00, 30680.00, 0.00, 30680.00, '2026-06-05', 'APPROVED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('BILL-202605-0002', 1, 2, 2, 2, 5, 2026, 80.00, 30000.00, 1500.00, 5670.00, 0.00, 37170.00, 0.00, 37170.00, '2026-06-05', 'APPROVED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('BILL-202605-0003', 2, 3, 3, 1, 5, 2026, 40.00, 20000.00, 1000.00, 3780.00, 0.00, 24780.00, 0.00, 24780.00, '2026-06-05', 'APPROVED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Payments trigger bill balance updates and full-payment notifications
INSERT INTO payments (bill_id, amount_paid, payment_method, payment_date, recorded_by, created_at) VALUES
(2, 20000.00, 'MOBILE_MONEY', '2026-05-20', 3, CURRENT_TIMESTAMP),
(3, 24780.00, 'BANK_TRANSFER', '2026-05-25', 3, CURRENT_TIMESTAMP);
