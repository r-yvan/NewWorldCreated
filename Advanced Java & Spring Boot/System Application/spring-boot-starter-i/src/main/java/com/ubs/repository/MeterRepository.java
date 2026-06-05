package com.ubs.repository;

import com.ubs.entity.Meter;
import com.ubs.enums.MeterStatus;
import com.ubs.enums.MeterType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface MeterRepository extends JpaRepository<Meter, Long> {
    boolean existsByMeterNumber(String meterNumber);
    boolean existsByCustomerId(Long customerId);
    Optional<Meter> findByMeterNumber(String meterNumber);

    @Query("""
            SELECT m FROM Meter m WHERE
            (:customerId IS NULL OR m.customer.id = :customerId)
            AND (:meterType IS NULL OR m.meterType = :meterType)
            AND (:status IS NULL OR m.status = :status)
            AND (CAST(:search AS string) IS NULL OR LOWER(m.meterNumber) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')))
            """)
    Page<Meter> search(@Param("customerId") Long customerId,
                       @Param("meterType") MeterType meterType,
                       @Param("status") MeterStatus status,
                       @Param("search") String search,
                       Pageable pageable);
}
