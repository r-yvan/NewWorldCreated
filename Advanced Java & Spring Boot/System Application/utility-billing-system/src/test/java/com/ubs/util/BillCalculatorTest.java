package com.ubs.util;

import com.ubs.entity.Tariff;
import com.ubs.entity.TariffTier;
import com.ubs.enums.MeterType;
import com.ubs.enums.TariffType;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class BillCalculatorTest {

    private final BillCalculator calculator = new BillCalculator();

    @Test
    void flatTariffCalculation() {
        Tariff tariff = Tariff.builder()
                .meterType(MeterType.WATER)
                .tariffType(TariffType.FLAT)
                .ratePerUnit(new BigDecimal("500"))
                .fixedServiceCharge(new BigDecimal("1000"))
                .vatRate(new BigDecimal("18"))
                .build();

        BigDecimal consumption = new BigDecimal("50");
        BigDecimal consumptionAmount = calculator.calculateConsumptionAmount(tariff, consumption);
        BigDecimal tax = calculator.calculateTax(consumptionAmount, tariff.getFixedServiceCharge(), tariff.getVatRate());
        BigDecimal total = calculator.calculateTotal(consumptionAmount, tariff.getFixedServiceCharge(), tax, BigDecimal.ZERO);

        assertEquals(new BigDecimal("25000.00"), consumptionAmount);
        assertEquals(new BigDecimal("4680.00"), tax);
        assertEquals(new BigDecimal("30680.00"), total);
    }

    @Test
    void tieredTariffCalculation() {
        Tariff tariff = Tariff.builder()
                .meterType(MeterType.ELECTRICITY)
                .tariffType(TariffType.TIERED)
                .fixedServiceCharge(new BigDecimal("1500"))
                .vatRate(new BigDecimal("18"))
                .tiers(List.of(
                        TariffTier.builder().minUnits(0).maxUnits(50).ratePerUnit(new BigDecimal("300")).build(),
                        TariffTier.builder().minUnits(51).maxUnits(100).ratePerUnit(new BigDecimal("500")).build(),
                        TariffTier.builder().minUnits(101).maxUnits(null).ratePerUnit(new BigDecimal("700")).build()
                ))
                .build();

        BigDecimal consumption = new BigDecimal("80");
        BigDecimal consumptionAmount = calculator.calculateConsumptionAmount(tariff, consumption);
        assertEquals(new BigDecimal("30000.00"), consumptionAmount);
    }
}
