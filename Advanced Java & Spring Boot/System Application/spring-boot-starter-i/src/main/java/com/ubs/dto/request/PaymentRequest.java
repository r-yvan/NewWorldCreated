package com.ubs.dto.request;

import com.ubs.enums.PaymentMethod;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class PaymentRequest {
    @NotBlank
    private String billReference;

    @NotNull
    @Positive
    private BigDecimal amountPaid;

    @NotNull
    private PaymentMethod paymentMethod;

    @NotNull
    private LocalDate paymentDate;
}
