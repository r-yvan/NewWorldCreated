package com.ubs.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class BillGenerateRequest {
    @NotNull
    private Long meterReadingId;

    @NotNull
    private LocalDate dueDate;
}
