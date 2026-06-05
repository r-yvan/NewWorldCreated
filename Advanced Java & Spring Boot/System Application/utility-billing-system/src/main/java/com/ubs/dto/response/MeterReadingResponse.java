package com.ubs.dto.response;

import com.ubs.enums.MeterType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class MeterReadingResponse {
    private Long id;
    private Long meterId;
    private String meterNumber;
    private MeterType meterType;
    private BigDecimal previousReading;
    private BigDecimal currentReading;
    private BigDecimal consumption;
    private LocalDate readingDate;
    private Integer billingMonth;
    private Integer billingYear;
    private Long capturedById;
    private String capturedByName;
    private LocalDateTime createdAt;
}
