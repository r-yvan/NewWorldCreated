package com.ubs.service;

import com.ubs.dto.request.MeterRequest;
import com.ubs.dto.request.MeterStatusRequest;
import com.ubs.dto.response.MeterResponse;
import com.ubs.dto.response.PageResponse;
import com.ubs.enums.MeterStatus;
import com.ubs.enums.MeterType;

public interface MeterService {

    PageResponse<MeterResponse> listMeters(Long customerId, MeterType meterType, MeterStatus status,
                                           String search, Integer page, Integer size,
                                           String sortBy, String sortDirection);

    MeterResponse getById(Long id);

    MeterResponse create(MeterRequest request);

    MeterResponse update(Long id, MeterRequest request);

    MeterResponse updateStatus(Long id, MeterStatusRequest request);

    void delete(Long id);
}
