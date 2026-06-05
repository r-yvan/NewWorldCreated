package com.ubs.dto.response;

import com.ubs.enums.MeterType;
import com.ubs.enums.TariffType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class TariffResponse {
    private Long id;
    private MeterType meterType;
    private TariffType tariffType;
    private BigDecimal ratePerUnit;
    private BigDecimal fixedServiceCharge;
    private BigDecimal vatRate;
    private BigDecimal penaltyRate;
    private LocalDate effectiveFrom;
    private LocalDate effectiveTo;
    private Boolean active;
    private Integer version;
    private Long createdById;
    private String createdByName;
    private List<TariffTierResponse> tiers;
    private LocalDateTime createdAt;
}
