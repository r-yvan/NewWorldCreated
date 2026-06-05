package com.ubs.service;

import com.ubs.dto.request.TariffRequest;
import com.ubs.dto.response.PageResponse;
import com.ubs.dto.response.TariffResponse;
import com.ubs.enums.MeterType;
import com.ubs.enums.TariffType;

public interface TariffService {

    TariffResponse create(TariffRequest request);

    PageResponse<TariffResponse> listTariffs(MeterType meterType, TariffType tariffType,
                                              Boolean active, Integer page, Integer size,
                                              String sortBy, String sortDirection);

    TariffResponse getById(Long id);

    java.util.List<TariffResponse> listActiveTariffs();

    TariffResponse deactivate(Long id);
}
