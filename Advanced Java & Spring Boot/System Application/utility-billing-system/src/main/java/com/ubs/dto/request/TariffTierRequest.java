package com.ubs.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class TariffTierRequest {
    @NotNull private Integer minUnits;
    private Integer maxUnits;
    @NotNull private BigDecimal ratePerUnit;
}
