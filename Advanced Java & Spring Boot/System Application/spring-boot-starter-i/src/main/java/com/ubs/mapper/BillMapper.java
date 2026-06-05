package com.ubs.mapper;

import com.ubs.dto.response.BillApprovalResponse;
import com.ubs.dto.response.BillResponse;
import com.ubs.entity.Bill;
import org.springframework.stereotype.Component;

@Component
public class BillMapper {

    public BillResponse toResponse(Bill bill) {
        return BillResponse.builder()
                .id(bill.getId())
                .billReference(bill.getBillReference())
                .customerId(bill.getCustomer().getId())
                .customerName(bill.getCustomer().getFullNames())
                .meterId(bill.getMeter().getId())
                .meterNumber(bill.getMeter().getMeterNumber())
                .meterReadingId(bill.getMeterReading().getId())
                .tariffId(bill.getTariff().getId())
                .billingMonth(bill.getBillingMonth())
                .billingYear(bill.getBillingYear())
                .consumption(bill.getConsumption())
                .consumptionAmount(bill.getConsumptionAmount())
                .fixedServiceCharge(bill.getFixedServiceCharge())
                .taxAmount(bill.getTaxAmount())
                .penaltyAmount(bill.getPenaltyAmount())
                .totalAmount(bill.getTotalAmount())
                .amountPaid(bill.getAmountPaid())
                .outstandingBalance(bill.getOutstandingBalance())
                .dueDate(bill.getDueDate())
                .status(bill.getStatus())
                .approvedById(bill.getApprovedBy() != null ? bill.getApprovedBy().getId() : null)
                .approvedByName(bill.getApprovedBy() != null ? bill.getApprovedBy().getFullNames() : null)
                .approvedAt(bill.getApprovedAt())
                .createdAt(bill.getCreatedAt())
                .updatedAt(bill.getUpdatedAt())
                .build();
    }

    public BillApprovalResponse toApprovalResponse(Bill bill) {
        return BillApprovalResponse.builder()
                .id(bill.getId())
                .billReference(bill.getBillReference())
                .status(bill.getStatus())
                .approvedById(bill.getApprovedBy() != null ? bill.getApprovedBy().getId() : null)
                .approvedByName(bill.getApprovedBy() != null ? bill.getApprovedBy().getFullNames() : null)
                .approvedAt(bill.getApprovedAt())
                .build();
    }
}
