package com.ubs.service.impl;

import com.ubs.dto.request.MeterRequest;
import com.ubs.dto.request.MeterStatusRequest;
import com.ubs.dto.response.MeterResponse;
import com.ubs.dto.response.PageResponse;
import com.ubs.entity.Customer;
import com.ubs.entity.Meter;
import com.ubs.enums.MeterStatus;
import com.ubs.enums.MeterType;
import com.ubs.exception.ConflictException;
import com.ubs.exception.ResourceNotFoundException;
import com.ubs.mapper.MeterMapper;
import com.ubs.exception.BusinessRuleException;
import com.ubs.repository.BillRepository;
import com.ubs.repository.CustomerRepository;
import com.ubs.repository.MeterReadingRepository;
import com.ubs.repository.MeterRepository;
import com.ubs.util.PageableUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MeterServiceImpl implements com.ubs.service.MeterService {

    private final MeterRepository meterRepository;
    private final CustomerRepository customerRepository;
    private final MeterReadingRepository meterReadingRepository;
    private final BillRepository billRepository;
    private final MeterMapper meterMapper;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<MeterResponse> listMeters(Long customerId, MeterType meterType, MeterStatus status,
                                                   String search, Integer page, Integer size,
                                                   String sortBy, String sortDirection) {
        Page<Meter> result = meterRepository.search(customerId, meterType, status, search,
                PageableUtil.of(page, size, sortBy, sortDirection));
        return PageResponse.from(result.map(meterMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public MeterResponse getById(Long id) {
        return meterMapper.toResponse(findMeter(id));
    }

    @Override
    @Transactional
    public MeterResponse create(MeterRequest request) {
        if (meterRepository.existsByMeterNumber(request.getMeterNumber())) {
            throw new ConflictException("Meter number already exists: " + request.getMeterNumber());
        }
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + request.getCustomerId()));
        Meter meter = Meter.builder()
                .meterNumber(request.getMeterNumber())
                .meterType(request.getMeterType())
                .installationDate(request.getInstallationDate())
                .customer(customer)
                .status(MeterStatus.ACTIVE)
                .build();
        return meterMapper.toResponse(meterRepository.save(meter));
    }

    @Override
    @Transactional
    public MeterResponse update(Long id, MeterRequest request) {
        Meter meter = findMeter(id);
        if (!meter.getMeterNumber().equals(request.getMeterNumber())
                && meterRepository.existsByMeterNumber(request.getMeterNumber())) {
            throw new ConflictException("Meter number already exists: " + request.getMeterNumber());
        }
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + request.getCustomerId()));
        meter.setMeterNumber(request.getMeterNumber());
        meter.setMeterType(request.getMeterType());
        meter.setInstallationDate(request.getInstallationDate());
        meter.setCustomer(customer);
        return meterMapper.toResponse(meterRepository.save(meter));
    }

    @Override
    @Transactional
    public MeterResponse updateStatus(Long id, MeterStatusRequest request) {
        Meter meter = findMeter(id);
        meter.setStatus(request.getStatus());
        return meterMapper.toResponse(meterRepository.save(meter));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Meter meter = findMeter(id);
        if (meterReadingRepository.existsByMeterId(id)) {
            throw new BusinessRuleException("Cannot delete meter with captured readings. Set status to INACTIVE instead.");
        }
        if (billRepository.existsByMeterId(id)) {
            throw new BusinessRuleException("Cannot delete meter with billing history. Set status to INACTIVE instead.");
        }
        meterRepository.delete(meter);
    }

    private Meter findMeter(Long id) {
        return meterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Meter not found with id: " + id));
    }
}
