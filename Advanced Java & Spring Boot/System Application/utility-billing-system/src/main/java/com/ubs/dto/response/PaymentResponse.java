package com.ubs.dto.response;

import com.ubs.enums.PaymentMethod;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class PaymentResponse {
    private Long id;
    private Long billId;
    private String billReference;
    private Long customerId;
    private String customerName;
    private BigDecimal amountPaid;
    private PaymentMethod paymentMethod;
    private LocalDate paymentDate;
    private Long recordedById;
    private String recordedByName;
    private LocalDateTime createdAt;
}
