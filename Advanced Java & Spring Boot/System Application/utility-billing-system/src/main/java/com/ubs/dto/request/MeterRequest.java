package com.ubs.dto.request;

import com.ubs.enums.MeterType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class MeterRequest {
    @NotBlank private String meterNumber;
    @NotNull private MeterType meterType;
    @NotNull private LocalDate installationDate;
    @NotNull private Long customerId;
}
