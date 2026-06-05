package com.ubs.service.impl;

import com.ubs.dto.request.BillGenerateRequest;
import com.ubs.dto.response.BillApprovalResponse;
import com.ubs.dto.response.BillResponse;
import com.ubs.dto.response.PageResponse;
import com.ubs.entity.Bill;
import com.ubs.entity.Customer;
import com.ubs.entity.Meter;
import com.ubs.entity.MeterReading;
import com.ubs.entity.Tariff;
import com.ubs.entity.User;
import com.ubs.enums.BillStatus;
import com.ubs.enums.CustomerStatus;
import com.ubs.enums.MeterStatus;
import com.ubs.enums.UserRole;
import com.ubs.exception.BusinessRuleException;
import com.ubs.exception.ConflictException;
import com.ubs.exception.ResourceNotFoundException;
import com.ubs.mapper.BillMapper;
import com.ubs.repository.BillRepository;
import com.ubs.repository.MeterReadingRepository;
import com.ubs.repository.TariffRepository;
import com.ubs.util.BillCalculator;
import com.ubs.util.PageableUtil;
import com.ubs.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;

@Service
@RequiredArgsConstructor
public class BillServiceImpl implements com.ubs.service.BillService {

    private final BillRepository billRepository;
    private final MeterReadingRepository meterReadingRepository;
    private final TariffRepository tariffRepository;
    private final BillCalculator billCalculator;
    private final BillMapper billMapper;
    private final SecurityUtils securityUtils;

    @Override
    @Transactional
    public BillResponse generate(BillGenerateRequest request) {
        MeterReading reading = meterReadingRepository.findById(request.getMeterReadingId())
                .orElseThrow(() -> new ResourceNotFoundException("Meter reading not found with id: " + request.getMeterReadingId()));

        Meter meter = reading.getMeter();
        Customer customer = meter.getCustomer();

        if (customer.getStatus() != CustomerStatus.ACTIVE) {
            throw new BusinessRuleException("Cannot generate bill for inactive customer");
        }

        if (meter.getStatus() != MeterStatus.ACTIVE) {
            throw new BusinessRuleException("Cannot generate bill for inactive meter");
        }

        if (billRepository.existsByMeterIdAndBillingMonthAndBillingYear(
                meter.getId(), reading.getBillingMonth(), reading.getBillingYear())) {
            throw new ConflictException("Bill already exists for this meter and billing period");
        }

        YearMonth billingPeriod = YearMonth.of(reading.getBillingYear(), reading.getBillingMonth());
        LocalDate periodStart = billingPeriod.atDay(1);
        LocalDate periodEnd = billingPeriod.atEndOfMonth();

        Tariff tariff = tariffRepository
                .findApplicableTariffs(meter.getMeterType(), periodStart, periodEnd, PageRequest.of(0, 1))
                .stream().findFirst()
                .orElseThrow(() -> new BusinessRuleException(
                        "No applicable tariff found for meter type " + meter.getMeterType()
                                + " during billing period"));

        BigDecimal consumption = reading.getConsumption();
        BigDecimal consumptionAmount = billCalculator.calculateConsumptionAmount(tariff, consumption);
        BigDecimal fixedCharge = tariff.getFixedServiceCharge();
        BigDecimal taxAmount = billCalculator.calculateTax(consumptionAmount, fixedCharge, tariff.getVatRate());
        BigDecimal penaltyAmount = BigDecimal.ZERO;
        BigDecimal totalAmount = billCalculator.calculateTotal(consumptionAmount, fixedCharge, taxAmount, penaltyAmount);

        String billReference = generateBillReference(reading.getBillingYear(), reading.getBillingMonth());
        LocalDate dueDate = request.getDueDate();

        Bill bill = Bill.builder()
                .billReference(billReference)
                .customer(customer)
                .meter(meter)
                .meterReading(reading)
                .tariff(tariff)
                .billingMonth(reading.getBillingMonth())
                .billingYear(reading.getBillingYear())
                .consumption(consumption)
                .consumptionAmount(consumptionAmount)
                .fixedServiceCharge(fixedCharge)
                .taxAmount(taxAmount)
                .penaltyAmount(penaltyAmount)
                .totalAmount(totalAmount)
                .amountPaid(BigDecimal.ZERO)
                .outstandingBalance(totalAmount)
                .dueDate(dueDate)
                .status(BillStatus.GENERATED)
                .build();

        return billMapper.toResponse(billRepository.save(bill));
    }

    @Override
    @Transactional
    public BillApprovalResponse approve(Long id) {
        Bill bill = findBill(id);

        if (bill.getStatus() != BillStatus.GENERATED) {
            throw new BusinessRuleException("Only generated bills can be approved");
        }

        User approver = securityUtils.getCurrentUser();
        bill.setStatus(BillStatus.APPROVED);
        bill.setApprovedBy(approver);
        bill.setApprovedAt(LocalDateTime.now());

        return billMapper.toApprovalResponse(billRepository.save(bill));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<BillResponse> listBills(Long customerId, Long meterId, Integer billingMonth,
                                                   Integer billingYear, BillStatus status,
                                                   LocalDate fromDate, LocalDate toDate, String search,
                                                   Integer page, Integer size, String sortBy, String sortDirection) {
        Page<Bill> result = billRepository.search(customerId, meterId, billingMonth, billingYear,
                status, fromDate, toDate, search, PageableUtil.of(page, size, sortBy, sortDirection));
        return PageResponse.from(result.map(billMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public BillResponse getById(Long id) {
        Bill bill = findBill(id);
        verifyBillAccess(bill);
        return billMapper.toResponse(bill);
    }

    @Override
    @Transactional
    public BillResponse cancel(Long id) {
        Bill bill = findBill(id);
        if (bill.getStatus() == BillStatus.CANCELLED) {
            throw new BusinessRuleException("Bill is already cancelled");
        }
        if (bill.getStatus() == BillStatus.PAID) {
            throw new BusinessRuleException("Cannot cancel a fully paid bill");
        }
        if (bill.getAmountPaid().compareTo(BigDecimal.ZERO) > 0) {
            throw new BusinessRuleException("Cannot cancel bill with recorded payments");
        }
        bill.setStatus(BillStatus.CANCELLED);
        return billMapper.toResponse(billRepository.save(bill));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<BillResponse> getMyBills(Integer page, Integer size,
                                                  String sortBy, String sortDirection) {
        User user = securityUtils.getCurrentUser();
        if (user.getCustomerId() == null) {
            throw new BusinessRuleException("No customer profile linked to this user");
        }
        Page<Bill> result = billRepository.search(user.getCustomerId(), null, null, null,
                null, null, null, null,
                PageableUtil.of(page, size, sortBy, sortDirection));
        return PageResponse.from(result.map(billMapper::toResponse));
    }

    private void verifyBillAccess(Bill bill) {
        User user = securityUtils.getCurrentUser();
        if (user.getRoles().contains(UserRole.ROLE_CUSTOMER)) {
            if (user.getCustomerId() == null || !user.getCustomerId().equals(bill.getCustomer().getId())) {
                throw new BusinessRuleException("Access denied to this bill");
            }
        }
    }

    private String generateBillReference(Integer year, Integer month) {
        long sequence = billRepository.countByBillingPeriod(year, month) + 1;
        return String.format("BILL-%d%02d-%04d", year, month, sequence);
    }

    private Bill findBill(Long id) {
        return billRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found with id: " + id));
    }
}
