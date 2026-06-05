package com.ubs.service.impl;

import com.ubs.dto.request.PaymentRequest;
import com.ubs.dto.response.PageResponse;
import com.ubs.dto.response.PaymentResponse;
import com.ubs.entity.Bill;
import com.ubs.entity.Payment;
import com.ubs.entity.User;
import com.ubs.enums.BillStatus;
import com.ubs.exception.BusinessRuleException;
import com.ubs.exception.ResourceNotFoundException;
import com.ubs.mapper.PaymentMapper;
import com.ubs.repository.BillRepository;
import com.ubs.repository.PaymentRepository;
import com.ubs.util.PageableUtil;
import com.ubs.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements com.ubs.service.PaymentService {

    private final PaymentRepository paymentRepository;
    private final BillRepository billRepository;
    private final PaymentMapper paymentMapper;
    private final SecurityUtils securityUtils;

    @Override
    @Transactional
    public PaymentResponse recordPayment(PaymentRequest request) {
        Bill bill = billRepository.findByBillReference(request.getBillReference())
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found with reference: " + request.getBillReference()));

        if (bill.getStatus() == BillStatus.CANCELLED) {
            throw new BusinessRuleException("Cannot record payment for cancelled bill");
        }

        if (request.getAmountPaid().compareTo(bill.getOutstandingBalance()) > 0) {
            throw new BusinessRuleException("Payment amount exceeds outstanding balance");
        }

        User recorder = securityUtils.getCurrentUser();

        Payment payment = Payment.builder()
                .bill(bill)
                .amountPaid(request.getAmountPaid())
                .paymentMethod(request.getPaymentMethod())
                .paymentDate(request.getPaymentDate())
                .recordedBy(recorder)
                .build();

        Payment saved = paymentRepository.save(payment);
        Bill refreshedBill = billRepository.findById(bill.getId()).orElse(saved.getBill());
        saved.setBill(refreshedBill);

        return paymentMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PaymentResponse> listPayments(String billReference, Long customerId,
                                                       com.ubs.enums.PaymentMethod paymentMethod,
                                                       LocalDate fromDate, LocalDate toDate,
                                                       Integer page, Integer size,
                                                       String sortBy, String sortDirection) {
        Page<Payment> result = paymentRepository.search(billReference, customerId, paymentMethod,
                fromDate, toDate, PageableUtil.of(page, size, sortBy, sortDirection));
        return PageResponse.from(result.map(paymentMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PaymentResponse> getMyPayments(Integer page, Integer size,
                                                        String sortBy, String sortDirection) {
        User user = securityUtils.getCurrentUser();
        if (user.getCustomerId() == null) {
            throw new BusinessRuleException("No customer profile linked to this user");
        }
        Page<Payment> result = paymentRepository.findByCustomerId(user.getCustomerId(),
                PageableUtil.of(page, size, sortBy, sortDirection));
        return PageResponse.from(result.map(paymentMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getById(Long id) {
        return paymentMapper.toResponse(paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + id)));
    }
}
