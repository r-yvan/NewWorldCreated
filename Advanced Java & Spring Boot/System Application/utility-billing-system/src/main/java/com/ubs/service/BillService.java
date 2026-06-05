package com.ubs.service;

import com.ubs.dto.request.BillGenerateRequest;
import com.ubs.dto.response.BillApprovalResponse;
import com.ubs.dto.response.BillResponse;
import com.ubs.dto.response.PageResponse;
import com.ubs.enums.BillStatus;

import java.time.LocalDate;

public interface BillService {

    BillResponse generate(BillGenerateRequest request);

    BillApprovalResponse approve(Long id);

    PageResponse<BillResponse> listBills(Long customerId, Long meterId, Integer billingMonth,
                                          Integer billingYear, BillStatus status,
                                          LocalDate fromDate, LocalDate toDate, String search,
                                          Integer page, Integer size, String sortBy, String sortDirection);

    BillResponse getById(Long id);

    PageResponse<BillResponse> getMyBills(Integer page, Integer size, String sortBy, String sortDirection);

    BillResponse cancel(Long id);
}
