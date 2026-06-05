package com.ubs.dto.request;

import com.ubs.enums.CustomerStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CustomerStatusRequest {
    @NotNull private CustomerStatus status;
}
