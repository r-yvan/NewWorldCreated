package com.ubs.repository;

import com.ubs.entity.Payment;
import com.ubs.enums.PaymentMethod;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    @Query("""
            SELECT p FROM Payment p WHERE
            (:billReference IS NULL OR p.bill.billReference = :billReference)
            AND (:customerId IS NULL OR p.bill.customer.id = :customerId)
            AND (:paymentMethod IS NULL OR p.paymentMethod = :paymentMethod)
            AND (:fromDate IS NULL OR p.paymentDate >= :fromDate)
            AND (:toDate IS NULL OR p.paymentDate <= :toDate)
            """)
    Page<Payment> search(@Param("billReference") String billReference,
                         @Param("customerId") Long customerId,
                         @Param("paymentMethod") PaymentMethod paymentMethod,
                         @Param("fromDate") LocalDate fromDate,
                         @Param("toDate") LocalDate toDate,
                         Pageable pageable);

    @Query("SELECT p FROM Payment p WHERE p.bill.customer.id = :customerId")
    Page<Payment> findByCustomerId(@Param("customerId") Long customerId, Pageable pageable);
}
