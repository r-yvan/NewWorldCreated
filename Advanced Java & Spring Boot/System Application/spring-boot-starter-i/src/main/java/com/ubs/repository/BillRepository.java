package com.ubs.repository;

import com.ubs.entity.Bill;
import com.ubs.enums.BillStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface BillRepository extends JpaRepository<Bill, Long> {
    boolean existsByMeterIdAndBillingMonthAndBillingYear(Long meterId, Integer month, Integer year);
    boolean existsByMeterReadingId(Long meterReadingId);
    boolean existsByMeterId(Long meterId);
    boolean existsByCustomerId(Long customerId);
    Optional<Bill> findByBillReference(String billReference);

    @Query("SELECT COUNT(b) FROM Bill b WHERE b.billingYear = :year AND b.billingMonth = :month")
    long countByBillingPeriod(@Param("year") Integer year, @Param("month") Integer month);

    @Query("""
            SELECT b FROM Bill b JOIN FETCH b.tariff
            WHERE b.dueDate < :today
            AND b.outstandingBalance > 0
            AND b.status IN (
                com.ubs.enums.BillStatus.GENERATED,
                com.ubs.enums.BillStatus.APPROVED,
                com.ubs.enums.BillStatus.PARTIALLY_PAID,
                com.ubs.enums.BillStatus.OVERDUE
            )
            """)
    List<Bill> findOverdueBills(@Param("today") LocalDate today);

    @Query("""
            SELECT b FROM Bill b WHERE
            (:customerId IS NULL OR b.customer.id = :customerId)
            AND (:meterId IS NULL OR b.meter.id = :meterId)
            AND (:billingMonth IS NULL OR b.billingMonth = :billingMonth)
            AND (:billingYear IS NULL OR b.billingYear = :billingYear)
            AND (:status IS NULL OR b.status = :status)
            AND (:fromDate IS NULL OR b.dueDate >= :fromDate)
            AND (:toDate IS NULL OR b.dueDate <= :toDate)
            AND (CAST(:search AS string) IS NULL OR LOWER(b.billReference) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')))
            """)
    Page<Bill> search(@Param("customerId") Long customerId,
                      @Param("meterId") Long meterId,
                      @Param("billingMonth") Integer billingMonth,
                      @Param("billingYear") Integer billingYear,
                      @Param("status") BillStatus status,
                      @Param("fromDate") LocalDate fromDate,
                      @Param("toDate") LocalDate toDate,
                      @Param("search") String search,
                      Pageable pageable);
}
