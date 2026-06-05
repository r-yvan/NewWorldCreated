package com.ubs.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class TariffTierResponse {
    private Long id;
    private Integer minUnits;
    private Integer maxUnits;
    private BigDecimal ratePerUnit;
}
