package com.ubs.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class MeterReadingRequest {
    @NotNull private Long meterId;
    @NotNull private BigDecimal previousReading;
    @NotNull private BigDecimal currentReading;
    @NotNull private LocalDate readingDate;
    @NotNull @Min(1) @Max(12) private Integer billingMonth;
    @NotNull private Integer billingYear;
}
