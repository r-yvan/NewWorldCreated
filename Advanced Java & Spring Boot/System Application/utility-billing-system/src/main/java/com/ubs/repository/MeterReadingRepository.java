package com.ubs.repository;

import com.ubs.entity.MeterReading;
import com.ubs.enums.MeterType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface MeterReadingRepository extends JpaRepository<MeterReading, Long> {
    boolean existsByMeterIdAndBillingMonthAndBillingYear(Long meterId, Integer month, Integer year);
    boolean existsByMeterId(Long meterId);

    Optional<MeterReading> findTopByMeterIdOrderByBillingYearDescBillingMonthDesc(Long meterId);

    @Query("""
            SELECT mr FROM MeterReading mr WHERE
            (:meterId IS NULL OR mr.meter.id = :meterId)
            AND (:customerId IS NULL OR mr.meter.customer.id = :customerId)
            AND (:billingMonth IS NULL OR mr.billingMonth = :billingMonth)
            AND (:billingYear IS NULL OR mr.billingYear = :billingYear)
            AND (:meterType IS NULL OR mr.meter.meterType = :meterType)
            """)
    Page<MeterReading> search(@Param("meterId") Long meterId,
                              @Param("customerId") Long customerId,
                              @Param("billingMonth") Integer billingMonth,
                              @Param("billingYear") Integer billingYear,
                              @Param("meterType") MeterType meterType,
                              Pageable pageable);
}
