package com.ubs.service.impl;

import com.ubs.dto.request.MeterReadingRequest;
import com.ubs.dto.response.MeterReadingResponse;
import com.ubs.dto.response.PageResponse;
import com.ubs.entity.Meter;
import com.ubs.entity.MeterReading;
import com.ubs.enums.MeterStatus;
import com.ubs.enums.MeterType;
import com.ubs.exception.BusinessRuleException;
import com.ubs.exception.ConflictException;
import com.ubs.exception.ResourceNotFoundException;
import com.ubs.mapper.MeterReadingMapper;
import com.ubs.repository.BillRepository;
import com.ubs.repository.MeterReadingRepository;
import com.ubs.repository.MeterRepository;
import com.ubs.util.PageableUtil;
import com.ubs.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MeterReadingServiceImpl implements com.ubs.service.MeterReadingService {

    private final MeterReadingRepository meterReadingRepository;
    private final MeterRepository meterRepository;
    private final BillRepository billRepository;
    private final MeterReadingMapper meterReadingMapper;
    private final SecurityUtils securityUtils;

    @Override
    @Transactional
    public MeterReadingResponse captureReading(MeterReadingRequest request) {
        Meter meter = meterRepository.findById(request.getMeterId())
                .orElseThrow(() -> new ResourceNotFoundException("Meter not found with id: " + request.getMeterId()));

        if (meter.getStatus() != MeterStatus.ACTIVE) {
            throw new BusinessRuleException("Cannot capture reading for inactive meter");
        }

        if (meterReadingRepository.existsByMeterIdAndBillingMonthAndBillingYear(
                request.getMeterId(), request.getBillingMonth(), request.getBillingYear())) {
            throw new ConflictException("Reading already exists for this meter and billing period");
        }

        if (request.getCurrentReading().compareTo(request.getPreviousReading()) <= 0) {
            throw new BusinessRuleException("Current reading must be greater than previous reading");
        }

        Optional<MeterReading> lastReading = meterReadingRepository
                .findTopByMeterIdOrderByBillingYearDescBillingMonthDesc(request.getMeterId());

        BigDecimal expectedPrevious = lastReading
                .map(MeterReading::getCurrentReading)
                .orElse(BigDecimal.ZERO);

        if (request.getPreviousReading().compareTo(expectedPrevious) != 0) {
            throw new BusinessRuleException("Previous reading must match the last recorded reading: " + expectedPrevious);
        }

        BigDecimal consumption = request.getCurrentReading().subtract(request.getPreviousReading());

        MeterReading reading = MeterReading.builder()
                .meter(meter)
                .previousReading(request.getPreviousReading())
                .currentReading(request.getCurrentReading())
                .consumption(consumption)
                .readingDate(request.getReadingDate())
                .billingMonth(request.getBillingMonth())
                .billingYear(request.getBillingYear())
                .capturedBy(securityUtils.getCurrentUser())
                .build();

        return meterReadingMapper.toResponse(meterReadingRepository.save(reading));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<MeterReadingResponse> listReadings(Long meterId, Long customerId,
                                                            Integer billingMonth, Integer billingYear,
                                                            MeterType meterType,
                                                            Integer page, Integer size,
                                                            String sortBy, String sortDirection) {
        Page<MeterReading> result = meterReadingRepository.search(
                meterId, customerId, billingMonth, billingYear, meterType,
                PageableUtil.of(page, size, sortBy, sortDirection));
        return PageResponse.from(result.map(meterReadingMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public MeterReadingResponse getById(Long id) {
        return meterReadingMapper.toResponse(findReading(id));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        MeterReading reading = findReading(id);
        if (billRepository.existsByMeterReadingId(id)) {
            throw new BusinessRuleException("Cannot delete reading used to generate a bill");
        }
        meterReadingRepository.delete(reading);
    }

    private MeterReading findReading(Long id) {
        return meterReadingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Meter reading not found with id: " + id));
    }
}
