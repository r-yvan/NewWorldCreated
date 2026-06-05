package com.ubs.mapper;

import com.ubs.dto.response.PaymentResponse;
import com.ubs.entity.Payment;
import org.springframework.stereotype.Component;

@Component
public class PaymentMapper {

    public PaymentResponse toResponse(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .billId(payment.getBill().getId())
                .billReference(payment.getBill().getBillReference())
                .customerId(payment.getBill().getCustomer().getId())
                .customerName(payment.getBill().getCustomer().getFullNames())
                .amountPaid(payment.getAmountPaid())
                .paymentMethod(payment.getPaymentMethod())
                .paymentDate(payment.getPaymentDate())
                .recordedById(payment.getRecordedBy().getId())
                .recordedByName(payment.getRecordedBy().getFullNames())
                .createdAt(payment.getCreatedAt())
                .build();
    }
}
