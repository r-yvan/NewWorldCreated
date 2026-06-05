package com.ubs.dto.request;

import com.ubs.enums.MeterType;
import com.ubs.enums.TariffType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class TariffRequest {
    @NotNull private MeterType meterType;
    @NotNull private TariffType tariffType;
    private BigDecimal ratePerUnit;
    @NotNull private BigDecimal fixedServiceCharge;
    @NotNull private BigDecimal vatRate;
    @NotNull private BigDecimal penaltyRate;
    @NotNull private LocalDate effectiveFrom;
    private LocalDate effectiveTo;
    private List<TariffTierRequest> tiers;
}
