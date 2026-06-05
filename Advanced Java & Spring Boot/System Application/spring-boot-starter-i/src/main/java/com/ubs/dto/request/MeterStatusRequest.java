package com.ubs.dto.request;

import com.ubs.enums.MeterStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MeterStatusRequest {
    @NotNull private MeterStatus status;
}
