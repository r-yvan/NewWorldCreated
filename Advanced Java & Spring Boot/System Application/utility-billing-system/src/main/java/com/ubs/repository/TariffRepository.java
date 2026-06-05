package com.ubs.repository;

import com.ubs.entity.Tariff;
import com.ubs.enums.MeterType;
import com.ubs.enums.TariffType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TariffRepository extends JpaRepository<Tariff, Long> {

    @Query("SELECT COALESCE(MAX(t.version), 0) FROM Tariff t WHERE t.meterType = :meterType")
    Integer findMaxVersionByMeterType(@Param("meterType") MeterType meterType);

    @Query("""
            SELECT DISTINCT t FROM Tariff t LEFT JOIN FETCH t.tiers
            WHERE t.meterType = :meterType AND t.active = true
            AND t.effectiveFrom <= :periodEnd
            AND (t.effectiveTo IS NULL OR t.effectiveTo >= :periodStart)
            ORDER BY t.version DESC
            """)
    List<Tariff> findApplicableTariffs(@Param("meterType") MeterType meterType,
                                       @Param("periodStart") LocalDate periodStart,
                                       @Param("periodEnd") LocalDate periodEnd,
                                       Pageable pageable);

    @Query("""
            SELECT COUNT(t) > 0 FROM Tariff t WHERE t.meterType = :meterType AND t.active = true
            AND t.effectiveFrom <= :newEnd
            AND (t.effectiveTo IS NULL OR t.effectiveTo >= :newStart)
            AND (:excludeId IS NULL OR t.id <> :excludeId)
            """)
    boolean hasOverlappingActiveTariff(@Param("meterType") MeterType meterType,
                                       @Param("newStart") LocalDate newStart,
                                       @Param("newEnd") LocalDate newEnd,
                                       @Param("excludeId") Long excludeId);

    @Query("""
            SELECT t FROM Tariff t WHERE
            (:meterType IS NULL OR t.meterType = :meterType)
            AND (:tariffType IS NULL OR t.tariffType = :tariffType)
            AND (:active IS NULL OR t.active = :active)
            """)
    Page<Tariff> search(@Param("meterType") MeterType meterType,
                          @Param("tariffType") TariffType tariffType,
                          @Param("active") Boolean active,
                          Pageable pageable);

    List<Tariff> findByActiveTrue();
}
