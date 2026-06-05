package com.ubs.service;

import com.ubs.dto.request.PaymentRequest;
import com.ubs.dto.response.PageResponse;
import com.ubs.dto.response.PaymentResponse;
import com.ubs.enums.PaymentMethod;

import java.time.LocalDate;

public interface PaymentService {

    PaymentResponse recordPayment(PaymentRequest request);

    PageResponse<PaymentResponse> listPayments(String billReference, Long customerId,
                                                PaymentMethod paymentMethod,
                                                LocalDate fromDate, LocalDate toDate,
                                                Integer page, Integer size,
                                                String sortBy, String sortDirection);

    PageResponse<PaymentResponse> getMyPayments(Integer page, Integer size,
                                                 String sortBy, String sortDirection);

    PaymentResponse getById(Long id);
}
