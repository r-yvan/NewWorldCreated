package com.ubs.service.impl;

import com.ubs.dto.request.TariffRequest;
import com.ubs.dto.request.TariffTierRequest;
import com.ubs.dto.response.PageResponse;
import com.ubs.dto.response.TariffResponse;
import com.ubs.entity.Tariff;
import com.ubs.entity.TariffTier;
import com.ubs.enums.MeterType;
import com.ubs.enums.TariffType;
import com.ubs.exception.BadRequestException;
import com.ubs.exception.BusinessRuleException;
import com.ubs.exception.ResourceNotFoundException;
import com.ubs.mapper.TariffMapper;
import com.ubs.repository.TariffRepository;
import com.ubs.util.PageableUtil;
import com.ubs.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TariffServiceImpl implements com.ubs.service.TariffService {

    private final TariffRepository tariffRepository;
    private final TariffMapper tariffMapper;
    private final SecurityUtils securityUtils;

    @Override
    @Transactional
    public TariffResponse create(TariffRequest request) {
        validateTariffRequest(request);

        LocalDate effectiveTo = request.getEffectiveTo() != null
                ? request.getEffectiveTo()
                : LocalDate.of(9999, 12, 31);

        if (request.getEffectiveFrom().isAfter(effectiveTo)) {
            throw new BadRequestException("Effective from date must be before effective to date");
        }

        deactivateOverlappingTariffs(request.getMeterType(), request.getEffectiveFrom(), effectiveTo);

        Integer nextVersion = tariffRepository.findMaxVersionByMeterType(request.getMeterType()) + 1;

        Tariff tariff = Tariff.builder()
                .meterType(request.getMeterType())
                .tariffType(request.getTariffType())
                .ratePerUnit(request.getTariffType() == TariffType.FLAT ? request.getRatePerUnit() : null)
                .fixedServiceCharge(request.getFixedServiceCharge())
                .vatRate(request.getVatRate())
                .penaltyRate(request.getPenaltyRate())
                .effectiveFrom(request.getEffectiveFrom())
                .effectiveTo(request.getEffectiveTo())
                .active(true)
                .version(nextVersion)
                .createdBy(securityUtils.getCurrentUser())
                .build();

        if (request.getTariffType() == TariffType.TIERED) {
            tariff.setTiers(buildTiers(request.getTiers(), tariff));
        }

        return tariffMapper.toResponse(tariffRepository.save(tariff));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<TariffResponse> listTariffs(MeterType meterType, TariffType tariffType,
                                                     Boolean active, Integer page, Integer size,
                                                     String sortBy, String sortDirection) {
        Page<Tariff> result = tariffRepository.search(meterType, tariffType, active,
                PageableUtil.of(page, size, sortBy, sortDirection));
        return PageResponse.from(result.map(tariffMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public TariffResponse getById(Long id) {
        return tariffMapper.toResponse(findTariff(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<TariffResponse> listActiveTariffs() {
        return tariffRepository.findByActiveTrue().stream()
                .map(tariffMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public TariffResponse deactivate(Long id) {
        Tariff tariff = findTariff(id);
        if (!tariff.getActive()) {
            throw new BusinessRuleException("Tariff is already inactive");
        }
        tariff.setActive(false);
        if (tariff.getEffectiveTo() == null) {
            tariff.setEffectiveTo(LocalDate.now());
        }
        return tariffMapper.toResponse(tariffRepository.save(tariff));
    }

    private void deactivateOverlappingTariffs(MeterType meterType, LocalDate newStart, LocalDate newEnd) {
        List<Tariff> activeTariffs = tariffRepository.findByActiveTrue().stream()
                .filter(t -> t.getMeterType() == meterType)
                .filter(t -> periodsOverlap(t.getEffectiveFrom(),
                        t.getEffectiveTo() != null ? t.getEffectiveTo() : LocalDate.of(9999, 12, 31),
                        newStart, newEnd))
                .toList();

        for (Tariff existing : activeTariffs) {
            existing.setActive(false);
            if (existing.getEffectiveTo() == null || existing.getEffectiveTo().isAfter(newStart.minusDays(1))) {
                existing.setEffectiveTo(newStart.minusDays(1));
            }
            tariffRepository.save(existing);
        }
    }

    private boolean periodsOverlap(LocalDate start1, LocalDate end1, LocalDate start2, LocalDate end2) {
        return !start1.isAfter(end2) && !start2.isAfter(end1);
    }

    private void validateTariffRequest(TariffRequest request) {
        if (request.getTariffType() == TariffType.FLAT) {
            if (request.getRatePerUnit() == null) {
                throw new BadRequestException("Flat tariff requires rate per unit");
            }
        } else if (request.getTariffType() == TariffType.TIERED) {
            if (request.getTiers() == null || request.getTiers().isEmpty()) {
                throw new BadRequestException("Tiered tariff requires at least one tier");
            }
        } else {
            throw new BusinessRuleException("Unsupported tariff type");
        }
    }

    private List<TariffTier> buildTiers(List<TariffTierRequest> tierRequests, Tariff tariff) {
        List<TariffTier> tiers = new ArrayList<>();
        for (TariffTierRequest tierRequest : tierRequests) {
            TariffTier tier = TariffTier.builder()
                    .tariff(tariff)
                    .minUnits(tierRequest.getMinUnits())
                    .maxUnits(tierRequest.getMaxUnits())
                    .ratePerUnit(tierRequest.getRatePerUnit())
                    .build();
            tiers.add(tier);
        }
        return tiers;
    }

    private Tariff findTariff(Long id) {
        return tariffRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tariff not found with id: " + id));
    }
}
