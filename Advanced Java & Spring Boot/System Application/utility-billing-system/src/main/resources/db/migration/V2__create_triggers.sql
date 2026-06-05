-- Database-level routines for bill generation and full payment notifications

CREATE OR REPLACE FUNCTION fn_format_billing_period(p_month INTEGER, p_year INTEGER)
RETURNS TEXT AS $$
DECLARE
    month_names TEXT[] := ARRAY['January','February','March','April','May','June',
                                'July','August','September','October','November','December'];
BEGIN
    RETURN month_names[p_month] || '/' || p_year::TEXT;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger: insert notification when a bill is inserted
CREATE OR REPLACE FUNCTION trg_bill_insert_notification()
RETURNS TRIGGER AS $$
DECLARE
    v_customer_name TEXT;
    v_period TEXT;
    v_message TEXT;
BEGIN
    SELECT c.full_names INTO v_customer_name
    FROM customers c
    WHERE c.id = NEW.customer_id;

    v_period := fn_format_billing_period(NEW.billing_month, NEW.billing_year);
    v_message := 'Dear ' || v_customer_name || E',\n\nYour ' || v_period ||
                 ' utility bill of ' || TRIM(TO_CHAR(NEW.total_amount, '999,999,999.99')) ||
                 ' FRW has been successfully processed.';

    INSERT INTO notifications (customer_id, bill_id, message, notification_type, status, created_at)
    VALUES (NEW.customer_id, NEW.id, v_message, 'BILL_GENERATED', 'PENDING', CURRENT_TIMESTAMP);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bill_after_insert_notification
    AFTER INSERT ON bills
    FOR EACH ROW
    EXECUTE PROCEDURE trg_bill_insert_notification();

-- Trigger: on payment, update bill balance and handle full payment notification
CREATE OR REPLACE FUNCTION trg_payment_update_bill()
RETURNS TRIGGER AS $$
DECLARE
    v_bill RECORD;
    v_customer_name TEXT;
    v_period TEXT;
    v_message TEXT;
    v_new_outstanding DECIMAL(15,2);
    v_new_status VARCHAR(20);
BEGIN
    SELECT b.*, c.full_names AS customer_name
    INTO v_bill
    FROM bills b
    JOIN customers c ON c.id = b.customer_id
    WHERE b.id = NEW.bill_id
    FOR UPDATE;

    IF v_bill.status = 'CANCELLED' THEN
        RAISE EXCEPTION 'Cannot record payment for cancelled bill';
    END IF;

    v_new_outstanding := v_bill.outstanding_balance - NEW.amount_paid;

    IF v_new_outstanding < 0 THEN
        RAISE EXCEPTION 'Payment exceeds outstanding balance';
    END IF;

    IF v_new_outstanding = 0 THEN
        v_new_status := 'PAID';
    ELSIF v_new_outstanding < v_bill.total_amount THEN
        v_new_status := 'PARTIALLY_PAID';
    ELSE
        v_new_status := v_bill.status;
    END IF;

    UPDATE bills
    SET amount_paid = amount_paid + NEW.amount_paid,
        outstanding_balance = v_new_outstanding,
        status = CASE WHEN v_new_outstanding = 0 THEN 'PAID' ELSE v_new_status END,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.bill_id;

    -- Full payment notification
    IF v_new_outstanding = 0 THEN
        v_period := fn_format_billing_period(v_bill.billing_month, v_bill.billing_year);
        v_message := 'Dear ' || v_bill.customer_name || E',\n\nYour payment of ' ||
                     TRIM(TO_CHAR(NEW.amount_paid, '999,999,999.99')) ||
                     ' FRW for the ' || v_period || ' bill (' || v_bill.bill_reference ||
                     ') has been received. Your bill is now fully paid.';

        INSERT INTO notifications (customer_id, bill_id, message, notification_type, status, created_at)
        VALUES (v_bill.customer_id, NEW.bill_id, v_message, 'PAYMENT_RECEIVED', 'PENDING', CURRENT_TIMESTAMP);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payment_after_insert_update_bill
    AFTER INSERT ON payments
    FOR EACH ROW
    EXECUTE PROCEDURE trg_payment_update_bill();
