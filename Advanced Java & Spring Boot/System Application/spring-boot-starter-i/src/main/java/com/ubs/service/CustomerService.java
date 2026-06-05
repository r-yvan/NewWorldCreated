package com.ubs.service;

import com.ubs.dto.request.CustomerRequest;
import com.ubs.dto.request.CustomerStatusRequest;
import com.ubs.dto.response.CustomerResponse;
import com.ubs.dto.response.PageResponse;
import com.ubs.enums.CustomerStatus;

public interface CustomerService {

    PageResponse<CustomerResponse> listCustomers(String search, CustomerStatus status,
                                                  Integer page, Integer size, String sortBy, String sortDirection);

    CustomerResponse getById(Long id);

    CustomerResponse create(CustomerRequest request);

    CustomerResponse update(Long id, CustomerRequest request);

    CustomerResponse updateStatus(Long id, CustomerStatusRequest request);

    void delete(Long id);
}
