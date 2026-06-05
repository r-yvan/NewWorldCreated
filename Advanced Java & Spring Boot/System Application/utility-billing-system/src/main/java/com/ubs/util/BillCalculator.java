package com.ubs.util;

import com.ubs.entity.Tariff;
import com.ubs.entity.TariffTier;
import com.ubs.enums.TariffType;
import com.ubs.exception.BusinessRuleException;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;

@Component
public class BillCalculator {

    public BigDecimal calculateConsumptionAmount(Tariff tariff, BigDecimal consumption) {
        if (tariff.getTariffType() == TariffType.FLAT) {
            if (tariff.getRatePerUnit() == null) {
                throw new BusinessRuleException("Flat tariff must have rate per unit");
            }
            return tariff.getRatePerUnit().multiply(consumption).setScale(2, RoundingMode.HALF_UP);
        }

        BigDecimal remaining = consumption;
        BigDecimal total = BigDecimal.ZERO;
        var tiers = tariff.getTiers().stream()
                .sorted(Comparator.comparing(TariffTier::getMinUnits))
                .toList();

        for (TariffTier tier : tiers) {
            if (remaining.compareTo(BigDecimal.ZERO) <= 0) {
                break;
            }
            int tierMin = tier.getMinUnits();
            int tierMax = tier.getMaxUnits() != null ? tier.getMaxUnits() : Integer.MAX_VALUE;
            // First tier (min=0): capacity equals maxUnits; subsequent tiers are inclusive ranges
            int tierCapacity = tier.getMaxUnits() != null
                    ? tierMax - tierMin + (tierMin == 0 ? 0 : 1)
                    : Integer.MAX_VALUE;
            BigDecimal unitsInTier = remaining.min(BigDecimal.valueOf(tierCapacity));
            total = total.add(unitsInTier.multiply(tier.getRatePerUnit()));
            remaining = remaining.subtract(unitsInTier);
        }
        return total.setScale(2, RoundingMode.HALF_UP);
    }

    public BigDecimal calculateTax(BigDecimal consumptionAmount, BigDecimal fixedCharge, BigDecimal vatRate) {
        BigDecimal taxable = consumptionAmount.add(fixedCharge);
        return taxable.multiply(vatRate)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
    }

    public BigDecimal calculateTotal(BigDecimal consumptionAmount, BigDecimal fixedCharge,
                                   BigDecimal taxAmount, BigDecimal penaltyAmount) {
        return consumptionAmount.add(fixedCharge).add(taxAmount).add(penaltyAmount)
                .setScale(2, RoundingMode.HALF_UP);
    }
}
