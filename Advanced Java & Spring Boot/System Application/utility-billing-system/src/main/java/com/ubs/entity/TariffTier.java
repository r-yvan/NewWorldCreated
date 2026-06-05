package com.ubs.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "tariff_tiers")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TariffTier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tariff_id", nullable = false)
    private Tariff tariff;

    @Column(name = "min_units", nullable = false)
    private Integer minUnits;

    @Column(name = "max_units")
    private Integer maxUnits;

    @Column(name = "rate_per_unit", nullable = false)
    private BigDecimal ratePerUnit;
}
