package com.ubs.service;

import com.ubs.dto.request.MeterReadingRequest;
import com.ubs.dto.response.MeterReadingResponse;
import com.ubs.dto.response.PageResponse;
import com.ubs.enums.MeterType;

public interface MeterReadingService {

    MeterReadingResponse captureReading(MeterReadingRequest request);

    PageResponse<MeterReadingResponse> listReadings(Long meterId, Long customerId,
                                                     Integer billingMonth, Integer billingYear,
                                                     MeterType meterType,
                                                     Integer page, Integer size,
                                                     String sortBy, String sortDirection);

    MeterReadingResponse getById(Long id);

    void delete(Long id);
}
