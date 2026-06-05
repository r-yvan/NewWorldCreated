package com.ubs.mapper;

import com.ubs.dto.response.TariffResponse;
import com.ubs.dto.response.TariffTierResponse;
import com.ubs.entity.Tariff;
import com.ubs.entity.TariffTier;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class TariffMapper {

    public TariffResponse toResponse(Tariff tariff) {
        return TariffResponse.builder()
                .id(tariff.getId())
                .meterType(tariff.getMeterType())
                .tariffType(tariff.getTariffType())
                .ratePerUnit(tariff.getRatePerUnit())
                .fixedServiceCharge(tariff.getFixedServiceCharge())
                .vatRate(tariff.getVatRate())
                .penaltyRate(tariff.getPenaltyRate())
                .effectiveFrom(tariff.getEffectiveFrom())
                .effectiveTo(tariff.getEffectiveTo())
                .active(tariff.getActive())
                .version(tariff.getVersion())
                .createdById(tariff.getCreatedBy() != null ? tariff.getCreatedBy().getId() : null)
                .createdByName(tariff.getCreatedBy() != null ? tariff.getCreatedBy().getFullNames() : null)
                .tiers(toTierResponses(tariff.getTiers()))
                .createdAt(tariff.getCreatedAt())
                .build();
    }

    public TariffTierResponse toTierResponse(TariffTier tier) {
        return TariffTierResponse.builder()
                .id(tier.getId())
                .minUnits(tier.getMinUnits())
                .maxUnits(tier.getMaxUnits())
                .ratePerUnit(tier.getRatePerUnit())
                .build();
    }

    private List<TariffTierResponse> toTierResponses(List<TariffTier> tiers) {
        if (tiers == null) {
            return List.of();
        }
        return tiers.stream().map(this::toTierResponse).toList();
    }
}
